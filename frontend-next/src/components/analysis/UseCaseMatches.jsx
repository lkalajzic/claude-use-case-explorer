"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// Default hourly rates by role (can be customized)
const DEFAULT_HOURLY_RATES = {
  "Engineering/Development": 75,
  "Customer Service/Support": 30,
  "Marketing/Content": 45,
  Sales: 60,
  "Legal/Compliance": 90,
  "Research/Data Analysis": 65,
  "Operations/Administration": 35,
  "Executive/Management": 100,
  Other: 50,
};

// Claude API subscription pricing (as of April 2025)
const CLAUDE_PRICING = {
  monthlySeatCost: 75, // $75 per user per month
  minUsers: 70,        // Minimum 70 users required for enterprise plan
  minAnnualCost: 75 * 12 * 70, // $63,000 minimum annual cost
};

// Helper function to render relevance score
const RelevanceScore = ({ score }) => {
  // Convert score to percentage for visual display
  const percentage =
    typeof score === "number" ? score : parseInt(score.toString(), 10);
  const width = `${percentage}%`;

  // Determine color based on score
  let bgColor = "bg-gray-200";
  let fillColor = "bg-gray-400";

  if (percentage >= 80) {
    fillColor = "bg-green-500";
  } else if (percentage >= 60) {
    fillColor = "bg-blue-500";
  } else if (percentage >= 40) {
    fillColor = "bg-yellow-500";
  } else {
    fillColor = "bg-orange-500";
  }

  return (
    <div className="flex items-center">
      <div className={`w-full h-2 rounded-full ${bgColor} mr-2`}>
        <div
          className={`h-2 rounded-full ${fillColor}`}
          style={{ width }}
        ></div>
      </div>
      <span className="text-sm font-medium">{percentage}%</span>
    </div>
  );
};

