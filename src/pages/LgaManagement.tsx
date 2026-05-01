import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, Search, Trash2, RefreshCw, 
  ArrowLeft, MapPin, ChevronLeft, ChevronRight, X, AlertTriangle, 
  LogOut, Key, Plus, Edit3, Users
} from 'lucide-react';
import { authService, lgaService, type LGARecord } from '../services/api.service';
import EditLgaModal from '../components/EditLgaModal';

const LgaManagement: React.FC = () => {
  const [lgas, setLgas] = useState<LGARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);
  const [editingLga, setEditingLga] = useState<LGARecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchLgas();
  }, [navigate]);

  const fetchLgas = async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const data = await lgaService.listLGAs(0, 10000);
      setLgas(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredLgas = useMemo(() => {
    return lgas.filter(l => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          l.lga_name.toLowerCase().includes(term) ||
          l.state_name.toLowerCase().includes(term) ||
          l.state_code.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [lgas, searchTerm]);

  const totalPages = Math.ceil(filteredLgas.length / rowsPerPage);
  const paginatedLgas = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLgas.slice(start, start + rowsPerPage);
  }, [filteredLgas, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      await lgaService.uploadLGAsCSV(file);
      setMessage({ type: 'success', text: 'LGAs uploaded successfully!' });
      fetchLgas();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} LGA(s)? This action cannot be undone.`)) return;

    setDeleting(true);
    setMessage(null);
    try {
      await lgaService.bulkDeleteLGAs([...selectedIds]);
      setMessage({ type: 'success', text: `${selectedIds.size} LGA(s) deleted successfully.` });
      setSelectedIds(new Set());
      fetchLgas();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const handleSingleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this LGA? This action cannot be undone.')) return;

    setMessage(null);
    try {
      await lgaService.deleteLGA(id);
      setMessage({ type: 'success', text: 'LGA deleted successfully.' });
      fetchLgas();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLgas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLgas.map(l => l.id)));
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          <Link to="/admin" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
          <MapPin size={20} color="var(--primary)" />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>LGA Management</h1>
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
          <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={16} /> User Management
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/change-password" title="Change My Password" style={{ color: 'var(--text-muted)' }}>
            <Key size={20} />
          </Link>
          <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Nigeria LGAs</h2>
              <span style={{ background: 'var(--accent)', color: 'var(--primary-dark)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                {filteredLgas.length.toLocaleString()} Records
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUpload} />
              <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
              
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} />
                Add LGA
              </button>

              {selectedIds.size > 0 && (
                <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={handleBulkDelete} disabled={deleting}>
                  {deleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by LGA name, state, or state code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
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
              <button onClick={() => setMessage(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading LGAs...</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input type="checkbox" checked={paginatedLgas.length > 0 && selectedIds.size === paginatedLgas.length} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                      </th>
                      <th style={{ width: '50px' }}>S/N</th>
                      <th>State Code</th>
                      <th>State Name</th>
                      <th>LGA Name</th>
                      <th style={{ width: '120px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLgas.map((lga, index) => (
                      <tr key={lga.id} style={{ background: selectedIds.has(lga.id) ? '#eff6ff' : undefined }}>
                        <td><input type="checkbox" checked={selectedIds.has(lga.id)} onChange={() => toggleSelect(lga.id)} style={{ cursor: 'pointer' }} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td><code>{lga.state_code}</code></td>
                        <td>{lga.state_name}</td>
                        <td style={{ fontWeight: 600 }}>{lga.lga_name}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => setEditingLga(lga)} title="Edit">
                              <Edit3 size={14} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem', color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleSingleDelete(lga.id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredLgas.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {((currentPage - 1) * rowsPerPage + 1).toLocaleString()}–{Math.min(currentPage * rowsPerPage, filteredLgas.length).toLocaleString()} of {filteredLgas.length.toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-outline" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
                      <button className="btn btn-outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                      <span style={{ padding: '0.35rem 0.75rem', background: 'var(--accent)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)' }}>{currentPage} / {totalPages}</span>
                      <button className="btn btn-outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
                      <button className="btn btn-outline" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {(editingLga || isAddModalOpen) && (
        <EditLgaModal 
          lga={editingLga || undefined}
          onClose={() => { setEditingLga(null); setIsAddModalOpen(false); }}
          onSuccess={() => {
            setEditingLga(null);
            setIsAddModalOpen(false);
            fetchLgas();
            setMessage({ type: 'success', text: `LGA ${editingLga ? 'updated' : 'added'} successfully!` });
          }}
        />
      )}
    </div>
  );
};

export default LgaManagement;
