// Task management service
// Handles storage and retrieval of remediation tasks

// Helper to get tasks from localStorage
const getTasksFromStorage = () => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedTasks = localStorage.getItem('remediation_tasks');
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error('Error retrieving tasks from localStorage:', error);
    return [];
  }
};

// Helper to save tasks to localStorage
const saveTasksToStorage = (tasks) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('remediation_tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
  }
};

// Task service API
export const tasksService = {
  // Get all tasks
  getTasks: async (clientId = null) => {
    // Retrieve tasks from storage
    const tasks = getTasksFromStorage();
    
    // Filter by client if specified
    return clientId 
      ? tasks.filter(task => task.clientId === clientId)
      : tasks;
  },
  
  // Add a new task
  addTask: async (task) => {
    if (!task) return null;
    
    // Generate an ID for the task
    const newTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: task.status || 'pending'
    };
    
    // Get existing tasks and add the new one
    const tasks = getTasksFromStorage();
    const updatedTasks = [...tasks, newTask];
    
    // Save to storage
    saveTasksToStorage(updatedTasks);
    
    return newTask;
  },
  
  // Update an existing task
  updateTask: async (taskId, updates) => {
    if (!taskId || !updates) return false;
    
    // Get tasks
    const tasks = getTasksFromStorage();
    
    // Find the task to update
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return false;
    
    // Update the task
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Replace in the array
    const updatedTasks = [
      ...tasks.slice(0, taskIndex),
      updatedTask,
      ...tasks.slice(taskIndex + 1)
    ];
    
    // Save to storage
    saveTasksToStorage(updatedTasks);
    
    return true;
  },
  
  // Delete a task
  deleteTask: async (taskId) => {
    if (!taskId) return false;
    
    // Get tasks
    const tasks = getTasksFromStorage();
    
    // Filter out the task to delete
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    if (updatedTasks.length === tasks.length) {
      // No task was removed
      return false;
    }
    
    // Save to storage
    saveTasksToStorage(updatedTasks);
    
    return true;
  },
  
  // Get task statistics
  getTaskStats: async (clientId = null) => {
    const tasks = await tasksService.getTasks(clientId);
    
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      completed: tasks.filter(task => task.status === 'completed').length,
      overdue: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return task.status !== 'completed' && dueDate < new Date();
      }).length
    };
  }
};

// Generate mock tasks for demonstration
export const generateMockTasks = (clientId, count = 5) => {
  const priorities = ['critical', 'high', 'medium', 'low'];
  const statuses = ['pending', 'in-progress', 'completed'];
  const testTypes = ['encryption', 'access', 'dataProtection', 'compliance'];
  const issues = [
    'Unpatched vulnerability in server',
    'Weak encryption for sensitive data',
    'Excessive admin permissions',
    'Insecure API endpoints',
    'Missing MFA for admin accounts',
    'Outdated security policies',
    'Inconsistent access reviews',
    'Incomplete audit logs'
  ];
  
  // Clear existing tasks for this client
  const allTasks = getTasksFromStorage();
  const otherClientTasks = allTasks.filter(task => task.clientId !== clientId);
  
  // Generate new tasks
  const newTasks = Array.from({ length: count }, (_, i) => {
    // Create a due date between yesterday and 30 days in the future
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 1);
    
    // Randomly determine if task is completed
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // For completed tasks, add a completion date
    const completedAt = status === 'completed' 
      ? new Date(dueDate.getTime() - Math.floor(Math.random() * 5 * 86400000)).toISOString() 
      : null;
    
    return {
      id: `task_mock_${clientId}_${i}`,
      clientId: clientId,
      title: issues[i % issues.length],
      description: `Remediation task for security issue: ${issues[i % issues.length]}`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignee: ['John Doe', 'Jane Smith', 'Alex Johnson'][Math.floor(Math.random() * 3)],
      dueDate: dueDate.toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      testType: testTypes[Math.floor(Math.random() * testTypes.length)],
      status,
      completedAt,
      source: Math.random() > 0.5 ? 'security_test' : 'report',
      sourceId: `source_${Math.floor(Math.random() * 1000)}`
    };
  });
  
  // Save all tasks
  saveTasksToStorage([...otherClientTasks, ...newTasks]);
  
  return newTasks;
}; 