"use client";

import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { LineRadial } from '@visx/shape';

const orange = '#ff9933';
export const silver = '#d1d5db';
const background = '#0f172a';

const degrees = 360;

interface DataPoint {
  label: string;
  value: number;
}

const defaultData: DataPoint[] = [
  { label: 'Road', value: 0.95 },
  { label: 'Sidewalk', value: 0.82 },
  { label: 'Lane', value: 0.88 },
  { label: 'Car', value: 0.75 },
  { label: 'Pedestrian', value: 0.65 },
];

export const AccuracyRadar = ({ data = defaultData, width, height }: { data?: DataPoint[], width: number, height: number }) => {
  const radius = Math.min(width, height) / 2 - 40;
  
  const yScale = scaleLinear<number>({
    range: [0, radius],
    domain: [0, 1],
  });

  const getTheta = (i: number) => (i * degrees) / data.length;

  return (
    <svg width={width} height={height}>
      <Group top={height / 2} left={width / 2}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((tick) => (
          <circle
            key={`tick-${tick}`}
            r={yScale(tick)}
            fill="none"
            stroke={silver}
            strokeWidth={1}
            strokeOpacity={0.1}
          />
        ))}
        {data.map((_, i) => (
          <line
            key={`line-${i}`}
            x1={0}
            y1={0}
            x2={radius * Math.cos((getTheta(i) * Math.PI) / 180)}
            y2={radius * Math.sin((getTheta(i) * Math.PI) / 180)}
            stroke={silver}
            strokeWidth={1}
            strokeOpacity={0.1}
          />
        ))}
        <LineRadial
          data={data}
          angle={(d, i) => (getTheta(i) * Math.PI) / 180}
          radius={(d) => yScale(d.value)}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth={2}
          curve={undefined}
        />
        {data.map((d, i) => {
          const x = (radius + 20) * Math.cos((getTheta(i) * Math.PI) / 180);
          const y = (radius + 20) * Math.sin((getTheta(i) * Math.PI) / 180);
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              fontSize={8}
              fill={silver}
              fillOpacity={0.6}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontWeight="bold"
              className="uppercase tracking-widest font-mono"
            >
              {d.label}
            </text>
          );
        })}
      </Group>
    </svg>
  );
};
