import React, { useState } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { dataService, type DataRecord, type ExamType } from '../services/api.service';

export interface CustodianInfo {
  name: string;
  code: string;
  town: string;
}

interface EditRecordModalProps {
  record: DataRecord;
  examType: ExamType;
  custodians?: CustodianInfo[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({ record, examType, custodians, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<DataRecord>>({
    state_code: record.state_code,
    state_name: record.state_name,
    sch_num: record.sch_num,
    sch_name: record.sch_name,
    cust_code: record.cust_code,
    cust_name: record.cust_name,
    cust_town: record.cust_town,
    status: record.status || '',
    type: record.type || '',
    category: record.category || '',
    accd_year: record.accd_year || '',
    lga: record.lga || '',
  });
  
  const currentUser = localStorage.getItem('user');
  const userObj = currentUser ? JSON.parse(currentUser) : null;
  const isAdmin = userObj?.email?.toLowerCase() === 'thomas.akiou@gmail.com';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cust_name' && custodians) {
      const found = custodians.find(c => c.name === value);
      if (found) {
        setFormData(prev => ({ 
          ...prev, 
          cust_name: found.name,
          cust_code: found.code,
          cust_town: found.town
        }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      setFormData(prev => ({ ...prev, accd_year: '' }));
      return;
    }
    const parts = val.split('-');
    if (parts.length === 3) {
      setFormData(prev => ({ ...prev, accd_year: `${parts[2]}/${parts[1]}/${parts[0]}` }));
    } else {
      setFormData(prev => ({ ...prev, accd_year: val }));
    }
  };

  const isComplete = (data: Partial<DataRecord>) => {
    const check = (val: string | null | undefined) => !!val && val.trim() !== '';
    return check(data.state_name) && check(data.state_code) && check(data.sch_num) && check(data.sch_name) && check(data.cust_name) && check(data.cust_code) && check(data.cust_town) && check(data.lga) && check(data.type) && check(data.category) && check(data.accd_year);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin && isComplete(formData)) {
      const confirm = window.confirm("Are you sure all fields are correct?\n\nClicking OK means you cannot edit this school again as it will be submitted for administrative review.");
      if (!confirm) return;
    }

    setLoading(true);
    setError('');

    try {
      await dataService.updateRecord(examType, record.id, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit {examType.toUpperCase()} Record</h2>
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
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">State Name</label>
              <input type="text" name="state_name" className="form-control" value={formData.state_name} onChange={handleChange} required={!isAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">State Code</label>
              <input type="text" name="state_code" className="form-control" value={formData.state_code} onChange={handleChange} required={!isAdmin} />
            </div>
            
            <div className="form-group">
              <label className="form-label">School Name</label>
              <input type="text" name="sch_name" className="form-control" value={formData.sch_name} onChange={handleChange} required={!isAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">School Number</label>
              <input type="text" name="sch_num" className="form-control" value={formData.sch_num} onChange={handleChange} required={!isAdmin} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Custodian Name</label>
              <input 
                type="text" 
                name="cust_name" 
                list="custodian-list"
                className="form-control" 
                value={formData.cust_name} 
                onChange={handleChange} 
                required={!isAdmin} 
              />
              {custodians && (
                <datalist id="custodian-list">
                  {custodians.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </datalist>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Custodian Code</label>
              <input type="text" name="cust_code" className="form-control" value={formData.cust_code} onChange={handleChange} required={!isAdmin} />
            </div>

            <div className="form-group">
              <label className="form-label">Custodian Town</label>
              <input type="text" name="cust_town" className="form-control" value={formData.cust_town} onChange={handleChange} required={!isAdmin} />
            </div>
            <div className="form-group">
              <label className="form-label">LGA</label>
              <input type="text" name="lga" className="form-control" value={formData.lga || ''} onChange={handleChange} required={!isAdmin} />
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select name="type" className="form-control" value={formData.type || ''} onChange={handleChange} required={!isAdmin}>
                <option value="">Select Type</option>
                <option value="BOYS">BOYS</option>
                <option value="GIRLS">GIRLS</option>
                <option value="MIXED">MIXED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="form-control" value={formData.category || ''} onChange={handleChange} required={!isAdmin}>
                <option value="">Select Category</option>
                <option value="PRIVATE">PRIVATE</option>
                <option value="PUBLIC">PUBLIC</option>
                <option value="FEDERAL">FEDERAL</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                name="accd_year" 
                className="form-control" 
                value={formatDateForInput(formData.accd_year || '')} 
                onChange={handleDateChange} 
                required={!isAdmin} 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecordModal;
