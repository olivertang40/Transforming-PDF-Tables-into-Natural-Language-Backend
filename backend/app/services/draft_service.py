"""
AI Draft Service for generating natural language descriptions from table schemas.
Handles LLM integration, prompt management, cost tracking, and response validation.
"""

import json
from typing import Dict, Any, Optional

import openai
from openai import AsyncOpenAI

from app.core.config import get_settings
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class DraftService:
    """Service for generating AI drafts from table schemas."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.prompt_version = "v1.0"
        
        # Token cost per 1K tokens (approximate, update with current pricing)
        self.token_costs = {
            "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
            "gpt-4o": {"input": 0.005, "output": 0.015},
            "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015}
        }
    
    def create_prompt(self, table_schema: Dict[str, Any]) -> str:
        """
        Create a prompt for generating natural language description from table schema.
        
        The prompt instructs the LLM to:
        1. Analyze the table structure and content
        2. Generate a faithful, concise description
        3. Preserve exact numbers, units, and ranges
        4. Identify key rules and exceptions
        5. Structure output in specific sections
        
        Args:
            table_schema: Unified table schema JSON
            
        Returns:
            Formatted prompt string
        """
        # Extract key information from schema
        meta = table_schema.get("meta", {})
        cells = table_schema.get("cells", [])
        n_rows = table_schema.get("n_rows", 0)
        n_cols = table_schema.get("n_cols", 0)
        
        # Get header and sample rows
        header_cells = [cell for cell in cells if cell.get("is_header", False)]
        data_cells = [cell for cell in cells if not cell.get("is_header", False)]
        
        # Group cells by row for better structure
        rows_by_number = {}
        for cell in cells:
            row_num = cell.get("row", 0)
            if row_num not in rows_by_number:
                rows_by_number[row_num] = []
            rows_by_number[row_num].append(cell)
        
        # Get header row (usually row 0)
        header_row = rows_by_number.get(0, [])
        header_texts = [cell.get("text", "").strip() for cell in sorted(header_row, key=lambda x: x.get("col", 0))]
        
        # Get sample data rows (2-3 representative rows)
        sample_rows = []
        for row_num in sorted(rows_by_number.keys())[1:4]:  # Skip header, take next 3
            if row_num in rows_by_number:
                row_cells = sorted(rows_by_number[row_num], key=lambda x: x.get("col", 0))
                row_texts = [cell.get("text", "").strip() for cell in row_cells]
                sample_rows.append(row_texts)
        
        # Build prompt
        prompt = f"""Convert the following table schema to a faithful, concise natural language description for compliance guidelines.

INSTRUCTIONS:
- Analyze the table structure and content carefully
- Generate a clear description that preserves exact numbers, units, and ranges
- Identify key rules, patterns, and exceptions
- Do NOT fabricate or assume information not present in the data
- Structure your response in the specified sections below

TABLE INFORMATION:
- Dimensions: {n_rows} rows × {n_cols} columns
- Detection method: {meta.get('detector', 'unknown')}
- Confidence: {meta.get('confidence', 0.0):.2f}
- Page number: {table_schema.get('page', 'unknown')}

HEADER ROW:
{' | '.join(header_texts) if header_texts else 'No clear headers identified'}

SAMPLE DATA ROWS:
"""
        
        for i, row in enumerate(sample_rows, 1):
            prompt += f"Row {i}: {' | '.join(row)}\n"
        
        if not sample_rows:
            prompt += "No data rows available\n"
        
        prompt += f"""
RESPONSE FORMAT:
Structure your response with these sections:

**Purpose**
[Brief description of what this table contains and its purpose]

**Structure**
[Description of the table organization, columns, and data types]

**Key Rules**
[Main rules, requirements, or patterns identified in the data]

**Exceptions**
[Any exceptions, special cases, or variations noted]

**Data Quality Notes**
[Any observations about data completeness, consistency, or quality issues]

