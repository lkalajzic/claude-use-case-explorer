"""
Test script for enhanced company analyzer with role-specific recommendations

This script tests the enhanced company analyzer that extracts employee role information
and provides role-specific use case recommendations and ROI estimates.

Author: Luka
Date: April 14, 2025
"""

import os
import json
from dotenv import load_dotenv
from analyzers.company_analyzer import CompanyAnalyzer

# Load environment variables from .env file
load_dotenv()

def test_description_analyzer():
    """
    Test the enhanced description analyzer with a sample company description
    """
    # Get API key from environment
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not found in environment variables")
        return
    
    # Initialize the analyzer
    analyzer = CompanyAnalyzer(api_key)
    
    # Sample company description with employee role information
    sample_description = """
    TechSolutions Inc. is a mid-size technology company with approximately 500 employees globally.
    Founded in 2010, we specialize in enterprise software solutions for the financial services industry.
    
    Our team consists of about 200 software engineers working on our core products, 100 customer support
    specialists handling client inquiries, 50 marketing professionals managing our brand and content,
    75 sales representatives, 25 legal and compliance experts, and 50 administrative staff.
    
    We're facing challenges with scaling our customer support operations and improving the efficiency
    of our documentation processes. Our engineering team spends significant time writing and maintaining
    technical documentation, and our support team struggles to quickly find relevant information when
    responding to customer inquiries.
    
    We're looking for AI solutions that could help automate repetitive tasks and improve knowledge
    management across the organization.
    """
    
    print("Testing enhanced company description analyzer...")
    
    # Analyze the description
    result = analyzer.analyze_description(sample_description)
    
    # Save the result to a file for inspection
    with open("enhanced_analysis_result.json", "w") as f:
        json.dump(result, f, indent=2)
    
    print("Analysis complete. Results saved to 'enhanced_analysis_result.json'")
    
    # Now test the use case matching with the analyzed data
    print("\nMatching to use cases...")
    
    # Match to use cases
    matches = analyzer.match_use_cases(result)
    
    # Save the matches to a file for inspection
    with open("enhanced_matches_result.json", "w") as f:
        json.dump(matches, f, indent=2)
    
    print("Matching complete. Results saved to 'enhanced_matches_result.json'")
    
    return result, matches

if __name__ == "__main__":
    test_description_analyzer()
