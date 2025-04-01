'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ROICalculator = () => {
  const searchParams = useSearchParams();
  const [useCase, setUseCase] = useState(searchParams.get('useCase') || '');
  const [relevanceScore] = useState(searchParams.get('relevanceScore') || '');
  
  // Form state
  const [employeeCount, setEmployeeCount] = useState(100);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [timeSpentPerWeek, setTimeSpentPerWeek] = useState(10);
  const [automationLevel, setAutomationLevel] = useState(70);
  
  // Results state
  const [annualSavings, setAnnualSavings] = useState(0);
  const [implementationCost, setImplementationCost] = useState(0);
  const [roi, setRoi] = useState(0);
  const [paybackPeriod, setPaybackPeriod] = useState(0);
  const [confidenceInterval, setConfidenceInterval] = useState({low: 0, high: 0});

  // Calculate ROI values based on inputs
  const calculateROI = () => {
    // Calculate weekly hours saved
    const weeklyHoursSaved = timeSpentPerWeek * (automationLevel / 100);
    
    // Calculate annual cost savings
    const annualCostSavings = weeklyHoursSaved * hourlyRate * 52;
    const totalAnnualSavings = annualCostSavings * employeeCount;
    
    // Estimate implementation costs
    // This is a simplified model and should be refined with real data
    const baseImplementationCost = 5000;  // Base cost for API setup, etc.
    const perEmployeeCost = 50;          // Additional cost per employee
    const totalImplementationCost = baseImplementationCost + (perEmployeeCost * employeeCount);
    
    // Calculate ROI
    const calculatedRoi = ((totalAnnualSavings - totalImplementationCost) / totalImplementationCost) * 100;
    
    // Calculate payback period in months
    const monthlySavings = totalAnnualSavings / 12;
    const calculatedPaybackPeriod = totalImplementationCost / monthlySavings;
    
    // Calculate confidence interval based on relevance score
    const relevanceValue = parseInt(relevanceScore) || 70;
    const confidenceMargin = (100 - relevanceValue) / 100;
    const confidenceLow = calculatedRoi * (1 - confidenceMargin);
    const confidenceHigh = calculatedRoi * (1 + confidenceMargin);
    
    // Update state with calculated values
    setAnnualSavings(Math.round(totalAnnualSavings));
    setImplementationCost(Math.round(totalImplementationCost));
    setRoi(Math.round(calculatedRoi));
    setPaybackPeriod(Math.round(calculatedPaybackPeriod * 10) / 10);
    setConfidenceInterval({
      low: Math.round(confidenceLow),
      high: Math.round(confidenceHigh)
    });
  };

  // Calculate when form values change
  useEffect(() => {
    calculateROI();
  }, [employeeCount, hourlyRate, timeSpentPerWeek, automationLevel, relevanceScore]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ROI Calculator</h1>
        <p className="text-gray-600 mb-6">
          Estimate the potential return on investment for implementing Claude in your business.
          {useCase && (
            <span className="block mt-2 font-medium">
              Selected use case: <span className="text-blue-600">{useCase}</span>
            </span>
          )}
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Business Parameters</h2>
            
            <div className="space-y-4">
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
            <h2 className="text-lg font-semibold text-gray-700 mb-4">ROI Projection</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Annual Cost Savings</div>
                <div className="text-3xl font-bold text-blue-800">${annualSavings.toLocaleString()}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Implementation Cost</div>
                <div className="text-3xl font-bold text-purple-800">${implementationCost.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Return on Investment (ROI)</h3>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {roi}%
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Based on your inputs, we project a {roi}% return on investment for implementing Claude in your business.
              </p>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Confidence Interval</div>
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500" 
                    style={{ width: `${confidenceInterval.high}%`, maxWidth: '100%' }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{confidenceInterval.low}%</span>
                  <span>{confidenceInterval.high}%</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Estimated Payback Period</div>
                <div className="text-2xl font-bold text-gray-800">{paybackPeriod} months</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Note</h3>
              <p className="text-xs text-yellow-700">
                This ROI calculator provides estimates based on your inputs and industry benchmarks. 
                Actual results may vary. For a more precise analysis, consider consulting with an implementation specialist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
