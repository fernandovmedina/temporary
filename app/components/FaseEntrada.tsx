"use client";

import { useState } from "react";
import { ConfiguracionP, CAMPOS_PARAMETROS } from "../types";

interface Props {
  configuraciones: ConfiguracionP[];
  onGuardarP: (config: ConfiguracionP) => void;
  onFinalizar: (config: ConfiguracionP) => void;
}

const valorInicial = (): Omit<ConfiguracionP, "nombre"> => ({
  r1912: 0, r1913: 0, r1915: 0, r1925: 0, r1927: 0,
  r1932_0: 0, r1932_1: 0, r1943_0: 0, r1936: 0, r1948: 0,
  corriente: 0, rpm: 0,
});

export default function FaseEntrada({ configuraciones, onGuardarP, onFinalizar }: Props) {
  const numeroPActual = configuraciones.length + 1;
  const nombreP = `P${numeroPActual}`;
  const [valores, setValores] = useState<Omit<ConfiguracionP, "nombre">>(valorInicial());
  const [errores, setErrores] = useState<Set<string>>(new Set());

  const manejarCambio = (key: string, val: string) => {
    const num = parseFloat(val);
    setValores((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
    setErrores((prev) => { const s = new Set(prev); s.delete(key); return s; });
  };

  const validar = () => {
    const nuevosErrores = new Set<string>();
    for (const campo of CAMPOS_PARAMETROS) {
      const v = valores[campo.key as keyof typeof valores] as number;
      if (v === 0 || isNaN(v)) nuevosErrores.add(campo.key);
    }
    setErrores(nuevosErrores);
    return nuevosErrores.size === 0;
  };

  const construirConfig = (): ConfiguracionP => ({ nombre: nombreP, ...valores });

  const handleSiguiente = () => {
    if (!validar()) return;
    onGuardarP(construirConfig());
    setValores(valorInicial());
    setErrores(new Set());
  };

  const handleFinalizar = () => {
    if (!validar()) return;
    onFinalizar(construirConfig());
  };

  return (
    <div className="fade-in max-w-5xl mx-auto w-full">
      {/* Progreso de configuraciones guardadas */}
      {configuraciones.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {configuraciones.map((c) => (
            <span
              key={c.nombre}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              {c.nombre} ✓
            </span>
          ))}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 pulse-ring">
            {nombreP} ←
          </span>
        </div>
      )}

      {/* Tarjeta principal */}
      <div className="glass-card glow-blue p-8">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold shadow-lg">
            {nombreP}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Configuración {nombreP}</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Ingresa los 10 parámetros de registro y los valores de operación
            </p>
          </div>
        </div>

        {/* Sección: Parámetros de registro */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Parámetros de Registro
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CAMPOS_PARAMETROS.slice(0, 10).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">{label}</label>
                <input
                  type="number"
                  step="any"
                  value={valores[key as keyof typeof valores] === 0 ? "" : valores[key as keyof typeof valores]}
                  onChange={(e) => manejarCambio(key, e.target.value)}
                  placeholder="0"
                  className={`w-full bg-slate-800/80 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all
                    ${errores.has(key)
                      ? "border-red-500 focus:ring-red-500/40"
                      : "border-slate-600 focus:ring-blue-500/40 focus:border-blue-500"
                    }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/60 my-6" />

        {/* Sección: Valores de operación */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Valores de Operación
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {CAMPOS_PARAMETROS.slice(10).map(({ key, label, unit }) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  {label}{unit ? ` (${unit})` : ""}
                </label>
                <input
                  type="number"
                  step="any"
                  value={valores[key as keyof typeof valores] === 0 ? "" : valores[key as keyof typeof valores]}
                  onChange={(e) => manejarCambio(key, e.target.value)}
                  placeholder="0"
                  className={`w-full bg-slate-800/80 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all
                    ${errores.has(key)
                      ? "border-red-500 focus:ring-red-500/40"
                      : "border-slate-600 focus:ring-blue-500/40 focus:border-blue-500"
                    }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Errores */}
        {errores.size > 0 && (
          <p className="text-red-400 text-sm mb-4 flex items-center gap-2">
            <span>⚠</span>
            Todos los campos deben tener un valor distinto de cero.
          </p>
        )}

        {/* Botones */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSiguiente}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <span>+</span>
            Configurar siguiente P{numeroPActual + 1}
          </button>
          <button
            onClick={handleFinalizar}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <span>✓</span>
            Finalizar captura
          </button>
        </div>
      </div>

      {/* Resumen de configuraciones capturadas */}
      {configuraciones.length > 0 && (
        <div className="mt-6 glass-card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Configuraciones capturadas ({configuraciones.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Config</th>
                  {CAMPOS_PARAMETROS.map(({ label }) => (
                    <th key={label} className="text-right py-2 px-2 text-slate-400 font-medium whitespace-nowrap">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {configuraciones.map((c) => (
                  <tr key={c.nombre} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-blue-400">{c.nombre}</td>
                    {CAMPOS_PARAMETROS.map(({ key }) => (
                      <td key={key} className="py-2 px-2 text-right text-slate-300">
                        {(c[key as keyof ConfiguracionP] as number).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
