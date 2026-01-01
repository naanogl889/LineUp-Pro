
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameMode, Player, TeamID, Position } from './types';
import { Header } from './components/Header';
import { SetupForm } from './components/SetupForm';
import { TeamView } from './components/TeamView';

const LOCAL_STORAGE_KEY = 'lineup-pro-state-v6';

interface PlayerData {
  name: string;
  rating: number;
  position: Position;
}

const App: React.FC = () => {
  const [playersData, setPlayersData] = useState<PlayerData[]>([]);
  const [mode, setMode] = useState<GameMode>(GameMode.F5);
  const [team1, setTeam1] = useState<Player[]>([]);
  const [team2, setTeam2] = useState<Player[]>([]);
  const [team1Color, setTeam1Color] = useState<string>('');
  const [team2Color, setTeam2Color] = useState<string>('');
  const [view, setView] = useState<'setup' | 'organize'>('setup');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; team: TeamID } | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.playersData)) setPlayersData(parsed.playersData);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.team1Color) setTeam1Color(parsed.team1Color);
        if (parsed.team2Color) setTeam2Color(parsed.team2Color);
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ playersData, mode, team1Color, team2Color }));
  }, [playersData, mode, team1Color, team2Color]);

  const generatePlayers = (data: PlayerData[]): Player[] => {
    return data.map((p, index) => ({
      id: `p-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: p.name,
      rating: p.rating,
      position: p.position
    }));
  };

  const handleStartRandom = () => {
    if (playersData.length < 2) return;
    const players = generatePlayers(playersData);
    
    const groups: Record<Position, Player[]> = {
      'POR': [], 'DEF': [], 'MED': [], 'DEL': [], 'N/A': []
    };

    players.forEach(p => groups[p.position].push(p));

    const t1: Player[] = [];
    const t2: Player[] = [];
    let score1 = 0;
    let score2 = 0;

    const positionOrder: Position[] = ['POR', 'DEF', 'MED', 'DEL', 'N/A'];
    
    positionOrder.forEach(pos => {
      const sortedGroup = groups[pos]
        .sort(() => Math.random() - 0.5)
        .sort((a, b) => b.rating - a.rating);

      sortedGroup.forEach(player => {
        if (score1 < score2) {
          t1.push(player);
          score1 += player.rating;
        } else if (score2 < score1) {
          t2.push(player);
          score2 += player.rating;
        } else {
          if (t1.length <= t2.length) {
            t1.push(player);
            score1 += player.rating;
          } else {
            t2.push(player);
            score2 += player.rating;
          }
        }
      });
    });

    setTeam1(t1);
    setTeam2(t2);
    setView('organize');
  };

  const handleStartManual = () => {
    if (playersData.length < 2) return;
    const players = generatePlayers(playersData);
    const mid = Math.ceil(players.length / 2);
    setTeam1(players.slice(0, mid));
    setTeam2(players.slice(mid));
    setView('organize');
  };

  const movePlayer = (playerId: string, from: TeamID, to: TeamID) => {
    let movingPlayer: Player | undefined;

    if (from === 'team1') {
      movingPlayer = team1.find(p => p.id === playerId);
      if (movingPlayer) setTeam1(prev => prev.filter(p => p.id !== playerId));
    } else {
      movingPlayer = team2.find(p => p.id === playerId);
      if (movingPlayer) setTeam2(prev => prev.filter(p => p.id !== playerId));
    }

    if (!movingPlayer) return;

    if (to === 'team1') setTeam1(prev => [...prev, movingPlayer!]);
    else setTeam2(prev => [...prev, movingPlayer!]);
  };

  const swapPlayers = (p1: { id: string; team: TeamID }, p2: { id: string; team: TeamID }) => {
    const getPlayer = (id: string, team: TeamID) => {
      if (team === 'team1') return team1.find(p => p.id === id);
      return team2.find(p => p.id === id);
    };

    const player1 = getPlayer(p1.id, p1.team);
    const player2 = getPlayer(p2.id, p2.team);

    if (!player1 || !player2) return;

    const newT1 = [...team1];
    const newT2 = [...team2];

    const removeFromTeam = (p: Player, t: TeamID) => {
      if (t === 'team1') {
        const idx = newT1.findIndex(x => x.id === p.id);
        if (idx > -1) newT1.splice(idx, 1);
      } else {
        const idx = newT2.findIndex(x => x.id === p.id);
        if (idx > -1) newT2.splice(idx, 1);
      }
    };

    const addToTeam = (p: Player, t: TeamID) => {
      if (t === 'team1') newT1.push(p);
      else newT2.push(p);
    };

    removeFromTeam(player1, p1.team);
    removeFromTeam(player2, p2.team);
    addToTeam(player1, p2.team);
    addToTeam(player2, p1.team);

    setTeam1(newT1);
    setTeam2(newT2);
    setSelectedPlayer(null);
  };

  const handlePlayerClick = (playerId: string, team: TeamID) => {
    if (!selectedPlayer) {
      setSelectedPlayer({ id: playerId, team });
    } else {
      if (selectedPlayer.id === playerId) {
        setSelectedPlayer(null);
      } else {
        swapPlayers(selectedPlayer, { id: playerId, team });
      }
    }
  };

  const handleBack = () => {
    setView('setup');
    setSelectedPlayer(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-4xl">
        {view === 'setup' ? (
          <SetupForm 
            playersData={playersData}
            setPlayersData={setPlayersData}
            mode={mode}
            setMode={setMode}
            onStartRandom={handleStartRandom}
            onStartManual={handleStartManual}
            team1Color={team1Color}
            setTeam1Color={setTeam1Color}
            team2Color={team2Color}
            setTeam2Color={setTeam2Color}
          />
        ) : (
          <TeamView 
            team1={team1}
            team2={team2}
            mode={mode}
            team1Color={team1Color}
            team2Color={team2Color}
            selectedPlayer={selectedPlayer}
            onPlayerClick={handlePlayerClick}
            onMovePlayer={movePlayer}
            onBack={handleBack}
            onShuffle={handleStartRandom}
          />
        )}
      </main>

      <footer className="py-4 text-center text-slate-400 text-sm border-t border-slate-100">
        LineUp Pro &copy; {new Date().getFullYear()} — Sin fricción, solo fútbol.
      </footer>
    </div>
  );
};

export default App;
