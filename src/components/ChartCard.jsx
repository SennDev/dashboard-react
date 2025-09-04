import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';

export default function ChartCard({ title, chartData, type = 'bar' }) {
  if (!chartData) {
    return (
      <div className="card chart-card empty-card">
        <div className="card-header">{title}</div>
        <div className="chart-empty">No hay datos</div>
      </div>
    );
  }

  const commonOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: false } },
    responsive: true,
  };

  return (
    <div className="card chart-card">
      <div className="card-header">{title}</div>
      <div className="chart-wrap">
        {type === 'bar' && <Bar data={chartData} options={commonOptions} />}
        {type === 'pie' && <Pie data={chartData} options={commonOptions} />}
        {type === 'line' && <Line data={chartData} options={commonOptions} />}
      </div>
    </div>
  );
}
