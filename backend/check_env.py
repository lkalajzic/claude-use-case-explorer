"""
Utility script to check environment and Anthropic client configuration
"""

import os
import sys
import importlib.metadata

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

print("\n=== End Environment Check ===")
