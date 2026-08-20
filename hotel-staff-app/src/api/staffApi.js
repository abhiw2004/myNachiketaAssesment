const BASE_URL = 'https://testaug.onrender.com/api';

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error('Unable to reach the server. Check your connection and try again.');
  }
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `HTTP error ${res.status}`);
  }
  return data;
}

export async function getFilters() {
  const res = await safeFetch(`${BASE_URL}/filters`);
  const json = await handleResponse(res);
  return json.data;
}

export async function getStaff({ q = '', role = '', department = '', shift = '', status = '', page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams();
  if (q)          params.set('q', q);
  if (role)       params.set('role', role);
  if (department) params.set('department', department);
  if (shift)      params.set('shift', shift);
  if (status)     params.set('status', status);
  params.set('page', page);
  params.set('limit', limit);

  const res = await safeFetch(`${BASE_URL}/staff?${params.toString()}`);
  const json = await handleResponse(res);
  return { data: json.data, meta: json.meta };
}

export async function getStaffById(id) {
  const res = await safeFetch(`${BASE_URL}/staff/${id}`);
  const json = await handleResponse(res);
  return json.data;
}

export async function getStaffByEmail(email) {
  const { data } = await getStaff({ q: email, limit: 50 });
  const found = data.find(s => s.email === email);
  if (!found) throw new Error('No staff member found with that email.');
  return found;
}

export async function isEmailTaken(email, excludeId = null) {
  const { data } = await getStaff({ q: email, limit: 50 });
  return data.some(s => s.email === email && s.id !== excludeId);
}

export async function isPhoneTaken(phone, excludeId = null) {
  const { data } = await getStaff({ q: phone, limit: 50 });
  return data.some(s => s.phone === phone && s.id !== excludeId);
}

export async function createStaff(payload) {
  const res = await safeFetch(`${BASE_URL}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data;
}

export async function updateStaff(id, payload) {
  const res = await safeFetch(`${BASE_URL}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse(res);
  return json.data;
}

export async function deleteStaff(id) {
  const res = await safeFetch(`${BASE_URL}/staff/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}
