# Evidence-Based Use Case Implementation Plan

## Overview: The Big Picture

We're transforming the recommendation system from theoretical suggestions to evidence-based examples organized by business function. Instead of generic implementation ideas and benefits, users will see real-world examples with concrete metrics from actual companies.

### Current System

- Claude analyzes company profile
- Matches to potential use cases based on role distribution
- Generates theoretical implementation ideas and benefits
- Displays these as separate sections without direct ties to evidence

### New Evidence-Based System

- Claude analyzes company profile
- Identifies ALL relevant business functions, sorted by relevance and potential ROI
- For each function, finds the most impactful use cases
- For each use case, presents real company examples with actual metrics
- Links directly to case studies for deeper exploration

## Conceptual Architecture

```
Company Profile
  │
  ↓
ALL Business Functions (sorted by relevance & potential ROI, eg "Customer Support")
  │
  ↓
Specific Use Cases per Function (e.g., "Automated Query Handling")
  │
  ↓
Real Company Examples with Metrics (e.g., "Asana → 40% reduction")
  │
  ↓
Direct Links to Case Studies
```

## Detailed Implementation Steps

### Phase 1: Data Preparation & Backend Changes

1. **Fetch Missing Case Studies** ✅ COMPLETED

   - Created `fetch_missing_case_studies.py` script that:
     - Systematically fetches all case studies from anthropic.com/customers
     - Compares with existing case studies to identify ~20 missing ones
     - Uses enhanced extraction prompts with business function categorization
     - Discovers new categories dynamically (e.g., Scientific Research, Healthcare, Education)
   
   **Enhanced extraction captures:**
   - Primary/secondary business functions with specific use case types
   - Role mappings showing which employees benefit
   - Quantitative metrics with source attribution
   - Qualitative benefits with supporting quotes
   - Implementation details and costs

2. **Create Business Function Taxonomy**

   - ✅ Enhanced taxonomy included in fetcher script with new categories:
     - Traditional: Customer Support, Marketing, Sales, Product, Engineering, Legal, Finance, HR, Operations
     - **NEW**: Scientific Research & Academia, Healthcare & Medical, Education & Training, Government & Public Sector, Non-profit & Social Impact
   - Map each to business roles (e.g., Customer Support → Customer Service Representatives)
   - Create a JSON mapping file `business_functions.json` from extracted data

3. **Execute Data Collection & Analysis**

   - **NEXT**: Run the fetcher script to collect missing case studies
   - **NEXT**: Analyze extracted data to discover actual business function patterns
   - **NEXT**: Create categorized_case_studies.json with enhanced structure
   - This will provide evidence-based examples organized by business function and use case type

4. **Modify Company Analyzer Backend (company_analyzer.py)**
   - Update the match_use_cases function to use the new taxonomy
   - Revise the Claude prompt to request evidence-based examples
   - New response structure:
     ```json
     {
       "businessFunctions": [
         {
           "id": "customer_support",
           "name": "Customer Support",
           "relevanceScore": 85,
           "potentialRoi": 125000,
           "useCases": [
             {
               "id": "automated_query_handling",
               "name": "Automated Query Handling",
               "examples": [
                 {
                   "company": "Asana",
                   "caseStudyId": "asana",
                   "implementation": "Implemented Claude to handle tier-1 support tickets",
                   "metric": "40% reduction in agent workload",
                   "metricValue": "40%",
                   "metricUnit": "reduction"
                 }
                 // Other examples
               ]
             }
             // Other use cases
           ],
           "targetRoles": [
             // Keep existing role structure for ROI calculations
           ],
           "totalEmployeesAffected": 150,
           "estimatedImplementationCost": {
             "level": "Medium",
             "range": "$10,000 - $20,000"
           }
         }
         // Other business functions
       ]
     }
     ```

### Phase 2: Frontend Updates

1. **Modify UseCaseMatches.jsx**

   - Replace current grid layout with business function-based organization
   - Create new components:
     - `BusinessFunctionCard` - Container for a business function and its use cases
     - `UseCaseExampleList` - Displays real-world examples for a use case
     - `CompanyExample` - Shows a specific company example with metrics

2. **Update Link Generation**

   - Enhance `formatCaseStudyUrl` function to handle edge cases
   - Create a special case mapping for known problematic company names
   - Add error handling when links can't be generated

