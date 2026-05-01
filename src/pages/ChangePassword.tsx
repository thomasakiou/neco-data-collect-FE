import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Key, ArrowLeft, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api.service';

const ChangePassword: React.FC = () => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.new_password !== formData.confirm_new_password) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(
        formData.old_password, 
        formData.new_password, 
        formData.confirm_new_password
      );
      setSuccess('Password changed successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #008751 0%, #004d2e 100%)',
      padding: '2rem'
    }}>
      <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '0.75rem', 
            background: 'var(--accent)', 
            borderRadius: '50%',
            marginBottom: '1rem',
            color: 'var(--primary)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Change Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update your account security credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: '#fee2e2', 
              color: '#991b1b', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              padding: '0.75rem', 
              background: '#dcfce7', 
              color: '#166534', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input 
              type="password" 
              name="old_password"
              className="form-control" 
              placeholder="••••••••"
              value={formData.old_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              name="new_password"
              className="form-control" 
              placeholder="••••••••"
              value={formData.new_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input 
              type="password" 
              name="confirm_new_password"
              className="form-control" 
              placeholder="••••••••"
              value={formData.confirm_new_password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            <Key size={18} />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
