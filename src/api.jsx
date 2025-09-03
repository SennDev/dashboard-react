import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // ajustar a tu backend
  timeout: 12000,
});

export async function listDatasets() {
  try {
    const res = await api.get('/datasets/');
    return res.data;
  } catch (e) {
    console.warn('listDatasets: usando mock', e?.message);
    return [
      { id: 1, name: 'clientes.csv' },
      { id: 2, name: 'ventas_q1.csv' },
    ];
  }
}

export async function uploadDataset(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post('/datasets/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getMetrics(datasetId) {
  try {
    const res = await api.get(`/datasets/${datasetId}/metrics`);
    return res.data;
  } catch (e) {
    console.warn('getMetrics: usando mock', e?.message);
    return {
      dataset_id: datasetId,
      name: 'mock.csv',
      rows: 1200,
      columns: 6,
      nulls_per_column: { edad: 12, ingresos: 30, nombre: 0 },
      duplicates_count: 8,
      types: { edad: 'integer', ingresos: 'float', nombre: 'string' },
    };
  }
}

export async function getDistribution(datasetId, column, bins = 10) {
  try {
    const res = await api.get(
      `/datasets/${datasetId}/column/${encodeURIComponent(column)}/distribution?bins=${bins}`
    );
    return res.data;
  } catch (e) {
    console.warn('getDistribution: usando mock', e?.message);
    return {
      column,
      type: 'histogram',
      bins: Array.from({ length: bins }, (_, i) => ({
        bin: `${i * 10}-${i * 10 + 9}`,
        count: Math.floor(Math.random() * 200),
      })),
      quantiles: { min: 0, q1: 10, median: 30, q3: 70, max: 100 },
    };
  }
}
