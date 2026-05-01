import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, MapPin, School as SchoolIcon, Edit3, Filter, Key, FileSpreadsheet, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { authService, dataService, type DataRecord, type ExamType } from '../services/api.service';
import EditRecordModal from '../components/EditRecordModal';

const Dashboard: React.FC = () => {
  const [examType, setExamType] = useState<ExamType>('ssce');
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustodian, setSelectedCustodian] = useState<string>('');
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (authService.getEmail().toLowerCase() === 'thomas.akiou@gmail.com') {
      navigate('/admin');
    }
  }, [navigate]);

  const stateName = authService.getStateName().toUpperCase();
  const stateOffice = `${stateName} STATE OFFICE`;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await dataService.listRecords(examType);
      // Filter by the state user
      const stateRecords = data.filter(r => r.state_name?.toUpperCase() === stateName);
      setRecords(stateRecords);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [examType, stateName]);

  const isComplete = (r: DataRecord) => {
    const check = (val: string | null | undefined) => !!val && val.trim() !== '';
    return check(r.state_name) && check(r.state_code) && check(r.sch_num) && check(r.sch_name) && check(r.cust_name) && check(r.cust_code) && check(r.cust_town) && check(r.lga) && check(r.type) && check(r.category) && check(r.accd_year);
  };

  const activeRecords = useMemo(() => {
    return records.filter(r => !isComplete(r));
  }, [records]);

  const custodians = useMemo(() => {
    const map = new Map<string, {name: string, code: string, town: string}>();
    activeRecords.forEach(r => {
      if (r.cust_name && r.cust_name.trim() !== '' && !map.has(r.cust_name)) {
        map.set(r.cust_name, { name: r.cust_name, code: r.cust_code || '', town: r.cust_town || '' });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [activeRecords]);

  const filteredSchools = activeRecords.filter(r => {
    if (!selectedCustodian) {
      return !r.cust_name || r.cust_name.trim() === '';
    }
    return r.cust_name === selectedCustodian;
  });

  const totalPages = Math.ceil(filteredSchools.length / rowsPerPage);
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSchools.slice(start, start + rowsPerPage);
  }, [filteredSchools, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCustodian, examType, rowsPerPage]);

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
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/neco.png" alt="NECO Logo" style={{ height: '28px', width: 'auto' }} />
          <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
          <h1 style={{ fontSize: '1.25rem', margin: 0, whiteSpace: 'nowrap' }}>{stateOffice}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/change-password" title="Change Password" style={{ color: 'var(--text-muted)' }}>
            <Key size={18} />
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

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '2rem 0' }}>

        {/* Exam Type Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['ssce', 'bece'] as ExamType[]).map(t => (
            <button
              key={t}
              className={`btn ${examType === t ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}
              onClick={() => { setExamType(t); setSelectedCustodian(''); }}
            >
              <FileSpreadsheet size={18} />
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <MapPin className="text-primary" size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Data Collection Dashboard</h2>
            {records.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'var(--primary-dark)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                {records.length} Total Records
              </span>
            )}
          </div>

          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label className="form-label">Select Custodian Area</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                value={selectedCustodian}
                onChange={(e) => setSelectedCustodian(e.target.value)}
                style={{ appearance: 'none', paddingRight: '2.5rem' }}
                disabled={loading}
              >
                <option value="">-- Schools without Custodian Points --</option>
                {custodians.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <Filter
                size={18}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SchoolIcon size={20} color={selectedCustodian ? "var(--primary)" : "#ef4444"} />
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: selectedCustodian ? "inherit" : "#ef4444" }}>
                  {selectedCustodian ? `Schools in ${selectedCustodian}` : "Schools without Custodian Points"}
                </h3>
              </div>

              {filteredSchools.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
                  <span style={{
                    background: 'var(--accent)',
                    color: 'var(--primary-dark)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {filteredSchools.length.toLocaleString()} Records
                  </span>
                </div>
              )}
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>School Number</th>
                    <th>School Name</th>
                    <th>Town</th>
                    <th>LGA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSchools.map((record, index) => (
                    <tr key={record.id}>
                      <td style={{ fontWeight: 600 }}>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td>{record.sch_num}</td>
                      <td>
                        <button
                          onClick={() => setEditingRecord(record)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'left'
                          }}
                        >
                          {record.sch_name}
                        </button>
                      </td>
                      <td>{record.cust_town}</td>
                      <td>{record.lga || '—'}</td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => setEditingRecord(record)}
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSchools.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No schools found in this area.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredSchools.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '1rem 0',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {((currentPage - 1) * rowsPerPage + 1).toLocaleString()}–{Math.min(currentPage * rowsPerPage, filteredSchools.length).toLocaleString()} of {filteredSchools.length.toLocaleString()}
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
          </div>
        )}
      </main>

      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          examType={examType}
          custodians={custodians}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null);
            fetchRecords();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
