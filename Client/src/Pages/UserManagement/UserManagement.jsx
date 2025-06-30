import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addActivity } from '../../Components/RecentActivity/RecentActivity';
import './UserManagement.css';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    recentSignups: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadUsers();
  }, [isAdmin]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, filterRole, sortBy, sortOrder]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
    calculateStats(storedUsers);
  };

  const calculateStats = (userList) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalUsers: userList.length,
      activeUsers: userList.filter(u => u.status !== 'suspended').length,
      adminUsers: userList.filter(u => u.role === 'admin').length,
      recentSignups: userList.filter(u => new Date(u.createdAt) > weekAgo).length
    };
    
    setStats(stats);
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
    
    if (existingUsers.find(u => u.username === newUser.username)) {
      alert('Username already exists');
      return;
    }
    
    if (existingUsers.find(u => u.email === newUser.email)) {
      alert('Email already exists');
      return;
    }

    const userToCreate = {
      id: Date.now(),
      ...newUser,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      status: 'active'
    };

    const updatedUsers = [...existingUsers, userToCreate];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setUsers(updatedUsers);
    setShowCreateModal(false);
    setNewUser({ username: '', email: '', password: '', role: 'user', status: 'active' });
    
    addActivity('user_created', `Created new user: ${userToCreate.username}`, `Role: ${userToCreate.role}`);
    alert('User created successfully!');
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleUpdateUser = () => {
    const updatedUsers = users.map(u => 
      u.id === editingUser.id ? editingUser : u
    );
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowEditModal(false);
    setEditingUser(null);
    
    addActivity('user_updated', `Updated user: ${editingUser.username}`, 'User profile modified');
    alert('User updated successfully!');
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    
    if (userToDelete.username === user.username) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) {
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      addActivity('user_deleted', `Deleted user: ${userToDelete.username}`, 'User account removed');
      alert('User deleted successfully!');
    }
  };

  function handleBulkAction(action) {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
        const updatedUsers = users.filter(u => !selectedUsers.includes(u.id));
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setSelectedUsers([]);

        addActivity('bulk_delete', `Deleted ${selectedUsers.length} users`, 'Bulk user deletion');
        alert('Users deleted successfully!');
      }
    } else if (action === 'suspend') {
      const updatedUsers = users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'suspended' } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setSelectedUsers([]);

      addActivity('bulk_suspend', `Suspended ${selectedUsers.length} users`, 'Bulk user suspension');
      alert('Users suspended successfully!');
    } else if (action === 'activate') {
      const updatedUsers = users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'active' } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setSelectedUsers([]);

      addActivity('bulk_activate', `Activated ${selectedUsers.length} users`, 'Bulk user activation');
      alert('Users activated successfully!');
    }
  }

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addActivity('export', 'Exported user data', `${users.length} users exported`);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <div className="access-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You need administrator privileges to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-content">
          <h1>👥 User Management</h1>
          <p>Manage system users, roles, and permissions</p>
        </div>
        
        <div className="header-actions">
          <button className="action-btn primary" onClick={() => setShowCreateModal(true)}>
            <span>➕</span>
            Add User
          </button>
          <button className="action-btn secondary" onClick={exportUsers}>
            <span>📤</span>
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <div className="stat-number">{stats.adminUsers}</div>
            <div className="stat-label">Administrators</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <div className="stat-number">{stats.recentSignups}</div>
            <div className="stat-label">Recent Signups</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="user-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Users</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
            <option value="lastLogin">Last Login</option>
          </select>
          
          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedUsers.length} users selected</span>
          <div className="bulk-buttons">
            <button className="bulk-btn activate" onClick={() => handleBulkAction('activate')}>
              ✅ Activate
            </button>
            <button className="bulk-btn suspend" onClick={() => handleBulkAction('suspend')}>
              ⏸️ Suspend
            </button>
            <button className="bulk-btn delete" onClick={() => handleBulkAction('delete')}>
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="username">{user.username}</div>
                      <div className="email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? '👨‍💼' : '👨‍💻'} {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status || 'active'}`}>
                    {user.status === 'suspended' ? '⏸️' : '✅'} {user.status || 'active'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn-small edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn-small delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Create New User</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleCreateUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit User</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingUser.status || 'active'}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleUpdateUser}>
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;