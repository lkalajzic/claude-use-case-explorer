#!/usr/bin/env python3
"""
Simple script to run the test_enhanced_analyzer.py with proper environment setup.
"""
import os
import sys
import subprocess

if __name__ == "__main__":
    # Ensure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print(f"Running from directory: {os.getcwd()}")
    
    # Check if API key is set
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable is not set.")
        sys.exit(1)
    
    # Run the test script
    cmd = [sys.executable, "test_enhanced_analyzer.py"]
    result = subprocess.run(cmd)
    
    # Exit with the same exit code
    sys.exit(result.returncode)
