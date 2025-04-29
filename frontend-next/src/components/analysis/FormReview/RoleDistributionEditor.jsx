'use client';

import React, { useState } from 'react';

// Helper function to calculate percentage
const calculatePercentage = (count, total) => {
  if (!total) return 0;
  return Math.round((count / total) * 100);
};

// Predefined role types with associated AI use cases and default costs/time values
// Note: Productivity is included for all roles as a universal benefit
const predefinedRoles = [
  { 
    name: 'Engineering/Development', 
    useCases: ['coding', 'productivity'],
    potential: 'High',
    yearlyCost: 150000,
    weeklyTaskHours: 30
  },
  { 
    name: 'Customer Service/Support', 
    useCases: ['customer_service', 'productivity'],
    potential: 'High',
    yearlyCost: 60000,
    weeklyTaskHours: 35
  },
  { 
    name: 'Marketing/Content', 
    useCases: ['content_creation', 'productivity'],
    potential: 'High',
    yearlyCost: 90000,
    weeklyTaskHours: 25
  },
  { 
    name: 'Sales', 
    useCases: ['productivity'],
    potential: 'Medium',
    yearlyCost: 120000,
    weeklyTaskHours: 20
  },
  { 
    name: 'Legal/Compliance', 
    useCases: ['document_qa', 'productivity'],
    potential: 'High',
    yearlyCost: 180000,
    weeklyTaskHours: 30
  },
  { 
    name: 'Research/Data Analysis', 
    useCases: ['research_analysis', 'productivity'],
    potential: 'High',
    yearlyCost: 130000,
    weeklyTaskHours: 32
  },
  { 
    name: 'Operations/Administration', 
    useCases: ['productivity'],
    potential: 'Medium',
    yearlyCost: 70000,
    weeklyTaskHours: 25
  },
  { 
    name: 'Executive/Management', 
    useCases: ['productivity'],
    potential: 'Medium',
    yearlyCost: 200000,
    weeklyTaskHours: 15
  }
];

