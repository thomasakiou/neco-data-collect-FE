import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, MapPin, School as SchoolIcon, Edit3, Filter, Key } from 'lucide-react';
import { CUSTODIANS, SCHOOLS, type School } from '../data/mockData';
import EditSchoolModal from '../components/EditSchoolModal.tsx';
import { authService } from '../services/api.service';

const Dashboard: React.FC = () => {
  const [selectedCustodian, setSelectedCustodian] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
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

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredSchools = selectedCustodian
    ? SCHOOLS.filter(s => s.custodianId === selectedCustodian)
    : [];

  const handleEdit = (school: School) => {
    setCurrentSchool(school);
    setIsModalOpen(true);
  };

  const handleSave = (updatedSchool: School) => {
    // In a real app, this would be an API call
    console.log('Saving school:', updatedSchool);
    setIsModalOpen(false);
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
        <div className="card animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <MapPin className="text-primary" size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Data Collection Dashboard</h2>
          </div>

          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label className="form-label">Select Custodian Area</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                value={selectedCustodian}
                onChange={(e) => setSelectedCustodian(e.target.value)}
                style={{ appearance: 'none', paddingRight: '2.5rem' }}
              >
                <option value="">-- Choose a Custodian Area --</option>
                {CUSTODIANS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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

        {selectedCustodian ? (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <SchoolIcon size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>Schools in {CUSTODIANS.find(c => c.id === selectedCustodian)?.name}</h3>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>School Name</th>
                    <th>LGA</th>
                    <th>Town</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school, index) => (
                    <tr key={school.id}>
                      <td style={{ fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(school)}
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
                          {school.name}
                        </button>
                      </td>
                      <td>{school.lga}</td>
                      <td>{school.town}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '100px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: '#e0f2fe',
                          color: '#0369a1'
                        }}>
                          Pending
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          onClick={() => handleEdit(school)}
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
          </div>
        ) : (
          <div className="card" style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'var(--accent)',
            borderStyle: 'dashed',
            borderWidth: '2px'
          }}>
            <SchoolIcon size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Please select a custodian area to view schools</p>
          </div>
        )}
      </main>

      {isModalOpen && currentSchool && (
        <EditSchoolModal
          school={currentSchool}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
