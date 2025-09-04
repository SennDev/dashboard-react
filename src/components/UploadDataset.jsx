import React, { useRef } from 'react';

export default function UploadDataset({ onUploaded }) {
  const fileInput = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileInput.current.files.length === 0) {
      alert('Selecciona un archivo CSV');
      return;
    }

    const file = fileInput.current.files[0];
    try {
      const created = await onUploaded(file);
      alert(`Dataset ${created.name} subido correctamente`);
      fileInput.current.value = '';
    } catch (err) {
      console.error(err);
      alert(`Error subiendo dataset: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <input type="file" ref={fileInput} accept=".csv" />
      <button type="submit">Subir CSV</button>
    </form>
  );
}
