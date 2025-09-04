import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/datasets/';

export const getDatasets = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getDatasetMetrics = async (id) => {
  const res = await axios.get(`${API_URL}${id}/metrics/`);
  return res.data;
};

export const getColumnDistribution = async (id, column, bins = 10) => {
  const res = await axios.get(`${API_URL}${id}/column/${column}/distribution/?bins=${bins}`);
  return res.data;
};

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data;
};