"use client";

import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { ConfiguracionP, CAMPOS_PARAMETROS } from "../types";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Tooltip, Legend, Filler
);

interface Props {
  configuraciones: ConfiguracionP[];
  ranking: number[];
}

const MEDALLAS = ["🥇", "🥈", "🥉"];

const COLOR_RANKING = [
  { border: "rgba(250,204,21,1)", bg: "rgba(250,204,21,0.75)" },
  { border: "rgba(200,210,220,1)", bg: "rgba(200,210,220,0.75)" },
  { border: "rgba(180,100,20,1)", bg: "rgba(180,100,20,0.75)" },
];
const COLOR_NORMAL = { border: "rgba(71,85,105,0.8)", bg: "rgba(71,85,105,0.5)" };

function gaussian(x: number, mean: number, std: number): number {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

export default function GraficaProximidad({ configuraciones, ranking }: Props) {
  const parametros10 = CAMPOS_PARAMETROS.slice(0, 10);

  // Score normalizado 0-100 para cada configuración
  const scores = useMemo(() => {
    return configuraciones.map((config) => {
      const vals = parametros10.map((p) => {
        const todos = configuraciones.map((c) => c[p.key] as number);
        const max = Math.max(...todos, 1);
        return ((config[p.key] as number) / max) * 100;
      });
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    });
  }, [configuraciones]);

  // Mejor score posible = 100
  const proximidades = scores.map((s) => parseFloat((100 - (100 - s)).toFixed(2)));

  // ──────────────────────────────────────────────────────────────────
  // Gráfica 1: barras horizontales — proximidad al ideal
  // ──────────────────────────────────────────────────────────────────
  const barData: ChartData<"bar"> = {
    labels: configuraciones.map((c) => {
      const lugar = ranking.indexOf(configuraciones.indexOf(c));
      return lugar !== -1 ? `${MEDALLAS[lugar]} ${c.nombre}` : c.nombre;
    }),
    datasets: [
      {
        label: "Proximidad al ideal (%)",
        data: proximidades,
        backgroundColor: configuraciones.map((_, i) => {
          const lugar = ranking.indexOf(i);
          return lugar !== -1 ? COLOR_RANKING[lugar].bg : COLOR_NORMAL.bg;
        }),
        borderColor: configuraciones.map((_, i) => {
          const lugar = ranking.indexOf(i);
          return lugar !== -1 ? COLOR_RANKING[lugar].border : COLOR_NORMAL.border;
        }),
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Ideal (100%)",
        data: configuraciones.map(() => 100),
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "rgba(34,197,94,0.5)",
        borderWidth: 1.5,
        type: "bar" as const,
        borderRadius: 0,
        borderSkipped: false,
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${(ctx.parsed.x ?? 0).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: 105,
        ticks: {
          color: "#94a3b8",
          callback: (v) => `${v}%`,
        },
        grid: { color: "rgba(71,85,105,0.3)" },
      },
      y: {
        ticks: { color: "#e2e8f0", font: { size: 13, weight: "bold" } },
        grid: { color: "rgba(71,85,105,0.2)" },
      },
    },
  };

  // ──────────────────────────────────────────────────────────────────
  // Gráfica 2: curva de campana con posición de cada configuración
  // ──────────────────────────────────────────────────────────────────
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + (b - mean) ** 2, 0) / scores.length;
  const std = Math.max(Math.sqrt(variance), 2); // mínimo 2 para evitar curva plana

  // Puntos de la curva gaussiana
  const xMin = Math.max(0, mean - std * 3.5);
  const xMax = Math.min(100, mean + std * 3.5);
  const steps = 120;
  const curveX: number[] = [];
  const curveY: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i / steps) * (xMax - xMin);
    curveX.push(parseFloat(x.toFixed(2)));
    curveY.push(gaussian(x, mean, std));
  }

  // Puntos de configuraciones sobre la curva
  const configPoints = configuraciones.map((_, i) => ({
    x: scores[i],
    y: gaussian(scores[i], mean, std),
  }));

  const bellData: ChartData<"line"> = {
    labels: curveX,
    datasets: [
      {
        label: "Distribución",
        data: curveY,
        borderColor: "rgba(99,102,241,0.9)",
        backgroundColor: "rgba(99,102,241,0.15)",
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
      ...configuraciones.map((config, i) => {
        const lugar = ranking.indexOf(i);
        const color = lugar !== -1 ? COLOR_RANKING[lugar].border : COLOR_NORMAL.border;
        const label = lugar !== -1 ? `${MEDALLAS[lugar]} ${config.nombre}` : config.nombre;
        return {
          label,
          data: curveX.map((x, xi) => {
            const cfgX = configPoints[i].x;
            const closest = curveX.reduce((best, cx, ci) =>
              Math.abs(cx - cfgX) < Math.abs(curveX[best] - cfgX) ? ci : best, 0);
            return xi === closest ? curveY[closest] : null;
          }),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius: (ctx: { dataIndex: number }) => (curveY[ctx.dataIndex] !== null ? 8 : 0),
          pointStyle: lugar === 0 ? "star" : "circle",
          pointHoverRadius: 10,
          showLine: false,
          fill: false,
          tension: 0,
        };
      }),
    ],
  };

  const bellOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          filter: (item) => item.text !== "Distribución",
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => `Score: ${Number(items[0].label).toFixed(1)}%`,
          label: (ctx) => {
            if (ctx.dataset.label === "Distribución") return "";
            return ` ${ctx.dataset.label}`;
          },
        },
        filter: (item) => item.dataset.label !== "Distribución" && item.parsed.y !== null,
      },
    },
    scales: {
      x: {
        type: "linear",
        min: Math.floor(xMin),
        max: Math.ceil(xMax),
        ticks: {
          color: "#94a3b8",
          callback: (v) => `${v}%`,
          maxTicksLimit: 8,
        },
        grid: { color: "rgba(71,85,105,0.3)" },
        title: { display: true, text: "Score (%)", color: "#64748b" },
      },
      y: {
        ticks: { display: false },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const alturaBarras = Math.max(180, configuraciones.length * 52);

  return (
    <div className="glass-card p-6 space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Proximidad al ideal por configuración
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Score normalizado sobre todos los parámetros de registro. La línea verde representa el 100% ideal.
        </p>
        <div style={{ height: alturaBarras }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="border-t border-slate-700/60 pt-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Distribución de scores — curva de campana
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Curva de distribución normal. Los marcadores muestran la posición de cada configuración.
          La estrella ★ indica el primer lugar.
        </p>
        <div className="h-64">
          <Line data={bellData} options={bellOptions} />
        </div>

        {/* Leyenda de posiciones debajo de la campana */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {configuraciones.map((config, i) => {
            const lugar = ranking.indexOf(i);
            const color = lugar !== -1 ? COLOR_RANKING[lugar].border : "rgba(71,85,105,0.9)";
            return (
              <div key={config.nombre} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ background: color }}
                />
                <span className="text-slate-300">
                  {lugar !== -1 && `${MEDALLAS[lugar]} `}{config.nombre}
                  <span className="text-slate-500 ml-1">({scores[i].toFixed(1)}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
