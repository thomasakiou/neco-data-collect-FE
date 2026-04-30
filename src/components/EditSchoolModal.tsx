import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { School } from '../data/mockData';

interface Props {
  school: School;
  onClose: () => void;
  onSave: (updatedSchool: School) => void;
}

const EditSchoolModal: React.FC<Props> = ({ school, onClose, onSave }) => {
  const [formData, setFormData] = useState<School>({ ...school });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'School email is mandatory';
    if (!formData.lastAccreditationDate) newErrors.lastAccreditationDate = 'Date is mandatory';
    if (!formData.gender) newErrors.gender = 'Please select gender type';
    if (!formData.ownership) newErrors.ownership = 'Please select ownership type';
    if (!formData.lga) newErrors.lga = 'LGA is mandatory';
    if (!formData.town) newErrors.town = 'Town is mandatory';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Edit School Information</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>{school.name}</h4>
          </div>

          <div className="form-group">
            <label className="form-label">School Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. school@example.com"
            />
            {errors.email && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</div>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Last Accreditation Date</label>
              <input 
                type="date" 
                name="lastAccreditationDate"
                className="form-control" 
                value={formData.lastAccreditationDate}
                onChange={handleChange}
              />
              {errors.lastAccreditationDate && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.lastAccreditationDate}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">School Category (Gender)</label>
              <select 
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">-- Select --</option>
                <option value="Girls">Girls</option>
                <option value="Boys">Boys</option>
                <option value="Mixed">Mixed</option>
              </select>
              {errors.gender && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.gender}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ownership Type</label>
            <select 
              name="ownership"
              className="form-control"
              value={formData.ownership}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              <option value="Private">Private</option>
              <option value="Public">Public</option>
              <option value="Federal">Federal</option>
            </select>
            {errors.ownership && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.ownership}</div>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">LGA</label>
              <input 
                type="text" 
                name="lga"
                className="form-control" 
                value={formData.lga}
                onChange={handleChange}
                placeholder="Local Government Area"
              />
              {errors.lga && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.lga}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Town</label>
              <input 
                type="text" 
                name="town"
                className="form-control" 
                value={formData.town}
                onChange={handleChange}
                placeholder="Town / Location"
              />
              {errors.town && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.town}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Save Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSchoolModal;
