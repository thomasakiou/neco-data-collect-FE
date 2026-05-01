import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RefreshCw, Users, Key, AlertTriangle, ArrowLeft, UserPlus, LogOut, Trash2, Edit3 } from 'lucide-react';
import { authService } from '../services/api.service';
import CreateUserModal from '../components/CreateUserModal.tsx';
import EditUserModal from '../components/EditUserModal.tsx';

interface UserInfo {
  id: number;
  email: string;
  state_name: string;
  state_code: string;
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [resettingEmail, setResettingEmail] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const data = await authService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!window.confirm(`Are you sure you want to reset password for ${email}?`)) return;
    
    setResettingEmail(email);
    setMessage(null);
    try {
      const result = await authService.resetPassword(email);
      setMessage({ type: 'success', text: result.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setResettingEmail(null);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email === 'thomas.akiou@gmail.com') return;
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE account: ${email}? This action cannot be undone.`)) return;

    setDeletingEmail(email);
    setMessage(null);
    try {
      await authService.deleteUser(email);
      setMessage({ type: 'success', text: `User ${email} deleted successfully.` });
      fetchUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="header" style={{ 
        background: 'white', 
        padding: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>System Administration</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
           <Link to="/change-password" title="Change My Password" style={{ color: 'var(--text-muted)' }}>
             <Key size={20} />
           </Link>
           <button 
             className="btn btn-outline" 
             style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
             onClick={handleLogout}
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={24} color="var(--primary)" />
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>User Management</h2>
            </div>
            <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus size={18} />
              Create New Account
            </button>
          </div>
          
          {message && (
            <div style={{ 
              padding: '1rem', 
              background: message.type === 'success' ? '#dcfce7' : '#fee2e2', 
              color: message.type === 'success' ? '#166534' : '#991b1b',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {message.type === 'error' && <AlertTriangle size={18} />}
              {message.text}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Email Address</th>
                    <th>Assigned State</th>
                    <th>Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email}>
                      <td style={{ fontWeight: 600 }}>{user.email}</td>
                      <td>{user.state_name}</td>
                      <td><code>{user.state_code}</code></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                            onClick={() => handleResetPassword(user.email)}
                            disabled={resettingEmail === user.email || deletingEmail === user.email}
                            title="Reset Password"
                          >
                            <RefreshCw size={14} className={resettingEmail === user.email ? 'animate-spin' : ''} />
                            {resettingEmail === user.email ? 'Resetting...' : 'Reset'}
                          </button>

                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            onClick={() => setEditingUser(user)}
                            title="Edit User"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          
                          {user.email !== 'thomas.akiou@gmail.com' && (
                            <button 
                              className="btn btn-outline" 
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#dc2626' }}
                              onClick={() => handleDeleteUser(user.email)}
                              disabled={resettingEmail === user.email || deletingEmail === user.email}
                              title="Delete User"
                            >
                              {deletingEmail === user.email ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isCreateModalOpen && (
        <CreateUserModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            fetchUsers();
            setMessage({ type: 'success', text: 'New account created successfully!' });
          }}
        />
      )}

      {editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => setEditingUser(null)} 
          onSuccess={() => {
            fetchUsers();
            setMessage({ type: 'success', text: `User ${editingUser.email} updated successfully!` });
          }}
        />
      )}
    </div>
  );
};

export default Admin;
