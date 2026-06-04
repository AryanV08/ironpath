import { useState } from 'react';
import '../../screens/screens.css';

export interface ChartPoint {
  week: string;
  weight: number;
}

interface WeightProgressChartProps {
  data: ChartPoint[];
  minY: number;
  maxY: number;
}

export function WeightProgressChart({ data, minY, maxY }: WeightProgressChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const CHART = {
    left: 50,
    right: 20,
    top: 20,
    bottom: 40,
    width: 360,
    height: 200,
  };

  function scaleX(index: number) {
    const plotW = CHART.width - CHART.left - CHART.right;
    return CHART.left + (index / (data.length - 1)) * plotW;
  }

  function scaleY(weight: number) {
    const plotH = CHART.height - CHART.top - CHART.bottom;
    const ratio = (weight - minY) / (maxY - minY);
    return CHART.height - CHART.bottom - ratio * plotH;
  }

  const points = data.map((d, i) => ({
    ...d,
    cx: scaleX(i),
    cy: scaleY(d.weight),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ');

  const yTicks = [minY, Math.round((minY + maxY) / 2), maxY];

  return (
    <div className="progress-chart-wrap glass-card">
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="progress-chart"
        role="img"
        aria-label="Weight progress chart"
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              className="chart-grid-line"
              x1={CHART.left}
              x2={CHART.width - CHART.right}
              y1={scaleY(tick)}
              y2={scaleY(tick)}
            />
            <text className="chart-axis-label" x={8} y={scaleY(tick) + 4}>
              {tick} lbs
            </text>
          </g>
        ))}

        {data.map((d, i) => (
          <text
            key={d.week}
            className="chart-axis-label"
            x={scaleX(i)}
            y={CHART.height - 10}
            textAnchor="middle"
          >
            {d.week}
          </text>
        ))}

        <path className="chart-line" d={linePath} />

        {points.map((p, i) => (
          <g key={p.week}>
            <circle
              className="chart-dot"
              cx={p.cx}
              cy={p.cy}
              r={5}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            {hovered === i && (
              <g className="chart-tooltip">
                <rect
                  className="chart-tooltip-bg"
                  x={p.cx - 36}
                  y={p.cy - 36}
                  width={72}
                  height={24}
                  rx={4}
                />
                <text
                  className="chart-tooltip-text"
                  x={p.cx}
                  y={p.cy - 20}
                  textAnchor="middle"
                >
                  {p.weight} lbs
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
