'use client';

import { useMemo, useState, useEffect } from 'react';
import type { BotData } from '@/lib/phemex-api';

interface BotChartProps {
  bot: BotData;
}

// Chart component that will be dynamically loaded
function ChartContent({ bot }: BotChartProps) {
  const [RechartsComponents, setRechartsComponents] = useState<{
    ResponsiveContainer: React.ComponentType<any>;
    ComposedChart: React.ComponentType<any>;
    Line: React.ComponentType<any>;
    XAxis: React.ComponentType<any>;
    YAxis: React.ComponentType<any>;
    Tooltip: React.ComponentType<any>;
    ReferenceLine: React.ComponentType<any>;
    Scatter: React.ComponentType<any>;
  } | null>(null);

  useEffect(() => {
    import('recharts').then((mod) => {
      setRechartsComponents({
        ResponsiveContainer: mod.ResponsiveContainer,
        ComposedChart: mod.ComposedChart,
        Line: mod.Line,
        XAxis: mod.XAxis,
        YAxis: mod.YAxis,
        Tooltip: mod.Tooltip,
        ReferenceLine: mod.ReferenceLine,
        Scatter: mod.Scatter,
      });
    });
  }, []);

  const { chartData, visibleGridLevels, arbitragePoints, minPrice, maxPrice } = useMemo(() => {
    const currentPrice = bot?.currentPrice ?? 0;
    const gridLevels = bot?.gridLevels ?? [];
    
    const sortedLevels = [...(gridLevels ?? [])]?.sort?.((a, b) => a - b) ?? [];
    const currentIndex = sortedLevels?.findIndex?.((level) => level >= currentPrice) ?? 0;
    const startIdx = Math.max(0, currentIndex - 3);
    const endIdx = Math.min((sortedLevels?.length ?? 0), currentIndex + 4);
    const visible = sortedLevels?.slice?.(startIdx, endIdx) ?? [];

    const history = bot?.priceHistory ?? [];
    const data = (history ?? [])?.map?.((point) => ({
      time: new Date(point?.timestamp ?? 0)?.toLocaleTimeString?.('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) ?? '',
      price: point?.price ?? 0,
      timestamp: point?.timestamp ?? 0,
    })) ?? [];

    const min = Math.min(...(visible ?? [0])) * 0.995;
    const max = Math.max(...(visible ?? [0])) * 1.005;
    
    // Extended chart max to make room for arbitrage row at top
    const chartMax = max * 1.015;
    
    // Fixed Y position for ALL arbitrage markers - at very top of chart
    const arbRowY = max * 1.012;

    // Map arbitrage points - all at same fixed Y position in a row at top
    const arbPoints = (bot?.arbitrages ?? [])?.map?.((arb: any) => {
      const arbTime = new Date(arb?.timestamp ?? 0)?.toLocaleTimeString?.('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) ?? '';
      return {
        time: arbTime,
        price: arbRowY, // ALL at same fixed Y position at top
        profit: arb?.profit ?? 0,
        type: arb?.type ?? 'buy',
      };
    }) ?? [];

    return {
      chartData: data,
      visibleGridLevels: visible,
      arbitragePoints: arbPoints,
      minPrice: min,
      maxPrice: chartMax,
    };
  }, [bot]);

  if (!RechartsComponents) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-terminal-green">
        <span className="animate-pulse">Loading chart...</span>
      </div>
    );
  }

  const { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Scatter } = RechartsComponents;
  const currentPrice = bot?.currentPrice ?? 0;

  const renderDollarSign = (props: any) => {
    const { cx, cy, payload } = props ?? {};
    if (!cx || !cy) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill="#000" stroke="#FFD700" strokeWidth={1} />
        <text
          x={cx}
          y={cy}
          fill="#FFD700"
          fontSize={12}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          $
        </text>
      </g>
    );
  };

  // Custom Y-axis tick to show price labels cleanly
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 80, left: 60, bottom: 20 }}>
          <XAxis
            dataKey="time"
            tick={{ fill: '#00FF00', fontSize: 10, fontFamily: 'Courier New, monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#00FF00', strokeOpacity: 0.3 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: '#00FF00', fontSize: 10, fontFamily: 'Courier New, monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#00FF00', strokeOpacity: 0.3 }}
            tickFormatter={formatYAxis}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#000',
              border: '1px solid #00FF00',
              fontFamily: 'Courier New, monospace',
              fontSize: 11,
            }}
            labelStyle={{ color: '#00FF00' }}
            formatter={(value: number, name: string) => {
              if (name === 'price') return [`$${value?.toFixed?.(2)}`, 'Price'];
              return [value, name];
            }}
          />
          
          {/* Grid levels - RED for sell levels (above current), GREEN for buy levels (below current) */}
          {(visibleGridLevels ?? [])?.map?.((level: number, idx: number) => {
            const isAboveCurrent = level > currentPrice;
            const color = isAboveCurrent ? '#FF4444' : '#00FF00'; // Red for sell, Green for buy
            const label = isAboveCurrent ? 'SELL' : 'BUY';
            
            return (
              <ReferenceLine
                key={`grid-${idx}`}
                y={level}
                stroke={color}
                strokeOpacity={0.5}
                strokeDasharray="5 5"
                label={{
                  value: `$${level?.toLocaleString?.()}`,
                  position: 'right',
                  fill: color,
                  fontSize: 9,
                  fontFamily: 'Courier New, monospace',
                }}
              />
            );
          })}
          
          {/* Current price indicator - Y-axis label only, no horizontal line */}
          <ReferenceLine
            y={currentPrice}
            stroke="transparent"
            strokeWidth={0}
            label={{
              value: `► $${currentPrice?.toLocaleString?.(undefined, { minimumFractionDigits: 2 })}`,
              position: 'left',
              fill: '#FFD700',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'Courier New, monospace',
            }}
          />
          
          {/* Price movement line - GREEN wavy line */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00FF00"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#00FF00', stroke: '#000' }}
            name="price"
          />
          
          {/* Arbitrage points - $ signs at exact grid level intersections */}
          <Scatter
            data={arbitragePoints}
            dataKey="price"
            fill="#FFD700"
            shape={renderDollarSign}
            name="Arbitrage"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BotChart({ bot }: BotChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-terminal-green">
        <span className="animate-pulse">Loading chart...</span>
      </div>
    );
  }

  return <ChartContent bot={bot} />;
}
