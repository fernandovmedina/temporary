"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { Bar, Radar } from "react-chartjs-2";
import { ConfiguracionP, CAMPOS_PARAMETROS } from "../types";
import GraficaProximidad from "./GraficaProximidad";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  RadialLinearScale, ArcElement, Tooltip, Legend, Title, Filler
);

interface Props {
  configuraciones: ConfiguracionP[];
  ranking: number[];
  onReiniciar: () => void;
}

const COLORES_TOP3 = [
  { border: "rgba(250,204,21,1)", bg: "rgba(250,204,21,0.2)", nombre: "#FFD700" },
  { border: "rgba(156,163,175,1)", bg: "rgba(156,163,175,0.2)", nombre: "#C0C0C0" },
  { border: "rgba(180,83,9,1)", bg: "rgba(180,83,9,0.2)", nombre: "#CD7F32" },
];

const COLORES_TODAS = [
  "rgba(59,130,246,0.8)",
  "rgba(168,85,247,0.8)",
  "rgba(234,179,8,0.8)",
  "rgba(249,115,22,0.8)",
  "rgba(20,184,166,0.8)",
  "rgba(236,72,153,0.8)",
  "rgba(99,102,241,0.8)",
  "rgba(34,197,94,0.8)",
];

const MEDALLAS = ["🥇", "🥈", "🥉"];
const TITULOS_LUGAR = ["Mejor configuración", "2da mejor", "3ra mejor"];

const opciones_base = {
  responsive: true,
  plugins: {
    legend: { labels: { color: "#94a3b8" } },
  },
};

