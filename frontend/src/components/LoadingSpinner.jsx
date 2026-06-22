import React from 'react';

export default function LoadingSpinner({ mensaje = 'Cargando datos...', oscuro = false, fullscreen = false }) {
  const containerClass = fullscreen
    ? `fixed inset-0 flex flex-col items-center justify-center z-50 p-6 ${
        oscuro ? 'bg-slate-950 text-slate-100' : 'bg-gray-50/80 backdrop-blur-sm text-gray-900'
      }`
    : `flex flex-col items-center justify-center p-8 my-4 w-full ${
        oscuro ? 'text-slate-100' : 'text-gray-900'
      }`;

  const spinnerBorderColor = oscuro
    ? 'border-emerald-500/20 border-t-emerald-400'
    : 'border-indigo-500/20 border-t-indigo-600';

  return (
    <div className={containerClass}>
      <div className="relative flex items-center justify-center">
        {/* Glow effect */}
        <div
          className={`absolute w-12 h-12 rounded-full blur-md opacity-40 animate-pulse ${
            oscuro ? 'bg-emerald-500/30' : 'bg-indigo-500/30'
          }`}
        ></div>
        {/* Spinner */}
        <div className={`w-10 h-10 rounded-full border-4 ${spinnerBorderColor} animate-spin relative z-10`}></div>
      </div>
      {mensaje && (
        <p
          className={`mt-4 text-xs font-semibold tracking-wider uppercase animate-pulse ${
            oscuro ? 'text-slate-400' : 'text-gray-500'
          }`}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
}
