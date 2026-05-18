import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  placeholder: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  showSearch?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder,
  options,
  selectedValues,
  onChange,
  showSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Select all options matching the current search
    const newValues = new Set([...selectedValues]);
    filteredOptions.forEach(opt => newValues.add(opt.value));
    onChange(Array.from(newValues));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove all options matching the current search
    const filteredValues = filteredOptions.map(opt => opt.value);
    onChange(selectedValues.filter(v => !filteredValues.includes(v)));
  };

  // Label to show on the button
  const getButtonText = () => {
    if (selectedValues.length === 0) {
      return `All ${placeholder}s`;
    }
    
    // Find labels of selected values
    const selectedLabels = selectedValues
      .map(v => options.find(opt => opt.value === v)?.label)
      .filter(Boolean) as string[];

    if (selectedLabels.length === 0) {
      return `All ${placeholder}s`;
    }

    if (selectedLabels.length <= 2) {
      return selectedLabels.join(', ');
    }

    return `${selectedLabels.length} ${placeholder}s Selected`;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Filter by ${label}`}
        title={`Filter by ${label}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          background: 'white',
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '0.85rem',
          color: selectedValues.length > 0 ? 'var(--text-main)' : 'var(--text-muted)',
          boxShadow: isOpen ? '0 0 0 3px rgba(0, 135, 81, 0.1)' : 'var(--shadow-sm)',
          transition: 'var(--transition)',
          outline: 'none',
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginRight: '0.5rem',
          fontWeight: selectedValues.length > 0 ? 600 : 400
        }}>
          {getButtonText()}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            flexShrink: 0
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.25rem',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          maxHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out forwards',
        }}>
          {/* Search Input */}
          {showSearch && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem',
              borderBottom: '1px solid var(--border-color)',
              gap: '0.5rem',
            }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder={`Search ${placeholder}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  padding: '0.2rem 0',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: 'var(--text-muted)'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Action Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.35rem 0.5rem',
            background: 'var(--accent)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.75rem',
          }}>
            <button
              type="button"
              onClick={handleSelectAll}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-dark)',
                fontWeight: 600,
                padding: 0,
              }}
            >
              Select All {searchTerm && '(Filtered)'}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#dc2626',
                fontWeight: 600,
                padding: 0,
              }}
            >
              Clear All {searchTerm && '(Filtered)'}
            </button>
          </div>

          {/* Options List */}
          <div style={{
            overflowY: 'auto',
            flex: 1,
            padding: '0.25rem',
          }}>
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
              }}>
                No options found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleToggleOption(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {/* Custom Styled Checkbox */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: isSelected ? '1.5px solid var(--primary)' : '1.5px solid #cbd5e1',
                      background: isSelected ? 'var(--primary)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}>
                      {isSelected && <Check size={11} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {opt.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
