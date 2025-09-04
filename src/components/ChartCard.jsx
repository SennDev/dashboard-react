import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function ChartCard({ title, chartData }) {
  return (
    <div className="chart-card card">
      <div className="card-header">{title}</div>
      <Bar data={chartData} />
    </div>
  );
}
