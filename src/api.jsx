// src/api.jsx
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export async function listDatasets() { const res = await fetch(`${API_BASE}/datasets/`); return await res.json(); }

async function safeJson(res) {
  if (!res.ok) {
    try { return await res.json(); } catch { throw new Error(res.statusText); }
  }
  return await res.json();
}

export async function listDatasets() {
  const res = await fetch(`${API_BASE}/datasets/`);
  return await safeJson(res);
}

export async function getMetrics(id) {
  const res = await fetch(`${API_BASE}/datasets/${id}/metrics/`);
  return await safeJson(res);
}

// getDistribution now supports sample=true (backend can implement sampling) and bins
export async function getDistribution(id, column, bins = 12, sample = 500) {
  // sample = number of rows to sample (client requests); backend may ignore
  const params = new URLSearchParams({ bins: String(bins) });
  if (sample) params.set('sample', String(sample));
  const res = await fetch(`${API_BASE}/datasets/${id}/column/${encodeURIComponent(column)}/distribution/?${params.toString()}`);
  return await safeJson(res);
}

export async function uploadDataset(file) {
  const formData = new FormData();
  // backend dataset serializer expects 'file' OR 'csv_file' depending on your implementation
  // We include both keys to be robust:
  formData.append('csv_file', file);
  formData.append('file', file);
  formData.append('name', file.name);

  const res = await fetch(`${API_BASE}/datasets/`, {
    method: 'POST',
    body: formData
  });

  return await safeJson(res);
}

// Preview endpoint (returns first N rows as array of objects) - backend may not have it; frontend will fallback.
export async function getPreview(id, rows = 200) {
  try {
    const res = await fetch(`${API_BASE}/datasets/${id}/preview/?rows=${rows}`);
    return await safeJson(res);
  } catch (err) {
    // Let caller handle fallback
    throw err;
  }
}

// Optional: request correlation matrix if backend supports it
export async function getCorrelation(id) {
  try {
    const res = await fetch(`${API_BASE}/datasets/${id}/correlation/`);
    return await safeJson(res);
  } catch (err) {
    throw err;
  }
}
