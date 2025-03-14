"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, AlertTriangle, FileText, Download, Calendar, 
  Filter, ChevronDown, Printer, BarChart4, CheckCircle, Download as DownloadIcon, X
} from 'lucide-react';
import { format } from 'date-fns';
import { tasksService } from '@/services/tasksService';

// Sample report data - in a real app, this would come from an API
const generateMockReports = (clientId) => {
  // Use client ID as a seed for deterministic reports
  const seed = parseInt(clientId, 10) || 1;
  
  // Generate a date within the last 3 months
  const getRandomDate = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (((seed + offset) % 90) + 1));
    return date;
  };

  const reportTypes = ['Security Assessment', 'Compliance Audit', 'Vulnerability Scan', 'Penetration Test'];
  const statuses = ['Completed', 'In Progress', 'Scheduled'];
  const complianceFrameworks = ['ISO 27001', 'GDPR', 'HIPAA', 'SOC 2', 'PCI DSS'];
  
  // Generate 10 reports with deterministic but varied data
  return Array.from({ length: 10 }, (_, index) => {
    const date = getRandomDate(index);
    const typeIndex = (seed + index) % reportTypes.length;
    const statusIndex = (seed + index) % statuses.length;
    
    return {
      id: `report-${seed}-${index}`,
      title: `${reportTypes[typeIndex]} Report`,
      date: date,
      status: statuses[statusIndex],
      complianceFramework: complianceFrameworks[(seed + index) % complianceFrameworks.length],
      score: statusIndex === 0 ? 60 + ((seed + index) % 35) : null, // Only completed reports have scores
      criticalFindings: statusIndex === 0 ? (seed + index) % 5 : null
    };
  }).sort((a, b) => b.date - a.date); // Sort by date, newest first
};