// Function to get default cost and time values based on role name
const getDefaultValuesForRole = (roleName) => {
  const matchingRole = predefinedRoles.find(r => 
    r.name.toLowerCase() === roleName.toLowerCase() || 
    r.name.toLowerCase().includes(roleName.toLowerCase()) || 
    roleName.toLowerCase().includes(r.name.toLowerCase())
  );
  
  return {
    yearlyCost: matchingRole?.yearlyCost || 100000,
    weeklyTaskHours: matchingRole?.weeklyTaskHours || 20
  };
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

const RoleDistributionEditor = ({ roles = [], totalEmployees = 0, isEditing = false, onChange }) => {
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState({
    role: '',
    count: '',
    confidence: 3,
    suggestedUseCases: [],
    yearlyCost: 100000,
    weeklyTaskHours: 20
  });
  
  // Handle changing an existing role
  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...roles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value };
    
    // Update percentage if count changed
    if (field === 'count' && totalEmployees) {
      updatedRoles[index].percentage = calculatePercentage(parseInt(value, 10) || 0, totalEmployees);
    }
    
    // If role name changed, update default cost and time values if they weren't already set
    if (field === 'role') {
      const { yearlyCost, weeklyTaskHours } = getDefaultValuesForRole(value);
      
      // Only set these if they don't exist or were default values
      if (!updatedRoles[index].hasOwnProperty('yearlyCost') || 
          (updatedRoles[index].yearlyCost === 100000 && yearlyCost !== 100000)) {
        updatedRoles[index].yearlyCost = yearlyCost;
      }
      
      if (!updatedRoles[index].hasOwnProperty('weeklyTaskHours') || 
          (updatedRoles[index].weeklyTaskHours === 20 && weeklyTaskHours !== 20)) {
        updatedRoles[index].weeklyTaskHours = weeklyTaskHours;
      }
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
    const { yearlyCost, weeklyTaskHours } = getDefaultValuesForRole(newRole.role);
    
    const newRoleObj = {
      ...newRole,
      count: roleCount,
      percentage: calculatePercentage(roleCount, totalEmployees),
      suggestedUseCases: matchingPredefined?.useCases || ['productivity'],
      potentialSavings: matchingPredefined?.potential || 'Medium',
      yearlyCost: newRole.yearlyCost || yearlyCost,
      weeklyTaskHours: newRole.weeklyTaskHours || weeklyTaskHours
    };
    
    // Add to roles array
    const updatedRoles = [...roles, newRoleObj];
    onChange(updatedRoles);
    
    // Reset form
    setNewRole({
      role: '',
      count: '',
      confidence: 3,
      suggestedUseCases: [],
      yearlyCost: 100000,
      weeklyTaskHours: 20
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
  
  // Add default values to existing roles if they don't have them
  const ensureDefaultValues = () => {
    if (roles.length > 0) {
      const updatedRoles = [...roles];
      let hasUpdates = false;
      
      updatedRoles.forEach((role, idx) => {
        // If the role doesn't have yearlyCost or weeklyTaskHours, add them
        if (!role.hasOwnProperty('yearlyCost') || !role.hasOwnProperty('weeklyTaskHours')) {
          const { yearlyCost, weeklyTaskHours } = getDefaultValuesForRole(role.role);
          
          if (!role.hasOwnProperty('yearlyCost')) {
            updatedRoles[idx].yearlyCost = yearlyCost;
            hasUpdates = true;
          }
          
          if (!role.hasOwnProperty('weeklyTaskHours')) {
            updatedRoles[idx].weeklyTaskHours = weeklyTaskHours;
            hasUpdates = true;
          }
        }
      });
      
      if (hasUpdates) {
        onChange(updatedRoles);
      }
    }
  };
  
  // Ensure all roles have default values when component mounts or roles change
  React.useEffect(() => {
    ensureDefaultValues();
  }, []);
  
  return (
    <div>
      {/* Roles Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                Role
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employees
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                %
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <span className="block">Avg Yearly Cost</span>
                <span className="text-gray-400 font-normal text-2xs normal-case">per employee</span>
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                <span className="block">Hours per Week</span>
                <span className="text-gray-400 font-normal text-2xs normal-case">spent doing this task</span>
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                AI Cases
              </th>
              {isEditing && (
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={isEditing ? 7 : 6} className="px-2 py-4 text-center text-sm text-gray-500">
                  No roles defined yet. Use the "Add Role" button below to get started.
                </td>
              </tr>
            ) : (
              roles.map((role, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-1.5">
                  {isEditing ? (
                    <select
                      className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    <span className="line-clamp-2">{role.role || 'Unnamed Role'}</span>
                  )}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      className="block w-16 py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={role.count || ''}
                      onChange={(e) => handleRoleChange(index, 'count', e.target.value)}
                    />
                  ) : (
                    role.count || '0'
                  )}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap text-sm">
                  {role.percentage || calculatePercentage(role.count, totalEmployees)}%
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="block w-24 py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={role.yearlyCost || ''}
                      onChange={(e) => handleRoleChange(index, 'yearlyCost', parseInt(e.target.value, 10) || 0)}
                    />
                  ) : (
                    formatCurrency(role.yearlyCost || 0)
                  )}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="block w-16 py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={role.weeklyTaskHours || ''}
                      onChange={(e) => handleRoleChange(index, 'weeklyTaskHours', parseInt(e.target.value, 10) || 0)}
                    />
                  ) : (
                    `${role.weeklyTaskHours || 0} hrs`
                  )}
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {(role.suggestedUseCases || []).map((useCase, ucIndex) => (
                      <span 
                        key={ucIndex} 
                        className="inline-block px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800"
                      >
                        {useCase === 'productivity' ? 'Productivity' : 
                         useCase === 'coding' ? 'Coding' :
                         useCase === 'customer_service' ? 'Customer Service' :
                         useCase === 'content_creation' ? 'Content' :
                         useCase === 'document_qa' ? 'Document QA' :
                         useCase === 'research_analysis' ? 'Research' :
                         useCase.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                {isEditing && (
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(index)}
                      className="text-red-600 hover:text-red-900 text-xs"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            )))}
            {/* Summary row - Only show if there are roles */}
            {roles.length > 0 && (
              <tr className="bg-gray-100 font-semibold text-sm">
                <td className="px-2 py-1.5 whitespace-nowrap">
                  Total
                </td>
                <td className={`px-2 py-1.5 whitespace-nowrap ${countMismatch ? 'text-red-600' : ''}`}>
                  {totalCount} {countMismatch && `(Target: ${totalEmployees})`}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {totalEmployees > 0 ? `${Math.round((totalCount / totalEmployees) * 100)}%` : '-'}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {formatCurrency(roles.reduce((sum, role) => sum + (parseInt(role.yearlyCost, 10) || 0) * (parseInt(role.count, 10) || 0), 0))}
                </td>
                <td colSpan="3"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Warning messages */}
      {countMismatch && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
          {totalCount > totalEmployees ? (
            <span><strong>Warning:</strong> The sum of role counts ({totalCount}) exceeds the total employee count ({totalEmployees}). You can still proceed, but the numbers won't match up exactly.</span>
          ) : (
            <span><strong>Warning:</strong> The sum of role counts ({totalCount}) doesn't match the total employee count ({totalEmployees}).</span>
          )}
        </div>
      )}
      
      {/* Always show Add Role Form */}
      {isEditing && (
        <div className="mt-3">
          {showAddRole ? (
            <div className="p-3 border rounded-md bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Role</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role Name</label>
                  <select
                    className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newRole.role}
                    onChange={(e) => {
                      const selected = e.target.value;
                      const { yearlyCost, weeklyTaskHours } = getDefaultValuesForRole(selected);
                      setNewRole({
                        ...newRole, 
                        role: selected,
                        yearlyCost,
                        weeklyTaskHours
                      });
                    }}
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
                    className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newRole.count}
                    onChange={(e) => setNewRole({...newRole, count: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Yearly Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newRole.yearlyCost}
                    onChange={(e) => setNewRole({...newRole, yearlyCost: parseInt(e.target.value, 10) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hours/Week on Task</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    className="block w-full py-1 px-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newRole.weeklyTaskHours}
                    onChange={(e) => setNewRole({...newRole, weeklyTaskHours: parseInt(e.target.value, 10) || 0})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddRole(false)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="px-2 py-1 border border-transparent rounded-md text-xs bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Role
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddRole(true)}
              className="flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-100"
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