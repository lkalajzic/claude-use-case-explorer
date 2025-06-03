#!/usr/bin/env python3
"""Test the new evidence-based company analyzer"""

import json
import os
import sys
from dotenv import load_dotenv
from analyzers.company_analyzer import CompanyAnalyzer

# Load environment variables
load_dotenv()

def test_company_analysis():
    # Initialize analyzer
    analyzer = CompanyAnalyzer()
    
    # Test company description
    test_company = """
    We are a mid-market healthcare company with 500 employees. 
    Our breakdown includes:
    - 150 customer service representatives handling patient inquiries
    - 100 software engineers building our patient portal
    - 50 sales team members
    - 30 marketing professionals
    - 50 operations staff
    - 20 HR team members
    - 15 finance team
    - 10 legal/compliance officers
    - 75 other administrative staff
    
    We struggle with high call volumes in customer service and need to 
    streamline our software development processes. We also want to improve
    our sales enablement and marketing content creation.
    """
    
    print("Testing company analysis with new evidence-based format...")
    print("-" * 80)
    
    # Analyze the company
    analysis = analyzer.analyze_description(test_company)
    print("Company Analysis Complete!")
    
    # Debug: show all keys in analysis
    print("\nAnalysis keys:", list(analysis.keys()))
    
    # Extract company info from nested structure
    company_info = analysis.get('companyInfo', {})
    print(f"\nIndustry: {company_info.get('industry', 'N/A')}")
    print(f"Size: {company_info.get('companySize', 'N/A')}")
    
    # Total employees from employeeRoles
    total_employees = analysis.get('employeeRoles', {}).get('totalEmployees', {}).get('count', 'N/A')
    print(f"Total Employees: {total_employees}")
    
    print("\nEmployee Distribution:")
    employee_roles = analysis.get('employeeRoles', {})
    if isinstance(employee_roles, dict) and 'roleDistribution' in employee_roles:
        for role in employee_roles['roleDistribution']:
            print(f"  - {role.get('role', 'Unknown')}: {role.get('count', 0)} ({role.get('percentage', 0)}%)")
    else:
        print("  No employee roles found or unexpected format")
    
    print("\n" + "-" * 80)
    print("Matching to evidence-based use cases...")
    
    # Match use cases
    matches = analyzer.match_use_cases(analysis)
    
    # Check if we got the new format
    if "businessFunctions" in matches:
        print("\n✅ NEW EVIDENCE-BASED FORMAT DETECTED!")
        print(f"Found {len(matches['businessFunctions'])} business functions")
        
        for idx, func in enumerate(matches['businessFunctions'], 1):
            print(f"\n{idx}. {func['name']} (Score: {func['relevanceScore']})")
            print(f"   Why relevant: {func['whyRelevant']}")
            print(f"   Employees affected: {func['totalEmployeesAffected']}")
            print(f"   Estimated ROI: {func.get('estimatedROI', 'N/A')}")
            
            if 'examples' in func and func['examples']:
                print(f"\n   Real-world examples:")
                for ex in func['examples'][:2]:  # Show first 2 examples
                    print(f"   • {ex['company']} ({ex['industry']}, {ex['size']})")
                    print(f"     {ex['implementation']}")
                    print(f"     → {ex['metric']}")
    
    elif "useCases" in matches:
        print("\n⚠️  OLD FORMAT DETECTED - Need to update Claude prompt")
        print(f"Found {len(matches['useCases'])} use cases")
    
    else:
        print("\n❌ ERROR: Unexpected response format")
        print(json.dumps(matches, indent=2))
    
    # Save the full response for inspection
    output_file = "test_new_analyzer_output.json"
    with open(output_file, "w") as f:
        json.dump({
            "analysis": analysis,
            "matches": matches
        }, f, indent=2)
    
    print(f"\nFull response saved to: {output_file}")

if __name__ == "__main__":
    test_company_analysis()