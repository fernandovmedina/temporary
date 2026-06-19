"use client";

import { useRef, useState, useCallback } from "react";
import { ConfiguracionP, CAMPOS_PARAMETROS } from "../types";
import { parseCSV } from "../utils/csvParser";

interface Props {
  onConfirmar: (configuraciones: ConfiguracionP[]) => void;
  onVolver: () => void;
}

export default function FaseCSV({ onConfirmar, onVolver }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastrar, setArrastrar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState<ConfiguracionP[] | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");

  const procesar = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Solo se aceptan archivos .csv");
      return;
    }
    setError(null);
    setWarnings([]);
    setPreview(null);
    setNombreArchivo(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      if (!result.ok) {
        setError(result.error);
      } else {
        setWarnings(result.warnings);
        setPreview(result.configuraciones);
      }
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrar(false);
    const file = e.dataTransfer.files[0];
    if (file) procesar(file);
  }, [procesar]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesar(file);
  };

  return (
    <div className="fade-in max-w-5xl mx-auto w-full space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onVolver}
          className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-white">Importar CSV</h2>
      </div>

      {/* Zona de carga */}
      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setArrastrar(true); }}
          onDragLeave={() => setArrastrar(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`glass-card border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all
            ${arrastrar
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-slate-600 hover:border-emerald-500/60 hover:bg-emerald-500/5"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onInputChange}
          />
          <div className="text-4xl mb-4">📂</div>
          <p className="text-white font-semibold mb-1">
            {arrastrar ? "Suelta el archivo aquí" : "Arrastra tu archivo CSV aquí"}
          </p>
          <p className="text-slate-400 text-sm mb-4">o haz clic para seleccionarlo</p>
          <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors">
            Seleccionar archivo
          </span>
          <p className="text-slate-500 text-xs mt-5">
            Compatible con Excel (.csv) y Google Sheets (Archivo → Descargar → CSV)
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card border border-red-500/40 bg-red-500/10 p-5 rounded-xl">
          <p className="text-red-400 font-semibold mb-1 flex items-center gap-2">
            <span>⚠</span> Error al procesar el archivo
          </p>
          <pre className="text-red-300 text-xs whitespace-pre-wrap mt-2">{error}</pre>
          <button
            onClick={() => { setError(null); setPreview(null); inputRef.current && (inputRef.current.value = ""); }}
            className="mt-4 text-sm text-slate-400 hover:text-white underline"
          >
            Intentar con otro archivo
          </button>
        </div>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <div className="glass-card border border-yellow-500/30 bg-yellow-500/5 p-4 rounded-xl">
          {warnings.map((w, i) => (
            <p key={i} className="text-yellow-300 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>{w}
            </p>
          ))}
        </div>
      )}

      {/* Vista previa */}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">
                ✓ Archivo procesado: <span className="text-emerald-400">{nombreArchivo}</span>
              </p>
              <p className="text-slate-400 text-sm mt-0.5">
                {preview.length} configuraciones detectadas ({preview.map((c) => c.nombre).join(", ")})
              </p>
            </div>
            <button
              onClick={() => { setPreview(null); setWarnings([]); setError(null); inputRef.current && (inputRef.current.value = ""); }}
              className="text-sm text-slate-400 hover:text-white underline"
            >
              Cambiar archivo
            </button>
          </div>

          {/* Tabla de preview */}
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Vista previa de datos
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
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
                  {preview.map((c) => (
                    <tr key={c.nombre} className="border-b border-slate-800 hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-bold text-blue-400">{c.nombre}</td>
                      {CAMPOS_PARAMETROS.map(({ key }) => (
                        <td key={key} className="py-2 px-2 text-right text-slate-300">
                          {(c[key as keyof ConfiguracionP] as number)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onConfirmar(preview)}
              className="px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25"
            >
              Confirmar e ir a selección →
            </button>
            <button
              onClick={onVolver}
              className="px-5 py-3 border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white rounded-xl transition-all text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
