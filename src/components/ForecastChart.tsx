import React, { useState, useId, useMemo } from 'react';
import { ForecastAnalysis, HourlyForecastPoint } from '../api/types';
import { AQI_CATEGORIES } from '../utils/aqi';

interface ForecastChartProps {
  forecast: ForecastAnalysis;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecast }) => {
  const [metric, setMetric] = useState<'usAqi' | 'pm2_5'>('usAqi');
  const [showTable, setShowTable] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<HourlyForecastPoint | null>(null);
  const chartId = useId();

  const points = forecast.points;
  const numPoints = points.length;

  // Calculate SVG ViewBox dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const { yMax, pathD, areaD, yTicks, xLabels } = useMemo(() => {
    if (numPoints === 0) {
      return { yMax: 100, pathD: '', areaD: '', yTicks: [], xLabels: [] };
    }

    const vals = points.map((p) => (metric === 'usAqi' ? p.usAqi : p.pm2_5));
    const rawMax = Math.max(...vals, metric === 'usAqi' ? 100 : 25);
    const maxY = metric === 'usAqi' ? Math.ceil(rawMax / 50) * 50 : Math.ceil(rawMax / 10) * 10;

    const getXCoord = (index: number) => paddingLeft + (index / (numPoints - 1 || 1)) * chartW;
    const getYCoord = (val: number) => {
      const clamped = Math.max(0, Math.min(val, maxY));
      return paddingTop + chartH - (clamped / maxY) * chartH;
    };

    const path = points.reduce((acc, p, idx) => {
      const val = metric === 'usAqi' ? p.usAqi : p.pm2_5;
      const x = getXCoord(idx);
      const y = getYCoord(val);
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');

    const area = `${path} L ${getXCoord(numPoints - 1).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${getXCoord(0).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`;

    const ticks =
      metric === 'usAqi'
        ? [0, 50, 100, 150, 200, 300].filter((v) => v <= maxY)
        : [0, 12, 35, 55, maxY];

    const step = Math.max(1, Math.floor(numPoints / 6));
    const labels = points.filter((_, idx) => idx % step === 0 || idx === numPoints - 1);

    return { values: vals, yMax: maxY, pathD: path, areaD: area, yTicks: ticks, xLabels: labels };
  }, [points, numPoints, metric, chartW, chartH]);

  if (numPoints === 0) {
    return null;
  }

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, yMax));
    return paddingTop + chartH - (clamped / yMax) * chartH;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (numPoints - 1 || 1)) * chartW;
  };

  return (
    <section className="forecast-section card" aria-labelledby="forecast-heading">
      <div className="forecast-header">
        <div>
          <h2 id="forecast-heading" className="forecast-title">
            48-Hour Air Quality Forecast
          </h2>
          <p className="forecast-summary-highlight">
            <span className="summary-icon" aria-hidden="true">
              💡
            </span>
            <span>{forecast.bestWindowText}</span>
          </p>
        </div>

        <div className="forecast-controls">
          <div className="metric-toggle-group" role="group" aria-label="Select forecast metric">
            <button
              type="button"
              className={`metric-toggle-btn ${metric === 'usAqi' ? 'active' : ''}`}
              onClick={() => setMetric('usAqi')}
              aria-pressed={metric === 'usAqi'}
            >
              US AQI
            </button>
            <button
              type="button"
              className={`metric-toggle-btn ${metric === 'pm2_5' ? 'active' : ''}`}
              onClick={() => setMetric('pm2_5')}
              aria-pressed={metric === 'pm2_5'}
            >
              PM₂.₅ (µg/m³)
            </button>
          </div>

          <button
            type="button"
            className="table-toggle-btn"
            onClick={() => setShowTable((prev) => !prev)}
            aria-expanded={showTable}
            aria-controls={`${chartId}-table-view`}
          >
            {showTable ? 'Show Chart' : 'Show Data Table'}
          </button>
        </div>
      </div>

      {/* Accessible Alternate View: Data Table */}
      {showTable ? (
        <div id={`${chartId}-table-view`} className="forecast-table-container">
          <table className="forecast-data-table">
            <caption className="sr-only">48-Hour Air Quality Forecast Data Table</caption>
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Day</th>
                <th scope="col">US AQI</th>
                <th scope="col">PM₂.₅</th>
                <th scope="col">Category</th>
              </tr>
            </thead>
            <tbody>
              {points.map((pt, i) => {
                const cat = AQI_CATEGORIES[pt.category];
                return (
                  <tr key={`${pt.time}-${i}`}>
                    <td>{pt.formattedTime}</td>
                    <td>{pt.dayLabel}</td>
                    <td>
                      <span
                        className="table-aqi-pill"
                        style={{ backgroundColor: cat.badgeBg, color: cat.badgeText }}
                      >
                        {pt.usAqi}
                      </span>
                    </td>
                    <td>{pt.pm2_5} µg/m³</td>
                    <td>
                      <span aria-hidden="true">{cat.icon} </span>
                      {cat.name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Accessible Custom SVG Line Chart */
        <div className="chart-canvas-wrapper">
          <svg
            className="forecast-svg"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            role="img"
            aria-label={`Interactive 48-hour forecast chart displaying ${metric === 'usAqi' ? 'US AQI' : 'PM 2.5'} over time. Best quality is ${forecast.bestWindowText}`}
          >
            <defs>
              <linearGradient id={`${chartId}-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-axis gridlines and labels */}
            {yTicks.map((val) => {
              const y = getY(val);
              return (
                <g key={`ytick-${val}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#64748b"
                    fontFamily="inherit"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaD} fill={`url(#${chartId}-gradient)`} />

            {/* Line stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points with interactive hit targets */}
            {points.map((pt, idx) => {
              const val = metric === 'usAqi' ? pt.usAqi : pt.pm2_5;
              const x = getX(idx);
              const y = getY(val);
              const isBest = pt.time === forecast.minAqiPoint.time;
              const cat = AQI_CATEGORIES[pt.category];
              const isHovered = hoveredPoint?.time === pt.time;

              return (
                <g
                  key={`pt-${pt.time}-${idx}`}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible enlarged hit target for mobile/mouse */}
                  <circle cx={x} cy={y} r="12" fill="transparent" />

                  {/* Visual point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : isBest ? 5 : 3}
                    fill={cat.color}
                    stroke="#ffffff"
                    strokeWidth={isHovered || isBest ? 2 : 1}
                  />

                  {/* Best time indicator icon */}
                  {isBest && !hoveredPoint && (
                    <g transform={`translate(${x - 8}, ${y - 24})`}>
                      <rect width="16" height="16" rx="8" fill="#15803d" />
                      <text
                        x="8"
                        y="12"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        ★
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {xLabels.map((pt) => {
              const idx = points.findIndex((p) => p.time === pt.time);
              const x = getX(idx);
              return (
                <g key={`xlabel-${pt.time}`}>
                  <line
                    x1={x}
                    y1={paddingTop + chartH}
                    x2={x}
                    y2={paddingTop + chartH + 5}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={paddingTop + chartH + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#475569"
                    fontWeight="500"
                  >
                    {pt.formattedTime}
                  </text>
                  <text
                    x={x}
                    y={paddingTop + chartH + 30}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#94a3b8"
                  >
                    {pt.dayLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Active tooltip overlay */}
          {hoveredPoint && (
            <div className="forecast-tooltip" role="tooltip">
              <div className="tooltip-header">
                <strong>
                  {hoveredPoint.dayLabel} at {hoveredPoint.formattedTime}
                </strong>
              </div>
              <div className="tooltip-body">
                <div>
                  US AQI: <strong>{hoveredPoint.usAqi}</strong> (
                  {AQI_CATEGORIES[hoveredPoint.category].name})
                </div>
                <div>
                  PM₂.₅: <strong>{hoveredPoint.pm2_5} µg/m³</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