3. **Create Visual Hierarchy**

   - Business function cards as main containers
   - Use case sections within each card
   - Company examples as compact items with highlighted metrics
   - Maintain ROI calculation summary at the top

4. **UI Enhancements**
   - Add business function icons for visual recognition
   - Highlight metrics with accent colors
   - Make company names visually distinct as links
   - Add toggle to expand/collapse business functions

### Phase 3: Claude Prompt Engineering

1. **Create New Claude Prompt Template**

   ````
   You are an AI implementation expert tasked with recommending Claude AI use cases based on real-world evidence.

   ## Company Analysis
   ```json
   {company_analysis_json}
   ````

   ## Available Case Studies

   ```json
   {case_studies_json}
   ```

   ## Business Function Taxonomy

   ```json
   {business_functions_json}
   ```

   ## Your Task

   Based on the company analysis, recommend ALL relevant business functions and evidence-based use cases:

   1. Include ALL business functions that are applicable to the company
   2. Sort business functions by:
      a) Relevance to the company's profile
      b) Potential ROI in dollar value
   3. For each function, identify 2-3 highest-impact use cases
   4. For each use case, provide 2-3 real company examples from the case studies
   5. Each example must include:
      - Company name
      - Brief implementation description (1 sentence)
      - Concrete metric or outcome (with numeric value when available)
      - Case study ID for linking

   Follow these guidelines:

   - Prioritize examples from the same industry when available
   - Focus on examples with clear, impressive metrics
   - Ensure examples demonstrate different approaches to the same use case
   - Maintain the existing role-based structure for ROI calculations
   - Calculate potential ROI in dollar terms for each business function

   Return ONLY a JSON object with the structure defined below...

   ```

   ```

2. **Optimize Prompt Parameters**
   - Set appropriate temperature (0.3-0.5) to balance creativity with accuracy
   - Ensure max_tokens is sufficient for comprehensive response
   - Add system message emphasizing evidence-based recommendations

### Phase 4: Testing and Refinement

1. **Test with Diverse Company Profiles**

   - Create test cases covering various industries and company sizes
   - Verify business function relevance and example selection
   - Check ROI calculations remain accurate with new structure

2. **Edge Case Handling**

   - Test with companies having unusual role distributions
   - Verify behavior when few relevant case studies exist
   - Ensure graceful degradation if categorized data is incomplete

3. **Fallback Mechanisms**
   - Create fallback to more generic examples if specific industry examples unavailable
   - Handle cases where metrics might be missing
   - Provide default structure when Claude's response doesn't match expected format

## Technical Implementation Notes

### Backward Compatibility

- ROI calculations should continue working with minimal changes
- The role-specific data must be preserved alongside the new business function structure
- All existing case study URL routes should remain valid

### Data Structure Alignment

- The existing role-based categories need to map to business functions
- This mapping occurs at two levels:
  1. In the prompt to Claude (guiding its recommendations)
  2. In the frontend (for display organization)

### URL Handling Edge Cases

- Some company names require special formatting for URLs:
  - Names with periods (e.g., "copy.ai" → "copy_ai")
  - Multi-word names (e.g., "SK Telecom" → "sk-telecom")
  - Names with special characters
- Implement a lookup table for known edge cases
- Add fallback URL generation with proper slugification

## Implementation Timeline

1. **Data Preparation (1-2 days)**

   - Create business function taxonomy
   - Analyze and categorize case studies
   - Generate enhanced data structure

2. **Backend Changes (2-3 days)**

   - Update prompt engineering
   - Modify response structure
   - Test Claude responses

3. **Frontend Development (3-4 days)**

   - Create new component hierarchy
   - Implement business function organization
   - Add company example formatting with metrics
   - Update link generation

4. **Testing and Refinement (2-3 days)**
   - Test with diverse company profiles
   - Address edge cases
   - Optimize performance

## Migration Strategy

Rather than rebuilding everything at once, we'll use a phased approach:

1. First, implement the backend changes and test Claude's responses
2. Then, create the new frontend components while maintaining the old ones
3. Once both are working, switch from the old display to the new organization
4. Run parallel tests comparing old and new approaches
5. Finally, remove deprecated components and code

This approach ensures we can revert if issues arise while minimizing disruption to the application.
