// src/api.jsx
const API_BASE = 'http://127.0.0.1:8000/api';

export async function listDatasets() {
  const res = await fetch(`${API_BASE}/datasets/`);
  return await res.json();
}

export async function getMetrics(id) {
  const res = await fetch(`${API_BASE}/datasets/${id}/metrics/`);
  return await res.json();
}

export async function getDistribution(id, column, bins = 12) {
  const res = await fetch(`${API_BASE}/datasets/${id}/column/${column}/distribution/?bins=${bins}`);
  return await res.json();
}

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append('csv_file', file);
  formData.append('name', file.name);

  const res = await fetch(`${API_BASE}/datasets/`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(JSON.stringify(errData));
  }

  return await res.json();
}
