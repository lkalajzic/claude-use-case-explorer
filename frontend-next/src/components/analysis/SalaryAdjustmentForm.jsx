'use client';

import React, { useState, useEffect } from 'react';

// Anthropic-inspired color palette
const styles = {
  container: 'bg-white rounded-lg shadow-sm border border-gray-100 p-6',
  header: 'flex justify-between items-start mb-6',
  title: 'text-2xl font-semibold text-gray-900',
  subtitle: 'text-sm text-gray-600 mt-1',
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
  infoCard: 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 mb-6',
  infoText: 'text-sm text-gray-800 flex items-center',
  presetButtons: 'flex gap-2 mb-6',
  presetButton: 'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
  table: 'w-full',
  tableHeader: 'bg-gray-50 border-b border-gray-200',
  tableHeaderCell: 'px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider',
  tableRow: 'border-b border-gray-100 hover:bg-gray-50 transition-colors',
  tableCell: 'px-4 py-3',
  input: 'w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
  numberInput: 'w-24 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono',
  salaryInput: 'w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-right',
  button: 'px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
  primaryButton: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-sm',
  secondaryButton: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  errorText: 'text-red-600 text-sm mt-1',
  totalRow: 'font-semibold bg-gray-50',
};

// Geographic salary multipliers
const GEOGRAPHY_PRESETS = {
  us: { name: 'US/Canada', multiplier: 1.0, emoji: '🇺🇸' },
  europe: { name: 'W. Europe', multiplier: 0.85, emoji: '🇪🇺' },
  easteurope: { name: 'E. Europe', multiplier: 0.3, emoji: '🇵🇱' },
  latam: { name: 'Latin America', multiplier: 0.35, emoji: '🇧🇷' },
  india: { name: 'India', multiplier: 0.15, emoji: '🇮🇳' },
  apac: { name: 'APAC', multiplier: 0.9, emoji: '🇸🇬' },
  africa: { name: 'Africa', multiplier: 0.25, emoji: '🇿🇦' },
};

// Default US baseline salaries by function
const DEFAULT_US_SALARIES = {
  'Executive/Leadership': 200000,
  'Sales': 100000,
  'Marketing': 80000,
  'Product & Engineering': 120000,
  'Operations': 60000,
  'Finance & Accounting': 110000,
  'Human Resources': 70000,
  'Legal & Compliance': 150000,
  'Customer Support': 40000,
};