Generate the description now:"""
        
        return prompt
    
    async def generate_draft(
        self,
        table_schema: Dict[str, Any],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Generate AI draft using LLM.
        
        Args:
            table_schema: Unified table schema
            model: LLM model to use
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Dict containing generated text, usage stats, and metadata
            
        Raises:
            ValueError: If API key not configured or generation fails
        """
        if not self.client:
            # Return mock response for development
            return self._generate_mock_draft(table_schema, model)
        
        logger.info(
            "Generating AI draft",
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        try:
            # Create prompt
            prompt = self.create_prompt(table_schema)
            
            # Call OpenAI API
            response = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at analyzing tables and creating compliance guideline descriptions. Generate clear, accurate descriptions that preserve all important details from the source data."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # Extract response
            draft_text = response.choices[0].message.content
            usage = response.usage
            
            # Calculate cost
            cost_usd = self._calculate_cost(model, usage.prompt_tokens, usage.completion_tokens)
            
            # Create trace for debugging
            trace = {
                "prompt_tokens": usage.prompt_tokens,
                "completion_tokens": usage.completion_tokens,
                "total_tokens": usage.total_tokens,
                "model": model,
                "temperature": temperature,
                "prompt_preview": prompt[:200] + "..." if len(prompt) > 200 else prompt
            }
            
            logger.info(
                "AI draft generated successfully",
                model=model,
                input_tokens=usage.prompt_tokens,
                output_tokens=usage.completion_tokens,
                cost_usd=cost_usd
            )
            
            return {
                "text": draft_text,
                "model": model,
                "prompt_version": self.prompt_version,
                "temperature": temperature,
                "usage": {
                    "input_tokens": usage.prompt_tokens,
                    "output_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens,
                    "cost_usd": cost_usd
                },
                "trace": trace
            }
            
        except Exception as e:
            logger.error(f"AI draft generation failed: {e}")
            raise ValueError(f"Failed to generate AI draft: {str(e)}")
    
    def _calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate estimated cost for API usage."""
        costs = self.token_costs.get(model, {"input": 0.001, "output": 0.002})
        
        input_cost = (input_tokens / 1000) * costs["input"]
        output_cost = (output_tokens / 1000) * costs["output"]
        
        return round(input_cost + output_cost, 6)
    
    def _generate_mock_draft(self, table_schema: Dict[str, Any], model: str) -> Dict[str, Any]:
        """Generate mock draft for development/testing."""
        logger.warning("Using mock AI draft generation (no API key configured)")
        
        n_rows = table_schema.get("n_rows", 0)
        n_cols = table_schema.get("n_cols", 0)
        detector = table_schema.get("meta", {}).get("detector", "unknown")
        
        mock_text = f"""**Purpose**
This table contains structured data extracted from a document using {detector} detection method.

**Structure**
The table has {n_rows} rows and {n_cols} columns. Data appears to be organized in a tabular format with headers and data rows.

**Key Rules**
- Table structure follows standard row/column format
- Data extraction confidence varies by detection method
- Column headers provide context for data interpretation

**Exceptions**
- Some cells may contain merged content spanning multiple rows or columns
- Data quality depends on source document clarity and extraction method

**Data Quality Notes**
This is a mock draft generated for development purposes. In production, this would contain detailed analysis of the actual table content and structure based on the extracted schema."""
        
        # Mock usage statistics
        estimated_input_tokens = len(self.create_prompt(table_schema)) // 4  # Rough estimate
        estimated_output_tokens = len(mock_text) // 4
        
        return {
            "text": mock_text,
            "model": model,
            "prompt_version": self.prompt_version,
            "temperature": 0.7,
            "usage": {
                "input_tokens": estimated_input_tokens,
                "output_tokens": estimated_output_tokens,
                "total_tokens": estimated_input_tokens + estimated_output_tokens,
                "cost_usd": 0.001  # Mock cost
            },
            "trace": {
                "mock": True,
                "reason": "No API key configured"
            }
        }
    
    def validate_draft(self, draft_text: str) -> Dict[str, Any]:
        """
        Validate generated draft for completeness and structure.
        
        Args:
            draft_text: Generated draft text
            
        Returns:
            Validation results with scores and feedback
        """
        validation = {
            "is_valid": True,
            "score": 1.0,
            "issues": [],
            "suggestions": []
        }
        
        required_sections = ["Purpose", "Structure", "Key Rules", "Exceptions"]
        found_sections = []
        
        for section in required_sections:
            if f"**{section}**" in draft_text or f"{section}:" in draft_text:
                found_sections.append(section)
        
        missing_sections = set(required_sections) - set(found_sections)
        if missing_sections:
            validation["issues"].append(f"Missing sections: {', '.join(missing_sections)}")
            validation["score"] *= 0.8
        
        # Check length
        if len(draft_text) < 100:
            validation["issues"].append("Draft is too short")
            validation["score"] *= 0.7
        elif len(draft_text) > 2000:
            validation["issues"].append("Draft is very long")
            validation["score"] *= 0.9
        
        # Check for placeholder text
        placeholder_phrases = ["[Brief description", "[Description of", "[Main rules"]
        for phrase in placeholder_phrases:
            if phrase in draft_text:
                validation["issues"].append("Contains placeholder text")
                validation["score"] *= 0.6
                break
        
        validation["is_valid"] = len(validation["issues"]) == 0 and validation["score"] >= 0.7
        
        return validation 