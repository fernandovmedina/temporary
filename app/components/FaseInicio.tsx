"use client";

interface Props {
  onManual: () => void;
  onCSV: () => void;
}

export default function FaseInicio({ onManual, onCSV }: Props) {
  return (
    <div className="fade-in max-w-3xl mx-auto w-full">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg glow-blue">
          ⚙
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Evaluación de Husillos</h2>
        <p className="text-slate-400">
          Selecciona cómo deseas ingresar los datos de las configuraciones
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Opción Manual */}
        <button
          onClick={onManual}
          className="glass-card p-8 text-left group hover:border-blue-500/60 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-2xl mb-5 group-hover:bg-blue-600/30 transition-all">
            ✏️
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Captura manual</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ingresa los parámetros de cada configuración Pn uno a uno directamente en el formulario.
          </p>
          <div className="mt-6 flex items-center gap-2 text-blue-400 text-sm font-semibold">
            Comenzar
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* Opción CSV */}
        <button
          onClick={onCSV}
          className="glass-card p-8 text-left group hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all duration-200 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-2xl mb-5 group-hover:bg-emerald-600/30 transition-all">
            📊
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Importar CSV</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Carga un archivo <code className="text-emerald-400 bg-slate-800 px-1 rounded">.csv</code> exportado desde Excel o Google Sheets con todas las configuraciones.
          </p>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            Cargar archivo
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>

      {/* Formato esperado */}
      <div className="mt-8 glass-card p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Formato CSV esperado
        </p>
        <div className="overflow-x-auto">
          <code className="text-xs text-emerald-300 whitespace-nowrap block leading-relaxed">
            r1912,r1913,r1915,r1925,r1927,r1932[0],r1932[1],r1934[0],r1936,r1948,Corriente,Amperaje
            <br />
            1.2,2.0,1.9,2.01,4.5,5.4,6.5,2.3,1.2,3.4,20,10
            <br />
            1.1,2.1,1.8,2.10,4.6,5.3,6.0,2.2,1.1,3.3,18,14
          </code>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Cada fila es una configuración (P1, P2 …). Acepta separador por coma o punto y coma.
        </p>
      </div>
    </div>
  );
}
