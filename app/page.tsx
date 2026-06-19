"use client";

import { useState } from "react";
import { ConfiguracionP, FaseApp } from "./types";
import FaseInicio from "./components/FaseInicio";
import FaseEntrada from "./components/FaseEntrada";
import FaseCSV from "./components/FaseCSV";
import FaseSeleccion from "./components/FaseSeleccion";
import FaseResultados from "./components/FaseResultados";

const PASOS: { id: FaseApp; label: string; visible: boolean }[] = [
  { id: "inicio",    label: "Inicio",             visible: false },
  { id: "entrada",   label: "Captura de datos",   visible: true  },
  { id: "csv",       label: "Captura de datos",   visible: true  },
  { id: "seleccion", label: "Selección de mejores", visible: true },
  { id: "resultados",label: "Resultados",          visible: true  },
];

const PASOS_VISIBLES = [
  { id: "datos",      label: "Captura de datos"    },
  { id: "seleccion",  label: "Selección de mejores" },
  { id: "resultados", label: "Resultados"           },
];

function pasoActualVisible(fase: FaseApp): number {
  if (fase === "entrada" || fase === "csv") return 0;
  if (fase === "seleccion") return 1;
  if (fase === "resultados") return 2;
  return -1;
}

export default function Home() {
  const [fase, setFase] = useState<FaseApp>("inicio");
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionP[]>([]);
  const [ranking, setRanking] = useState<number[]>([]);

  const guardarP = (config: ConfiguracionP) => setConfiguraciones((prev) => [...prev, config]);

  const finalizarCaptura = (config: ConfiguracionP) => {
    setConfiguraciones((prev) => [...prev, config]);
    setFase("seleccion");
  };

  const confirmarCSV = (configs: ConfiguracionP[]) => {
    setConfiguraciones(configs);
    setFase("seleccion");
  };

  const confirmarRanking = (r: number[]) => {
    setRanking(r);
    setFase("resultados");
  };

  const reiniciar = () => {
    setFase("inicio");
    setConfiguraciones([]);
    setRanking([]);
  };

  const pasoVisible = pasoActualVisible(fase);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={reiniciar}
            className="flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
              ⚙
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-white leading-tight group-hover:text-blue-300 transition-colors">
                Sistema de Evaluación de Husillos
              </h1>
              <p className="text-xs text-slate-500">Control de configuraciones industriales</p>
            </div>
          </button>

          {/* Stepper — solo visible cuando no estamos en inicio */}
          {fase !== "inicio" && (
            <nav className="hidden sm:flex items-center gap-1">
              {PASOS_VISIBLES.map((paso, i) => (
                <div key={paso.id} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${pasoVisible === i
                        ? "bg-blue-600 text-white"
                        : i < pasoVisible
                          ? "text-blue-400"
                          : "text-slate-600"
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
                        ${pasoVisible === i ? "bg-white/20" : i < pasoVisible ? "bg-blue-500/30" : "bg-slate-800"}`}
                    >
                      {i < pasoVisible ? "✓" : i + 1}
                    </span>
                    {paso.label}
                  </div>
                  {i < PASOS_VISIBLES.length - 1 && (
                    <span className={`text-xs ${i < pasoVisible ? "text-blue-600" : "text-slate-700"}`}>›</span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {fase === "inicio" && (
          <FaseInicio
            onManual={() => setFase("entrada")}
            onCSV={() => setFase("csv")}
          />
        )}
        {fase === "entrada" && (
          <FaseEntrada
            configuraciones={configuraciones}
            onGuardarP={guardarP}
            onFinalizar={finalizarCaptura}
          />
        )}
        {fase === "csv" && (
          <FaseCSV
            onConfirmar={confirmarCSV}
            onVolver={() => setFase("inicio")}
          />
        )}
        {fase === "seleccion" && (
          <FaseSeleccion
            configuraciones={configuraciones}
            onConfirmar={confirmarRanking}
          />
        )}
        {fase === "resultados" && (
          <FaseResultados
            configuraciones={configuraciones}
            ranking={ranking}
            onReiniciar={reiniciar}
          />
        )}
      </main>
    </div>
  );
}
