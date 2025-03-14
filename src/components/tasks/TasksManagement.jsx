"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckSquare, Calendar, AlertTriangle, Filter, Search, 
  CheckCircle, Clock, XCircle, ChevronRight, PlusCircle,
  User, Tag, ArrowUpDown
} from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { tasksService, generateMockTasks } from '@/services/tasksService';

const TasksManagement = ({ client, addAlert }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  // Load tasks when component mounts or client changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!client) {
        setTasks([]);
        setFilteredTasks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // In development, generate mock tasks if none exist
        if (process.env.NODE_ENV === 'development') {
          const existingTasks = await tasksService.getTasks(client.id);
          if (existingTasks.length === 0) {
            await generateMockTasks(client.id, 8);
          }
        }

        // Get tasks for the current client
        const loadedTasks = await tasksService.getTasks(client.id);
        setTasks(loadedTasks);
        
        // Also update stats
        const taskStats = await tasksService.getTaskStats(client.id);
        setStats(taskStats);
        
        // Apply initial filtering
        filterAndSortTasks(loadedTasks, activeTab, searchQuery, sortField, sortDirection);
      } catch (error) {
        console.error('Error loading tasks:', error);
        addAlert('error', `Error loading tasks: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [client]);

  // Filter and sort tasks when filter criteria change
  useEffect(() => {
    filterAndSortTasks(tasks, activeTab, searchQuery, sortField, sortDirection);
  }, [activeTab, searchQuery, sortField, sortDirection]);

  // Function to filter and sort tasks
  const filterAndSortTasks = (taskList, tab, query, field, direction) => {
    if (!taskList || taskList.length === 0) {
      setFilteredTasks([]);
      return;
    }

    // Apply status filter
    let filtered = [...taskList];
    if (tab === 'pending') {
      filtered = filtered.filter(task => task.status === 'pending');
    } else if (tab === 'in-progress') {
      filtered = filtered.filter(task => task.status === 'in-progress');
    } else if (tab === 'completed') {
      filtered = filtered.filter(task => task.status === 'completed');
    } else if (tab === 'overdue') {
      filtered = filtered.filter(task => {
        const dueDate = parseISO(task.dueDate);
        return task.status !== 'completed' && isAfter(new Date(), dueDate);
      });
    }

    // Apply search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(lowerQuery) || 
        task.description.toLowerCase().includes(lowerQuery) || 
        task.assignee.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;

      if (field === 'dueDate') {
        valueA = new Date(a.dueDate);
        valueB = new Date(b.dueDate);
      } else if (field === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        valueA = priorityOrder[a.priority] || 999;
        valueB = priorityOrder[b.priority] || 999;
      } else if (field === 'createdAt') {
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
      } else {
        valueA = a[field] || '';
        valueB = b[field] || '';
      }

      if (direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  };

  // Handle changing task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const success = await tasksService.updateTask(taskId, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });
      
      if (success) {
        // Update the local state
        const updatedTasks = tasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : null
              } 
            : task
        );
        
        setTasks(updatedTasks);
        
        // Refresh stats
        const taskStats = await tasksService.getTaskStats(client.id);
        setStats(taskStats);
        
        // Show alert
        addAlert('success', `Task status updated to ${newStatus}`);
        
        // Re-apply filtering
        filterAndSortTasks(updatedTasks, activeTab, searchQuery, sortField, sortDirection);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      addAlert('error', `Error updating task: ${error.message}`);
    }
  };

  // Handle sorting change
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get color for priority
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color for status
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if a task is overdue
  const isTaskOverdue = (task) => {
    if (task.status === 'completed') return false;
    const dueDate = parseISO(task.dueDate);
    return isAfter(new Date(), dueDate);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Remediation Tasks</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        </div>
        <p className="text-gray-500 text-sm">
          Manage security remediation tasks and track implementation progress
        </p>
      </div>

      {!client ? (
        <Card className="shadow-md border-none">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 text-blue-800 p-3 rounded-full mb-3">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="text-base font-medium text-gray-800 mb-1">Select a Client</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Please select a client from the sidebar to view and manage remediation tasks.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="shadow-md border-none">
          <CardContent className="pt-6 pb-6 text-center">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-sm text-gray-500">Loading tasks...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {/* Task Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <TaskStatCard 
              title="Total" 
              value={stats.total} 
              icon={<CheckSquare className="h-5 w-5 text-blue-600" />} 
              bgColor="bg-blue-50"
            />
            <TaskStatCard 
              title="Pending" 
              value={stats.pending} 
              icon={<Clock className="h-5 w-5 text-gray-600" />} 
              bgColor="bg-gray-50"
            />
            <TaskStatCard 
              title="In Progress" 
              value={stats.inProgress} 
              icon={<Clock className="h-5 w-5 text-blue-600" />} 
              bgColor="bg-blue-50"
            />
            <TaskStatCard 
              title="Completed" 
              value={stats.completed} 
              icon={<CheckCircle className="h-5 w-5 text-green-600" />} 
              bgColor="bg-green-50"
            />
            <TaskStatCard 
              title="Overdue" 
              value={stats.overdue} 
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />} 
              bgColor="bg-red-50"
            />
          </div>

          {/* Tasks Card */}
          <Card className="shadow-md border-none overflow-hidden">
            {/* Search and filter section */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Search tasks by title, description or assignee..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('dueDate')}
                  >
                    <Calendar className="h-4 w-4" />
                    Due Date
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleSortChange('priority')}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Priority
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs for filtering */}
            <div className="px-4 pt-3 pb-0">
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-5 h-9">
                  <TabsTrigger value="all" className="text-xs">All Tasks</TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="in-progress" className="text-xs">In Progress</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                  <TabsTrigger value="overdue" className="text-xs">Overdue</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Task list */}
            <CardContent className="pt-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3">
                    <CheckSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-800 mb-1">No tasks found</h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery 
                      ? "Try adjusting your search or filters" 
                      : activeTab === 'all' 
                        ? "No remediation tasks have been created yet" 
                        : `No ${activeTab} tasks found`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      isOverdue={isTaskOverdue(task)}
                      getPriorityColor={getPriorityColor}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Component for task statistics card
const TaskStatCard = ({ title, value, icon, bgColor }) => (
  <div className={`p-3 rounded-lg shadow-sm ${bgColor} flex items-center justify-between`}>
    <div>
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
    <div>
      {icon}
    </div>
  </div>
);

// Component for individual task item
const TaskItem = ({ task, onStatusChange, isOverdue, getPriorityColor, getStatusColor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-md overflow-hidden transition-all ${
      isOverdue ? 'border-red-200' : expanded ? 'border-blue-200' : 'border-gray-100'
    } ${expanded ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Task header - always visible */}
      <div className="p-3 bg-white">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 mt-0.5`}>
            {task.status === 'completed' 
              ? <CheckCircle className="h-4 w-4" />
              : isOverdue 
                ? <AlertTriangle className="h-4 w-4" />
                : <Clock className="h-4 w-4" />
            }
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                  {isOverdue && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.assignee}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                  {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-7 w-7 p-0"
                  onClick={() => setExpanded(!expanded)}
                >
                  <ChevronRight className={`h-5 w-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 bg-gray-50 border-t border-gray-100">
          {/* Task description */}
          <div className="mb-3">
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>
          
          {/* Task metadata */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div>
              <span className="text-gray-500">Test Type:</span>{' '}
              <span className="font-medium">{task.testType}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>{' '}
              <span className="font-medium">{format(parseISO(task.createdAt), 'MMM d, yyyy')}</span>
            </div>
            {task.status === 'completed' && task.completedAt && (
              <div>
                <span className="text-gray-500">Completed:</span>{' '}
                <span className="font-medium">{format(parseISO(task.completedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Source:</span>{' '}
              <span className="font-medium capitalize">{task.source.replace('_', ' ')}</span>
            </div>
          </div>
          
          {/* Task actions */}
          <div className="flex justify-end space-x-2">
            {task.status !== 'completed' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onStatusChange(task.id, 'completed')}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Mark Complete
              </Button>
            )}
            
            {task.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onStatusChange(task.id, 'in-progress')}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                Start Progress
              </Button>
            )}
            
            {task.status === 'in-progress' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onStatusChange(task.id, 'pending')}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Pause Progress
              </Button>
            )}
            
            {task.status === 'completed' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onStatusChange(task.id, 'in-progress')}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                Reopen Task
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksManagement; 