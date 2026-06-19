"use client";

import { useState } from "react";
import { ConfiguracionP } from "../types";

interface Props {
  configuraciones: ConfiguracionP[];
  onConfirmar: (ranking: number[]) => void;
}

const MEDALLAS = ["🥇", "🥈", "🥉"];
const COLORES_MEDALLA = [
  "border-yellow-400 bg-yellow-400/10 text-yellow-300",
  "border-slate-400 bg-slate-400/10 text-slate-300",
  "border-amber-600 bg-amber-700/10 text-amber-400",
];
const ETIQUETAS_LUGAR = ["1er lugar", "2do lugar", "3er lugar"];

export default function FaseSeleccion({ configuraciones, onConfirmar }: Props) {
  const [seleccionados, setSeleccionados] = useState<number[]>([]);

  const toggleSeleccion = (idx: number) => {
    if (seleccionados.includes(idx)) {
      setSeleccionados(seleccionados.filter((i) => i !== idx));
    } else if (seleccionados.length < 3) {
      setSeleccionados([...seleccionados, idx]);
    }
  };

  const lugarDe = (idx: number) => seleccionados.indexOf(idx);

  const puedeConfirmar = seleccionados.length === 3;

  return (
    <div className="fade-in max-w-5xl mx-auto w-full">
      <div className="glass-card p-8 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-xl flex-shrink-0">
            🏆
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Selección de mejores configuraciones</h2>
            <p className="text-slate-400 text-sm mt-1">
              Selecciona en orden las <span className="text-violet-300 font-semibold">3 configuraciones</span> con las que el husillo funcionó mejor.
              El orden de selección determina el ranking (1ro, 2do, 3ro).
            </p>
          </div>
        </div>

        {/* Indicador de progreso de selección */}
        <div className="flex gap-3 mb-8">
          {[0, 1, 2].map((i) => {
            const selIdx = seleccionados[i];
            const tiene = selIdx !== undefined;
            return (
              <div
                key={i}
                className={`flex-1 rounded-xl p-3 border-2 transition-all ${tiene ? COLORES_MEDALLA[i] : "border-slate-700 bg-slate-800/40 text-slate-600"}`}
              >
                <div className="text-xl mb-1">{MEDALLAS[i]}</div>
                <div className="text-xs font-semibold">{ETIQUETAS_LUGAR[i]}</div>
                <div className="text-sm font-bold mt-0.5">
                  {tiene ? configuraciones[selIdx].nombre : "—"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid de configuraciones */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {configuraciones.map((config, idx) => {
            const lugar = lugarDe(idx);
            const estaSeleccionado = lugar !== -1;

            return (
              <button
                key={config.nombre}
                onClick={() => toggleSeleccion(idx)}
                disabled={seleccionados.length >= 3 && !estaSeleccionado}
                className={`relative rounded-xl p-4 border-2 transition-all text-left cursor-pointer
                  ${estaSeleccionado
                    ? COLORES_MEDALLA[lugar] + " scale-95"
                    : seleccionados.length >= 3
                      ? "border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed opacity-40"
                      : "border-slate-600 bg-slate-800/60 text-slate-300 hover:border-violet-500 hover:bg-violet-500/10"
                  }`}
              >
                {estaSeleccionado && (
                  <span className="absolute top-2 right-2 text-lg">{MEDALLAS[lugar]}</span>
                )}
                <div className="text-xl font-bold mb-2">{config.nombre}</div>
                <div className="text-xs space-y-0.5 text-slate-400">
                  <div>RPM: <span className="text-slate-300 font-medium">{config.rpm.toLocaleString()}</span></div>
                  <div>Corriente: <span className="text-slate-300 font-medium">{config.corriente} A</span></div>
                </div>
                {estaSeleccionado && (
                  <div className="mt-2 text-xs font-bold">{ETIQUETAS_LUGAR[lugar]}</div>
                )}
              </button>
            );
          })}
        </div>

        {seleccionados.length < 3 && (
          <p className="mt-5 text-center text-slate-500 text-sm">
            {3 - seleccionados.length === 3
              ? "Selecciona la configuración que funcionó mejor"
              : `Selecciona ${3 - seleccionados.length} configuración${3 - seleccionados.length > 1 ? "es" : ""} más`}
          </p>
        )}

        {puedeConfirmar && (
          <div className="mt-6 text-center">
            <button
              onClick={() => onConfirmar(seleccionados)}
              className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-violet-500/30 text-lg"
            >
              Ver resultados y gráficas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