const SalaryAdjustmentForm = ({ analysisData, onProceed, onCancel }) => {
  const [formData, setFormData] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('us');
  const [validationError, setValidationError] = useState('');

  // Initialize form data
  useEffect(() => {
    if (analysisData) {
      // Detect geography from headquarters
      const hq = analysisData.companyInfo?.headquarters?.toLowerCase() || '';
      let detectedPreset = 'us';
      
      if (hq.includes('india')) detectedPreset = 'india';
      else if (hq.includes('poland') || hq.includes('romania') || hq.includes('croatia')) detectedPreset = 'easteurope';
      else if (hq.includes('uk') || hq.includes('germany') || hq.includes('france')) detectedPreset = 'europe';
      else if (hq.includes('brazil') || hq.includes('mexico') || hq.includes('argentina')) detectedPreset = 'latam';
      else if (hq.includes('singapore') || hq.includes('australia') || hq.includes('japan')) detectedPreset = 'apac';
      else if (hq.includes('kenya') || hq.includes('nigeria') || hq.includes('south africa')) detectedPreset = 'africa';
      
      setSelectedPreset(detectedPreset);
      
      // Initialize form data with business functions
      const initialData = {
        companyInfo: analysisData.companyInfo || {},
        businessFunctions: analysisData.businessFunctions?.map(func => ({
          ...func,
          adjustedSalaryUSD: func.avgSalaryUSD || DEFAULT_US_SALARIES[func.name] || 50000
        })) || []
      };
      
      setFormData(initialData);
    }
  }, [analysisData]);

  // Apply preset salaries
  const applyPreset = (presetKey) => {
    if (!formData) return;
    
    const preset = GEOGRAPHY_PRESETS[presetKey];
    const updatedFunctions = formData.businessFunctions.map(func => ({
      ...func,
      adjustedSalaryUSD: Math.round((DEFAULT_US_SALARIES[func.name] || 50000) * preset.multiplier)
    }));
    
    setFormData({
      ...formData,
      businessFunctions: updatedFunctions
    });
    setSelectedPreset(presetKey);
  };

  // Update employee count
  const updateEmployeeCount = (functionId, newCount) => {
    const updatedFunctions = formData.businessFunctions.map(func => 
      func.id === functionId ? { ...func, employeeCount: parseInt(newCount) || 0 } : func
    );
    
    setFormData({
      ...formData,
      businessFunctions: updatedFunctions
    });
  };

  // Update salary
  const updateSalary = (functionId, newSalary) => {
    const updatedFunctions = formData.businessFunctions.map(func => 
      func.id === functionId ? { ...func, adjustedSalaryUSD: parseInt(newSalary) || 0 } : func
    );
    
    setFormData({
      ...formData,
      businessFunctions: updatedFunctions
    });
  };

  // Validate and submit
  const handleSubmit = () => {
    // Validate total employees
    const totalMapped = formData.businessFunctions.reduce((sum, func) => sum + func.employeeCount, 0);
    const totalStated = formData.companyInfo.totalEmployees || 0;
    
    if (totalMapped !== totalStated) {
      setValidationError(`Employee counts don't match: ${totalMapped} mapped vs ${totalStated} total`);
      return;
    }
    
    // Prepare data for submission
    const submissionData = {
      companyInfo: formData.companyInfo,
      businessFunctions: formData.businessFunctions
    };
    
    onProceed(submissionData);
  };

  if (!formData) {
    return <div className={styles.container}>Loading...</div>;
  }

  const totalEmployees = formData.businessFunctions.reduce((sum, func) => sum + func.employeeCount, 0);
  const currentPreset = GEOGRAPHY_PRESETS[selectedPreset];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Review Your Company Information</h2>
          <p className={styles.subtitle}>
            Adjust employee counts and salaries to match your organization
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Employees</div>
          <div className="text-2xl font-semibold text-gray-900">{formData.companyInfo.totalEmployees || 0}</div>
        </div>
      </div>

      {/* Company Info Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
          <div className="text-sm font-medium text-gray-900">{formData.companyInfo.name || 'Not specified'}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Industry</label>
          <div className="text-sm font-medium text-gray-900">{formData.companyInfo.industry || 'Not specified'}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Headquarters</label>
          <div className="text-sm font-medium text-gray-900">{formData.companyInfo.headquarters || 'Not specified'}</div>
        </div>
      </div>

      {/* Salary Adjustment Info */}
      <div className={styles.infoCard}>
        <p className={styles.infoText}>
          <span className="mr-2">💡</span>
          Salaries auto-adjusted for {currentPreset.name} ({(currentPreset.multiplier * 100).toFixed(0)}% of US rates)
        </p>
      </div>

      {/* Preset Buttons */}
      <div className={styles.presetButtons}>
        {Object.entries(GEOGRAPHY_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`${styles.presetButton} ${
              selectedPreset === key 
                ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{preset.emoji}</span>
            {preset.name}
          </button>
        ))}
      </div>

      {/* Employee Distribution Table */}
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Function</th>
              <th className={`${styles.tableHeaderCell} text-center`}>Employees</th>
              <th className={`${styles.tableHeaderCell} text-right`}>Avg Salary/Year</th>
              <th className={`${styles.tableHeaderCell} text-right`}>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {formData.businessFunctions
              .filter(func => func.employeeCount > 0)
              .map((func) => (
                <tr key={func.id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} font-medium text-gray-900`}>
                    {func.name}
                  </td>
                  <td className={`${styles.tableCell} text-center`}>
                    <input
                      type="number"
                      min="0"
                      value={func.employeeCount}
                      onChange={(e) => updateEmployeeCount(func.id, e.target.value)}
                      className={styles.numberInput}
                    />
                  </td>
                  <td className={`${styles.tableCell} text-right`}>
                    <div className="flex items-center justify-end">
                      <span className="text-gray-500 mr-1">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={func.adjustedSalaryUSD}
                        onChange={(e) => updateSalary(func.id, e.target.value)}
                        className={styles.salaryInput}
                      />
                    </div>
                  </td>
                  <td className={`${styles.tableCell} text-right font-mono text-gray-700`}>
                    ${(func.employeeCount * func.adjustedSalaryUSD).toLocaleString()}
                  </td>
                </tr>
              ))}
            
            {/* Total Row */}
            <tr className={styles.totalRow}>
              <td className={styles.tableCell}>Total</td>
              <td className={`${styles.tableCell} text-center font-mono`}>{totalEmployees}</td>
              <td className={styles.tableCell}></td>
              <td className={`${styles.tableCell} text-right font-mono`}>
                ${formData.businessFunctions
                  .reduce((sum, func) => sum + (func.employeeCount * func.adjustedSalaryUSD), 0)
                  .toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className={styles.errorText}>{validationError}</div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Calculate ROI →
        </button>
      </div>
    </div>
  );
};

export default SalaryAdjustmentForm;