// Helper function to calculate ROI
const calculateRoi = (useCase, hourlyRates = DEFAULT_HOURLY_RATES) => {
  if (!useCase.targetRoles || useCase.targetRoles.length === 0) {
    return {
      annual: 0,
      implementation: useCase.estimatedImplementationCost?.range || "$0",
      claudeCost: formatCurrency(CLAUDE_PRICING.minAnnualCost),
      netAnnual: -CLAUDE_PRICING.minAnnualCost,
      employees: 0,
      affectedRoles: [],
      savingsDetails: [],
    };
  }

  // Calculate annual savings based on role hourly rates and time savings
  let totalAnnualSavings = 0;
  let totalEmployees = 0;
  let affectedRoles = new Set();
  const savingsDetails = [];

  useCase.targetRoles.forEach((role) => {
    const employeeCount = parseInt(role.employeeCount) || 0;
    totalEmployees += employeeCount;
    
    // Add to list of unique affected roles
    affectedRoles.add(role.role);

    // Extract time savings percentage (convert "20-30%" to average of 25%)
    const timeSavingsText = role.timeSavings || "0%";
    const timeSavingsMatch = timeSavingsText.match(/(\d+)(?:-(\d+))?%/);
    let timeSavingsPercent = 0;

    if (timeSavingsMatch) {
      if (timeSavingsMatch[2]) {
        // Range like "20-30%"
        const min = parseInt(timeSavingsMatch[1]);
        const max = parseInt(timeSavingsMatch[2]);
        timeSavingsPercent = (min + max) / 2;
      } else {
        // Single value like "25%"
        timeSavingsPercent = parseInt(timeSavingsMatch[1]);
      }
    }

    // Get hourly rate for this role
    const roleName = role.role || "Other";
    const hourlyRate = hourlyRates[roleName] || DEFAULT_HOURLY_RATES["Other"];

    // Calculate annual savings based on hourly rate and weekly task hours if available
    const weeklyTaskHours = role.weeklyTaskHours || 40; // Default to 40 if not specified
    const weeksPerYear = 52;
    const annualTaskHours = weeklyTaskHours * weeksPerYear;
    const savedHoursPerEmployee = annualTaskHours * (timeSavingsPercent / 100);
    const savingsPerEmployee = savedHoursPerEmployee * hourlyRate;
    const totalRoleSavings = savingsPerEmployee * employeeCount;

    totalAnnualSavings += totalRoleSavings;

    savingsDetails.push({
      role: roleName,
      employees: employeeCount,
      timeSavings: `${timeSavingsPercent}%`,
      hourlyRate: `$${hourlyRate}`,
      weeklyHours: weeklyTaskHours,
      annualSavings: formatCurrency(totalRoleSavings),
    });
  });

  // Extract any one-time implementation cost from use case data
  const costRangeText = useCase.estimatedImplementationCost?.range || "$0";
  const costMatch = costRangeText.match(
    /\$(\d+(?:,\d+)?(?:\.\d+)?)\s*(?:-\s*\$(\d+(?:,\d+)?(?:\.\d+)?))?/
  );

  let oneTimeImplementationCost = 0;
  if (costMatch) {
    if (costMatch[2]) {
      // Range like "$10,000 - $20,000"
      const min = parseFloat(costMatch[1].replace(/,/g, ""));
      const max = parseFloat(costMatch[2].replace(/,/g, ""));
      oneTimeImplementationCost = (min + max) / 2;
    } else {
      // Single value like "$15,000"
      oneTimeImplementationCost = parseFloat(costMatch[1].replace(/,/g, ""));
    }
  }

  // Calculate Claude subscription cost
  const claudeUserCount = Math.max(totalEmployees, CLAUDE_PRICING.minUsers);
  const annualClaudeCost = claudeUserCount * CLAUDE_PRICING.monthlySeatCost * 12;
  
  // Check if we need to use minimum cost
  const finalClaudeCost = Math.max(annualClaudeCost, CLAUDE_PRICING.minAnnualCost);
  
  // Calculate net annual savings (annual savings minus Claude subscription and full implementation cost)
  const netAnnualSavings = totalAnnualSavings - finalClaudeCost - oneTimeImplementationCost;

  // Implementation time message based on complexity
  const complexity = useCase.estimatedImplementationCost?.level || "Medium";
  const implementationTimeMap = {
    "Low": "1-2 months",
    "Medium": "2-4 months",
    "High": "4-6 months"
  };
  const implementationTime = implementationTimeMap[complexity] || "2-4 months";

  return {
    annual: totalAnnualSavings,
    implementation: oneTimeImplementationCost > 0 ? formatCurrency(oneTimeImplementationCost) : "$0",
    implementationTime: implementationTime,
    claudeCost: formatCurrency(finalClaudeCost),
    netAnnual: netAnnualSavings,
    employees: totalEmployees,
    affectedRoles: Array.from(affectedRoles),
    savingsDetails: savingsDetails,
  };
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Function to format case study ID for URL
const formatCaseStudyUrl = (id) => {
  if (!id) return "/use-cases";

  // Handle special cases based on the examples provided
  // 1. Convert dots to underscores (e.g., copy.ai -> copy_ai)
  // 2. Keep hyphens as is
  // 3. Take only the first part before parentheses or spaces
  // 4. Make everything lowercase

  let formattedId = id
    .toLowerCase()
    .replace(/\./g, "_") // Replace dots with underscores
    .replace(/\s+\([^)]*\)/g, "") // Remove anything in parentheses with preceding space
    .split(/\s+/)[0]; // Take only the first part before any spaces

  return `/use-cases/${formattedId}`;
};

