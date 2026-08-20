import { useState, useEffect } from 'react';
import { getStaffByEmail, updateStaff, getFilters, isEmailTaken, isPhoneTaken } from '../api/staffApi';
import { ROLES, SHIFTS, STATUSES } from '../constants';
import '../styles.css';

export default function UpdatePage() {
  const [emailInput,    setEmailInput]    = useState('');
  const [fetchLoading,  setFetchLoading]  = useState(false);
  const [fetchError,    setFetchError]    = useState('');
  const [staffData,     setStaffData]     = useState(null);
  const [form,          setForm]          = useState({});
  const [phoneErr,      setPhoneErr]      = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError,   setUpdateError]   = useState('');
  const [updated,       setUpdated]       = useState(null);
  const [opts,          setOpts]          = useState({ roles: ROLES, shifts: SHIFTS, statuses: STATUSES });

  useEffect(() => {
    getFilters().then(data => setOpts(data)).catch(() => {});
  }, []);

  async function handleFetch(e) {
    e.preventDefault();
    setFetchError('');
    setStaffData(null);
    setUpdated(null);
    setPhoneErr('');
    setFetchLoading(true);
    try {
      const data = await getStaffByEmail(emailInput.trim());
      setStaffData(data);
      setForm({
        fullName:    data.fullName,
        email:       data.email,
        phone:       data.phone,
        role:        data.role,
        shift:       data.shift,
        status:      data.status,
        joiningDate: data.joiningDate,
      });
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetchLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setPhoneErr(/^\d{10}$/.test(value) ? '' : 'Phone must be exactly 10 digits.');
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      setPhoneErr('Phone must be exactly 10 digits.');
      return;
    }
    setUpdateError('');
    setUpdateLoading(true);
    try {
      const [emailTaken, phoneTaken] = await Promise.all([
        isEmailTaken(form.email, staffData.id),
        isPhoneTaken(form.phone, staffData.id),
      ]);
      if (emailTaken) { setUpdateError('This email is already used by another staff member.'); setUpdateLoading(false); return; }
      if (phoneTaken) { setUpdateError('This phone number is already used by another staff member.'); setUpdateLoading(false); return; }
      const data = await updateStaff(staffData.id, form);
      setUpdated(data);
      setStaffData(null);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Update Staff Member</h1>

      <div className="form-card" style={{ marginBottom: 24 }}>
        <h2>Find staff by email</h2>
        <p style={{ color: '#666', fontSize: '0.82rem', marginBottom: 12 }}>
          Email is case-sensitive.
        </p>
        <form onSubmit={handleFetch} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Email Address</label>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="e.g. rahul@hotel.com"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={fetchLoading}>
            {fetchLoading ? 'Fetching...' : 'Fetch'}
          </button>
        </form>
        {fetchError && <div className="alert alert-error" style={{ marginTop: 12 }}>{fetchError}</div>}
      </div>

      {staffData && (
        <div className="form-card">
          <h2>Edit details</h2>
          <p style={{ color: '#666', fontSize: '0.82rem', marginBottom: 14 }}>
            {staffData.employeeCode} &middot; {staffData.department}
          </p>

          {updateError && <div className="alert alert-error">{updateError}</div>}

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
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
            {updateLoading && <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: 8 }}>Checking and saving...</p>}
            <button className="btn btn-primary" type="submit" disabled={updateLoading || !!phoneErr}>
              {updateLoading ? 'Please wait...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {updated && (
        <div className="detail-card">
          <h2>Staff Updated</h2>
          {[
            ['Employee Code', updated.employeeCode],
            ['Full Name',     updated.fullName],
            ['Email',         updated.email],
            ['Phone',         updated.phone],
            ['Role',          updated.role],
            ['Department',    updated.department],
            ['Shift',         updated.shift],
            ['Status',        updated.status],
            ['Joining Date',  updated.joiningDate],
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
