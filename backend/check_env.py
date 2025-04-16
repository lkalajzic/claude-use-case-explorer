"""
Utility script to check environment and Anthropic client configuration.
Also includes a utility to test case study ID formatting for URL links.

Author: Luka
Updated: April 16, 2025
"""

import os
import sys
import json
import re
import importlib.metadata
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

def check_environment():
    """Check environment and installed packages"""
    print("=== Environment Check ===")
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")

    # Check for Anthropic API key in environment
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    print(f"ANTHROPIC_API_KEY present: {'Yes' if api_key else 'No'}")

    # Check installed packages
    try:
        anthropic_version = importlib.metadata.version('anthropic')
        print(f"Anthropic library version: {anthropic_version}")

        # Import anthropic to examine available classes
        import anthropic
        print(f"Available classes/modules in anthropic: {dir(anthropic)}")
        print(f"ANTHROPIC_API_BASE in env: {os.environ.get('ANTHROPIC_API_BASE', 'Not set')}")
    except Exception as e:
        print(f"Error checking anthropic library: {e}")

def format_case_study_id(id_str):
    """
    Format a case study ID for URL usage in frontend
    
    Args:
        id_str: The original ID string
        
    Returns:
        Formatted ID string for URL
    """
    if not id_str:
        return ""
    
    # Handle special cases based on the examples provided
    # 1. Convert dots to underscores (e.g., copy.ai -> copy_ai)
    # 2. Keep hyphens as is
    # 3. Take only the first part before parentheses or spaces
    # 4. Make everything lowercase
    
    formatted_id = id_str.lower()
    formatted_id = formatted_id.replace(".", "_")
    formatted_id = re.sub(r"\s+\([^)]*\)", "", formatted_id)  # Remove anything in parentheses with preceding space
    formatted_id = formatted_id.split()[0]  # Take only the first part before any spaces
    
    return formatted_id

def test_case_study_formatting():
    """
    Test case study ID formatting with examples from the project
    """
    print("\n=== Case Study ID Formatting Test ===")
    
    # Load all case studies to test their IDs
    try:
        case_studies_path = os.path.join(os.path.dirname(__file__), "data", "case_studies", "all_case_studies.json")
        with open(case_studies_path, 'r') as f:
            case_studies_data = json.load(f)
        
        if 'caseStudies' in case_studies_data:
            case_studies = case_studies_data['caseStudies']
            print(f"Testing {len(case_studies)} case study IDs...")
            
            for idx, case_study in enumerate(case_studies[:10]):  # Test first 10 for brevity
                original_id = case_study.get('id', '')
                formatted_id = format_case_study_id(original_id)
                print(f"{idx+1}. '{original_id}' -> '/use-cases/{formatted_id}'")
                
            # Also test some specific examples
            test_cases = [
                "advolve",
                "copy.ai",
                "zapia (by brainlogic)",
                "Brand-AI",
                "lazy.ai"
            ]
            
            print("\nTesting specific examples:")
            for test_case in test_cases:
                formatted_id = format_case_study_id(test_case)
                print(f"'{test_case}' -> '/use-cases/{formatted_id}'")
                
        else:
            print("No case studies found in file.")
    except Exception as e:
        print(f"Error testing case study formatting: {e}")

if __name__ == "__main__":
    check_environment()
    test_case_study_formatting()
    print("\n=== End Check ===")
