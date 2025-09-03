import React, { useState } from 'react';

export default function UploadDataset({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecciona un archivo CSV');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      // Lógica de subida se maneja en App (subir vía API o pasar al parent)
      if (onUploaded) {
        const res = await onUploaded(file);
        // onUploaded puede devolver el dataset creado o id
      }
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Error subiendo archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="upload-form" onSubmit={submit}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Subiendo...' : 'Subir CSV'}
      </button>
    </form>
  );
}
