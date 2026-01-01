
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GameMode, Position } from '../types';

interface PlayerData {
  name: string;
  rating: number;
  position: Position;
}

interface SetupFormProps {
  playersData: PlayerData[];
  setPlayersData: React.Dispatch<React.SetStateAction<PlayerData[]>>;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  onStartRandom: () => void;
  onStartManual: () => void;
  team1Color: string;
  setTeam1Color: (c: string) => void;
  team2Color: string;
  setTeam2Color: (c: string) => void;
}

const POSITIONS: Position[] = ['POR', 'DEF', 'MED', 'DEL', 'N/A'];
const COLOR_OPTIONS = [
  { label: 'Blanco', value: 'Blanco' },
  { label: 'Negro', value: 'Negro' },
  { label: 'Rojo', value: 'Rojo' },
  { label: 'Azul', value: 'Azul' },
  { label: 'Verde', value: 'Verde' },
  { label: 'Amarillo', value: 'Amarillo' },
  { label: 'Naranja', value: 'Naranja' },
];

export const SetupForm: React.FC<SetupFormProps> = ({
  playersData,
  setPlayersData,
  mode,
  setMode,
  onStartRandom,
  onStartManual,
  team1Color,
  setTeam1Color,
  team2Color,
  setTeam2Color,
}) => {
  const [currentName, setCurrentName] = useState('');
  const [currentRating, setCurrentRating] = useState(3);
  const [currentPosition, setCurrentPosition] = useState<Position>('N/A');
  
  const [batchQueue, setBatchQueue] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const playerCount = playersData.length;
  const minPlayers = mode * 2;
  const isEnough = playerCount >= 2;

  const handleAddPlayer = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = currentName.trim();
    if (!name) return;

    if (playersData.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert('Este jugador ya está en la lista');
      return;
    }

    setPlayersData(prev => [...prev, { name, rating: currentRating, position: currentPosition }]);
    setCurrentName('');
    setCurrentPosition('N/A');
    setCurrentRating(3);
    inputRef.current?.focus();
  };

  const handleNextInBatch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (batchQueue.length === 0) return;

    const name = batchQueue[0];
    if (playersData.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setBatchQueue(prev => prev.slice(1));
      return;
    }

    setPlayersData(prev => [...prev, { name, rating: currentRating, position: currentPosition }]);
    
    if (batchQueue.length === 1) {
      setIsBatchMode(false);
      setBatchQueue([]);
    } else {
      setBatchQueue(prev => prev.slice(1));
    }

    setCurrentRating(3);
    setCurrentPosition('N/A');
  };

  const handleRemovePlayer = (nameToRemove: string) => {
    setPlayersData(prev => prev.filter(p => p.name !== nameToRemove));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const names = pastedData
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (names.length > 1) {
      setBatchQueue(names);
      setIsBatchMode(true);
      setCurrentRating(3);
      setCurrentPosition('N/A');
    } else if (names.length === 1) {
      setCurrentName(names[0]);
    }
  };

  const RatingSelector = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
            value === num 
            ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' 
            : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  );

  const PositionSelector = ({ value, onChange }: { value: Position, onChange: (v: Position) => void }) => (
    <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
      {POSITIONS.map((pos) => (
        <button
          key={pos}
          type="button"
          onClick={() => onChange(pos)}
          className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${
            value === pos 
            ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' 
            : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {pos}
        </button>
      ))}
    </div>
  );

  if (isBatchMode) {
    const currentBatchName = batchQueue[0];
    return (
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-xl shadow-emerald-100 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Configurando Jugadores
          </h3>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-200">
            {batchQueue.length} restantes
          </span>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
          <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest mb-1">Nombre</p>
          <h4 className="text-3xl font-black text-emerald-900">{currentBatchName}</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Nivel (1-5)</label>
            <RatingSelector value={currentRating} onChange={setCurrentRating} />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase px-1">Posición</label>
            <PositionSelector value={currentPosition} onChange={setCurrentPosition} />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => { setIsBatchMode(false); setBatchQueue([]); }}
            className="flex-grow py-4 px-6 rounded-2xl font-bold text-slate-400 border-2 border-slate-100 hover:bg-slate-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleNextInBatch}
            className="flex-grow-[2] py-4 px-6 rounded-2xl font-bold text-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
          >
            {batchQueue.length === 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
          1. Modo de Juego
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(GameMode) as Array<keyof typeof GameMode>).filter(k => isNaN(Number(k))).map((key) => {
            const val = GameMode[key as any] as unknown as number;
            const isSelected = mode === val;
            return (
              <button
                key={key}
                onClick={() => setMode(val as GameMode)}
                className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  isSelected 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md scale-[1.02]' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className="text-lg font-bold">Fútbol {val}</span>
                <span className="text-[10px] opacity-70 uppercase font-medium">{val} vs {val}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
          2. Colores (Opcional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Color Equipo A</span>
            <select 
              value={team1Color} 
              onChange={(e) => setTeam1Color(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 py-3 px-4 rounded-xl text-slate-600 font-bold focus:border-emerald-500 transition-colors"
            >
              <option value="">Por defecto (Equipo A)</option>
              {COLOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Color Equipo B</span>
            <select 
              value={team2Color} 
              onChange={(e) => setTeam2Color(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 py-3 px-4 rounded-xl text-slate-600 font-bold focus:border-emerald-500 transition-colors"
            >
              <option value="">Por defecto (Equipo B)</option>
              {COLOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wider">
            3. Jugadores
          </label>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              playerCount >= minPlayers 
              ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' 
              : 'bg-slate-100 text-slate-500'
            }`}>
              {playerCount} / {minPlayers} ideal
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              onPaste={handlePaste}
              placeholder="escribe o pega una lista con los jugadores"
              className="flex-grow py-4 px-5 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 transition-colors text-slate-700 text-lg shadow-sm placeholder:text-slate-300"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl">
            <div className="w-full sm:w-auto flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Nivel</span>
              <RatingSelector value={currentRating} onChange={setCurrentRating} />
            </div>
            <div className="w-full sm:w-auto flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Posición</span>
              <PositionSelector value={currentPosition} onChange={setCurrentPosition} />
            </div>
            <button
              onClick={() => handleAddPlayer()}
              disabled={!currentName.trim()}
              className="w-full sm:w-auto sm:ml-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider"
            >
              Añadir
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 min-h-[120px] max-h-[400px] overflow-y-auto">
          {playerCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-20"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              <p className="text-sm font-bold">Agrega jugadores con su nivel y posición</p>
              <p className="text-[10px] mt-1 opacity-70 italic">Tip: Pega una lista para asignar niveles en lote</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {playersData.map((p, index) => (
                <div 
                  key={index}
                  className="bg-white border border-slate-200 pl-4 pr-2 py-2.5 rounded-xl flex items-center justify-between shadow-sm group animate-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-[9px] font-black bg-slate-800 text-white w-8 py-0.5 text-center rounded">
                      {p.position !== 'N/A' ? p.position : '--'}
                    </span>
                    <span className="text-slate-700 font-bold text-sm truncate">{p.name}</span>
                    <span className="text-[10px] text-emerald-600 font-black">
                      {p.rating}★
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemovePlayer(p.name)}
                    className="text-slate-300 hover:text-red-500 p-1 transition-colors ml-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <button
          onClick={onStartRandom}
          disabled={!isEnough}
          className={`flex flex-col items-center justify-center py-5 px-6 rounded-2xl font-black text-lg transition-all ${
            isEnough 
            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
            <span>Generar Equilibrado</span>
          </div>
          <span className="text-[10px] opacity-70 uppercase tracking-tighter">Nivel + Posición</span>
        </button>
        <button
          onClick={onStartManual}
          disabled={!isEnough}
          className={`flex flex-col items-center justify-center py-5 px-6 rounded-2xl font-black text-lg transition-all ${
            isEnough 
            ? 'bg-white text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-50 shadow-sm active:scale-95' 
            : 'bg-white text-slate-300 border-2 border-slate-200 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21 14-8-3V4c0-1.1-.9-2-2-2s-2 .9-2 2v10l-4-1c-1-.3-2 .4-2.3 1.4-.2.8.2 1.6 1 1.9l5.3 2.1c.5.2 1 .3 1.5.3H18c1.7 0 3-1.3 3-3v-2Z"/></svg>
            <span>Repartir Manualmente</span>
          </div>
          <span className="text-[10px] opacity-70 uppercase tracking-tighter">Organiza tú mismo</span>
        </button>
      </div>
    </div>
  );
};
