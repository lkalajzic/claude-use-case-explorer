import subprocess
import json
import os
import sys

def main():
    print("Running create_simple_use_cases.py script...")
    
    # Check if all_case_studies.json exists
    all_case_studies_path = os.path.join("data", "case_studies", "all_case_studies.json")
    
    if not os.path.exists(all_case_studies_path):
        print(f"Error: {all_case_studies_path} not found!")
        return
    
    # Run the create_simple_use_cases.py script
    try:
        result = subprocess.run(["python", "create_simple_use_cases.py"], 
                              stdout=subprocess.PIPE, 
                              stderr=subprocess.PIPE,
                              text=True,
                              check=True)
        
        print("Output:")
        print(result.stdout)
        
        if result.stderr:
            print("Errors:")
            print(result.stderr)
            
        # Check if use_cases.json was created
        use_cases_path = os.path.join("data", "taxonomies", "use_cases.json")
        
        if os.path.exists(use_cases_path):
            print(f"{use_cases_path} was successfully created!")
            
            # Read and display the first use case
            with open(use_cases_path, "r") as f:
                use_cases = json.load(f)
                
            print(f"Generated {len(use_cases)} use cases")
            
            if len(use_cases) > 0:
                print("First use case:")
                print(json.dumps(use_cases[0], indent=2))
        else:
            print(f"Error: {use_cases_path} was not created!")
            
    except subprocess.CalledProcessError as e:
        print(f"Error running script: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error output: {e.stderr}")

if __name__ == "__main__":
    main()
