#!/usr/bin/env python3
"""
Test script for India B2B SaaS company example
Tests the new analyze-and-match endpoint
"""

import requests
import json

# Backend URL
API_URL = "http://localhost:5001/api/analyze-and-match"

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

def test_analyze_and_match():
    """Test the analyze-and-match endpoint"""
    print("Testing /api/analyze-and-match endpoint...")
    print("-" * 50)
    
    # Prepare request
    payload = {
        "description": india_saas_description
    }
    
    try:
        # Make request
        response = requests.post(API_URL, json=payload)
        
        # Check response
        if response.status_code == 200:
            result = response.json()
            
            # Print company info
            print("\n✅ Company Info:")
            company_info = result.get('companyInfo', {})
            print(f"  Name: {company_info.get('name', 'Not detected')}")
            print(f"  Industry: {company_info.get('industry', 'Not detected')}")
            print(f"  Total Employees: {company_info.get('totalEmployees', 0)}")
            print(f"  Headquarters: {company_info.get('headquarters', 'Not detected')}")
            
            # Check business functions
            print("\n✅ Business Functions:")
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
                
                # Check if it's Product & Engineering to verify mapping
                if func.get('name') == 'Product & Engineering':
                    print(f"    ✓ Should be 290 (200+50+40), got {emp_count}")
            
            # Verify totals
            print(f"\n📊 Total Employees Mapped: {total_mapped} (should be 850)")
            print(f"📊 Total Functions: {len(functions)} (should be 9)")
            
            # Check salary adjustments for India
            print("\n💰 Salary Adjustments (India):")
            for func in functions[:3]:  # Show first 3
                salary = func.get('avgSalaryUSD', 0)
                print(f"  {func.get('name')}: ${salary:,}/year")
            
            # Save full response
            with open('test_india_response.json', 'w') as f:
                json.dump(result, f, indent=2)
            print("\n✅ Full response saved to test_india_response.json")
            
        else:
            print(f"\n❌ Error: Status code {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"\n❌ Request failed: {e}")

def test_with_corrected_data():
    """Test with corrected data (Phase 2)"""
    print("\n\nTesting with corrected data...")
    print("-" * 50)
    
    corrected_data = {
        "companyInfo": {
            "name": "TechCorp India",
            "industry": "Information Technology",
            "totalEmployees": 850,
            "headquarters": "India"
        },
        "businessFunctions": [
            {
                "id": "product_engineering",
                "name": "Product & Engineering",
                "employeeCount": 290,
                "avgSalaryUSD": 120000,
                "adjustedSalaryUSD": 24000  # India adjustment
            },
            {
                "id": "customer_support",
                "name": "Customer Support",
                "employeeCount": 180,
                "avgSalaryUSD": 40000,
                "adjustedSalaryUSD": 8000
            },
            # Add other functions as needed...
        ]
    }
    
    payload = {
        "description": india_saas_description,
        "correctedData": corrected_data
    }
    
    # Make request with corrected data
    # (This will be used in Phase 3 after frontend work)
    print("✅ Ready for testing with corrected data in Phase 3")

if __name__ == "__main__":
    print("🚀 Testing India B2B SaaS Example")
    print("=" * 50)
    
    # Test basic flow
    test_analyze_and_match()
    
    # Show how corrected data will work
    test_with_corrected_data()