export default function FaseResultados({ configuraciones, ranking, onReiniciar }: Props) {
  const top3 = ranking.map((idx) => configuraciones[idx]);
  const parametros10 = CAMPOS_PARAMETROS.slice(0, 10);

  // Normalizar valores para el radar (escala 0-100)
  const normalizar = (key: keyof ConfiguracionP) => {
    const vals = configuraciones.map((c) => c[key] as number);
    const max = Math.max(...vals, 1);
    return top3.map((c) => ((c[key] as number) / max) * 100);
  };

  const radarData = {
    labels: parametros10.map((p) => p.label),
    datasets: top3.map((config, i) => ({
      label: config.nombre,
      data: parametros10.map((p) => normalizar(p.key)[i]),
      borderColor: COLORES_TOP3[i].border,
      backgroundColor: COLORES_TOP3[i].bg,
      borderWidth: 2,
      pointBackgroundColor: COLORES_TOP3[i].border,
      pointRadius: 4,
    })),
  };

  const rpmData = {
    labels: configuraciones.map((c) => c.nombre),
    datasets: [{
      label: "RPM",
      data: configuraciones.map((c) => c.rpm),
      backgroundColor: configuraciones.map((_, i) => {
        const lugar = ranking.indexOf(i);
        return lugar !== -1 ? COLORES_TOP3[lugar].border : "rgba(71,85,105,0.6)";
      }),
      borderColor: configuraciones.map((_, i) => {
        const lugar = ranking.indexOf(i);
        return lugar !== -1 ? COLORES_TOP3[lugar].border : "rgba(71,85,105,0.9)";
      }),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const corrienteData = {
    labels: configuraciones.map((c) => c.nombre),
    datasets: [{
      label: "Corriente (A)",
      data: configuraciones.map((c) => c.corriente),
      backgroundColor: configuraciones.map((_, i) => {
        const lugar = ranking.indexOf(i);
        return lugar !== -1 ? COLORES_TOP3[lugar].border : "rgba(71,85,105,0.6)";
      }),
      borderColor: configuraciones.map((_, i) => {
        const lugar = ranking.indexOf(i);
        return lugar !== -1 ? COLORES_TOP3[lugar].border : "rgba(71,85,105,0.9)";
      }),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  // Score calculado: promedio normalizado de todos los parámetros
  const scoresPorConfig = configuraciones.map((config) => {
    const vals = parametros10.map((p) => {
      const todos = configuraciones.map((c) => c[p.key] as number);
      const max = Math.max(...todos, 1);
      return ((config[p.key] as number) / max) * 100;
    });
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  const scoreData = {
    labels: configuraciones.map((c) => c.nombre),
    datasets: [{
      label: "Score global (%)",
      data: scoresPorConfig,
      backgroundColor: configuraciones.map((_, i) => {
        const lugar = ranking.indexOf(i);
        return lugar !== -1 ? COLORES_TOP3[lugar].border : "rgba(71,85,105,0.6)";
      }),
      borderColor: configuraciones.map((_, i) => {
        const lugar = ranking.indexOf(i);
        return lugar !== -1 ? COLORES_TOP3[lugar].border : "rgba(71,85,105,0.9)";
      }),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const opcionesBarras = {
    ...opciones_base,
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(71,85,105,0.3)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(71,85,105,0.3)" } },
    },
  };

  const opcionesRadar = {
    ...opciones_base,
    scales: {
      r: {
        ticks: { color: "#94a3b8", backdropColor: "transparent" },
        grid: { color: "rgba(71,85,105,0.5)" },
        pointLabels: { color: "#cbd5e1", font: { size: 11 } },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="fade-in max-w-6xl mx-auto w-full space-y-6">
      {/* Podio */}
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Resultados del análisis</h2>
        <p className="text-slate-400 text-sm mb-8">
          {configuraciones.length} configuraciones evaluadas · Top 3 seleccionadas por el operador
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 0, 2].map((podioIdx) => {
            const config = top3[podioIdx];
            const alturas = ["h-28", "h-36", "h-24"];
            const coloresCard = [
              "border-slate-400 bg-slate-400/10",
              "border-yellow-400 bg-yellow-400/10 glow-orange",
              "border-amber-700 bg-amber-700/10",
            ];
            return (
              <div key={podioIdx} className={`rounded-xl border-2 ${coloresCard[podioIdx]} p-5 text-center flex flex-col items-center justify-center ${alturas[podioIdx]}`}>
                <div className="text-3xl mb-1">{MEDALLAS[podioIdx]}</div>
                <div className="text-xl font-black text-white">{config.nombre}</div>
                <div className="text-xs text-slate-400 mt-1">{TITULOS_LUGAR[podioIdx]}</div>
                <div className="text-xs mt-2 space-y-0.5">
                  <div className="text-slate-300">{config.rpm.toLocaleString()} RPM</div>
                  <div className="text-slate-300">{config.corriente} A</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rangos recomendados */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Rangos recomendados de operación
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Basado en las 3 configuraciones seleccionadas como mejores. Operar dentro de estos rangos maximiza el rendimiento del husillo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAMPOS_PARAMETROS.map(({ key, label, unit }) => {
            const vals = top3.map((c) => c[key as keyof ConfiguracionP] as number);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            const mismo = min === max;
            return (
              <div
                key={key}
                className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {label}{unit ? ` (${unit})` : ""}
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {mismo
                      ? min.toLocaleString()
                      : `${min.toLocaleString()} – ${max.toLocaleString()}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {top3.map((c, i) => (
                    <div key={i} className="text-xs text-slate-500 leading-snug">
                      <span className="mr-1">{["🥇","🥈","🥉"][i]}</span>
                      <span className="text-slate-400">{(c[key as keyof ConfiguracionP] as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score global */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Score global por configuración (parámetros normalizados)
        </h3>
        <div className="h-64">
          <Bar data={scoreData} options={{ ...opcionesBarras, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Proximidad al ideal + Curva de campana */}
      <GraficaProximidad configuraciones={configuraciones} ranking={ranking} />

      {/* Radar top 3 */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Comparación radar — Top 3 configuraciones (parámetros normalizados)
        </h3>
        <div className="max-w-lg mx-auto h-80">
          <Radar data={radarData} options={{ ...opcionesRadar, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* RPM y Corriente lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
            RPM por configuración
          </h3>
          <div className="h-52">
            <Bar data={rpmData} options={{ ...opcionesBarras, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
            Corriente (A) por configuración
          </h3>
          <div className="h-52">
            <Bar data={corrienteData} options={{ ...opcionesBarras, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Tabla comparativa completa
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Config</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Lugar</th>
                {CAMPOS_PARAMETROS.map(({ label }) => (
                  <th key={label} className="text-right py-2 px-2 text-slate-400 font-medium whitespace-nowrap">
                    {label}
                  </th>
                ))}
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {configuraciones
                .map((c, i) => ({ config: c, originalIdx: i, score: scoresPorConfig[i] }))
                .sort((a, b) => {
                  const lugarA = ranking.indexOf(a.originalIdx);
                  const lugarB = ranking.indexOf(b.originalIdx);
                  if (lugarA !== -1 && lugarB !== -1) return lugarA - lugarB;
                  if (lugarA !== -1) return -1;
                  if (lugarB !== -1) return 1;
                  return b.score - a.score;
                })
                .map(({ config, originalIdx, score }) => {
                  const lugar = ranking.indexOf(originalIdx);
                  return (
                    <tr
                      key={config.nombre}
                      className={`border-b border-slate-800 ${lugar !== -1 ? "bg-slate-800/30" : ""}`}
                    >
                      <td className={`py-2 px-3 font-bold ${lugar === 0 ? "text-yellow-400" : lugar === 1 ? "text-slate-300" : lugar === 2 ? "text-amber-600" : "text-slate-500"}`}>
                        {config.nombre}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {lugar !== -1 ? MEDALLAS[lugar] : "—"}
                      </td>
                      {CAMPOS_PARAMETROS.map(({ key }) => (
                        <td key={key} className="py-2 px-2 text-right text-slate-300 text-xs">
                          {(config[key as keyof ConfiguracionP] as number).toLocaleString()}
                        </td>
                      ))}
                      <td className="py-2 px-3 text-right font-semibold text-blue-400">
                        {score.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón reiniciar */}
      <div className="text-center pb-8">
        <button
          onClick={onReiniciar}
          className="px-8 py-3 border-2 border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white font-semibold rounded-xl transition-all"
        >
          ↺ Nueva evaluación
        </button>
      </div>
    </div>
  );
}
