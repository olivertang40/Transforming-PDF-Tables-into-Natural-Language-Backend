"""
PDF Table Detection Service using pdfplumber with camelot fallback.
Handles page-by-page table extraction and normalization to unified schema.
"""

import io
import time
from typing import Dict, List, Any, Optional, Tuple
from uuid import uuid4

import pdfplumber
import pandas as pd
from PIL import Image

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.schema_normalize import SchemaValidator

settings = get_settings()
logger = get_logger(__name__)

# Try to import camelot for fallback
try:
    import camelot
    CAMELOT_AVAILABLE = True
except ImportError:
    CAMELOT_AVAILABLE = False
    logger.warning("Camelot not available, using pdfplumber only")


class PDFDetectionService:
    """Service for detecting and extracting tables from PDF documents."""
    
    def __init__(self):
        self.schema_validator = SchemaValidator()
        
    async def extract_tables_from_pdf(
        self,
        file_content: bytes,
        file_name: str,
        doc_id: str
    ) -> List[Dict[str, Any]]:
        """
        Extract all tables from a PDF file.
        
        Args:
            file_content: PDF file content as bytes
            file_name: Original filename
            doc_id: Document UUID
            
        Returns:
            List of normalized table schemas
        """
        logger.info(
            "Starting PDF table extraction",
            file_name=file_name,
            doc_id=doc_id,
            file_size=len(file_content)
        )
        
        start_time = time.time()
        all_tables = []
        
        try:
            # Create file-like object from bytes
            pdf_file = io.BytesIO(file_content)
            
            # Process with pdfplumber
            with pdfplumber.open(pdf_file) as pdf:
                total_pages = len(pdf.pages)
                logger.info(f"Processing {total_pages} pages", doc_id=doc_id)
                
                for page_num, page in enumerate(pdf.pages, 1):
                    logger.debug(f"Processing page {page_num}", doc_id=doc_id)
                    
                    # Detect page type (vector vs scanned)
                    page_type = self._detect_page_type(page)
                    
                    # Extract tables from this page
                    page_tables = await self._extract_page_tables(
                        page, page_num, doc_id, page_type, file_content
                    )
                    
                    all_tables.extend(page_tables)
                    
                    logger.debug(
                        f"Page {page_num} processed",
                        tables_found=len(page_tables),
                        page_type=page_type
                    )
            
            processing_time = time.time() - start_time
            
            logger.info(
                "PDF table extraction completed",
                doc_id=doc_id,
                total_tables=len(all_tables),
                processing_time_seconds=round(processing_time, 2)
            )
            
            return all_tables
            
        except Exception as e:
            logger.error(
                f"PDF table extraction failed: {e}",
                doc_id=doc_id,
                file_name=file_name,
                exc_info=True
            )
            raise ValueError(f"Failed to extract tables from PDF: {str(e)}")
    
    async def _extract_page_tables(
        self,
        page: pdfplumber.page.Page,
        page_num: int,
        doc_id: str,
        page_type: str,
        file_content: bytes
    ) -> List[Dict[str, Any]]:
        """Extract tables from a single page using multiple methods."""
        page_tables = []
        
        # Method 1: pdfplumber table extraction
        plumber_tables = self._extract_with_pdfplumber(page, page_num, doc_id)
        page_tables.extend(plumber_tables)
        
        # Method 2: Camelot fallback if pdfplumber finds no tables
        if not plumber_tables and CAMELOT_AVAILABLE:
            logger.info(f"No tables found with pdfplumber on page {page_num}, trying camelot")
            camelot_tables = await self._extract_with_camelot(
                file_content, page_num, doc_id
            )
            page_tables.extend(camelot_tables)
        
        # Method 3: OCR fallback (if enabled and no tables found)
        if not page_tables and settings.OCR_ENABLED:
            logger.info(f"No tables found on page {page_num}, OCR extraction not implemented")
            # TODO: Implement OCR table extraction
            # ocr_tables = await self._extract_with_ocr(page, page_num, doc_id)
            # page_tables.extend(ocr_tables)
        
        return page_tables
    
    def _detect_page_type(self, page: pdfplumber.page.Page) -> str:
        """
        Detect if page is vector-based or scanned image.
        
        Returns:
            'vector' if page has text objects, 'scanned' if likely image-based
        """
        try:
            # Count text objects
            text_objects = len(page.chars)
            
            # Count images
            images = len(page.images) if hasattr(page, 'images') else 0
            
            # Simple heuristic: if very few text objects but images present, likely scanned
            if text_objects < 10 and images > 0:
                return "scanned"
            elif text_objects > 50:
                return "vector"
            else:
                return "mixed"
                
        except Exception as e:
            logger.warning(f"Failed to detect page type: {e}")
            return "unknown"
    
    def _extract_with_pdfplumber(
        self,
        page: pdfplumber.page.Page,
        page_num: int,
        doc_id: str
    ) -> List[Dict[str, Any]]:
        """Extract tables using pdfplumber."""
        tables = []
        
        try:
            # Find tables with default settings
            found_tables = page.find_tables()
            
            logger.debug(
                f"pdfplumber found {len(found_tables)} tables on page {page_num}",
                doc_id=doc_id
            )
            
            for table_idx, table in enumerate(found_tables):
                try:
                    # Extract table data
                    table_data = table.extract()
                    
                    if not table_data or len(table_data) < 2:  # Need at least header + 1 row
                        continue
                    
                    # Get table bounding box
                    bbox = table.bbox  # (x0, top, x1, bottom)
                    
                    # Convert to unified schema
                    normalized_table = self._normalize_pdfplumber_table(
                        table_data, bbox, page_num, doc_id, table_idx, page
                    )
                    
                    if normalized_table:
                        tables.append(normalized_table)
                        
                except Exception as e:
                    logger.warning(
                        f"Failed to extract table {table_idx} on page {page_num}: {e}",
                        doc_id=doc_id
                    )
                    continue
            
        except Exception as e:
            logger.error(
                f"pdfplumber extraction failed on page {page_num}: {e}",
                doc_id=doc_id
            )
        
        return tables
    
    async def _extract_with_camelot(
        self,
        file_content: bytes,
        page_num: int,
        doc_id: str
    ) -> List[Dict[str, Any]]:
        """Extract tables using camelot as fallback."""
        tables = []
        
        if not CAMELOT_AVAILABLE:
            return tables
        
        try:
            # Save bytes to temporary file for camelot
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
                tmp_file.write(file_content)
                tmp_file_path = tmp_file.name
            
            try:
                # Try lattice method first
                camelot_tables = camelot.read_pdf(
                    tmp_file_path,
                    pages=str(page_num),
                    flavor='lattice'
                )
                
                # If lattice finds no tables, try stream
                if len(camelot_tables) == 0:
                    camelot_tables = camelot.read_pdf(
                        tmp_file_path,
                        pages=str(page_num),
                        flavor='stream'
                    )
                
                logger.debug(
                    f"camelot found {len(camelot_tables)} tables on page {page_num}",
                    doc_id=doc_id
                )
                
                for table_idx, table in enumerate(camelot_tables):
                    try:
                        # Convert to unified schema
                        normalized_table = self._normalize_camelot_table(
                            table, page_num, doc_id, table_idx
                        )
                        
                        if normalized_table:
                            tables.append(normalized_table)
                            
                    except Exception as e:
                        logger.warning(
                            f"Failed to normalize camelot table {table_idx} on page {page_num}: {e}",
                            doc_id=doc_id
                        )
                        continue
                
            finally:
                # Clean up temporary file
                import os
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(
                f"camelot extraction failed on page {page_num}: {e}",
                doc_id=doc_id
            )
        
        return tables
    
    def _normalize_pdfplumber_table(
        self,
        table_data: List[List[str]],
        bbox: Tuple[float, float, float, float],
        page_num: int,
        doc_id: str,
        table_idx: int,
        page: pdfplumber.page.Page
    ) -> Optional[Dict[str, Any]]:
        """Normalize pdfplumber table to unified schema."""
        try:
            table_id = str(uuid4())
            
            # Filter out None values and convert to strings
            clean_data = []
            for row in table_data:
                clean_row = [str(cell).strip() if cell is not None else "" for cell in row]
                clean_data.append(clean_row)
            
            if not clean_data:
                return None
            
            # Determine table dimensions
            n_rows = len(clean_data)
            n_cols = max(len(row) for row in clean_data) if clean_data else 0
            
            # Create cells array
            cells = []
            for row_idx, row in enumerate(clean_data):
                for col_idx, cell_text in enumerate(row):
                    if col_idx < n_cols:  # Ensure we don't exceed max columns
                        # Estimate cell bounding box (rough approximation)
                        cell_width = (bbox[2] - bbox[0]) / n_cols
                        cell_height = (bbox[3] - bbox[1]) / n_rows
                        
                        cell_bbox = [
                            bbox[0] + col_idx * cell_width,
                            bbox[1] + row_idx * cell_height,
                            bbox[0] + (col_idx + 1) * cell_width,
                            bbox[1] + (row_idx + 1) * cell_height
                        ]
                        
                        cell = {
                            "row": row_idx,
                            "col": col_idx,
                            "text": cell_text,
                            "bbox": cell_bbox,
                            "rowspan": 1,
                            "colspan": 1,
                            "is_header": row_idx == 0  # Assume first row is header
                        }
                        cells.append(cell)
            
            # Calculate confidence based on data quality
            confidence = self._calculate_confidence(clean_data, "pdfplumber")
            
            # Create unified schema
            unified_schema = {
                "doc_id": doc_id,
                "page": page_num,
                "table_id": table_id,
                "bbox": list(bbox),
                "n_rows": n_rows,
                "n_cols": n_cols,
                "cells": cells,
                "meta": {
                    "detector": "plumber",
                    "extraction_flavor": "lattice",
                    "confidence": confidence,
                    "processing_time_ms": 0,  # Will be set by caller
                    "page_dimensions": {
                        "width": float(page.width),
                        "height": float(page.height)
                    } if page else None,
                    "table_area_ratio": self._calculate_table_area_ratio(bbox, page),
                    "ocr_used": False
                }
            }
            
            # Validate schema (but don't reject tables for minor validation issues)
            is_valid = self.schema_validator.validate_schema(unified_schema)
            if not is_valid:
                logger.warning(f"Schema validation failed for table {table_id}, but returning anyway")
            
            return unified_schema
                
        except Exception as e:
            logger.error(f"Failed to normalize pdfplumber table: {e}")
            return None
    
    def _normalize_camelot_table(
        self,
        camelot_table,
        page_num: int,
        doc_id: str,
        table_idx: int
    ) -> Optional[Dict[str, Any]]:
        """Normalize camelot table to unified schema."""
        try:
            table_id = str(uuid4())
            
            # Get DataFrame
            df = camelot_table.df
            
            # Convert DataFrame to list of lists
            table_data = df.values.tolist()
            
            # Add column headers if they exist
            if not df.columns.empty:
                headers = df.columns.tolist()
                table_data.insert(0, headers)
            
            # Clean data
            clean_data = []
            for row in table_data:
                clean_row = [str(cell).strip() if pd.notna(cell) else "" for cell in row]
                clean_data.append(clean_row)
            
            if not clean_data:
                return None
            
            # Get table dimensions
            n_rows = len(clean_data)
            n_cols = len(clean_data[0]) if clean_data else 0
            
            # Get bounding box from camelot
            bbox = [0, 0, 100, 100]  # Default bbox, camelot doesn't provide exact bbox
            
            # Create cells array
            cells = []
            for row_idx, row in enumerate(clean_data):
                for col_idx, cell_text in enumerate(row):
                    if col_idx < n_cols:
                        cell_width = 100 / n_cols  # Normalized coordinates
                        cell_height = 100 / n_rows
                        
                        cell_bbox = [
                            col_idx * cell_width,
                            row_idx * cell_height,
                            (col_idx + 1) * cell_width,
                            (row_idx + 1) * cell_height
                        ]
                        
                        cell = {
                            "row": row_idx,
                            "col": col_idx,
                            "text": cell_text,
                            "bbox": cell_bbox,
                            "rowspan": 1,
                            "colspan": 1,
                            "is_header": row_idx == 0
                        }
                        cells.append(cell)
            
            # Get camelot confidence
            confidence = float(camelot_table.accuracy) / 100.0 if hasattr(camelot_table, 'accuracy') else 0.8
            
            # Determine extraction flavor
            flavor = camelot_table.flavor if hasattr(camelot_table, 'flavor') else "lattice"
            
            # Create unified schema
            unified_schema = {
                "doc_id": doc_id,
                "page": page_num,
                "table_id": table_id,
                "bbox": bbox,
                "n_rows": n_rows,
                "n_cols": n_cols,
                "cells": cells,
                "meta": {
                    "detector": "camelot",
                    "extraction_flavor": flavor,
                    "confidence": confidence,
                    "processing_time_ms": 0,
                    "ocr_used": False
                }
            }
            
            # Validate schema
            if self.schema_validator.validate_schema(unified_schema):
                return unified_schema
            else:
                logger.warning(f"Schema validation failed for camelot table {table_id}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to normalize camelot table: {e}")
            return None
    
    def _calculate_confidence(self, table_data: List[List[str]], detector: str) -> float:
        """Calculate confidence score based on table data quality."""
        if not table_data:
            return 0.0
        
        total_cells = sum(len(row) for row in table_data)
        empty_cells = sum(1 for row in table_data for cell in row if not cell.strip())
        
        # Base confidence by detector
        base_confidence = {
            "plumber": 0.8,
            "pdfplumber": 0.8,  # Support both names
            "camelot": 0.7,
            "ocr": 0.6
        }.get(detector, 0.5)
        
        # Adjust based on data quality
        if total_cells > 0:
            fill_ratio = 1.0 - (empty_cells / total_cells)
            confidence = base_confidence * (0.5 + 0.5 * fill_ratio)
        else:
            confidence = 0.0
        
        # Bonus for reasonable table size
        if 2 <= len(table_data) <= 50 and 2 <= len(table_data[0]) <= 20:
            confidence *= 1.1
        
        return min(confidence, 1.0)
    
    def _calculate_table_area_ratio(
        self,
        bbox: Tuple[float, float, float, float],
        page: Optional[pdfplumber.page.Page]
    ) -> Optional[float]:
        """Calculate ratio of table area to page area."""
        if not page or not bbox:
            return None
        
        try:
            table_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
            page_area = page.width * page.height
            
            if page_area > 0:
                return table_area / page_area
            else:
                return None
                
        except Exception:
            return None 