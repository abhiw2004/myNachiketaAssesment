import { useState, useEffect } from 'react';
import { createStaff, getFilters, isEmailTaken, isPhoneTaken } from '../api/staffApi';
import { ROLES, SHIFTS, STATUSES } from '../constants';
import '../styles.css';

const blank = { fullName: '', email: '', phone: '', role: '', shift: '', status: '', joiningDate: '' };

export default function CreatePage() {
  const [form,     setForm]     = useState(blank);
  const [opts,     setOpts]     = useState({ roles: ROLES, shifts: SHIFTS, statuses: STATUSES });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [created,  setCreated]  = useState(null);

  useEffect(() => {
    getFilters().then(data => setOpts(data)).catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setPhoneErr(/^\d{10}$/.test(value) ? '' : 'Phone must be exactly 10 digits.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      setPhoneErr('Phone must be exactly 10 digits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const [emailTaken, phoneTaken] = await Promise.all([
        isEmailTaken(form.email),
        isPhoneTaken(form.phone),
      ]);
      if (emailTaken) { setError('This email is already registered.'); setLoading(false); return; }
      if (phoneTaken) { setError('This phone number is already registered.'); setLoading(false); return; }
      const data = await createStaff(form);
      setCreated(data);
      setForm(blank);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Add New Staff Member</h1>

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="e.g. Rahul Sharma" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="e.g. rahul@hotel.com" required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10 digits" required maxLength={10} />
            {phoneErr && <span style={{ color: '#c0392b', fontSize: '0.8rem' }}>{phoneErr}</span>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select role</option>
              {opts.roles.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Shift</label>
            <select name="shift" value={form.shift} onChange={handleChange} required>
              <option value="">Select shift</option>
              {opts.shifts.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange} required>
              <option value="">Select status</option>
              {opts.statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Joining Date</label>
            <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} required />
          </div>
          {loading && <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: 8 }}>Checking and submitting...</p>}
          <button className="btn btn-primary" type="submit" disabled={loading || !!phoneErr}>
            {loading ? 'Please wait...' : 'Create Staff'}
          </button>
        </form>
      </div>

      {created && (
        <div className="detail-card">
          <h2>Staff Created</h2>
          {[
            ['Employee Code', created.employeeCode],
            ['Full Name',     created.fullName],
            ['Email',         created.email],
            ['Phone',         created.phone],
            ['Role',          created.role],
            ['Department',    created.department],
            ['Shift',         created.shift],
            ['Status',        created.status],
            ['Joining Date',  created.joiningDate],
          ].map(([label, value]) => (
            <div className="detail-row" key={label}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
