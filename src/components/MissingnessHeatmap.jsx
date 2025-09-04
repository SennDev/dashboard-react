// src/components/MissingnessHeatmap.jsx
import React from 'react';

/*
Props:
- data: array of rows (objects) limited e.g. first 200 rows
- columns: array of column names (same order as object keys)
This component renders a compact heatmap: white = present, dark = null/empty.
*/
export default function MissingnessHeatmap({ data = [], columns = [] }) {
  if (!data || data.length === 0 || columns.length === 0) {
    return (
      <div className="card chart-card empty-card">
        <div className="card-header">Mapa de missingness</div>
        <div className="chart-empty">No hay datos de vista previa</div>
      </div>
    );
  }

  const maxRows = data.length;
  const maxCols = columns.length;
  // limit shown cols to avoid overflow (show up to 40 cols, show scrollbar otherwise)
  const shownCols = columns.slice(0, 40);

  return (
    <div className="card heatmap-card">
      <div className="card-header">Mapa de Nulos — primeras {maxRows} filas</div>
      <div className="heatmap-wrap">
        <div className="heatmap-grid" style={{ gridTemplateColumns: `120px repeat(${shownCols.length}, 20px)` }}>
          <div className="heatmap-row-header"></div>
          {shownCols.map((c) => <div key={c} className="heatmap-col-name" title={c}>{c}</div>)}
          {data.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              <div className="heatmap-row-header">{rIdx + 1}</div>
              {shownCols.map((col) => {
                const val = row[col];
                const isNull = val === null || val === undefined || val === '' || String(val).toLowerCase() === 'nan';
                return <div key={col} className={`cell ${isNull ? 'cell-null' : 'cell-ok'}`} title={isNull ? 'NULL' : String(val).slice(0,20)} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {columns.length > shownCols.length && <div className="small muted">... mostrando {shownCols.length} de {columns.length} columnas</div>}
    </div>
  );
}
