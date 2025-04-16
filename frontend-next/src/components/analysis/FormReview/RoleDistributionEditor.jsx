'use client';

import React, { useState } from 'react';

// Helper function to calculate percentage
const calculatePercentage = (count, total) => {
  if (!total) return 0;
  return Math.round((count / total) * 100);
};

// Predefined role types with associated AI use cases
// Note: Productivity is included for all roles as a universal benefit
const predefinedRoles = [
  { 
    name: 'Engineering/Development', 
    useCases: ['coding', 'productivity'],
    potential: 'High'
  },
  { 
    name: 'Customer Service/Support', 
    useCases: ['customer_service', 'productivity'],
    potential: 'High'
  },
  { 
    name: 'Marketing/Content', 
    useCases: ['content_creation', 'productivity'],
    potential: 'High'
  },
  { 
    name: 'Sales', 
    useCases: ['productivity'],
    potential: 'Medium'
  },
  { 
    name: 'Legal/Compliance', 
    useCases: ['document_qa', 'productivity'],
    potential: 'High'
  },
  { 
    name: 'Research/Data Analysis', 
    useCases: ['research_analysis', 'productivity'],
    potential: 'High'
  },
  { 
    name: 'Operations/Administration', 
    useCases: ['productivity'],
    potential: 'Medium'
  },
  { 
    name: 'Executive/Management', 
    useCases: ['productivity'],
    potential: 'Medium'
  }
];

const RoleDistributionEditor = ({ roles = [], totalEmployees = 0, isEditing = false, onChange }) => {
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({
    role: '',
    count: '',
    confidence: 3,
    suggestedUseCases: []
  });
  
  // Handle changing an existing role
  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...roles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value };
    
    // Update percentage if count changed
    if (field === 'count' && totalEmployees) {
      updatedRoles[index].percentage = calculatePercentage(parseInt(value, 10) || 0, totalEmployees);
    }
    
    onChange(updatedRoles);
  };
  
  // Handle adding a new role
  const handleAddRole = () => {
    // Basic validation
    if (!newRole.role.trim() || !newRole.count) {
      alert('Please provide both a role name and employee count');
      return;
    }
    
    // Find any matching predefined role to suggest use cases
    const matchingPredefined = predefinedRoles.find(pr => 
      pr.name.toLowerCase().includes(newRole.role.toLowerCase()) || 
      newRole.role.toLowerCase().includes(pr.name.toLowerCase())
    );
    
    // Create new role object with calculated percentage
    const roleCount = parseInt(newRole.count, 10);
    const newRoleObj = {
      ...newRole,
      count: roleCount,
      percentage: calculatePercentage(roleCount, totalEmployees),
      suggestedUseCases: matchingPredefined?.useCases || ['productivity'],
      potentialSavings: matchingPredefined?.potential || 'Medium'
    };
    
    // Add to roles array
    const updatedRoles = [...roles, newRoleObj];
    onChange(updatedRoles);
    
    // Reset form
    setNewRole({
      role: '',
      count: '',
      confidence: 3,
      suggestedUseCases: []
    });
    setShowAddRole(false);
  };
  
  // Handle removing a role
  const handleRemoveRole = (index) => {
    const updatedRoles = [...roles];
    updatedRoles.splice(index, 1);
    onChange(updatedRoles);
  };
  
  // Calculate total count from roles
  const totalCount = roles.reduce((sum, role) => sum + (parseInt(role.count, 10) || 0), 0);
  const countMismatch = totalEmployees > 0 && totalCount !== totalEmployees;
  
  return (
    <div>
      {/* Roles Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Potential AI Use Cases
              </th>
              {isEditing && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 whitespace-nowrap">
                  {isEditing ? (
                    <select
                      className="block w-full py-1 px-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={role.role}
                      onChange={(e) => handleRoleChange(index, 'role', e.target.value)}
                    >
                      <option value="">Select Role</option>
                      {predefinedRoles.map((pr, i) => (
                        <option key={i} value={pr.name}>{pr.name}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    role.role || 'Unnamed Role'
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      className="block w-24 py-1 px-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={role.count || ''}
                      onChange={(e) => handleRoleChange(index, 'count', e.target.value)}
                    />
                  ) : (
                    role.count || '0'
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {role.percentage || calculatePercentage(role.count, totalEmployees)}%
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(role.suggestedUseCases || []).map((useCase, ucIndex) => (
                      <span 
                        key={ucIndex} 
                        className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {useCase.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                {isEditing && (
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {/* Summary row */}
            <tr className="bg-gray-100 font-semibold">
              <td className="px-3 py-2 whitespace-nowrap">
                Total
              </td>
              <td className={`px-3 py-2 whitespace-nowrap ${countMismatch ? 'text-red-600' : ''}`}>
                {totalCount} {countMismatch && `(Target: ${totalEmployees})`}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                100%
              </td>
              <td colSpan={isEditing ? 2 : 1}></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Warning if totals don't match */}
      {countMismatch && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
          <strong>Warning:</strong> The sum of role counts ({totalCount}) doesn't match the total employee count ({totalEmployees}).
        </div>
      )}
      
      {/* Add Role Form */}
      {isEditing && (
        <div className="mt-4">
          {showAddRole ? (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Role</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role Name</label>
                  <select
                    className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newRole.role}
                    onChange={(e) => setNewRole({...newRole, role: e.target.value})}
                  >
                    <option value="">Select Role</option>
                    {predefinedRoles.map((role, idx) => (
                      <option key={idx} value={role.name}>{role.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Employee Count</label>
                  <input
                    type="number"
                    min="1"
                    className="block w-full py-1.5 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newRole.count}
                    onChange={(e) => setNewRole({...newRole, count: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddRole(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="px-3 py-1.5 border border-transparent rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Role
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddRole(true)}
              className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
            >
              <span className="mr-1">+</span> Add Role
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleDistributionEditor;