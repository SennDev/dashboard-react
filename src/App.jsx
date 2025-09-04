import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import ChartCard from './components/ChartCard';
import MetricCard from './components/MetricCard';
import DatasetList from './components/DatasetList';
import UploadDataset from './components/UploadDataset';
import ColumnSelector from './components/ColumnSelector';
import MissingnessHeatmap from './components/MissingnessHeatmap';
import './index.css';
import { listDatasets, getMetrics, getDistribution, uploadDataset, getPreview, getCorrelation } from './api.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function App() {
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [histData, setHistData] = useState(null);
  const [nullsChart, setNullsChart] = useState(null);
  const [typesChart, setTypesChart] = useState(null);
  const [topValuesChart, setTopValuesChart] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [dark, setDark] = useState(true);
  const [correlationHeatmap, setCorrelationHeatmap] = useState(null);

  // load datasets
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ds = await listDatasets();
        if (!mounted) return;
        setDatasets(ds);
        if (!selected && ds.length > 0) setSelected(ds[0].id);
      } catch (err) { console.error(err); }
    })();
    return () => (mounted = false);
  }, []);

  // load metrics and charts when selected dataset changes
  useEffect(() => {
    if (!selected) {
      setMetrics(null);
      setHistData(null);
      setNullsChart(null);
      setTypesChart(null);
      setTopValuesChart(null);
      setPreviewRows([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoadingMetrics(true);
        const m = await getMetrics(selected);
        if (!mounted) return;
        setMetrics(m);

        // set available columns (and default selectedColumn)
        const cols = Object.keys(m.types || {});
        setSelectedColumn((prev) => prev && cols.includes(prev) ? prev : (cols[0] || null));

        // request preview rows (first N) - backend may not have preview endpoint, so catch
        try {
          const preview = await getPreview(selected, 200);
          if (mounted) setPreviewRows(preview);
        } catch (err) {
          // fallback: no preview endpoint — keep previewRows empty (heatmap will fallback)
          console.warn('Preview endpoint not available, heatmap will use mock if needed', err);
          setPreviewRows([]);
        }

        // Nulls chart
        if (m.nulls_per_column) {
          const labels = Object.keys(m.nulls_per_column);
          const data = labels.map((c) => m.nulls_per_column[c]);
          setNullsChart({
            labels,
            datasets: [{ label: 'Nulos', data, backgroundColor: labels.map((_, i) => `rgba(248,113,113,${0.9 - i * 0.01})`) }]
          });
        }

        // Types chart
        if (m.types) {
          const counts = {};
          Object.values(m.types).forEach((t) => counts[t] = (counts[t] || 0) + 1);
          const labels = Object.keys(counts);
          const data = Object.values(counts);
          const palette = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
          setTypesChart({ labels, datasets: [{ data, backgroundColor: labels.map((_, i) => palette[i % palette.length]) }] });
        }

        // Top values chart for first categorical
        const firstCat = Object.entries(m.types || {}).find(([k, t]) => t && !(t.includes('int') || t.includes('float') || t.includes('number')));
        if (firstCat) {
          const colCat = firstCat[0];
          try {
            const distCat = await getDistribution(selected, colCat, 10, 500);
            if (!mounted) return;
            setTopValuesChart({ labels: distCat.bins.map(b => b.bin), datasets: [{ label: colCat, data: distCat.bins.map(b => b.count), backgroundColor: '#a78bfa' }] });
          } catch (err) {
            console.warn('Top values distribution failed', err);
            setTopValuesChart(null);
          }
        } else {
          setTopValuesChart(null);
        }

        // Try to fetch correlation matrix if backend supports it
        try {
          const corr = await getCorrelation(selected);
          if (mounted && corr && corr.matrix) setCorrelationHeatmap(corr);
        } catch (err) {
          // ignore, backend may not provide correlation
          setCorrelationHeatmap(null);
        }
      } catch (err) {
        console.error(err);
      } finally { if (mounted) setLoadingMetrics(false); }
    })();
    return () => (mounted = false);
  }, [selected]);

  // load histogram when selectedColumn changes
  useEffect(() => {
    if (!selected || !selectedColumn) return;
    let mounted = true;
    (async () => {
      try {
        // ask backend to sample up to 1000 rows to compute histogram quickly
        const dist = await getDistribution(selected, selectedColumn, 20, 1000);
        if (!mounted) return;
        const labels = dist.bins.map((b) => b.bin);
        const data = dist.bins.map((b) => b.count);
        setHistData({ labels, datasets: [{ label: selectedColumn, data, backgroundColor: '#0ea5e9' }] });
      } catch (err) {
        console.error('Histogram failed', err);
        setHistData(null);
      }
    })();
    return () => (mounted = false);
  }, [selectedColumn, selected]);

  const handleUpload = async (file) => {
    try {
      const created = await uploadDataset(file);
      const ds = await listDatasets();
      setDatasets(ds);
      if (created?.id) setSelected(created.id);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error subiendo dataset');
    }
  };

  const columns = metrics ? Object.keys(metrics.types || {}) : [];

  return (
    <div className={dark ? 'app-root dark' : 'app-root'}>
      <header className="topbar">
        <div style={{display:'flex',gap:12, alignItems:'center'}}>
          <h1 className="title">Data Quality Dashboard</h1>
          <button className="btn small" onClick={() => setDark(d => !d)}>{dark ? 'Tema claro' : 'Tema oscuro'}</button>
        </div>
        <UploadDataset onUploaded={handleUpload} />
      </header>

      <main className="layout">
        <aside className="sidebar card">
          <DatasetList datasets={datasets} selectedId={selected} onSelect={setSelected} />
        </aside>

        <section className="content">
          {loadingMetrics && <div className="loading">Cargando métricas...</div>}

          {!metrics && !loadingMetrics && <div className="empty">Selecciona un dataset para ver métricas</div>}

          {metrics && (
            <>
              <div className="metrics-row">
                <MetricCard title={<strong>Filas</strong>} value={<strong>{metrics.rows}</strong>} />
                <MetricCard title={<strong>Columnas</strong>} value={<strong>{metrics.columns}</strong>} />
                <MetricCard title={<strong>Duplicados</strong>} value={<strong>{metrics.duplicates_count}</strong>} />
                <MetricCard title={<strong>% Nulos (ej)</strong>} value={<strong>{`${Math.round(((Object.values(metrics.nulls_per_column || {})[0] || 0) * 100) / Math.max(1, metrics.rows))}%`}</strong>} sub={Object.keys(metrics.nulls_per_column || {})[0]} />
              </div>

              <div style={{display:'flex', gap:12, marginBottom:12, alignItems:'flex-start'}}>
                <ColumnSelector columns={columns} value={selectedColumn} onChange={setSelectedColumn} />
                <div style={{flex:1}} />
                <div className="card" style={{minWidth:220}}>
                  <div className="card-header">Preview</div>
                  <div style={{fontSize:13, color:'var(--muted)'}}>
                    {metrics.name} — {metrics.rows} filas — {metrics.columns} columnas
                  </div>
                </div>
              </div>

              <div className="grid-2-1">
                <div className="left-col">
                  <ChartCard title={`Histograma — ${selectedColumn || 'N/A'}`} chartData={histData} type="bar" />
                  <ChartCard title="Top valores (categórica)" chartData={topValuesChart} type="bar" />
                  <MissingnessHeatmap data={previewRows} columns={columns} />
                </div>

                <div className="right-col">
                  <ChartCard title="Tipos de columnas" chartData={typesChart} type="pie" />
                  <ChartCard title="Nulos por columna" chartData={nullsChart} type="bar" />
                  {/* Correlation heatmap: if backend provided correlation, render small table */}
                  {correlationHeatmap ? (
                    <div className="card">
                      <div className="card-header">Matriz de correlación</div>
                      <pre style={{whiteSpace:'pre-wrap', fontSize:12}}>{JSON.stringify(correlationHeatmap, null, 2)}</pre>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