const UseCaseMatches = ({ matches }) => {
  // If no matches are provided or array is empty
  if (!matches || !matches.useCases || matches.useCases.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-md">
        <p className="text-gray-500">
          No suitable use cases found. Try providing more company information.
        </p>
      </div>
    );
  }

  // Sort matches by relevance score
  const sortedMatches = [...matches.useCases].sort((a, b) => {
    const scoreA =
      typeof a.relevanceScore === "number"
        ? a.relevanceScore
        : parseInt(a.relevanceScore.toString(), 10);
    const scoreB =
      typeof b.relevanceScore === "number"
        ? b.relevanceScore
        : parseInt(b.relevanceScore.toString(), 10);
    return scoreB - scoreA;
  });

  // State for enabled use cases (all enabled by default)
  const [enabledUseCases, setEnabledUseCases] = useState(
    sortedMatches.map((match) => ({ id: match.id, enabled: true }))
  );

  // Calculate total ROI across all enabled use cases
  const totalRoi = React.useMemo(() => {
    const enabledIds = enabledUseCases
      .filter((item) => item.enabled)
      .map((item) => item.id);

    const enabledMatches = sortedMatches.filter((match) =>
      enabledIds.includes(match.id)
    );

    let totalAnnualSavings = 0;
    let totalImplementationCost = 0;
    let totalEmployeesAffected = 0;
    let allAffectedRoles = new Set();

    enabledMatches.forEach((match) => {
      const roi = calculateRoi(match);
      totalAnnualSavings += roi.annual;
      totalImplementationCost += parseInt(roi.implementation.replace(/\$|,/g, "")) || 0;

      // Count total affected employees
      totalEmployeesAffected += roi.employees || 0;
      
      // Collect all affected roles
      if (roi.affectedRoles && roi.affectedRoles.length > 0) {
        roi.affectedRoles.forEach(role => allAffectedRoles.add(role));
      }
    });

    // Calculate Claude subscription cost - based on total employees affected
    // with minimum of 70 users
    const claudeUserCount = Math.max(totalEmployeesAffected, CLAUDE_PRICING.minUsers);
    const annualClaudeCost = claudeUserCount * CLAUDE_PRICING.monthlySeatCost * 12;
    const finalClaudeCost = Math.max(annualClaudeCost, CLAUDE_PRICING.minAnnualCost);
    
    // Calculate net annual savings (including full implementation cost in first year)
    const netAnnualSavings = totalAnnualSavings - finalClaudeCost - totalImplementationCost;

    return {
      annual: totalAnnualSavings,
      claudeCost: formatCurrency(finalClaudeCost),
      netAnnual: netAnnualSavings,
      implementation: formatCurrency(totalImplementationCost),
      employees: totalEmployeesAffected,
      affectedRoles: Array.from(allAffectedRoles),
      useCaseCount: enabledMatches.length,
    };
  }, [sortedMatches, enabledUseCases]);

  // Toggle use case enabled/disabled
  const toggleUseCase = (id) => {
    setEnabledUseCases((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  return (
    <div>
      {/* ROI Summary Card */}
      <div className="bg-white border rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Annual ROI Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-1">Gross Annual Savings</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalRoi.annual)}
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-1">Claude Subscription</p>
            <p className="text-2xl font-bold text-amber-900">
              {totalRoi.claudeCost}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              ${CLAUDE_PRICING.monthlySeatCost}/user/month (min {CLAUDE_PRICING.minUsers} users)
            </p>
          </div>

          <div className={`${totalRoi.netAnnual >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
            <p className={`text-sm ${totalRoi.netAnnual >= 0 ? 'text-green-800' : 'text-red-800'} mb-1`}>Net Annual Savings</p>
            <p className={`text-2xl font-bold ${totalRoi.netAnnual >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(totalRoi.netAnnual)}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-800 mb-1">Employees Affected</p>
            <p className="text-2xl font-bold text-purple-900">
              {totalRoi.employees}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Across {totalRoi.useCaseCount} use cases
            </p>
          </div>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Toggle use cases on/off to customize your ROI calculation</p>
        </div>
      </div>

      {/* Use Case Cards */}
      <div className="space-y-6">
        {sortedMatches.map((match, index) => {
          const isEnabled =
            enabledUseCases.find((item) => item.id === match.id)?.enabled ??
            true;
          const roi = calculateRoi(match);

          return (
            <div
              key={index}
              className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-opacity ${
                !isEnabled && "opacity-60"
              }`}
            >
              <div className="border-b bg-gray-50 px-4 py-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {/* Toggle checkbox */}
                    <label className="inline-flex items-center mr-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        checked={isEnabled}
                        onChange={() => toggleUseCase(match.id)}
                      />
                    </label>

                    <h3 className="text-lg font-semibold text-gray-800">
                      {match.name}
                    </h3>
                  </div>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      match.relevanceScore >= 80
                        ? "bg-green-100 text-green-800"
                        : match.relevanceScore >= 60
                        ? "bg-blue-100 text-blue-800"
                        : match.relevanceScore >= 40
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {match.relevanceScore >= 80
                      ? "Excellent Match"
                      : match.relevanceScore >= 60
                      ? "Good Match"
                      : match.relevanceScore >= 40
                      ? "Potential Match"
                      : "Possible Match"}
                  </span>
                </div>
                <div className="mt-2">
                  <RelevanceScore score={match.relevanceScore} />
                </div>
              </div>

              <div className="p-4">
                {/* ROI Quick View */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Annual Savings</p>
                    <p className="text-md font-bold text-blue-700">
                      {formatCurrency(roi.annual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Claude Subscription</p>
                    <p className="text-md font-bold text-amber-700">
                      {roi.claudeCost}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Net Annual ROI</p>
                    <p className={`text-md font-bold ${roi.netAnnual >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(roi.netAnnual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Implementation</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-md font-bold text-purple-700">
                        {roi.implementationTime}
                      </p>
                      <span className="text-xs text-gray-500">
                        {roi.implementation !== "$0" ? `/ ${roi.implementation}` : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Why This Matches Your Company
                  </h4>
                  <p className="text-sm text-gray-600">
                    {match.relevanceExplanation}
                  </p>
                </div>

                {/* Target Roles Section */}
                {match.targetRoles && match.targetRoles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Target Roles & Savings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {match.targetRoles.map((role, idx) => {
                        // Find savings details for this role
                        const savingsDetail = roi.savingsDetails.find(
                          (d) => d.role === role.role
                        );

                        return (
                          <div
                            key={idx}
                            className="flex items-center border rounded-md p-2 bg-gray-50"
                          >
                            <div className="flex-grow">
                              <p className="font-medium text-sm">{role.role}</p>
                              <p className="text-xs text-gray-600">
                                {role.employeeCount} employees ·{" "}
                                {role.timeSavings} time savings
                              </p>
                              {savingsDetail && (
                                <p className="text-xs font-semibold text-blue-700 mt-1">
                                  {savingsDetail.annualSavings}/year
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Implementation Ideas
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {match.implementationIdeas.map((idea, idx) => (
                        <li key={idx}>{idea}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Expected Benefits
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {match.expectedBenefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Potential Challenges
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {match.expectedChallenges.map((challenge, idx) => (
                      <li key={idx}>{challenge}</li>
                    ))}
                  </ul>
                </div>

                {/* Implementation Cost Section */}
                {match.estimatedImplementationCost && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Implementation Cost
                    </h4>
                    <p className="text-sm">
                      <span
                        className={`font-medium ${
                          match.estimatedImplementationCost.level.includes(
                            "Low"
                          )
                            ? "text-green-600"
                            : match.estimatedImplementationCost.level.includes(
                                "Medium"
                              )
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {match.estimatedImplementationCost.level}
                      </span>
                      {match.estimatedImplementationCost.range &&
                        ` - ${match.estimatedImplementationCost.range}`}
                    </p>
                  </div>
                )}

                {/* Add spacing at bottom of card */}
                <div className="h-4"></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UseCaseMatches;
