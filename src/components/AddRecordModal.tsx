import React, { useState, useMemo } from 'react';
import { X, Save, RefreshCw, School, User, Award, MapPin } from 'lucide-react';
import { dataService, type DataRecord, type ExamType, type LGARecord } from '../services/api.service';

export interface CustodianInfo {
  name: string;
  code: string;
  town: string;
}

interface AddRecordModalProps {
  examType: ExamType;
  allLgas: LGARecord[];
  existingRecords: DataRecord[];
  onClose: () => void;
  onSuccess: () => void;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({ examType, allLgas, existingRecords, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<DataRecord>>({
    state_code: '',
    state_name: '',
    sch_num: '',
    sch_name: '',
    cust_code: '',
    cust_name: '',
    cust_town: '',
    status: 'ACTIVE',
    type: '',
    category: '',
    accd_year: '',
    lga: '',
    lga_code: '',
    sch_email: '',
    accreditation_type: '',
    locality: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived data
  const states = useMemo(() => {
    const set = new Set<string>();
    allLgas.forEach(l => set.add(l.state_name));
    return Array.from(set).sort().map(name => {
      const lga = allLgas.find(l => l.state_name === name);
      return { name, code: lga?.state_code || '' };
    });
  }, [allLgas]);

  const filteredLgas = useMemo(() => {
    if (!formData.state_name) return [];
    return allLgas
      .filter(l => l.state_name === formData.state_name)
      .sort((a, b) => a.lga_name.localeCompare(b.lga_name));
  }, [formData.state_name, allLgas]);

  const filteredSchools = useMemo(() => {
    if (!formData.lga) return [];
    // Get unique schools from existing records in this LGA
    const schoolsMap = new Map<string, DataRecord>();
    existingRecords.forEach(r => {
      if (r.lga === formData.lga && r.state_name === formData.state_name) {
        schoolsMap.set(r.sch_name, r);
      }
    });
    return Array.from(schoolsMap.values()).sort((a, b) => a.sch_name.localeCompare(b.sch_name));
  }, [formData.lga, formData.state_name, existingRecords]);

  const custodians = useMemo(() => {
    const map = new Map<string, CustodianInfo>();
    existingRecords.forEach(r => {
      if (r.cust_name && (formData.state_name ? r.state_name === formData.state_name : true)) {
        map.set(r.cust_name, { name: r.cust_name, code: r.cust_code || '', town: r.cust_town || '' });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [existingRecords, formData.state_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'state_name') {
      const state = states.find(s => s.name === value);
      setFormData(prev => ({
        ...prev,
        state_name: value,
        state_code: state?.code || '',
        lga: '',
        lga_code: '',
        sch_name: '',
        sch_num: ''
      }));
      return;
    }

    if (name === 'lga') {
      const lga = filteredLgas.find(l => l.lga_name === value);
      setFormData(prev => ({
        ...prev,
        lga: value,
        lga_code: lga?.lga_code || '',
        sch_name: '',
        sch_num: ''
      }));
      return;
    }

    if (name === 'sch_name') {
      const school = filteredSchools.find(s => s.sch_name === value);
      if (school) {
        setFormData(prev => ({
          ...prev,
          sch_name: school.sch_name,
          sch_num: school.sch_num,
          sch_email: school.sch_email || prev.sch_email,
          type: school.type || prev.type,
          category: school.category || prev.category,
          locality: school.locality || prev.locality,
          cust_name: school.cust_name || prev.cust_name,
          cust_code: school.cust_code || prev.cust_code,
          cust_town: school.cust_town || prev.cust_town,
        }));
      } else {
        setFormData(prev => ({ ...prev, sch_name: value }));
      }
      return;
    }

    if (name === 'cust_name') {
      const cust = custodians.find(c => c.name === value);
      if (cust) {
        setFormData(prev => ({
          ...prev,
          cust_name: cust.name,
          cust_code: cust.code,
          cust_town: cust.town
        }));
      } else {
        setFormData(prev => ({ ...prev, cust_name: value }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
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

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await dataService.createRecord(examType, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Add New {examType.toUpperCase()} School Record</h2>
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
          <div className="form-section">
            <h3 className="form-section-title">
              <MapPin size={16} /> Location Hierarchy
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">State</label>
                <select name="state_name" className="form-control" value={formData.state_name ?? ''} onChange={handleChange} required>
                  <option value="">Select State</option>
                  {states.map(s => <option key={s.name} value={s.name}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">LGA</label>
                <select 
                  name="lga" 
                  className="form-control" 
                  value={formData.lga ?? ''} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.state_name}
                >
                  <option value="">Select LGA</option>
                  {filteredLgas.map(l => <option key={l.id} value={l.lga_name}>{l.lga_name} ({l.lga_code})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <School size={16} /> School Details
            </h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">School Name</label>
                <input 
                  type="text" 
                  name="sch_name" 
                  className="form-control" 
                  list="existing-schools"
                  value={formData.sch_name} 
                  onChange={handleChange} 
                  required 
                  disabled={!formData.lga}
                  placeholder="Type name or select existing..."
                />
                <datalist id="existing-schools">
                  {filteredSchools.map(s => <option key={s.id} value={s.sch_name} label={s.sch_num} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">School Number (Code)</label>
                <input type="text" name="sch_num" className="form-control" value={formData.sch_num} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="sch_email" className="form-control" value={formData.sch_email ?? ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" className="form-control" value={formData.type ?? ''} onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="BOYS">BOYS</option>
                  <option value="GIRLS">GIRLS</option>
                  <option value="MIXED">MIXED</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-control" value={formData.category ?? ''} onChange={handleChange}>
                  <option value="">Select Category</option>
                  <option value="PRIVATE">PRIVATE</option>
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="FEDERAL">FEDERAL</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Locality</label>
                <select name="locality" className="form-control" value={formData.locality ?? ''} onChange={handleChange}>
                  <option value="">Select Locality</option>
                  <option value="URBAN">URBAN</option>
                  <option value="RURAL">RURAL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} /> Custodian Assignment
            </h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Custodian Name</label>
                <input 
                  type="text" 
                  name="cust_name" 
                  list="custodian-list" 
                  className="form-control" 
                  value={formData.cust_name} 
                  onChange={handleChange}
                  placeholder="Search existing custodians..."
                />
                <datalist id="custodian-list">
                  {custodians.map(c => <option key={c.name} value={c.name} label={c.code} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Custodian Code</label>
                <input type="text" name="cust_code" className="form-control" value={formData.cust_code} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Custodian Town</label>
                <input type="text" name="cust_town" className="form-control" value={formData.cust_town} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <Award size={16} /> Accreditation
            </h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date of Last Accreditation</label>
                <input 
                  type="date" 
                  name="accd_year" 
                  className="form-control" 
                  value={formatDateForInput(formData.accd_year || '')} 
                  onChange={handleDateChange} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Accreditation Type</label>
                <select name="accreditation_type" className="form-control" value={formData.accreditation_type ?? ''} onChange={handleChange}>
                  <option value="">Select Type</option>
                  <option value="FULL">FULL</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
