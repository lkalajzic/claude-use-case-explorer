import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';

// A custom hook to get URL query params
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ROICalculator = () => {
  const queryParams = useQuery();
  const useCaseFromUrl = queryParams.get('useCase');
  const relevanceScore = queryParams.get('relevanceScore');
  
  // State for form inputs
  const [selectedUseCase, setSelectedUseCase] = useState(useCaseFromUrl || '');
  const [companySize, setCompanySize] = useState('');
  const [implementationComplexity, setImplementationComplexity] = useState('Medium');
  const [currentCosts, setCurrentCosts] = useState({
    laborCosts: 250000,
    operationalCosts: 100000,
    opportunityCosts: 50000
  });
  const [conversionMetrics, setConversionMetrics] = useState({
    conversions: 1000,
    averageRevenue: 500
  });
  const [calculationResult, setCalculationResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Fetch use cases for the dropdown
  const { data: useCases, isLoading } = useQuery('useCases', async () => {
    const response = await axios.get('/api/use-case-database');
    return response.data;
  });
  
  // Update selected use case when URL parameter changes
  useEffect(() => {
    if (useCaseFromUrl) {
      setSelectedUseCase(useCaseFromUrl);
    }
  }, [useCaseFromUrl]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real implementation, we would call the backend API
    // For now, we'll simulate a calculation result
    
    // Placeholder ROI calculation
    const implementationCost = 
      companySize === 'Enterprise' ? 300000 :
      companySize === 'Mid-Market' ? 100000 :
      companySize === 'SMB' ? 25000 : 5000;
    
    const complexityMultiplier = 
      implementationComplexity === 'High' ? 1.5 :
      implementationComplexity === 'Medium' ? 1.0 : 0.7;
    
    const totalImplementationCost = implementationCost * complexityMultiplier;
    
    // Calculate ongoing costs
    const apiCostsPerMonth = 
      companySize === 'Enterprise' ? 5000 :
      companySize === 'Mid-Market' ? 2000 :
      companySize === 'SMB' ? 500 : 100;
    
    const maintenanceCost = totalImplementationCost * 0.1 / 12; // 10% annually, per month
    
    // Calculate benefits
    const laborSavingsPercent = selectedUseCase === 'customer_service' ? 0.3 :
                              selectedUseCase === 'content_generation' ? 0.5 :
                              selectedUseCase === 'research_analysis' ? 0.4 :
                              selectedUseCase === 'document_processing' ? 0.6 : 0.3;
    
    const laborSavings = currentCosts.laborCosts * laborSavingsPercent;
    
    const operationalSavingsPercent = selectedUseCase === 'customer_service' ? 0.2 :
                                    selectedUseCase === 'content_generation' ? 0.3 :
                                    selectedUseCase === 'research_analysis' ? 0.2 :
                                    selectedUseCase === 'document_processing' ? 0.4 : 0.2;
    
    const operationalSavings = currentCosts.operationalCosts * operationalSavingsPercent;
    
    const revenueIncreasePercent = selectedUseCase === 'customer_service' ? 0.05 :
                                  selectedUseCase === 'content_generation' ? 0.1 :
                                  selectedUseCase === 'research_analysis' ? 0.03 :
                                  selectedUseCase === 'document_processing' ? 0.02 : 0.04;
    
    const additionalRevenue = conversionMetrics.conversions * conversionMetrics.averageRevenue * revenueIncreasePercent;
    
    const monthlyBenefit = (laborSavings + operationalSavings) / 12 + additionalRevenue / 12;
    const monthlyCost = apiCostsPerMonth + maintenanceCost;
    const monthlyNetBenefit = monthlyBenefit - monthlyCost;
    
    const paybackPeriodMonths = totalImplementationCost / monthlyNetBenefit;
    const oneYearROI = (monthlyNetBenefit * 12 - totalImplementationCost) / totalImplementationCost * 100;
    const threeYearROI = (monthlyNetBenefit * 36 - totalImplementationCost) / totalImplementationCost * 100;
    
    // Calculate timeline
    const implementationDuration = 
      companySize === 'Enterprise' ? 6 :
      companySize === 'Mid-Market' ? 3 :
      companySize === 'SMB' ? 2 : 1;
    
    const timelineMultiplier = 
      implementationComplexity === 'High' ? 1.5 :
      implementationComplexity === 'Medium' ? 1.0 : 0.7;
    
    const totalMonths = Math.round(implementationDuration * timelineMultiplier);
    
    // Apply confidence based on relevance score
    const confidenceFactor = relevanceScore ? parseInt(relevanceScore) / 100 : 0.8;
    
    // Set the calculation result
    setCalculationResult({
      costs: {
        implementation: Math.round(totalImplementationCost),
        monthly: {
          apiCosts: Math.round(apiCostsPerMonth),
          maintenance: Math.round(maintenanceCost),
          total: Math.round(apiCostsPerMonth + maintenanceCost)
        },
        confidence: Math.round(70 + 20 * confidenceFactor)
      },
      benefits: {
        monthlySavings: {
          labor: Math.round(laborSavings / 12),
          operational: Math.round(operationalSavings / 12),
          total: Math.round((laborSavings + operationalSavings) / 12)
        },
        revenue: {
          additional: Math.round(additionalRevenue),
          monthly: Math.round(additionalRevenue / 12)
        },
        monthlyNetBenefit: Math.round(monthlyNetBenefit),
        confidence: Math.round(60 + 30 * confidenceFactor)
      },
      roi: {
        paybackPeriodMonths: Math.round(paybackPeriodMonths),
        oneYearROI: Math.round(oneYearROI),
        threeYearROI: Math.round(threeYearROI),
        confidence: Math.round(50 + 40 * confidenceFactor)
      },
      timeline: {
        implementationMonths: totalMonths,
        firstValueMonth: Math.ceil(totalMonths * 0.6),
        fullRoiMonth: Math.round(paybackPeriodMonths),
        confidence: Math.round(65 + 25 * confidenceFactor)
      }
    });
    
    setShowResults(true);
  };
  
  // Helper function for number formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Claude ROI Calculator</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Use Case Selection */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="useCase">
                Claude Use Case
              </label>
              <select
                id="useCase"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedUseCase}
                onChange={(e) => setSelectedUseCase(e.target.value)}
                required
              >
                <option value="">Select a Use Case</option>
                {!isLoading && useCases && Object.values(useCases).map((useCase) => (
                  <option key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                The specific way you plan to implement Claude
              </p>
            </div>
            
            {/* Company Size */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companySize">
                Company Size
              </label>
              <select
                id="companySize"
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                required
              >
                <option value="">Select Company Size</option>
                <option value="Sole Proprietor">Sole Proprietor (1 person)</option>
                <option value="SMB">Small Business (2-49 employees)</option>
                <option value="Mid-Market">Mid-Market (50-999 employees)</option>
                <option value="Enterprise">Enterprise (1,000+ employees)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Affects implementation costs and timeline
              </p>
            </div>
          </div>
          
          {/* Implementation Complexity */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Implementation Complexity
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="complexity"
                  value="Low"
                  checked={implementationComplexity === 'Low'}
                  onChange={() => setImplementationComplexity('Low')}
                />
                <span className="ml-2 text-gray-700">Low</span>
                <span className="ml-1 text-xs text-gray-500">(Simple API integration)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="complexity"
                  value="Medium"
                  checked={implementationComplexity === 'Medium'}
                  onChange={() => setImplementationComplexity('Medium')}
                />
                <span className="ml-2 text-gray-700">Medium</span>
                <span className="ml-1 text-xs text-gray-500">(Custom development)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  name="complexity"
                  value="High"
                  checked={implementationComplexity === 'High'}
                  onChange={() => setImplementationComplexity('High')}
                />
                <span className="ml-2 text-gray-700">High</span>
                <span className="ml-1 text-xs text-gray-500">(Complex integration with existing systems)</span>
              </label>
            </div>
          </div>
          
          {/* Current Costs Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="laborCosts">
                  Annual Labor Costs
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                  <input
                    type="number"
                    id="laborCosts"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-r-md"
                    value={currentCosts.laborCosts}
                    onChange={(e) => setCurrentCosts({...currentCosts, laborCosts: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Staff costs related to this function</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="operationalCosts">
                  Annual Operational Costs
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                  <input
                    type="number"
                    id="operationalCosts"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-r-md"
                    value={currentCosts.operationalCosts}
                    onChange={(e) => setCurrentCosts({...currentCosts, operationalCosts: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Systems, tools, external services</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="opportunityCosts">
                  Annual Opportunity Costs
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                  <input
                    type="number"
                    id="opportunityCosts"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-r-md"
                    value={currentCosts.opportunityCosts}
                    onChange={(e) => setCurrentCosts({...currentCosts, opportunityCosts: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Lost productivity, missed opportunities</p>
              </div>
            </div>
          </div>
          
          {/* Revenue Impact Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Revenue Impact Potential</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="conversions">
                  Annual Conversions/Transactions
                </label>
                <input
                  type="number"
                  id="conversions"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={conversionMetrics.conversions}
                  onChange={(e) => setConversionMetrics({...conversionMetrics, conversions: parseInt(e.target.value) || 0})}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Number of sales, sign-ups, etc.</p>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="averageRevenue">
                  Average Revenue Per Conversion
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
                  <input
                    type="number"
                    id="averageRevenue"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-r-md"
                    value={conversionMetrics.averageRevenue}
                    onChange={(e) => setConversionMetrics({...conversionMetrics, averageRevenue: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Average value per transaction</p>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Calculate ROI
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Section */}
      {showResults && calculationResult && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">ROI Calculation Results</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800">Payback Period</h3>
              <div className="mt-2 text-3xl font-bold text-blue-900">
                {calculationResult.roi.paybackPeriodMonths} months
              </div>
              <div className="mt-1 text-sm text-blue-600">
                Confidence: {calculationResult.roi.confidence}%
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-800">1-Year ROI</h3>
              <div className="mt-2 text-3xl font-bold text-green-900">
                {calculationResult.roi.oneYearROI}%
              </div>
              <div className="mt-1 text-sm text-green-600">
                Confidence: {calculationResult.roi.confidence}%
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-800">Monthly Net Benefit</h3>
              <div className="mt-2 text-3xl font-bold text-purple-900">
                {formatCurrency(calculationResult.benefits.monthlyNetBenefit)}
              </div>
              <div className="mt-1 text-sm text-purple-600">
                Confidence: {calculationResult.benefits.confidence}%
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <h3 className="font-semibold text-orange-800">Implementation</h3>
              <div className="mt-2 text-3xl font-bold text-orange-900">
                {calculationResult.timeline.implementationMonths} months
              </div>
              <div className="mt-1 text-sm text-orange-600">
                Confidence: {calculationResult.timeline.confidence}%
              </div>
            </div>
          </div>
          
          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              {/* Costs Breakdown */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">One-time Implementation</span>
                    <span className="font-medium">{formatCurrency(calculationResult.costs.implementation)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly API Costs</span>
                    <span className="font-medium">{formatCurrency(calculationResult.costs.monthly.apiCosts)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly Maintenance</span>
                    <span className="font-medium">{formatCurrency(calculationResult.costs.monthly.maintenance)}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                    <span className="font-medium text-gray-700">Total Monthly Costs</span>
                    <span className="font-bold">{formatCurrency(calculationResult.costs.monthly.total)}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                    <span className="font-medium text-gray-700">First Year Total Costs</span>
                    <span className="font-bold">
                      {formatCurrency(calculationResult.costs.implementation + (calculationResult.costs.monthly.total * 12))}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Benefits Breakdown */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Benefits Breakdown</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly Labor Savings</span>
                    <span className="font-medium">{formatCurrency(calculationResult.benefits.monthlySavings.labor)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly Operational Savings</span>
                    <span className="font-medium">{formatCurrency(calculationResult.benefits.monthlySavings.operational)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Monthly Revenue Increase</span>
                    <span className="font-medium">{formatCurrency(calculationResult.benefits.revenue.monthly)}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                    <span className="font-medium text-gray-700">Total Monthly Benefits</span>
                    <span className="font-bold">
                      {formatCurrency(
                        calculationResult.benefits.monthlySavings.labor + 
                        calculationResult.benefits.monthlySavings.operational + 
                        calculationResult.benefits.revenue.monthly
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                    <span className="font-medium text-gray-700">First Year Total Benefits</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (calculationResult.benefits.monthlySavings.labor + 
                         calculationResult.benefits.monthlySavings.operational + 
                         calculationResult.benefits.revenue.monthly) * 12
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div>
              {/* ROI Over Time */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">ROI Over Time</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">3-Month ROI</span>
                    <span className="font-medium">
                      {Math.round((calculationResult.benefits.monthlyNetBenefit * 3 - calculationResult.costs.implementation) / calculationResult.costs.implementation * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">6-Month ROI</span>
                    <span className="font-medium">
                      {Math.round((calculationResult.benefits.monthlyNetBenefit * 6 - calculationResult.costs.implementation) / calculationResult.costs.implementation * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">1-Year ROI</span>
                    <span className="font-medium">{calculationResult.roi.oneYearROI}%</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">3-Year ROI</span>
                    <span className="font-medium">{calculationResult.roi.threeYearROI}%</span>
                  </div>
                  
                  {/* Placeholder for Chart */}
                  <div className="mt-4 bg-white p-2 rounded border border-gray-200 h-48 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      ROI Chart Visualization
                      <br />
                      (Coming Soon)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Implementation Timeline */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Implementation Timeline</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="relative">
                    {/* Timeline Bar */}
                    <div className="h-2 bg-gray-200 rounded-full relative">
                      {/* Implementation Phase */}
                      <div 
                        className="absolute top-0 h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(calculationResult.timeline.implementationMonths / (calculationResult.roi.paybackPeriodMonths + 1)) * 100}%` }}
                      ></div>
                      
                      {/* First Value Point */}
                      <div 
                        className="absolute top-0 h-2 w-2 bg-green-500 rounded-full"
                        style={{ left: `${(calculationResult.timeline.firstValueMonth / (calculationResult.roi.paybackPeriodMonths + 1)) * 100}%` }}
                      ></div>
                      
                      {/* Full ROI Point */}
                      <div 
                        className="absolute top-0 h-2 w-2 bg-yellow-500 rounded-full"
                        style={{ left: `${(calculationResult.roi.paybackPeriodMonths / (calculationResult.roi.paybackPeriodMonths + 1)) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Timeline Labels */}
                    <div className="flex justify-between mt-2">
                      <div className="text-xs text-gray-600">Start</div>
                      <div 
                        className="text-xs text-blue-600"
                        style={{ position: 'absolute', left: `${(calculationResult.timeline.implementationMonths / (calculationResult.roi.paybackPeriodMonths + 1)) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                        Implementation
                        <br />
                        Complete
                      </div>
                      <div 
                        className="text-xs text-green-600"
                        style={{ position: 'absolute', left: `${(calculationResult.timeline.firstValueMonth / (calculationResult.roi.paybackPeriodMonths + 1)) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                        First
                        <br />
                        Value
                      </div>
                      <div 
                        className="text-xs text-yellow-600"
                        style={{ position: 'absolute', left: `${(calculationResult.roi.paybackPeriodMonths / (calculationResult.roi.paybackPeriodMonths + 1)) * 100}%`, transform: 'translateX(-50%)' }}
                      >
                        Full
                        <br />
                        ROI
                      </div>
                      <div className="text-xs text-gray-600">
                        Month
                        <br />
                        {calculationResult.roi.paybackPeriodMonths + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Implementation Complete</span>
                      <span className="font-medium">Month {calculationResult.timeline.implementationMonths}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">First Business Value</span>
                      <span className="font-medium">Month {calculationResult.timeline.firstValueMonth}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Break-even Point</span>
                      <span className="font-medium">Month {calculationResult.roi.paybackPeriodMonths}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              This calculator provides estimates based on industry benchmarks and the information you provided.
              <br />
              Actual results may vary based on specific implementation details and business conditions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ROICalculator;
