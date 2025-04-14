'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { benchmarksApi, roiCalculatorApi } from '../../services/api';

const ROICalculator = () => {
  const searchParams = useSearchParams();
  const [useCase, setUseCase] = useState(searchParams.get('useCase') || '');
  const [industry, setIndustry] = useState(searchParams.get('industry') || 'Technology');
  const [relevanceScore] = useState(searchParams.get('relevanceScore') || '');
  
  // Form state
  const [employeeCount, setEmployeeCount] = useState(100);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [timeSpentPerWeek, setTimeSpentPerWeek] = useState(10);
  const [automationLevel, setAutomationLevel] = useState(70);
  
  // Benchmark state
  const [benchmarks, setBenchmarks] = useState(null);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState(true);
  const [benchmarkError, setBenchmarkError] = useState(null);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState({
    time_savings: { median: 0.3, min: 0.1, max: 0.5, count: 0 },
    cost_savings: { median: 0.25, min: 0.1, max: 0.4, count: 0 },
    implementation_cost: { base: 5000, perEmployee: 50 }
  });
  const [dataSource, setDataSource] = useState('Default');
  
  // Results state
  const [annualSavings, setAnnualSavings] = useState(0);
  const [implementationCost, setImplementationCost] = useState(0);
  const [roi, setRoi] = useState(0);
  const [paybackPeriod, setPaybackPeriod] = useState(0);
  const [confidenceInterval, setConfidenceInterval] = useState({low: 0, high: 0});
  const [calculationMode, setCalculationMode] = useState('client'); // 'client' or 'backend'
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch benchmarks from the API
  useEffect(() => {
    const fetchBenchmarkData = async () => {
      setIsLoadingBenchmarks(true);
      setBenchmarkError(null);
      
      try {
        const data = await benchmarksApi.getBenchmarks();
        setBenchmarks(data);
        
        // Find relevant benchmarks for selected industry and use case
        updateSelectedBenchmarks(data, industry, useCase);
        
        setIsLoadingBenchmarks(false);
      } catch (error) {
        console.error('Error fetching benchmarks:', error);
        setBenchmarkError('Failed to load benchmark data');
        setIsLoadingBenchmarks(false);
      }
    };
    
    fetchBenchmarkData();
  }, []);
  
  // Fetch use cases for the dropdown
  const [useCaseOptions, setUseCaseOptions] = useState([]);
  const [isLoadingUseCases, setIsLoadingUseCases] = useState(false);
  
  useEffect(() => {
    const fetchUseCases = async () => {
      setIsLoadingUseCases(true);
      try {
        // We only need the use case categories for the dropdown
        const useCaseCategories = [
          { id: '', name: 'Select a use case' },
          { id: 'Customer Service', name: 'Customer Service Automation' },
          { id: 'Content Creation', name: 'Content Generation & Repurposing' },
          { id: 'Knowledge Management', name: 'Knowledge Management & Retrieval' },
          { id: 'Research & Analysis', name: 'Research & Data Analysis' },
          { id: 'Software Development', name: 'Software Development Assistance' },
          { id: 'Other', name: 'Other Use Cases' }
        ];
        
        setUseCaseOptions(useCaseCategories);
      } catch (error) {
        console.error('Error fetching use cases:', error);
      } finally {
        setIsLoadingUseCases(false);
      }
    };
    
    fetchUseCases();
  }, []);
  
  // Update selected benchmarks when industry or use case changes
  useEffect(() => {
    if (benchmarks) {
      updateSelectedBenchmarks(benchmarks, industry, useCase);
    }
  }, [industry, useCase, benchmarks]);

  // Function to update selected benchmarks based on industry and use case
  const updateSelectedBenchmarks = (data, selectedIndustry, selectedUseCase) => {
    let timeSavingsBenchmark = { median: 0.3, min: 0.1, max: 0.5, count: 0 };
    let costSavingsBenchmark = { median: 0.25, min: 0.1, max: 0.4, count: 0 };
    let implementationCostModel = { base: 5000, perEmployee: 50 };
    let source = 'Default';
    
    // Only proceed if we have data
    if (data && data.industries && data.use_cases) {
      // Check use case specific benchmarks first
      if (selectedUseCase && data.use_cases[selectedUseCase]) {
        const useCaseData = data.use_cases[selectedUseCase];
        
        if (useCaseData.time_savings) {
          timeSavingsBenchmark = useCaseData.time_savings;
          source = `${selectedUseCase} use case (${timeSavingsBenchmark.count} case studies)`;
        }
        
        if (useCaseData.cost_savings) {
          costSavingsBenchmark = useCaseData.cost_savings;
        }
        
        // Adjust implementation cost based on use case complexity
        if (selectedUseCase === 'Software Development' || selectedUseCase === 'Research & Analysis') {
          implementationCostModel = { base: 8000, perEmployee: 75 };
        } else if (selectedUseCase === 'Customer Service') {
          implementationCostModel = { base: 10000, perEmployee: 60 };
        }
      }
      // Fall back to industry benchmarks if we don't have use case specific ones
      else if (selectedIndustry && data.industries[selectedIndustry]) {
        const industryData = data.industries[selectedIndustry];
        
        if (industryData.time_savings && timeSavingsBenchmark.count === 0) {
          timeSavingsBenchmark = industryData.time_savings;
          source = `${selectedIndustry} industry (${timeSavingsBenchmark.count} case studies)`;
        }
        
        if (industryData.cost_savings && costSavingsBenchmark.count === 0) {
          costSavingsBenchmark = industryData.cost_savings;
        }
        
        // Adjust implementation cost based on industry
        if (selectedIndustry === 'Financial Services' || selectedIndustry === 'Healthcare') {
          implementationCostModel = { base: 12000, perEmployee: 80 };
        }
      }
      // If we still don't have benchmarks, use the "Other" category
      else if (data.industries['Other']) {
        const otherData = data.industries['Other'];
        
        if (otherData.time_savings && timeSavingsBenchmark.count === 0) {
          timeSavingsBenchmark = otherData.time_savings;
          source = `Average across industries (${timeSavingsBenchmark.count} case studies)`;
        }
        
        if (otherData.cost_savings && costSavingsBenchmark.count === 0) {
          costSavingsBenchmark = otherData.cost_savings;
        }
      }
    }
    
    // Update state with the selected benchmarks
    setSelectedBenchmarks({
      time_savings: timeSavingsBenchmark,
      cost_savings: costSavingsBenchmark,
      implementation_cost: implementationCostModel
    });
    
    setDataSource(source);
  };
  
  // Calculate ROI values based on inputs and benchmarks
  const calculateROI = () => {
    // Calculate total annual cost of current process
    const annualHours = employeeCount * timeSpentPerWeek * 52;
    const totalAnnualCost = annualHours * hourlyRate;
    
    // Apply benchmark time savings modified by user's automation level
    const effectiveTimeSaving = selectedBenchmarks.time_savings.median * (automationLevel / 100);
    const totalAnnualSavings = totalAnnualCost * effectiveTimeSaving;
    
    // Calculate implementation cost using the model
    const baseImplementationCost = selectedBenchmarks.implementation_cost.base;
    const perEmployeeCost = selectedBenchmarks.implementation_cost.perEmployee;
    const totalImplementationCost = baseImplementationCost + (perEmployeeCost * employeeCount);
    
    // Calculate ROI
    const calculatedRoi = ((totalAnnualSavings - totalImplementationCost) / totalImplementationCost) * 100;
    
    // Calculate payback period in months
    const monthlySavings = totalAnnualSavings / 12;
    const calculatedPaybackPeriod = totalImplementationCost / monthlySavings;
    
    // Calculate confidence interval based on benchmark min/max values
    const minTimeSaving = selectedBenchmarks.time_savings.min * (automationLevel / 100);
    const maxTimeSaving = selectedBenchmarks.time_savings.max * (automationLevel / 100);
    
    const minSavings = totalAnnualCost * minTimeSaving;
    const maxSavings = totalAnnualCost * maxTimeSaving;
    
    const minRoi = ((minSavings - totalImplementationCost) / totalImplementationCost) * 100;
    const maxRoi = ((maxSavings - totalImplementationCost) / totalImplementationCost) * 100;
    
    // Update state with calculated values
    setAnnualSavings(Math.round(totalAnnualSavings));
    setImplementationCost(Math.round(totalImplementationCost));
    setRoi(Math.round(calculatedRoi));
    setPaybackPeriod(Math.round(calculatedPaybackPeriod * 10) / 10);
    setConfidenceInterval({
      low: Math.round(minRoi),
      high: Math.round(maxRoi)
    });
  };

  // Calculate when form values or benchmarks change
  useEffect(() => {
    if (!isLoadingBenchmarks && calculationMode === 'client') {
      calculateROI();
    }
  }, [employeeCount, hourlyRate, timeSpentPerWeek, automationLevel, selectedBenchmarks, isLoadingBenchmarks, calculationMode]);
  
  // Function to calculate ROI using backend API
  const calculateROIWithBackend = async () => {
    setIsCalculating(true);
    try {
      const parameters = {
        numEmployees: employeeCount,
        hourlyRate: hourlyRate,
        hoursPerWeek: timeSpentPerWeek,
        automationLevel: automationLevel / 100, // Backend expects decimal
        industry: industry,
        useCase: useCase || 'Other'
      };
      
      const result = await roiCalculatorApi.calculateRoi(useCase, parameters);
      
      // Update state with results from backend
      setAnnualSavings(result.annualCostSavings);
      setImplementationCost(result.implementationCost);
      setRoi(result.roi);
      setPaybackPeriod(result.paybackPeriod);
      setConfidenceInterval({
        low: result.minRoi,
        high: result.maxRoi
      });
      
      setCalculationMode('backend');
    } catch (error) {
      console.error('Error calculating ROI with backend:', error);
      // Fall back to client-side calculation
      calculateROI();
      setCalculationMode('client');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Claude <span className="text-coral-500">ROI Calculator</span></h1>
        <p className="text-gray-600 mb-6">
          Estimate the potential return on investment for implementing Claude in your business.
          {useCase && (
            <span className="block mt-2 font-medium">
              Selected use case: <span className="text-blue-600">{useCase}</span>
            </span>
          )}
        </p>
        
        {benchmarkError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {benchmarkError}
        </div>
      )}
      
      {isLoadingBenchmarks ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-3">Loading benchmark data...</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-coral-700 mb-4">Business Parameters</h2>
            
            <div className="space-y-4">
              <div className="bg-coral-50 p-3 rounded mb-2">
                <div className="text-sm font-medium text-coral-700 mb-1">Calculation Mode</div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs rounded-full ${calculationMode === 'client' 
                      ? 'bg-coral-500 text-white' 
                      : 'bg-white border border-coral-300 text-coral-700'}`}
                    onClick={() => setCalculationMode('client')}
                    disabled={isCalculating}
                  >
                    Client-side
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs rounded-full ${calculationMode === 'backend' 
                      ? 'bg-coral-500 text-white' 
                      : 'bg-white border border-coral-300 text-coral-700'}`}
                    onClick={calculateROIWithBackend}
                    disabled={isCalculating}
                  >
                    Use Backend API
                  </button>
                </div>
                <div className="text-xs text-coral-600 mt-1">
                  {calculationMode === 'client' 
                    ? 'Using local calculations with benchmark data' 
                    : 'Using backend API with full data analysis'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoadingBenchmarks}
                >
                  <option value="Technology">Technology</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select your industry for more accurate benchmarks
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use Case
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  disabled={isLoadingBenchmarks || isLoadingUseCases}
                >
                  {useCaseOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a specific use case for tailored benchmarks
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Employees Affected
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  How many employees will use this solution?
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Average fully-loaded cost per hour of affected employees
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours Spent Per Week on Task
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="40"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={timeSpentPerWeek}
                  onChange={(e) => setTimeSpentPerWeek(parseFloat(e.target.value) || 0)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Average hours each employee spends on tasks that could be automated
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Automation Level (%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  className="mt-1 block w-full"
                  value={automationLevel}
                  onChange={(e) => setAutomationLevel(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10%</span>
                  <span>{automationLevel}%</span>
                  <span>90%</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Percentage of the task that can be automated with Claude
                </p>
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-coral-700 mb-4">ROI Projection</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-coral-50 p-4 rounded-lg">
                <div className="text-sm text-coral-600 font-medium">Annual Cost Savings</div>
                <div className="text-3xl font-bold text-coral-800">${annualSavings.toLocaleString()}</div>
              </div>
              
              <div className="bg-coral-50/60 p-4 rounded-lg">
                <div className="text-sm text-coral-600 font-medium">Implementation Cost</div>
                <div className="text-3xl font-bold text-coral-700">${implementationCost.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="bg-coral-50/50 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-coral-800">Return on Investment (ROI)</h3>
                <div className="px-3 py-1 bg-coral-100 text-coral-800 text-sm font-medium rounded-full">
                  {roi}%
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Based on your inputs, we project a {roi}% return on investment for implementing Claude in your business.
              </p>
              
              <div className="bg-coral-50 p-4 rounded mb-4">
                <h4 className="text-sm font-semibold text-coral-700 mb-2">Benchmark Data</h4>
                
                <div className="mb-2">
                  <div className="text-xs font-medium text-coral-800">Source</div>
                  <div className="text-xs text-coral-600">{dataSource}</div>
                </div>
                
                <div className="mb-2">
                  <div className="text-xs font-medium text-coral-800">Time Savings</div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-coral-700">{Math.round(selectedBenchmarks.time_savings.median * 100)}%</span>
                    <span className="text-xs text-coral-600 ml-2">
                      (range: {Math.round(selectedBenchmarks.time_savings.min * 100)}% - {Math.round(selectedBenchmarks.time_savings.max * 100)}%)
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-xs font-medium text-coral-800">Implementation Cost Model</div>
                  <div className="text-xs text-coral-600">
                    ${selectedBenchmarks.implementation_cost.base.toLocaleString()} base + 
                    ${selectedBenchmarks.implementation_cost.perEmployee}/employee
                  </div>
                </div>
                
                <div className="text-xs text-coral-500 italic">
                  *Based on actual outcomes from similar Claude implementations
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Calculation mode:</span> {calculationMode === 'client' ? 'Client-side' : 'Backend API'}
                  {isCalculating && <span className="ml-2 animate-pulse">Calculating...</span>}
                </div>
              </div>
              
              <div className="mb-4">
              <div className="text-sm font-medium text-coral-700 mb-1">ROI Confidence Interval</div>
              <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                  className="h-full bg-gradient-to-r from-coral-500 to-coral-400" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, confidenceInterval.high))}%`, 
                    maxWidth: '100%' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-coral-600">
                <span>{confidenceInterval.low}%</span>
                <span>{confidenceInterval.high}%</span>
              </div>
            </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium text-coral-700 mb-1">Estimated Payback Period</div>
                <div className="text-2xl font-bold text-coral-800">{paybackPeriod} months</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Note</h3>
              <p className="text-xs text-yellow-700">
                This ROI calculator provides estimates based on real benchmark data from {selectedBenchmarks.time_savings.count} case studies in your industry and similar use cases. 
                The confidence interval shows the range of potential outcomes based on observed results. 
                Actual results may vary based on implementation specifics. For a more precise analysis, consider consulting with an implementation specialist.
              </p>
              
              <button 
                type="button" 
                className="text-xs text-coral-600 mt-2 underline"
                onClick={() => document.getElementById('methodology-modal').classList.toggle('hidden')}
              >
                View Calculation Methodology
              </button>
              
              <div id="methodology-modal" className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-4/5 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">ROI Calculation Methodology</h3>
                    <button 
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => document.getElementById('methodology-modal').classList.add('hidden')}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-sm text-gray-500 overflow-y-auto max-h-[70vh]">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Data Sources</h4>
                      <p>
                        Our ROI calculator uses real benchmark data extracted from {selectedBenchmarks.time_savings.count} case studies 
                        of actual Claude implementations. These metrics are categorized by industry and use case to provide 
                        relevant benchmarks for your specific scenario.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Calculation Formula</h4>
                      <p className="mb-2">The ROI is calculated using the following approach:</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          <strong>Annual Cost of Current Process</strong><br />
                          Employees × Hours per Week × 52 weeks × Hourly Rate
                        </li>
                        <li>
                          <strong>Annual Savings</strong><br />
                          Annual Cost × Time Savings Benchmark × Automation Level
                        </li>
                        <li>
                          <strong>Implementation Cost</strong><br />
                          Base Cost + (Per Employee Cost × Number of Employees)
                        </li>
                        <li>
                          <strong>ROI</strong><br />
                          (Annual Savings - Implementation Cost) / Implementation Cost × 100%
                        </li>
                        <li>
                          <strong>Payback Period</strong><br />
                          Implementation Cost / Monthly Savings
                        </li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Confidence Intervals</h4>
                      <p>
                        The confidence interval is calculated using the minimum and maximum time savings 
                        observed across all case studies in your selected industry or use case. This 
                        provides a realistic range of potential outcomes based on actual implementations.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Time Savings Benchmark</h4>
                      <p>
                        The median time savings of {Math.round(selectedBenchmarks.time_savings.median * 100)}% is based on 
                        {selectedBenchmarks.time_savings.count} actual implementations. The range from 
                        {Math.round(selectedBenchmarks.time_savings.min * 100)}% to 
                        {Math.round(selectedBenchmarks.time_savings.max * 100)}% represents the 
                        minimum and maximum observed values.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Implementation Cost Model</h4>
                      <p>
                        Implementation costs vary by industry and use case complexity. Our model 
                        uses a base cost of ${selectedBenchmarks.implementation_cost.base.toLocaleString()} plus 
                        ${selectedBenchmarks.implementation_cost.perEmployee} per employee affected. This accounts for 
                        API setup, integration, training, and ongoing maintenance.
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="button"
                        className="px-4 py-2 bg-coral-500 text-white text-sm font-medium rounded-md hover:bg-coral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
                        onClick={() => document.getElementById('methodology-modal').classList.add('hidden')}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default ROICalculator;