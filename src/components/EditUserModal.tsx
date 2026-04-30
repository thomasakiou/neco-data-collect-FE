import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { authService } from '../services/api.service';

const NIGERIAN_STATES = [
  { code: 'AB', name: 'Abia' },
  { code: 'AD', name: 'Adamawa' },
  { code: 'AK', name: 'Akwa Ibom' },
  { code: 'AN', name: 'Anambra' },
  { code: 'BA', name: 'Bauchi' },
  { code: 'BY', name: 'Bayelsa' },
  { code: 'BE', name: 'Benue' },
  { code: 'BO', name: 'Borno' },
  { code: 'CR', name: 'Cross River' },
  { code: 'DE', name: 'Delta' },
  { code: 'EB', name: 'Ebonyi' },
  { code: 'ED', name: 'Edo' },
  { code: 'EK', name: 'Ekiti' },
  { code: 'EN', name: 'Enugu' },
  { code: 'FC', name: 'FCT' },
  { code: 'GO', name: 'Gombe' },
  { code: 'IM', name: 'Imo' },
  { code: 'JI', name: 'Jigawa' },
  { code: 'KD', name: 'Kaduna' },
  { code: 'KN', name: 'Kano' },
  { code: 'KT', name: 'Katsina' },
  { code: 'KE', name: 'Kebbi' },
  { code: 'KO', name: 'Kogi' },
  { code: 'KW', name: 'Kwara' },
  { code: 'LA', name: 'Lagos' },
  { code: 'NA', name: 'Nasarawa' },
  { code: 'NI', name: 'Niger' },
  { code: 'OG', name: 'Ogun' },
  { code: 'ON', name: 'Ondo' },
  { code: 'OS', name: 'Osun' },
  { code: 'OY', name: 'Oyo' },
  { code: 'PL', name: 'Plateau' },
  { code: 'RI', name: 'Rivers' },
  { code: 'SO', name: 'Sokoto' },
  { code: 'TA', name: 'Taraba' },
  { code: 'YO', name: 'Yobe' },
  { code: 'ZA', name: 'Zamfara' }
];

interface UserInfo {
  id: number;
  email: string;
  state_name: string;
  state_code: string;
}

interface EditUserModalProps {
  user: UserInfo;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    stateName: user.state_name,
    stateCode: user.state_code,
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'stateName') {
      const selectedState = NIGERIAN_STATES.find(s => s.name === value);
      setFormData({
        ...formData,
        stateName: value,
        stateCode: selectedState ? selectedState.code : formData.stateCode
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const updateData: any = {};
    if (formData.email !== user.email) updateData.email = formData.email;
    if (formData.stateName !== user.state_name) updateData.state_name = formData.stateName;
    if (formData.stateCode !== user.state_code) updateData.state_code = formData.stateCode.toUpperCase();
    if (formData.password) updateData.password = formData.password;

    if (Object.keys(updateData).length === 0) {
      setError('No changes detected');
      setLoading(false);
      return;
    }

    try {
      await authService.updateUser(user.id, updateData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale-in">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Save size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Edit User Account</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              background: '#fee2e2', 
              color: '#991b1b', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
            <input 
              type="text" 
              name="password"
              className="form-control" 
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">State Name</label>
              <select 
                name="stateName"
                className="form-control" 
                value={formData.stateName}
                onChange={handleChange}
                required
              >
                <option value="">-- Select State --</option>
                {NIGERIAN_STATES.map(state => (
                  <option key={state.code} value={state.name}>{state.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State Code</label>
              <input 
                type="text" 
                name="stateCode"
                className="form-control" 
                value={formData.stateCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