const SecurityReports = ({ client, addAlert }) => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRemediationModal, setShowRemediationModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setIsLoading(true);
      // Simulate API call to get reports
      setTimeout(() => {
        const mockReports = generateMockReports(client.id);
        setReports(mockReports);
        setIsLoading(false);
      }, 800);
    }
  }, [client]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Scheduled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status.toLowerCase() === filter.toLowerCase());

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  // Handle remediation button click
  const handleRemediate = (finding, index) => {
    setSelectedFinding({
      ...finding,
      reportId: selectedReport.id,
      index: index
    });
    setShowRemediationModal(true);
  };

  // Handle when a remediation task is created
  const handleRemediationComplete = async (remediation) => {
    if (!selectedFinding || !client) return;
    
    try {
      // Create a task using the task service
      const taskData = {
        clientId: client.id,
        title: selectedFinding.title || `Finding #${selectedFinding.index + 1}`,
        description: remediation.action,
        priority: remediation.priority,
        assignee: remediation.assignee,
        dueDate: remediation.dueDate,
        testType: 'report',
        status: 'pending',
        source: 'security_report',
        sourceId: selectedReport?.id
      };
      
      await tasksService.addTask(taskData);
      
      // Show success message
      addAlert('success', 'Remediation task created successfully');
      
      // Close modal
      setShowRemediationModal(false);
    } catch (error) {
      console.error('Error creating remediation task:', error);
      addAlert('error', 'Failed to create remediation task');
    }
  };

  // Handle export report
  const handleExportReport = () => {
    if (!selectedReport) return;
    
    setExportLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      // Create a simple JSON representation of the report
      const reportData = {
        title: selectedReport.title,
        date: format(selectedReport.date, 'yyyy-MM-dd'),
        status: selectedReport.status,
        complianceFramework: selectedReport.complianceFramework,
        score: selectedReport.score,
        criticalFindings: selectedReport.criticalFindings
      };
      
      // Convert to string
      const jsonString = JSON.stringify(reportData, null, 2);
      
      // Create a blob with the data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create an anchor element and trigger a download
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `security-report-${selectedReport.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setExportLoading(false);
      addAlert('success', 'Report exported successfully');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Security Reports</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => {
              if (reports.length > 0) {
                setExportLoading(true);
                setTimeout(() => {
                  setExportLoading(false);
                  addAlert('success', 'All reports exported successfully');
                }, 1500);
              } else {
                addAlert('warning', 'No reports available to export');
              }
            }}
            disabled={exportLoading || reports.length === 0}
          >
            {exportLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4" />
                Export All
              </>
            )}
          </Button>
        </div>
        <p className="text-gray-500 text-sm">
          Review all security assessment reports and compliance documentation
        </p>
      </div>

      {!client ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-3">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Select a Client</h3>
            <p className="text-sm text-gray-500 max-w-md text-center">
              Please select a client from the sidebar to view security reports.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-gray-500">Loading reports...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Reports List Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-none">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">Reports</CardTitle>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1 text-sm"
                    >
                      <Filter className="h-3 w-3" />
                      Filter
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant={filter === 'all' ? 'default' : 'outline'} 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filter === 'completed' ? 'default' : 'outline'} 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </Button>
                  <Button 
                    variant={filter === 'in progress' ? 'default' : 'outline'} 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setFilter('in progress')}
                  >
                    In Progress
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <div 
                        key={report.id} 
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedReport?.id === report.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'bg-white border border-gray-100 hover:border-blue-200'
                        }`}
                        onClick={() => handleViewReport(report)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{report.title}</h4>
                            <span className="text-xs text-gray-500">
                              {format(report.date, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                        {report.score !== null && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeColor(report.score)}`}>
                              Score: {report.score}%
                            </span>
                            {report.criticalFindings > 0 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                {report.criticalFindings} Critical
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">No reports match the filter</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Details Panel */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <Card className="shadow-md border-none">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">{selectedReport.title}</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                      >
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={handleExportReport}
                        disabled={exportLoading}
                      >
                        {exportLoading ? (
                          <>
                            <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <DownloadIcon className="h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Generated on {format(selectedReport.date, 'MMMM d, yyyy')} • Framework: {selectedReport.complianceFramework}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedReport.status === 'Completed' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Overall Score</div>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold mr-2">{selectedReport.score}%</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getScoreBadgeColor(selectedReport.score)}`}>
                              {selectedReport.score >= 80 ? 'Good' : selectedReport.score >= 60 ? 'Average' : 'Poor'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Critical Findings</div>
                          <div className="text-2xl font-bold">
                            {selectedReport.criticalFindings}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Next Assessment</div>
                          <div className="text-lg font-medium">
                            {format(new Date(selectedReport.date.getTime() + 90*24*60*60*1000), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Executive Summary</h3>
                        <p className="text-sm text-gray-800">
                          This security assessment was conducted to evaluate the overall security posture of the BPO operations.
                          The assessment covered key areas including encryption standards, access controls, data protection measures,
                          and compliance with relevant frameworks and regulations.
                        </p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center justify-between">
                          <span>Key Findings</span>
                          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                            <DownloadIcon className="h-3 w-3" />
                            Export Findings
                          </Button>
                        </h3>
                        <div className="space-y-2">
                          {Array.from({ length: 3 + (selectedReport.criticalFindings || 0) }, (_, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-all">
                              <div className={`p-1.5 rounded-full flex-shrink-0 ${
                                i < selectedReport.criticalFindings 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                <AlertTriangle className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium flex items-center justify-between">
                                  <span>
                                    {i < selectedReport.criticalFindings 
                                      ? `Critical Finding ${i+1}: ${['Unpatched vulnerability', 'Weak encryption', 'Excessive permissions', 'Insecure API', 'Missing MFA'][i % 5]}`
                                      : `Finding ${i+1}: ${['Outdated security policy', 'Inconsistent access reviews', 'Incomplete audit logs'][i % 3]}`
                                    }
                                  </span>
                                  {i < selectedReport.criticalFindings && addAlert && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-xs h-7 px-2 text-blue-600" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const finding = {
                                          title: `${['Unpatched vulnerability', 'Weak encryption', 'Excessive permissions', 'Insecure API', 'Missing MFA'][i % 5]}`,
                                          priority: 'critical',
                                          description: 'A critical security issue identified in security report that requires immediate attention.'
                                        };
                                        handleRemediate(finding, i);
                                      }}
                                    >
                                      Remediate
                                    </Button>
                                  )}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {i < selectedReport.criticalFindings
                                    ? `A critical security issue was identified that requires immediate attention.`
                                    : `A medium-priority finding that should be addressed within 30 days.`
                                  }
                                </p>
                                {selectedReport.status === 'Completed' && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    <span className="font-medium">Impact Score:</span> {70 - (i * 10)}%
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h3>
                        <div className="space-y-2">
                          {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                              <div className="p-1.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                                <CheckCircle className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  {['Implement security patching schedule', 'Enforce MFA across all systems', 'Review access permissions quarterly', 'Upgrade encryption standards'][i]}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {['Regular patching reduces vulnerability exposure', 
                                    'Multi-factor authentication significantly reduces unauthorized access risk',
                                    'Regular access reviews prevent privilege creep',
                                    'Modern encryption standards protect data at rest and in transit'][i]}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className={`p-4 rounded-full mb-4 ${
                        selectedReport.status === 'In Progress' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedReport.status === 'In Progress' 
                          ? <BarChart4 className="h-8 w-8" /> 
                          : <Calendar className="h-8 w-8" />
                        }
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        {selectedReport.status === 'In Progress' 
                          ? 'Report is being generated' 
                          : 'Assessment scheduled'
                        }
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        {selectedReport.status === 'In Progress' 
                          ? 'The security assessment is currently in progress. Results will be available once completed.' 
                          : `This security assessment is scheduled for ${format(selectedReport.date, 'MMMM d, yyyy')}.`
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-md border-none h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="bg-blue-100 text-blue-700 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a report</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    Choose a report from the list to view detailed information about the security assessment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Remediation Modal for report findings */}
      {showRemediationModal && selectedFinding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Remediate Finding</h2>
              </div>
              <button 
                onClick={() => setShowRemediationModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-full bg-red-100 text-red-700 flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{selectedFinding.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedFinding.description}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                        Critical finding
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        From: {selectedReport?.title || 'Security Report'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                      Remediation Action
                    </label>
                    <textarea
                      id="action"
                      rows={3}
                      className="w-full p-2 border rounded-md"
                      placeholder="Describe the specific action to address this finding..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <input
                      id="assignee"
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Who will be responsible for this task?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      className="w-full p-2 border rounded-md"
                      defaultValue="critical"
                      required
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowRemediationModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => {
                        // Mock remediation data
                        const remediationData = {
                          action: `Remediate ${selectedFinding.title}`,
                          assignee: 'Security Team',
                          dueDate: new Date().toISOString().split('T')[0],
                          priority: 'critical'
                        };
                        handleRemediationComplete(remediationData);
                      }}
                    >
                      Create Remediation Task
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityReports; 