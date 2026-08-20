import { useEffect, useState, useCallback } from 'react';
import { getStaff, getFilters, deleteStaff } from '../api/staffApi';
import StaffDetailModal from '../components/StaffDetailModal';
import { ROLES, DEPARTMENTS, SHIFTS, STATUSES } from '../constants';
import '../styles.css';

const LIMIT = 10;

function statusBadge(status) {
  if (status === 'Active')   return 'badge badge-active';
  if (status === 'Inactive') return 'badge badge-inactive';
  return 'badge badge-leave';
}

export default function HomePage() {
  const [q,       setQ]       = useState('');
  const [role,    setRole]    = useState('');
  const [dept,    setDept]    = useState('');
  const [shift,   setShift]   = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [staff,   setStaff]   = useState([]);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [msg,     setMsg]     = useState('');
  const [opts,    setOpts]    = useState({ roles: ROLES, departments: DEPARTMENTS, shifts: SHIFTS, statuses: STATUSES });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getFilters().then(data => setOpts(data)).catch(() => {});
  }, []);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getStaff({ q, role, department: dept, shift, status, page, limit: LIMIT });
      setStaff(result.data);
      setMeta(result.meta);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, role, dept, shift, status, page]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  function applyFilter(setter) {
    return (e) => { setter(e.target.value); setPage(1); };
  }

  function clearFilters() {
    setQ(''); setRole(''); setDept(''); setShift(''); setStatus(''); setPage(1);
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await deleteStaff(id);
      setMsg(`${name} deleted.`);
      setTimeout(() => setMsg(''), 3000);
      fetchStaff();
    } catch (e) {
      setError(e.message);
    }
  }

  const hasFilters = q || role || dept || shift || status;

  return (
    <div className="page">
      <h1>Staff Directory</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {msg   && <div className="alert alert-success">{msg}</div>}

      <div className="filter-bar">
        <input
          placeholder="Search name, email, phone, code, role..."
          value={q}
          onChange={applyFilter(setQ)}
        />
        <select value={role} onChange={applyFilter(setRole)}>
          <option value="">All Roles</option>
          {opts.roles.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={dept} onChange={applyFilter(setDept)}>
          <option value="">All Departments</option>
          {opts.departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={shift} onChange={applyFilter(setShift)}>
          <option value="">All Shifts</option>
          {opts.shifts.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={status} onChange={applyFilter(setStatus)}>
          <option value="">All Statuses</option>
          {opts.statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {!loading && !error && (
        <p style={{ marginBottom: 10, color: '#666', fontSize: '0.88rem' }}>
          {meta.total} staff member{meta.total !== 1 ? 's' : ''} found
          {meta.totalPages > 1 ? ` · Page ${page} of ${meta.totalPages}` : ''}
        </p>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Loading...</p>
      ) : error ? null : (
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 24 }}>
                  No staff found.
                </td>
              </tr>
            ) : staff.map(s => (
              <tr key={s.id}>
                <td>{s.employeeCode}</td>
                <td>{s.fullName}</td>
                <td>{s.role}</td>
                <td>{s.department}</td>
                <td>{s.shift}</td>
                <td><span className={statusBadge(s.status)}>{s.status}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelected(s)}>View</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.fullName)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && meta.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
            Prev
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages}>
            Next
          </button>
        </div>
      )}

      <StaffDetailModal staff={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
