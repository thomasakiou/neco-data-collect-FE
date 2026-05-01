import React, { useState } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { lgaService, type LGARecord } from '../services/api.service';

interface EditLgaModalProps {
  lga?: LGARecord; // If provided, we are editing. If not, creating.
  onClose: () => void;
  onSuccess: () => void;
}

const EditLgaModal: React.FC<EditLgaModalProps> = ({ lga, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Omit<LGARecord, 'id'>>({
    state_name: lga?.state_name || '',
    state_code: lga?.state_code || '',
    lga_name: lga?.lga_name || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (lga) {
        await lgaService.updateLGA(lga.id, formData);
      } else {
        await lgaService.createLGA(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save LGA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{lga ? 'Edit LGA' : 'Add New LGA'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">State Name</label>
            <input 
              type="text" 
              name="state_name" 
              className="form-control" 
              value={formData.state_name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Abia"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">State Code</label>
            <input 
              type="text" 
              name="state_code" 
              className="form-control" 
              value={formData.state_code} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 001"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">LGA Name</label>
            <input 
              type="text" 
              name="lga_name" 
              className="form-control" 
              value={formData.lga_name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Aba South"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save LGA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLgaModal;
