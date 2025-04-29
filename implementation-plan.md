# Claude Use Case Explorer Implementation Plan

## Phase 1: Form Review Component Enhancements

### Step 1: Improve FormReview Component
- Add visual indicators for editable fields (subtle styling/icon)
- Optimize layout to reduce vertical space by ~25%
- Reorganize sections to fit within 1vh without scrolling

### Step 2: Enhance Role Distribution Editor
- Add new column for yearly cost per employee role
- Add logic to infer costs based on role and geography
- Make cost values editable with validation
- Add "time spent per week on task per employee" column
- Update validation logic to accommodate new fields
- Update styling to maintain compact layout

## Phase 2: ROI Calculation Logic Updates

### Step 3: Refine ROI Calculation
- Remove 3-Year ROI calculations from the logic
- Focus calculations on annual savings
- Update total ROI summary card to reflect changes
- Add Claude subscription cost to implementation costs
- Modify `calculateRoi` function in UseCaseMatches.jsx

### Step 4: Add Automation Level Confidence
- Create new component for automation level slider
- Add visual confidence indicator based on slider value
- Connect slider value to ROI calculations
- Update UI to show changes in real-time

## Phase 3: UseCaseMatches Component Improvements

### Step 5: Simplify Analysis Results
- Reduce vertical space of Analysis Results to 0.5vh
- Remove source/date/confidence metadata
- Condense AI Opportunity Assessment section
- Remove "Potential uses" details
- Maintain readability with cleaner layout

### Step 6: Use Case Card Redesign
- Add implementation time field to each use case
- Remove "View case study" link
- Remove "Detailed ROI analysis" button
- Remove duplicate implementation cost at bottom
- Remove employee count at bottom
- Simplify use case names for readability

### Step 7: Merge Implementation Ideas and Benefits
- Create combined section for implementation ideas and benefits
- Link company names to their case studies using URL schema
- Format to show implementation approach and results clearly
- Add hyperlinks to referenced case studies

### Step 8: Add Second-Order Benefits
- Create new section for second-order benefits
- Keep content concise (max 10 words)
- Focus on productivity gains beyond direct time savings
- Add explanatory tooltip/info icon

## Phase 4: Final Touches

### Step 9: Add Loading Screen
- Create informative loading screen
- Add message about 1-2 minute processing time
- Show progress indicator or animation
- Mention the number of case studies being analyzed

### Step 10: Final Testing and Optimization
- Test all changes with different company profiles
- Ensure responsive layout across device sizes
- Verify all calculations are correct
- Check for any performance issues

## Implementation Notes
- Focus on one component at a time
- Make sure changes to one component don't break others
- Keep consistent styling throughout
- Maintain code organization and readability
- Document changes for future developers