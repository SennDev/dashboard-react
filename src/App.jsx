import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartCard from './components/ChartCard';
import MetricCard from './components/MetricCard';
import DatasetList from './components/DatasetList';
import UploadDataset from './components/UploadDataset';
import { listDatasets, getMetrics, getDistribution, uploadDataset } from './api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [histData, setHistData] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ds = await listDatasets();
      if (!mounted) return;
      setDatasets(ds);
      if (!selected && ds.length > 0) setSelected(ds[0].id);
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!selected) {
      setMetrics(null);
      setHistData(null);
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingMetrics(true);
      const m = await getMetrics(selected);
      if (!mounted) return;
      setMetrics(m);

      // encontrar primera columna numérica
      const firstNum = Object.entries(m.types || {}).find(([k, t]) =>
        t && (t.includes('int') || t.includes('float') || t.includes('number'))
      );
      const col = firstNum ? firstNum[0] : Object.keys(m.types || {})[0];
      if (col) {
        const dist = await getDistribution(selected, col, 12);
        if (!mounted) return;
        const labels = dist.bins.map((b) => b.bin);
        const data = dist.bins.map((b) => b.count);
        setHistData({ labels, datasets: [{ label: `${col}`, data }] });
      } else {
        setHistData(null);
      }
      setLoadingMetrics(false);
    })();
    return () => (mounted = false);
  }, [selected]);

  const handleUpload = async (fileOrFileObj) => {
    // subir a backend y refrescar lista
    // uploadDataset espera un File; si onUploaded desde UploadDataset manda el file
    try {
      const created = await uploadDataset(fileOrFileObj);
      const ds = await listDatasets();
      setDatasets(ds);
      if (created?.id) setSelected(created.id);
      return created;
    } catch (err) {
      console.error(err);
      alert('Error al subir dataset');
    }
  };

  return (
    <div className="app-root">
      <header className="topbar">
        <h1 className="title">Data Quality Dashboard</h1>
        <div className="top-actions">
          <UploadDataset onUploaded={handleUpload} />
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <DatasetList datasets={datasets} selectedId={selected} onSelect={setSelected} />
        </aside>

        <section className="content">
          {loadingMetrics && <div className="loading">Cargando métricas...</div>}

          {!metrics && !loadingMetrics && <div className="empty">Selecciona un dataset para ver métricas</div>}

          {metrics && (
            <>
              <div className="metrics-row">
                <MetricCard title="Filas" value={metrics.rows} />
                <MetricCard title="Columnas" value={metrics.columns} />
                <MetricCard title="Duplicados" value={metrics.duplicates_count} />
                <MetricCard
                  title="% Nulls (ej)"
                  value={`${Math.round(((Object.values(metrics.nulls_per_column || {})[0] || 0) * 100) / Math.max(1, metrics.rows))}%`}
                  sub={Object.keys(metrics.nulls_per_column || {})[0]}
                />
              </div>

              <div className="panels-grid">
                <div className="panel-main">
                  {histData ? (
                    <ChartCard title={`Histogram - ${histData.datasets[0].label}`} chartData={histData} />
                  ) : (
                    <div className="empty">No hay datos numéricos para graficar</div>
                  )}
                </div>

                <aside className="panel-side card">
                  <div className="card-header">Column types</div>
                  <pre className="types-pre">{JSON.stringify(metrics.types, null, 2)}</pre>
                </aside>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
