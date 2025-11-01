
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const DEMO_ACCOUNTS = [
  { email: 'admin@example.com', password: 'Admin123!', role: 'admin' },
  { email: 'user@example.com', password: 'User123!', role: 'user' },
];

function App() {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', username: '', firstName: '', lastName: '' });
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchTasks();
    }
  }, [token]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTaskInput = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = (account) => {
    setForm({ email: account.email, password: account.password });
    handleLogin(account.email, account.password);
  };

  const handleLogin = async (email = form.email, password = form.password) => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.data.token);
      localStorage.setItem('jwt', res.data.data.token);
      setUser(res.data.data.user);
      setView('dashboard');
      setSuccess(`Welcome back, ${res.data.data.user.fullName || res.data.data.user.username}!`);
      setForm({ email: '', password: '', username: '', firstName: '', lastName: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.username) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, form);
      setToken(res.data.data.token);
      localStorage.setItem('jwt', res.data.data.token);
      setUser(res.data.data.user);
      setView('dashboard');
      setSuccess(`Welcome, ${res.data.data.user.fullName || res.data.data.user.username}!`);
      setForm({ email: '', password: '', username: '', firstName: '', lastName: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data.user);
    } catch (err) {
      setError('Session expired. Please login again.');
      setToken('');
      localStorage.removeItem('jwt');
      setView('login');
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.data.tasks || []);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/tasks`, taskForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Task created successfully!');
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!taskForm.title.trim()) {
      setError('Please enter a task title');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.put(`${API_URL}/tasks/${editingTask}`, taskForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Task updated successfully!');
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setEditingTask(task._id);
  };

  const handleCancelEdit = () => {
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setEditingTask(null);
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Task deleted successfully!');
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setTasks([]);
    localStorage.removeItem('jwt');
    setView('login');
    setSuccess('Logged out successfully!');
    setForm({ email: '', password: '', username: '', firstName: '', lastName: '' });
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' });
    setEditingTask(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority?.toLowerCase() || 'medium'}`;
  };

  return (
    <div className="container">
      <h1>🚀 Task Manager App</h1>
      
      {error && <div className="error">❌ {error}</div>}
      {success && <div className="success">✅ {success}</div>}
      {loading && <div className="loading">⏳ Loading...</div>}

      {view === 'login' && (
        <div className="auth-form">
          <h2>🔐 Login</h2>
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={handleInput}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleInput}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={() => handleLogin()} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button onClick={() => setView('register')} disabled={loading}>
            Create New Account
          </button>
          
          <div className="demo-accounts">
            <h3>🎯 Demo Accounts</h3>
            <p style={{fontSize: '14px', color: '#666', marginBottom: '10px'}}>
              Quick login for testing
            </p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button 
                key={acc.email} 
                onClick={() => handleDemoLogin(acc)}
                disabled={loading}
              >
                Login as {acc.role.toUpperCase()} ({acc.email})
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'register' && (
        <div className="auth-form">
          <h2>📝 Create Account</h2>
          <input 
            name="username" 
            placeholder="Username (required)" 
            value={form.username} 
            onChange={handleInput} 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address (required)" 
            value={form.email} 
            onChange={handleInput} 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password (required)" 
            value={form.password} 
            onChange={handleInput} 
          />
          <input 
            name="firstName" 
            placeholder="First Name (optional)" 
            value={form.firstName} 
            onChange={handleInput} 
          />
          <input 
            name="lastName" 
            placeholder="Last Name (optional)" 
            value={form.lastName} 
            onChange={handleInput} 
          />
          <button onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <button onClick={() => setView('login')} disabled={loading}>
            Back to Login
          </button>
        </div>
      )}

      {view === 'dashboard' && user && (
        <div className="dashboard">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
            <div>
              <h2>👋 Welcome, {user.fullName || user.username}!</h2>
              <p style={{color: '#666', fontSize: '16px'}}>
                Role: <span style={{color: '#667eea', fontWeight: 'bold'}}>{user.role?.toUpperCase()}</span>
              </p>
            </div>
            <button onClick={handleLogout} disabled={loading} style={{position: 'relative'}}>
              🚪 Logout
            </button>
          </div>

          <h3>{editingTask ? '✏️ Edit Task' : '➕ Create New Task'}</h3>
          <div className="task-form">
            <input 
              name="title" 
              placeholder="Task Title (required)" 
              value={taskForm.title} 
              onChange={handleTaskInput} 
            />
            <input 
              name="description" 
              placeholder="Task Description (optional)" 
              value={taskForm.description} 
              onChange={handleTaskInput} 
            />
            <select name="priority" value={taskForm.priority} onChange={handleTaskInput}>
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            <input 
              name="dueDate" 
              type="date" 
              value={taskForm.dueDate} 
              onChange={handleTaskInput} 
            />
            {editingTask ? (
              <>
                <button onClick={handleUpdateTask} disabled={loading}>
                  {loading ? 'Updating...' : '💾 Update Task'}
                </button>
                <button onClick={handleCancelEdit} disabled={loading} style={{background: '#6c757d'}}>
                  ❌ Cancel
                </button>
              </>
            ) : (
              <button onClick={handleCreateTask} disabled={loading} style={{gridColumn: 'span 2'}}>
                {loading ? 'Creating...' : '✨ Create Task'}
              </button>
            )}
          </div>

          <h3>📋 Your Tasks ({tasks.length})</h3>
          <ul className="task-list">
            {tasks.length === 0 && (
              <li style={{textAlign: 'center', fontStyle: 'italic', color: '#666'}}>
                📝 No tasks found. Create your first task above!
              </li>
            )}
            {tasks.map((task) => (
              <li key={task._id}>
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                    <strong>{task.title}</strong>
                    <span className={getPriorityClass(task.priority)}>
                      {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                      {task.priority?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>
                  {task.description && (
                    <p style={{color: '#666', margin: '5px 0'}}>{task.description}</p>
                  )}
                  <p style={{fontSize: '14px', color: '#888'}}>
                    📅 Due: {formatDate(task.dueDate)}
                  </p>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button 
                    onClick={() => handleEditTask(task)}
                    style={{background: '#007bff', fontSize: '14px', padding: '6px 12px'}}
                    disabled={loading}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    disabled={loading}
                    style={{fontSize: '14px', padding: '6px 12px'}}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
