'use client';

import React, { useState, useEffect } from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import RoleDistributionEditor from './RoleDistributionEditor';

const FormReview = ({ analysisData, onConfirm, onCancel }) => {
  // Clone the analysis data to avoid modifying the original
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Initialize form data when analysis data is received
  useEffect(() => {
    if (analysisData) {
      setFormData({...analysisData});
    }
  }, [analysisData]);
  
  if (!formData) {
    return <div className="p-4 text-center">Loading analysis data...</div>;
  }
  
  // Handle form field changes
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Handle role distribution changes
  const handleRoleChange = (updatedRoles) => {
    setFormData(prev => ({
      ...prev,
      employeeRoles: {
        ...prev.employeeRoles,
        roleDistribution: updatedRoles
      }
    }));
  };
  
  // Handle total employee count change
  const handleTotalEmployeeChange = (count) => {
    setFormData(prev => ({
      ...prev,
      employeeRoles: {
        ...prev.employeeRoles,
        totalEmployees: {
          ...prev.employeeRoles.totalEmployees,
          count: parseInt(count, 10) || 0
        }
      }
    }));
  };
  
  // Validate the form data before submission
  const validateForm = () => {
    const errors = {};
    
    // Check company name
    if (!formData.companyInfo?.name) {
      errors.companyName = "Company name is required";
    }
    
    // Check industry
    if (!formData.companyInfo?.industry?.primary) {
      errors.industry = "Primary industry is required";
    }
    
    // Check total employees
    const totalEmployees = formData.employeeRoles?.totalEmployees?.count;
    if (!totalEmployees || totalEmployees <= 0) {
      errors.totalEmployees = "Total employee count must be greater than 0";
    }
    
    // Check role distribution
    const roles = formData.employeeRoles?.roleDistribution || [];
    if (roles.length === 0) {
      errors.roles = "At least one employee role is required";
    } else {
      // Verify role counts
      const roleSum = roles.reduce((sum, role) => sum + (parseInt(role.count, 10) || 0), 0);
      if (totalEmployees && roleSum !== totalEmployees) {
        errors.roleSum = `Role counts (${roleSum}) don't match total employees (${totalEmployees})`;
      }
      
      // Verify individual roles
      const roleErrors = roles.map(role => {
        if (!role.role) return "Role name is required";
        if (!role.count || role.count <= 0) return "Role count must be greater than 0";
        return null;
      }).filter(Boolean);
      
      if (roleErrors.length > 0) {
        errors.roleDetails = roleErrors;
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfirm(formData);
    } else {
      // Scroll to the first error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Review Company Analysis
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          {isEditing ? "View Mode" : "Edit Mode"}
        </button>
      </div>
      
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-700 font-medium mb-2">Please correct the following issues:</h3>
          <ul className="list-disc pl-5 text-red-600">
            {Object.entries(validationErrors).map(([key, error]) => (
              <li key={key} className="error-message">
                {typeof error === 'string' ? error : Array.isArray(error) ? error.join(', ') : JSON.stringify(error)}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information Section */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Company Information</h3>
            <ConfidenceIndicator 
              score={formData.companyInfo?.industry?.confidence || 
                    formData.confidenceScore?.companyInfo || 3} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={formData.companyInfo?.name || ''}
                  onChange={(e) => handleChange('companyInfo', 'name', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  {formData.companyInfo?.name || 'Not specified'}
                </div>
              )}
            </div>
            
            {/* Primary Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Industry
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={formData.companyInfo?.industry?.primary || ''}
                  onChange={(e) => handleChange('companyInfo', 'industry', {
                    ...formData.companyInfo?.industry,
                    primary: e.target.value
                  })}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  {(typeof formData.companyInfo?.industry === 'object' 
                    ? formData.companyInfo.industry.primary 
                    : formData.companyInfo?.industry) || 'Not specified'}
                </div>
              )}
            </div>
            
            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              {isEditing ? (
                <select
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={(typeof formData.companyInfo?.size === 'object' 
                    ? formData.companyInfo.size.category 
                    : formData.companyInfo?.size) || ''}
                  onChange={(e) => handleChange('companyInfo', 'size', {
                    ...formData.companyInfo?.size,
                    category: e.target.value
                  })}
                >
                  <option value="">Select Size</option>
                  <option value="Sole Proprietor">Sole Proprietor</option>
                  <option value="SMB">Small Business (SMB)</option>
                  <option value="Mid-Market">Mid-Market</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  {(typeof formData.companyInfo?.size === 'object' 
                    ? formData.companyInfo.size.category 
                    : formData.companyInfo?.size) || 'Not specified'}
                </div>
              )}
            </div>
            
            {/* Geography */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geography
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  value={formData.companyInfo?.geography?.headquarters || 
                        (typeof formData.companyInfo?.geography === 'string' ? formData.companyInfo.geography : '') || ''}
                  onChange={(e) => handleChange('companyInfo', 'geography', {
                    ...formData.companyInfo?.geography,
                    headquarters: e.target.value
                  })}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">
                  {formData.companyInfo?.geography?.headquarters || 
                   formData.companyInfo?.region || 
                   (typeof formData.companyInfo?.geography === 'string' ? formData.companyInfo.geography : null) || 
                   'Not specified'}
                </div>
              )}
            </div>
          </div>
          
          {/* Company Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Description
            </label>
            {isEditing ? (
              <textarea
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={formData.companyInfo?.companyDescription || ''}
                onChange={(e) => handleChange('companyInfo', 'companyDescription', e.target.value)}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded">
                {formData.companyInfo?.companyDescription || 'No description available'}
              </div>
            )}
          </div>
        </section>
        
        {/* Employee Roles Section */}
        <section className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Employee Role Distribution</h3>
            <ConfidenceIndicator score={formData.employeeRoles?.confidence || 3} />
          </div>
          
          {/* Total Employees */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Employees
            </label>
            {isEditing ? (
              <input
                type="number"
                min="1"
                className="w-full md:w-1/3 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                value={formData.employeeRoles?.totalEmployees?.count || ''}
                onChange={(e) => handleTotalEmployeeChange(e.target.value)}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded w-full md:w-1/3">
                {formData.employeeRoles?.totalEmployees?.count || 'Not specified'}
              </div>
            )}
          </div>
          
          {/* Role Distribution Editor */}
          <RoleDistributionEditor 
            roles={formData.employeeRoles?.roleDistribution || []}
            totalEmployees={formData.employeeRoles?.totalEmployees?.count || 0}
            isEditing={isEditing}
            onChange={handleRoleChange}
          />
        </section>
        
        {/* Business Challenges Section */}
        {formData.businessChallenges && (
          <section className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Business Challenges</h3>
              <ConfidenceIndicator score={formData.businessChallenges.confidence || 3} />
            </div>
            
            {/* Explicit Challenges */}
            {formData.businessChallenges.explicitChallenges && formData.businessChallenges.explicitChallenges.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explicit Challenges
                </label>
                {isEditing ? (
                  <textarea
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={formData.businessChallenges.explicitChallenges.join('\n')}
                    onChange={(e) => handleChange('businessChallenges', 'explicitChallenges', 
                      e.target.value.split('\n').filter(line => line.trim() !== '')
                    )}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {formData.businessChallenges.explicitChallenges.map((challenge, idx) => (
                      <li key={idx}>{challenge}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {/* Implied Challenges */}
            {formData.businessChallenges.impliedChallenges && formData.businessChallenges.impliedChallenges.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Implied Challenges
                </label>
                {isEditing ? (
                  <textarea
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={formData.businessChallenges.impliedChallenges.join('\n')}
                    onChange={(e) => handleChange('businessChallenges', 'impliedChallenges', 
                      e.target.value.split('\n').filter(line => line.trim() !== '')
                    )}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {formData.businessChallenges.impliedChallenges.map((challenge, idx) => (
                      <li key={idx}>{challenge}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm & Calculate
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormReview;