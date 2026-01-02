
import React, { useState } from 'react';
import { Player, TeamID, Position, GameMode } from '../types';

interface TeamViewProps {
  team1: Player[];
  team2: Player[];
  mode: GameMode;
  team1Color?: string;
  team2Color?: string;
  selectedPlayer: { id: string; team: TeamID } | null;
  onPlayerClick: (id: string, team: TeamID) => void;
  onMovePlayer: (id: string, from: TeamID, to: TeamID) => void;
  onBack: () => void;
  onShuffle: () => void;
}

interface PlayerItemProps {
  player: Player;
  team: TeamID;
  isSelected: boolean;
  onPlayerClick: (id: string, team: TeamID) => void;
  onDragStart: (e: React.DragEvent, id: string, from: TeamID) => void;
}

const PlayerItem: React.FC<PlayerItemProps> = ({ player, team, isSelected, onPlayerClick, onDragStart }) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, player.id, team)}
      onClick={() => onPlayerClick(player.id, team)}
      className={`player-card group flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
        isSelected 
        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg scale-[1.02] animate-swap-pulse z-20' 
        : 'bg-white text-slate-700 border-slate-100 hover:border-emerald-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? 'bg-white animate-pulse' : (team === 'team1' ? 'bg-emerald-400' : 'bg-blue-400')}`} />
        <div className="flex flex-col">
          <span className="font-bold truncate text-sm sm:text-base leading-tight">{player.name}</span>
          {player.position !== 'N/A' && (
            <span className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
              {player.position}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isSelected ? (
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-100">
            <span>Swap</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            <div className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              Swap
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TeamStatsSummary: React.FC<{ players: Player[], colorClass: string, label: string }> = ({ players, colorClass, label }) => {
  const totalStars = players.reduce((acc, p) => acc + p.rating, 0);
  const posCounts = players.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const positions: Position[] = ['POR', 'DEF', 'MED', 'DEL'];

  return (
    <div className={`mt-4 p-4 rounded-2xl bg-white/80 border border-white flex flex-col gap-3 shadow-inner`}>
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Balance {label}</span>
        <div className="flex items-center gap-1">
          <span className={`text-base font-black ${colorClass}`}>{totalStars}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={colorClass}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {positions.map(pos => (
          <div key={pos} className={`flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50 border border-slate-100 transition-all ${posCounts[pos] ? 'opacity-100' : 'opacity-40'}`}>
            <span className="text-[8px] font-black text-slate-400 uppercase">{pos}</span>
            <span className="text-xs font-black text-slate-700">{posCounts[pos] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeamView: React.FC<TeamViewProps> = ({
  team1,
  team2,
  mode,
  team1Color,
  team2Color,
  selectedPlayer,
  onPlayerClick,
  onMovePlayer,
  onBack,
  onShuffle
}) => {
  const [copying, setCopying] = useState(false);
  const [dragOverTeam, setDragOverTeam] = useState<TeamID | null>(null);

  const handleCopy = () => {
    const totalStarsT1 = team1.reduce((acc, p) => acc + p.rating, 0);
    const totalStarsT2 = team2.reduce((acc, p) => acc + p.rating, 0);

    const formatTeamList = (team: Player[]) => 
      team.map((p, i) => `${i + 1}. ${p.name} [${p.position === 'N/A' ? '–' : p.position}]`).join('\n');

    const labelT1 = team1Color ? `EQUIPO ${team1Color.toUpperCase()}` : 'EQUIPO A';
    const labelT2 = team2Color ? `EQUIPO ${team2Color.toUpperCase()}` : 'EQUIPO B';

    const text = `📍 *PARTIDO CONFIRMADO*
━━━━━━━━━━━━━━━━━━━━━━
⚽ *Modalidad:* Fútbol ${mode}

 *${labelT1}* 
──────────────────────
${formatTeamList(team1)}
📊 *Potencia total:* ${totalStarsT1} ★

 *${labelT2}* 
──────────────────────
${formatTeamList(team2)}
📊 *Potencia total:* ${totalStarsT2} ★

Organizado con *LineUp Pro* 🚀
_Planifica rápido, juega mejor._`;
    
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const onDragStart = (e: React.DragEvent, id: string, from: TeamID) => {
    e.dataTransfer.setData('playerId', id);
    e.dataTransfer.setData('fromTeam', from);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, team: TeamID) => {
    e.preventDefault();
    setDragOverTeam(team);
  };

  const onDrop = (e: React.DragEvent, toTeam: TeamID) => {
    e.preventDefault();
    setDragOverTeam(null);
    const playerId = e.dataTransfer.getData('playerId');
    const fromTeam = e.dataTransfer.getData('fromTeam') as TeamID;

    if (fromTeam !== toTeam) {
      onMovePlayer(playerId, fromTeam, toTeam);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm sticky top-2 z-30">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          Atrás
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={onShuffle}
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all"
            title="Equilibrar de nuevo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
            <span className="hidden sm:inline">Re-equilibrar</span>
          </button>
          
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 ${
              copying ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'
            }`}
          >
            {copying ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ¡Hecho!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
        <div 
          onDragOver={(e) => onDragOver(e, 'team1')}
          onDrop={(e) => onDrop(e, 'team1')}
          onDragLeave={() => setDragOverTeam(null)}
          className={`bg-emerald-50/40 rounded-3xl p-5 border-2 transition-all flex flex-col gap-4 ${
            dragOverTeam === 'team1' ? 'border-emerald-400 bg-emerald-100/60 scale-[1.01]' : 'border-emerald-100'
          }`}
        >
          <div className="flex justify-between items-center border-b border-emerald-100 pb-3 mb-1">
            <h3 className="font-extrabold text-emerald-800 text-xl tracking-tight uppercase italic truncate max-w-[150px]">
              {team1Color ? `Equipo ${team1Color}` : 'Equipo A'}
            </h3>
            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {team1.length} Jugadores
            </span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {team1.map(p => (
              <PlayerItem 
                key={p.id} 
                player={p} 
                team="team1" 
                isSelected={selectedPlayer?.id === p.id}
                onPlayerClick={onPlayerClick}
                onDragStart={onDragStart}
              />
            ))}
          </div>
          <TeamStatsSummary players={team1} colorClass="text-emerald-700" label={team1Color || "Equipo A"} />
        </div>

        {/* Team 2 */}
        <div 
          onDragOver={(e) => onDragOver(e, 'team2')}
          onDrop={(e) => onDrop(e, 'team2')}
          onDragLeave={() => setDragOverTeam(null)}
          className={`bg-blue-50/40 rounded-3xl p-5 border-2 transition-all flex flex-col gap-4 ${
            dragOverTeam === 'team2' ? 'border-blue-400 bg-blue-100/60 scale-[1.01]' : 'border-blue-100'
          }`}
        >
          <div className="flex justify-between items-center border-b border-blue-100 pb-3 mb-1">
            <h3 className="font-extrabold text-blue-800 text-xl tracking-tight uppercase italic truncate max-w-[150px]">
              {team2Color ? `Equipo ${team2Color}` : 'Equipo B'}
            </h3>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              {team2.length} Jugadores
            </span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {team2.map(p => (
              <PlayerItem 
                key={p.id} 
                player={p} 
                team="team2" 
                isSelected={selectedPlayer?.id === p.id}
                onPlayerClick={onPlayerClick}
                onDragStart={onDragStart}
              />
            ))}
          </div>
          <TeamStatsSummary players={team2} colorClass="text-blue-700" label={team2Color || "Equipo B"} />
        </div>
      </div>

      {selectedPlayer && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50 border border-slate-700 animate-in slide-in-from-bottom-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest leading-none mb-1 animate-pulse">Modo Intercambio</span>
            <span className="text-sm font-semibold whitespace-nowrap">Toca el segundo jugador para cambiar</span>
          </div>
          <div className="h-8 w-[1px] bg-white/20" />
          <button 
            onClick={() => onPlayerClick(selectedPlayer.id, selectedPlayer.team)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start sm:items-center">
        <div className="bg-emerald-200 text-emerald-700 p-2 rounded-xl flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <p className="text-xs sm:text-sm text-emerald-800 leading-snug">
          <strong>Intercambio Directo:</strong> Toca un jugador y luego otro para intercambiarlos al instante. Las <strong>estrellas totales</strong> y el <strong>conteo por posición</strong> se recalculan para que el partido sea lo más justo posible.
        </p>
      </div>
    </div>
  );
};
