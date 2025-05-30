#!/usr/bin/env python3
"""
Analyze business functions across all case studies
"""

import json
import os
from collections import defaultdict, Counter
from pathlib import Path

def analyze_case_studies():
    case_studies_dir = Path("data/case_studies")
    
    # Statistics to track
    total_files = 0
    files_with_business_functions = 0
    files_without_business_functions = 0
    
    # Business function statistics
    business_function_counts = Counter()
    use_case_type_by_function = defaultdict(Counter)
    roles_by_function = defaultdict(Counter)
    primary_function_counts = Counter()
    
    # Company size and industry stats
    company_sizes = Counter()
    industries = Counter()
    
    # Process all JSON files
    for file_path in case_studies_dir.glob("*.json"):
        if file_path.name == "all_case_studies.json":
            continue
            
        total_files += 1
        
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Check for businessFunctions field
            if 'businessFunctions' in data:
                files_with_business_functions += 1
                
                # Extract company info
                if 'companySize' in data:
                    company_sizes[data['companySize']] += 1
                if 'industry' in data:
                    industries[data['industry']] += 1
                
                # Analyze business functions
                for func in data['businessFunctions']:
                    function_name = func.get('function', 'Unknown')
                    business_function_counts[function_name] += 1
                    
                    # Track primary functions
                    if func.get('isPrimary', False):
                        primary_function_counts[function_name] += 1
                    
                    # Track use case types
                    for use_case_type in func.get('useCaseTypes', []):
                        use_case_type_by_function[function_name][use_case_type] += 1
                    
                    # Track roles affected
                    for role in func.get('rolesAffected', []):
                        roles_by_function[function_name][role] += 1
            else:
                files_without_business_functions += 1
                
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")
    
    # Print analysis results
    print("=" * 80)
    print("CASE STUDY ANALYSIS SUMMARY")
    print("=" * 80)
    print(f"\n1. FILE STATISTICS:")
    print(f"   Total case study files: {total_files}")
    print(f"   Files with businessFunctions: {files_with_business_functions}")
    print(f"   Files without businessFunctions: {files_without_business_functions}")
    
    print(f"\n2. BUSINESS FUNCTIONS DISTRIBUTION:")
    print(f"   Total unique business functions: {len(business_function_counts)}")
    print(f"\n   Function counts (sorted by frequency):")
    for func, count in business_function_counts.most_common():
        primary_count = primary_function_counts.get(func, 0)
        print(f"   - {func}: {count} occurrences ({primary_count} as primary)")
    
    print(f"\n3. TOP USE CASE TYPES BY BUSINESS FUNCTION:")
    for func in sorted(use_case_type_by_function.keys()):
        print(f"\n   {func}:")
        top_use_cases = use_case_type_by_function[func].most_common(10)
        for use_case, count in top_use_cases:
            print(f"      - {use_case}: {count}")
    
    print(f"\n4. COMPANY SIZE DISTRIBUTION:")
    for size, count in company_sizes.most_common():
        print(f"   - {size}: {count}")
    
    print(f"\n5. INDUSTRY DISTRIBUTION:")
    for industry, count in industries.most_common(10):
        print(f"   - {industry}: {count}")
    
    print(f"\n6. TOP ROLES BY BUSINESS FUNCTION:")
    for func in sorted(roles_by_function.keys()):
        print(f"\n   {func}:")
        top_roles = roles_by_function[func].most_common(5)
        for role, count in top_roles:
            print(f"      - {role}: {count}")
    
    # Export unique business functions to JSON
    business_functions_data = {
        "business_functions": sorted(list(business_function_counts.keys())),
        "function_details": {}
    }
    
    for func in sorted(business_function_counts.keys()):
        business_functions_data["function_details"][func] = {
            "total_occurrences": business_function_counts[func],
            "primary_occurrences": primary_function_counts.get(func, 0),
            "common_use_case_types": [uc for uc, _ in use_case_type_by_function[func].most_common(10)],
            "common_roles": [role for role, _ in roles_by_function[func].most_common(10)]
        }
    
    # Save to JSON file
    output_path = Path("data/taxonomies/business_functions.json")
    with open(output_path, 'w') as f:
        json.dump(business_functions_data, f, indent=2)
    
    print(f"\n\nBusiness functions taxonomy saved to: {output_path}")

if __name__ == "__main__":
    analyze_case_studies()