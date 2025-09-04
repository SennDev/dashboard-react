// src/components/ColumnSelector.jsx
import React from 'react';

export default function ColumnSelector({ columns = [], value, onChange }) {
  return (
    <div className="card column-selector">
      <div className="card-header">Seleccionar columna</div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="column-select"
      >
        <option value="" disabled>-- Elegir columna --</option>
        {columns.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
