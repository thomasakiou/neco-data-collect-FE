import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Upload, Download, Filter, Search, Trash2, RefreshCw, 
  ArrowLeft, Database, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle, 
  FileSpreadsheet, LogOut, Key, Users
} from 'lucide-react';
import { authService, dataService, type DataRecord, type ExamType } from '../services/api.service';

const DataManagement: React.FC = () => {
  const [examType, setExamType] = useState<ExamType>('ssce');
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter states
  const [filterState, setFilterState] = useState('');
  const [filterCustodian, setFilterCustodian] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLga, setFilterLga] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchRecords();
  }, [examType, navigate]);

  const fetchRecords = async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const data = await dataService.listRecords(examType);
      setRecords(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Derive unique filter values from data
  const filterOptions = useMemo(() => {
    const states = [...new Set(records.map(r => r.state_name).filter(Boolean))].sort();
    const custodians = [...new Set(records.map(r => r.cust_name).filter(Boolean))].sort();
    const types = [...new Set(records.map(r => r.type).filter(Boolean) as string[])].sort();
    const statuses = [...new Set(records.map(r => r.status).filter(Boolean) as string[])].sort();
    const categories = [...new Set(records.map(r => r.category).filter(Boolean) as string[])].sort();
    const lgas = [...new Set(records.map(r => r.lga).filter(Boolean) as string[])].sort();
    return { states, custodians, types, statuses, categories, lgas };
  }, [records]);

  // Apply filters & search
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterState && r.state_name !== filterState) return false;
      if (filterCustodian && r.cust_name !== filterCustodian) return false;
      if (filterType && r.type !== filterType) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterCategory && r.category !== filterCategory) return false;
      if (filterLga && r.lga !== filterLga) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          r.sch_name.toLowerCase().includes(term) ||
          r.sch_num.toLowerCase().includes(term) ||
          r.cust_name.toLowerCase().includes(term) ||
          r.cust_code.toLowerCase().includes(term) ||
          r.state_name.toLowerCase().includes(term) ||
          (r.lga && r.lga.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [records, filterState, filterCustodian, filterType, filterStatus, filterCategory, filterLga, searchTerm]);

  const activeFilterCount = [filterState, filterCustodian, filterType, filterStatus, filterCategory, filterLga].filter(Boolean).length;

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState, filterCustodian, filterType, filterStatus, filterCategory, filterLga, searchTerm, rowsPerPage]);

  const clearFilters = () => {
    setFilterState('');
    setFilterCustodian('');
    setFilterType('');
    setFilterStatus('');
    setFilterCategory('');
    setFilterLga('');
    setSearchTerm('');
  };

  // Upload handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const result = await dataService.uploadCSV(examType, file);
      setMessage({ type: 'success', text: result.message || `${examType.toUpperCase()} CSV uploaded successfully!` });
      fetchRecords();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Download CSV of filtered data
  const handleDownload = () => {
    if (filteredRecords.length === 0) return;

    const headers = ['S/N', 'State Code', 'State Name', 'Sch Num', 'Sch Name', 'Cust Code', 'Cust Name', 'Cust Town', 'Status', 'Type', 'Category', 'Accd Year', 'LGA'];
    const csvRows = [headers.join(',')];

    filteredRecords.forEach((r, i) => {
      const row = [
        i + 1,
        `"${r.state_code}"`,
        `"${r.state_name}"`,
        `"${r.sch_num}"`,
        `"${r.sch_name}"`,
        `"${r.cust_code}"`,
        `"${r.cust_name}"`,
        `"${r.cust_town}"`,
        `"${r.status || ''}"`,
        `"${r.type || ''}"`,
        `"${r.category || ''}"`,
        `"${r.accd_year || ''}"`,
        `"${r.lga || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Build filename from active filters
    const parts = [examType.toUpperCase()];
    if (filterState) parts.push(filterState.replace(/\s+/g, '_'));
    if (filterCustodian) parts.push(filterCustodian.replace(/\s+/g, '_'));
    if (filterType) parts.push(filterType);
    parts.push('data');
    
    link.href = url;
    link.download = `${parts.join('_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} record(s)? This action cannot be undone.`)) return;

    setDeleting(true);
    setMessage(null);
    try {
      await dataService.bulkDelete(examType, [...selectedIds]);
      setMessage({ type: 'success', text: `${selectedIds.size} record(s) deleted successfully.` });
      setSelectedIds(new Set());
      fetchRecords();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
    }
  };

  // Selection helpers
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRecords.map(r => r.id)));
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
          <Link to="/admin" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
          <Database size={20} color="var(--primary)" />
          <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Data Management</h1>
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
          <Link to="/admin" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Users size={16} /> User Management
          </Link>
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
        {/* Exam Type Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['ssce', 'bece'] as ExamType[]).map(t => (
            <button
              key={t}
              className={`btn ${examType === t ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}
              onClick={() => { setExamType(t); clearFilters(); }}
            >
              <FileSpreadsheet size={18} />
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{examType.toUpperCase()} Records</h2>
              <span style={{
                background: 'var(--accent)',
                color: 'var(--primary-dark)',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {filteredRecords.length.toLocaleString()} of {records.length.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Rows per page */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                <span>Rows:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                  value={rowsPerPage}
                  onChange={e => setRowsPerPage(Number(e.target.value))}
                >
                  {[10, 25, 50, 100, 250, 500].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleUpload}
              />
              <button
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>

              {/* Download */}
              <button
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={handleDownload}
                disabled={filteredRecords.length === 0}
                title="Download filtered data as CSV"
              >
                <Download size={16} />
                Download CSV
              </button>

              {/* Filter Toggle */}
              <button
                className={`btn btn-outline`}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  ...(activeFilterCount > 0 ? { borderColor: 'var(--primary)', background: 'var(--accent)' } : {})
                }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Bulk Delete */}
              {selectedIds.size > 0 && (
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#dc2626', borderColor: '#dc2626' }}
                  onClick={handleBulkDelete}
                  disabled={deleting}
                >
                  {deleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div style={{
              background: 'var(--accent)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Filter Records</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <X size={14} /> Clear All
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>State</label>
                  <select className="form-control" style={{ padding: '0.5rem' }} value={filterState} onChange={e => setFilterState(e.target.value)}>
                    <option value="">All States</option>
                    {filterOptions.states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Custodian</label>
                  <select className="form-control" style={{ padding: '0.5rem' }} value={filterCustodian} onChange={e => setFilterCustodian(e.target.value)}>
                    <option value="">All Custodians</option>
                    {filterOptions.custodians.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Type</label>
                  <select className="form-control" style={{ padding: '0.5rem' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Status</label>
                  <select className="form-control" style={{ padding: '0.5rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>Category</label>
                  <select className="form-control" style={{ padding: '0.5rem' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'block' }}>LGA</label>
                  <select className="form-control" style={{ padding: '0.5rem' }} value={filterLga} onChange={e => setFilterLga(e.target.value)}>
                    <option value="">All LGAs</option>
                    {filterOptions.lgas.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by school name, number, custodian, state..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Messages */}
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

          {/* Data Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading {examType.toUpperCase()} records...</p>
            </div>
          ) : (
            <>
              <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={paginatedRecords.length > 0 && selectedIds.size === paginatedRecords.length}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ width: '50px' }}>S/N</th>
                    <th>State</th>
                    <th>School</th>
                    <th>Custodian</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>LGA</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record, index) => (
                    <tr key={record.id} style={{ background: selectedIds.has(record.id) ? '#eff6ff' : undefined }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record.id)}
                          onChange={() => toggleSelect(record.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{record.state_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.state_code}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{record.sch_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.sch_num}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{record.cust_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.cust_code} · {record.cust_town}</div>
                      </td>
                      <td>
                        {record.type && (
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#dbeafe',
                            color: '#1e40af'
                          }}>
                            {record.type}
                          </span>
                        )}
                      </td>
                      <td>
                        {record.status && (
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: record.status.toLowerCase() === 'active' ? '#dcfce7' : '#fee2e2',
                            color: record.status.toLowerCase() === 'active' ? '#166534' : '#991b1b'
                          }}>
                            {record.status}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{record.category || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{record.lga || '—'}</td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                        <Database size={32} style={{ color: 'var(--border-color)', marginBottom: '0.5rem' }} />
                        <p style={{ color: 'var(--text-muted)' }}>
                          {records.length === 0 ? `No ${examType.toUpperCase()} records found. Upload a CSV to get started.` : 'No records match your filters.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredRecords.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '1rem 0',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '0.5rem'
              }}>
                {/* Page info & navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {((currentPage - 1) * rowsPerPage + 1).toLocaleString()}–{Math.min(currentPage * rowsPerPage, filteredRecords.length).toLocaleString()} of {filteredRecords.length.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      title="First page"
                    >
                      First
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.5rem' }}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      background: 'var(--accent)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--primary-dark)'
                    }}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.5rem' }}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Last page"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DataManagement;
