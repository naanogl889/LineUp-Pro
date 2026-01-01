
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="pitch-gradient text-white py-6 px-4 shadow-lg">
      <div className="container mx-auto max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><path d="M12 12 7.5 7.5"/><path d="M12 12 16.5 16.5"/><path d="m12 12 4.5-4.5"/><path d="m12 12-4.5 4.5"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">LineUp Pro</h1>
            <p className="text-xs text-emerald-100/70">Arma tu partido en 30 segundos</p>
          </div>
        </div>
      </div>
    </header>
  );
};
