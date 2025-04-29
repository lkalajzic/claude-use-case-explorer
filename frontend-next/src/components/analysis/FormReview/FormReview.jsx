'use client';

import React, { useState, useEffect } from 'react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import RoleDistributionEditor from './RoleDistributionEditor';

// Edit icon component for editable fields
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const FormReview = ({ analysisData, onConfirm, onCancel }) => {
  // Clone the analysis data to avoid modifying the original
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(true); // Set editing mode as default
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
  
  // Editable field wrapper component
  const EditableField = ({ children, label }) => (
    <div className="relative group">
      {isEditing && (
        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditIcon />
        </div>
      )}
      {children}
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-gray-800">
          Review Company Analysis
        </h2>
        <div className="text-xs text-blue-600 italic">All fields are editable</div>
      </div>
      
      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-700 font-medium text-sm mb-1">Please correct the following issues:</h3>
          <ul className="list-disc pl-5 text-red-600 text-xs">
            {Object.entries(validationErrors).map(([key, error]) => (
              <li key={key} className="error-message">
                {typeof error === 'string' ? error : Array.isArray(error) ? error.join(', ') : JSON.stringify(error)}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Combined Company Information and Challenges Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Information Section - 2/3 width */}
          <section className="border rounded-md p-3 md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-semibold text-gray-700">Company Information</h3>
              <ConfidenceIndicator 
                score={formData.companyInfo?.industry?.confidence || 
                      formData.confidenceScore?.companyInfo || 3} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Company Name
                </label>
                <EditableField>
                  <input
                    type="text"
                    className="w-full p-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.companyInfo?.name || ''}
                    onChange={(e) => handleChange('companyInfo', 'name', e.target.value)}
                  />
                </EditableField>
              </div>
              
              {/* Primary Industry */}
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Primary Industry
                </label>
                <EditableField>
                  <input
                    type="text"
                    className="w-full p-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.companyInfo?.industry?.primary || ''}
                    onChange={(e) => handleChange('companyInfo', 'industry', {
                      ...formData.companyInfo?.industry,
                      primary: e.target.value
                    })}
                  />
                </EditableField>
              </div>
              
              {/* Company Size */}
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Company Size
                </label>
                <EditableField>
                  <select
                    className="w-full p-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
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
                </EditableField>
              </div>
              
              {/* Geography */}
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Geography
                </label>
                <EditableField>
                  <input
                    type="text"
                    className="w-full p-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.companyInfo?.geography?.headquarters || 
                          (typeof formData.companyInfo?.geography === 'string' ? formData.companyInfo.geography : '') || ''}
                    onChange={(e) => handleChange('companyInfo', 'geography', {
                      ...formData.companyInfo?.geography,
                      headquarters: e.target.value
                    })}
                  />
                </EditableField>
              </div>
            </div>
            
            {/* Company Description */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500">
                Company Description
              </label>
              <EditableField>
                <textarea
                  className="w-full p-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  value={formData.companyInfo?.companyDescription || ''}
                  onChange={(e) => handleChange('companyInfo', 'companyDescription', e.target.value)}
                />
              </EditableField>
            </div>
          </section>
          
          {/* Business Challenges Section - 1/3 width */}
          {formData.businessChallenges && (
            <section className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-700">Business Challenges</h3>
                <ConfidenceIndicator score={formData.businessChallenges.confidence || 3} />
              </div>
              
              {/* Explicit Challenges */}
              {formData.businessChallenges.explicitChallenges && formData.businessChallenges.explicitChallenges.length > 0 && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-500">
                    Key Challenges
                  </label>
                  <EditableField>
                    <textarea
                      className="w-full p-1.5 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      value={formData.businessChallenges.explicitChallenges.join('\n')}
                      onChange={(e) => handleChange('businessChallenges', 'explicitChallenges', 
                        e.target.value.split('\n').filter(line => line.trim() !== '')
                      )}
                    />
                  </EditableField>
                </div>
              )}
            </section>
          )}
        </div>
        
        {/* Employee Roles Section */}
        <section className="border rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <h3 className="text-md font-semibold text-gray-700 mr-3">Employee Role Distribution</h3>
              <div className="flex items-center">
                <label className="block text-xs font-medium text-gray-500 mr-2">
                  Total Employees:
                </label>
                <EditableField>
                  <input
                    type="number"
                    min="1"
                    className="w-20 p-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.employeeRoles?.totalEmployees?.count || ''}
                    onChange={(e) => handleTotalEmployeeChange(e.target.value)}
                  />
                </EditableField>
              </div>
            </div>
            <ConfidenceIndicator score={formData.employeeRoles?.confidence || 3} />
          </div>
          
          {/* Role Distribution Editor */}
          <RoleDistributionEditor 
            roles={formData.employeeRoles?.roleDistribution || []}
            totalEmployees={formData.employeeRoles?.totalEmployees?.count || 0}
            isEditing={isEditing}
            onChange={handleRoleChange}
          />
        </section>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Confirm & Calculate
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormReview;