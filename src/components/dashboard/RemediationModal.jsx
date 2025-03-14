"use client";

import React, { useState } from 'react';
import { Shield, X, CheckCircle, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tasksService } from '@/services/tasksService';

const RemediationModal = ({ issue, onClose, onRemediate, client }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [remediation, setRemediation] = useState({
    action: '',
    assignee: '',
    dueDate: '',
    priority: issue?.priority || 'high'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRemediation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create a new task object
      const taskData = {
        clientId: client?.id || 'unknown',
        title: issue?.title || 'Unnamed issue',
        description: remediation.action,
        priority: remediation.priority,
        assignee: remediation.assignee,
        dueDate: remediation.dueDate,
        testType: issue?.testType || 'unknown',
        status: 'pending',
        source: 'security_issue',
        sourceId: `issue_${Date.now()}`
      };
      
      // Store in the task service
      await tasksService.addTask(taskData);
      
      setTimeout(() => {
        setIsLoading(false);
        setStep(2);
      }, 500);
    } catch (error) {
      console.error('Error creating remediation task:', error);
      setIsLoading(false);
      // You could show an error message here
    }
  };

  const handleComplete = () => {
    if (onRemediate) {
      onRemediate(remediation);
    }
    onClose();
  };

  // Get tailwind classes based on issue priority
  const getPriorityColor = () => {
    if (issue?.priority === 'critical') return 'bg-red-100 text-red-700';
    if (issue?.priority === 'high') return 'bg-amber-100 text-amber-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Security Issue Remediation</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-full ${getPriorityColor()} flex-shrink-0 mt-0.5`}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{issue?.title}</h3>
                    <p className="text-gray-600 mt-1">{issue?.description}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor()}`}>
                        {issue?.priority} priority
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {issue?.testType} security
                      </span>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                      Remediation Action
                    </label>
                    <textarea
                      id="action"
                      name="action"
                      rows={3}
                      className="w-full p-2 border rounded-md"
                      placeholder="Describe the specific action to address this issue..."
                      value={remediation.action}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <input
                      id="assignee"
                      name="assignee"
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Who will be responsible for this task?"
                      value={remediation.assignee}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      className="w-full p-2 border rounded-md"
                      value={remediation.dueDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      className="w-full p-2 border rounded-md"
                      value={remediation.priority}
                      onChange={handleChange}
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
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : 'Create Remediation Task'}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center py-6">
                <div className="bg-green-100 text-green-700 p-4 rounded-full mb-4">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Remediation Task Created</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  A remediation task has been created and assigned to {remediation.assignee}. 
                  The task is due by {new Date(remediation.dueDate).toLocaleDateString()}.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg w-full mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full flex-shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Remediation: {issue?.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{remediation.action}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Due: {new Date(remediation.dueDate).toLocaleDateString()}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          remediation.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          remediation.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                          remediation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {remediation.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="default" 
                    onClick={handleComplete}
                  >
                    Done
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      onClose();
                      // Navigate to the tasks tab
                      if (window && window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('navigate-to-tasks'));
                      }
                    }}
                  >
                    View All Tasks <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemediationModal; 