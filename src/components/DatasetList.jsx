import React from 'react';

export default function DatasetList({ datasets, selectedId, onSelect }) {
  return (
    <div>
      <h4 className="side-title">Datasets</h4>
      <div className="dataset-list">
        {datasets.map((d) => (
          <button
            key={d.id}
            className={`dataset-btn ${d.id === selectedId ? 'active' : ''}`}
            onClick={() => onSelect(d.id)}
          >
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
