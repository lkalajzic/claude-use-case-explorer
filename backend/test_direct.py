#!/usr/bin/env python3
"""
Direct test of the analyze_and_match_combined method
"""

import os
import json
from dotenv import load_dotenv
from analyzers.company_analyzer import CompanyAnalyzer

# Load environment variables
load_dotenv()

# Test company description
india_saas_description = """
We are a B2B SaaS company based in India with 850 employees providing cloud-based enterprise resource planning (ERP) solutions to mid-market companies globally. 

Our workforce consists of:
- 200 software engineers building our core platform
- 50 product managers and designers shaping our product roadmap
- 40 data analysts and business intelligence team members
- 180 customer success and support representatives handling client queries
- 120 sales representatives driving new business
- 80 marketing professionals managing our brand and demand generation
- 30 HR and recruiting staff supporting our growing team
- 25 finance and accounting team members
- 20 legal and compliance officers ensuring regulatory adherence
- 15 executives and senior leadership guiding strategy
- 90 other operations and administrative staff

Key challenges we face:
- Customer support ticket volume has doubled in the last year
- Sales team spends too much time on manual prospect research
- Engineering team has a growing documentation backlog
- Marketing struggles to produce content at the pace needed
- Data analysis requests are bottlenecked with our BI team
"""

def test_direct():
    """Test the analyzer directly"""
    print("🚀 Direct Test of analyze_and_match_combined")
    print("=" * 50)
    
    # Get API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ Error: ANTHROPIC_API_KEY not set")
        return
    
    try:
        # Initialize analyzer
        print("Initializing analyzer...")
        analyzer = CompanyAnalyzer(api_key)
        
        # Run analysis
        print("\nRunning analysis...")
        result = analyzer.analyze_and_match_combined(india_saas_description)
        
        # Print results
        print("\n✅ Analysis Complete!")
        
        # Company info
        company_info = result.get('companyInfo', {})
        print(f"\nCompany Info:")
        print(f"  Name: {company_info.get('name', 'Not detected')}")
        print(f"  Industry: {company_info.get('industry', 'Not detected')}")
        print(f"  Total Employees: {company_info.get('totalEmployees', 0)}")
        print(f"  Headquarters: {company_info.get('headquarters', 'Not detected')}")
        
        # Business functions
        print(f"\nBusiness Functions:")
        functions = result.get('businessFunctions', [])
        total_mapped = 0
        
        for func in functions:
            emp_count = func.get('employeeCount', 0)
            avg_salary = func.get('avgSalaryUSD', 0)
            total_mapped += emp_count
            
            print(f"\n  {func.get('name')}:")
            print(f"    Employees: {emp_count}")
            print(f"    Avg Salary: ${avg_salary:,}/year")
            print(f"    Use Cases: {len(func.get('useCases', []))}")
            
            # Special check for Product & Engineering
            if func.get('name') == 'Product & Engineering':
                print(f"    ✓ Should be 290 (200+50+40), got {emp_count}")
        
        # Summary
        print(f"\n📊 Summary:")
        print(f"  Total Employees Mapped: {total_mapped} (should be 850)")
        print(f"  Total Functions: {len(functions)} (should be 9)")
        
        # Save full result
        with open('test_direct_result.json', 'w') as f:
            json.dump(result, f, indent=2)
        print("\n✅ Full result saved to test_direct_result.json")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct()