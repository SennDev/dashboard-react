import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function ChartCard({ title, chartData }) {
  return (
    <div className="card chart-card">
      <div className="card-header">{title}</div>
      <div className="chart-wrap">
        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
