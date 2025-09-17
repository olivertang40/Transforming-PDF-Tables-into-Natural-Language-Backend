"""
Schema normalization and validation service.
Validates table schemas against the unified JSON schema specification.
"""

import json
import os
from typing import Dict, Any, List, Optional, Tuple

import jsonschema
from jsonschema import ValidationError

from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class SchemaValidator:
    """Validator for unified table schema."""
    
    def __init__(self):
        self.schema = self._load_json_schema()
    
    def _load_json_schema(self) -> Dict[str, Any]:
        """Load the unified table JSON schema."""
        try:
            schema_path = os.path.join(
                os.path.dirname(__file__),
                "..",
                "schemas",
                "jsonschema",
                "table_schema.json"
            )
            
            with open(schema_path, 'r', encoding='utf-8') as f:
                schema = json.load(f)
            
            logger.info("Loaded unified table schema for validation")
            return schema
            
        except Exception as e:
            logger.error(f"Failed to load JSON schema: {e}")
            # Return a minimal schema as fallback
            return {
                "type": "object",
                "required": ["doc_id", "page", "table_id", "bbox", "n_rows", "n_cols", "cells", "meta"],
                "properties": {
                    "doc_id": {"type": "string"},
                    "page": {"type": "integer", "minimum": 1},
                    "table_id": {"type": "string"},
                    "bbox": {"type": "array", "minItems": 4, "maxItems": 4},
                    "n_rows": {"type": "integer", "minimum": 1},
                    "n_cols": {"type": "integer", "minimum": 1},
                    "cells": {"type": "array"},
                    "meta": {"type": "object"}
                }
            }
    
    def validate_schema(self, table_data: Dict[str, Any]) -> bool:
        """
        Validate table data against unified schema.
        
        Args:
            table_data: Table data to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        try:
            jsonschema.validate(table_data, self.schema)
            return True
            
        except ValidationError as e:
            logger.warning(
                f"Schema validation failed: {e.message}",
                table_id=table_data.get("table_id", "unknown"),
                validation_path=list(e.absolute_path)
            )
            return False
            
        except Exception as e:
            logger.error(f"Unexpected validation error: {e}")
            return False
    
    def get_validation_errors(self, table_data: Dict[str, Any]) -> List[str]:
        """
        Get detailed validation errors for debugging.
        
        Args:
            table_data: Table data to validate
            
        Returns:
            List of error messages
        """
        errors = []
        
        try:
            jsonschema.validate(table_data, self.schema)
            
        except ValidationError as e:
            # Collect all validation errors
            validator = jsonschema.Draft7Validator(self.schema)
            for error in validator.iter_errors(table_data):
                error_path = " -> ".join(str(p) for p in error.absolute_path)
                error_msg = f"Path '{error_path}': {error.message}"
                errors.append(error_msg)
                
        except Exception as e:
            errors.append(f"Validation failed: {str(e)}")
        
        return errors
    
    def normalize_table_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize and clean table data to match schema requirements.
        
        Args:
            raw_data: Raw table data
            
        Returns:
            Normalized table data
        """
        try:
            normalized = raw_data.copy()
            
            # Ensure required fields exist
            if "doc_id" not in normalized:
                normalized["doc_id"] = "unknown"
            
            if "table_id" not in normalized:
                normalized["table_id"] = "unknown"
            
            # Ensure numeric fields are integers
            for field in ["page", "n_rows", "n_cols"]:
                if field in normalized:
                    try:
                        normalized[field] = int(normalized[field])
                    except (ValueError, TypeError):
                        logger.warning(f"Could not convert {field} to integer")
                        normalized[field] = 1
            
            # Ensure bbox is a list of 4 numbers
            if "bbox" in normalized:
                try:
                    bbox = normalized["bbox"]
                    if len(bbox) >= 4:
                        normalized["bbox"] = [float(bbox[i]) for i in range(4)]
                    else:
                        normalized["bbox"] = [0.0, 0.0, 100.0, 100.0]
                except (ValueError, TypeError, IndexError):
                    normalized["bbox"] = [0.0, 0.0, 100.0, 100.0]
            
            # Ensure cells is a list
            if "cells" not in normalized or not isinstance(normalized["cells"], list):
                normalized["cells"] = []
            
            # Normalize cells
            normalized_cells = []
            for cell in normalized.get("cells", []):
                if isinstance(cell, dict):
                    norm_cell = self._normalize_cell(cell)
                    if norm_cell:
                        normalized_cells.append(norm_cell)
            
            normalized["cells"] = normalized_cells
            
            # Ensure meta exists
            if "meta" not in normalized or not isinstance(normalized["meta"], dict):
                normalized["meta"] = {}
            
            # Add default meta fields
            meta = normalized["meta"]
            if "detector" not in meta:
                meta["detector"] = "unknown"
            if "extraction_flavor" not in meta:
                meta["extraction_flavor"] = "default"
            if "confidence" not in meta:
                meta["confidence"] = 0.5
            if "ocr_used" not in meta:
                meta["ocr_used"] = False
            
            return normalized
            
        except Exception as e:
            logger.error(f"Failed to normalize table data: {e}")
            return raw_data
    
    def _normalize_cell(self, cell: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Normalize a single cell to match schema requirements."""
        try:
            normalized = {}
            
            # Required fields with defaults
            normalized["row"] = int(cell.get("row", 0))
            normalized["col"] = int(cell.get("col", 0))
            normalized["text"] = str(cell.get("text", ""))
            normalized["rowspan"] = int(cell.get("rowspan", 1))
            normalized["colspan"] = int(cell.get("colspan", 1))
            normalized["is_header"] = bool(cell.get("is_header", False))
            
            # Bbox with validation
            bbox = cell.get("bbox", [0, 0, 10, 10])
            if isinstance(bbox, (list, tuple)) and len(bbox) >= 4:
                normalized["bbox"] = [float(bbox[i]) for i in range(4)]
            else:
                normalized["bbox"] = [0.0, 0.0, 10.0, 10.0]
            
            # Optional fields
            if "confidence" in cell:
                try:
                    normalized["confidence"] = float(cell["confidence"])
                except (ValueError, TypeError):
                    pass
            
            if "style" in cell and isinstance(cell["style"], dict):
                normalized["style"] = cell["style"]
            
            return normalized
            
        except Exception as e:
            logger.warning(f"Failed to normalize cell: {e}")
            return None
    
    def validate_and_fix(self, table_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], List[str]]:
        """
        Validate table data and attempt to fix common issues.
        
        Args:
            table_data: Table data to validate and fix
            
        Returns:
            Tuple of (is_valid, fixed_data, error_messages)
        """
        # First, try to normalize the data
        normalized_data = self.normalize_table_data(table_data)
        
        # Check if it's valid now
        is_valid = self.validate_schema(normalized_data)
        
        # Get any remaining errors
        errors = self.get_validation_errors(normalized_data) if not is_valid else []
        
        return is_valid, normalized_data, errors
    
    def get_schema_summary(self) -> Dict[str, Any]:
        """Get a summary of the schema requirements."""
        return {
            "required_fields": self.schema.get("required", []),
            "optional_fields": [
                key for key in self.schema.get("properties", {}).keys()
                if key not in self.schema.get("required", [])
            ],
            "cell_required_fields": self.schema.get("definitions", {}).get("cell", {}).get("required", []),
            "meta_required_fields": self.schema.get("definitions", {}).get("meta", {}).get("required", [])
        } 