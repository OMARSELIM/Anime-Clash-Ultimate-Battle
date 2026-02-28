/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Heart, Zap, RotateCcw, Trophy, Skull, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { GameState, Character, Move, BattleLog } from './types';
import { CHARACTERS } from './constants';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.SELECTION);
  const [player, setPlayer] = useState<Character | null>(null);
  const [enemy, setEnemy] = useState<Character | null>(null);
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [winner, setWinner] = useState<Character | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [battleEffect, setBattleEffect] = useState<{ type: 'attack' | 'special' | 'heal' | null, target: 'player' | 'enemy' | null }>({ type: null, target: null });
  const [floatingText, setFloatingText] = useState<{ text: string, target: 'player' | 'enemy', id: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isHurtPlayer, setIsHurtPlayer] = useState(false);
  const [isHurtEnemy, setIsHurtEnemy] = useState(false);
  const [hitSpark, setHitSpark] = useState<'player' | 'enemy' | null>(null);

  const playSound = useCallback((type: 'attack' | 'special' | 'heal' | 'select' | 'victory') => {
    if (isMuted) return;
    
    const sounds = {
      attack: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      special: 'https://assets.mixkit.co/active_storage/sfx/2593/2593-preview.mp3',
      heal: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      select: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      victory: 'https://assets.mixkit.co/active_storage/sfx/2581/2581-preview.mp3'
    };

    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Ignore autoplay restrictions
  }, [isMuted]);

  const addLog = (message: string, type: BattleLog['type']) => {
    setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), message, type }, ...prev].slice(0, 5));
  };

  const selectCharacter = (char: Character) => {
    playSound('select');
    setPlayer({ ...char });
    // Randomly select an enemy that is not the player
    const availableEnemies = CHARACTERS.filter(c => c.id !== char.id);
    const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    setEnemy({ ...randomEnemy });
    setGameState(GameState.BATTLE);
    setLogs([{ id: 'start', message: `بدأت المعركة: ${char.name} ضد ${randomEnemy.name}!`, type: 'system' }]);
  };

  const resetGame = () => {
    setGameState(GameState.SELECTION);
    setPlayer(null);
    setEnemy(null);
    setLogs([]);
    setIsPlayerTurn(true);
    setWinner(null);
  };

  const handleMove = async (move: Move, isPlayer: boolean) => {
    if (isAnimating || !player || !enemy) return;
    
    setIsAnimating(true);
    const attacker = isPlayer ? player : enemy;
    const defender = isPlayer ? enemy : player;
    
    addLog(`${attacker.name} استخدم ${move.name}!`, move.type === 'heal' ? 'heal' : 'attack');
    
    // Play sound based on move type
    if (move.type === 'heal') playSound('heal');
    else if (move.type === 'special') playSound('special');
    else playSound('attack');

    // Trigger visual effect
    setBattleEffect({ type: move.type as any, target: isPlayer ? 'enemy' : 'player' });
    setTimeout(() => setBattleEffect({ type: null, target: null }), 500);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (move.type === 'heal') {
      const healAmount = Math.abs(move.damage);
      if (isPlayer) {
        setPlayer(prev => prev ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) } : null);
      } else {
        setEnemy(prev => prev ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) } : null);
      }
      addLog(`${attacker.name} رجع ${healAmount} من صحته!`, 'heal');
      setFloatingText({ text: `+${healAmount}`, target: isPlayer ? 'player' : 'enemy', id: Date.now() });
    } else {
      // Show hit spark and hurt state
      setHitSpark(isPlayer ? 'enemy' : 'player');
      if (isPlayer) setIsHurtEnemy(true);
      else setIsHurtPlayer(true);

      setTimeout(() => {
        setHitSpark(null);
        setIsHurtEnemy(false);
        setIsHurtPlayer(false);
      }, 400);

      // Calculate damage with some randomness and defense
      const baseDamage = move.damage + (attacker.attack * 0.5);
      const mitigatedDamage = Math.max(5, Math.floor(baseDamage - (defender.defense * 0.3)));
      
      if (isPlayer) {
        setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - mitigatedDamage) } : null);
      } else {
        setPlayer(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - mitigatedDamage) } : null);
      }
      addLog(`${defender.name} خد ${mitigatedDamage} ضرر!`, 'attack');
      setFloatingText({ text: `-${mitigatedDamage}`, target: isPlayer ? 'enemy' : 'player', id: Date.now() });
      
      // Trigger screen shake on damage
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setTimeout(() => setFloatingText(null), 1000);

    setIsAnimating(false);
    setIsPlayerTurn(!isPlayer);
  };

  // Enemy AI
  useEffect(() => {
    if (!isPlayerTurn && gameState === GameState.BATTLE && !isAnimating && enemy && player) {
      const timer = setTimeout(() => {
        // Simple AI: Heal if low HP, otherwise random attack
        let move;
        if (enemy.hp < enemy.maxHp * 0.3 && Math.random() > 0.3) {
          move = enemy.moves.find(m => m.type === 'heal') || enemy.moves[0];
        } else {
          const attackMoves = enemy.moves.filter(m => m.type !== 'heal');
          move = attackMoves[Math.floor(Math.random() * attackMoves.length)];
        }
        handleMove(move, false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, isAnimating, enemy, player]);

  // Check for win/loss
  useEffect(() => {
    if (gameState === GameState.BATTLE) {
      if (enemy && enemy.hp <= 0) {
        setWinner(player);
        setGameState(GameState.GAMEOVER);
        playSound('victory');
      } else if (player && player.hp <= 0) {
        setWinner(enemy);
        setGameState(GameState.GAMEOVER);
      }
    }
  }, [player?.hp, enemy?.hp, gameState, playSound, player, enemy]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Mute Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-50 p-3 glass-panel hover:bg-white/10 transition-all"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-orange-500" />}
      </button>

      <AnimatePresence mode="wait">
        {gameState === GameState.SELECTION && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-6xl"
          >
            <div className="text-center mb-12">
              <motion.h1 
                className="text-7xl md:text-9xl font-display uppercase tracking-tighter leading-none mb-4"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                صراع <span className="text-orange-500">الجبابرة</span>
              </motion.h1>
              <p className="text-white/50 uppercase tracking-widest text-sm font-semibold">اختار بطلك يا معلم</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CHARACTERS.map((char) => (
                <motion.button
                  key={char.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectCharacter(char)}
                  className="relative group overflow-hidden rounded-3xl aspect-[3/4] text-left"
                >
                  <img 
                    src={char.image} 
                    alt={char.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/50 mb-1">{char.title}</p>
                    <h3 className="text-3xl font-display uppercase leading-none mb-2">{char.name}</h3>
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Swords className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-mono text-white/70 uppercase">هجوم: {char.attack}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-mono text-white/70 uppercase">دفاع: {char.defense}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${(char.attack / 30) * 100}%` }} />
                      </div>
                      <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(char.defense / 30) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === GameState.BATTLE && player && enemy && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl flex flex-col gap-8"
          >
            {/* Battle Arena */}
            <div className={`relative h-[400px] md:h-[500px] w-full glass-panel overflow-hidden flex items-center justify-between px-8 md:px-20 transition-transform duration-100 ${isShaking ? 'animate-shake' : ''}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
              
              {/* Effect Overlays */}
              <AnimatePresence>
                {battleEffect.type && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 z-20 pointer-events-none flex items-center justify-center ${
                      battleEffect.type === 'heal' ? 'bg-green-500/10' : 
                      battleEffect.type === 'special' ? 'bg-orange-500/20' : 
                      'bg-white/5'
                    }`}
                  >
                    {battleEffect.type === 'special' && (
                      <motion.div 
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: [1, 2, 1.5], rotate: [0, 90, 180] }}
                        className="w-64 h-64 border-4 border-orange-500/30 rounded-full flex items-center justify-center"
                      >
                        <Zap className="w-32 h-32 text-orange-500 animate-pulse" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Player */}
              <motion.div 
                className="relative z-10 flex flex-col items-center"
                animate={
                  isAnimating && isPlayerTurn ? { x: [0, 150, 0], scale: [1, 1.1, 1] } : 
                  isHurtPlayer ? { x: [0, -10, 10, -10, 0], filter: ['brightness(1)', 'brightness(2) saturate(2) hue-rotate(300deg)', 'brightness(1)'] } : 
                  {}
                }
                transition={{ duration: isAnimating ? 0.4 : 0.1 }}
              >
                <div className="relative mb-4">
                  {/* Hit Spark */}
                  <AnimatePresence>
                    {hitSpark === 'player' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-32 h-32 bg-white rounded-full blur-xl opacity-50" />
                        <Swords className="w-16 h-16 text-white absolute" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Text */}
                  <AnimatePresence>
                    {floatingText && floatingText.target === 'player' && (
                      <motion.div
                        key={floatingText.id}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -50 }}
                        exit={{ opacity: 0 }}
                        className={`absolute -top-12 left-1/2 -translate-x-1/2 text-3xl font-display z-30 ${floatingText.text.startsWith('+') ? 'text-green-400' : 'text-red-500'}`}
                      >
                        {floatingText.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <motion.div 
                    className="absolute -top-4 -right-4 bg-orange-500 text-black font-display px-3 py-1 rounded-lg text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    P1
                  </motion.div>
                </div>
                <h2 className="text-2xl font-display uppercase mb-2">{player.name}</h2>
                <div className="w-48 h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  />
                </div>
                <p className="font-mono text-xs mt-1 text-white/50">{player.hp} / {player.maxHp} HP</p>
              </motion.div>

              {/* VS */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-6xl md:text-8xl font-display text-white/10 italic">VS</div>
              </div>

              {/* Enemy */}
              <motion.div 
                className="relative z-10 flex flex-col items-center"
                animate={
                  isAnimating && !isPlayerTurn ? { x: [0, -150, 0], scale: [1, 1.1, 1] } : 
                  isHurtEnemy ? { x: [0, 10, -10, 10, 0], filter: ['brightness(1)', 'brightness(2) saturate(2) hue-rotate(300deg)', 'brightness(1)'] } : 
                  {}
                }
                transition={{ duration: isAnimating ? 0.4 : 0.1 }}
              >
                <div className="relative mb-4">
                  {/* Hit Spark */}
                  <AnimatePresence>
                    {hitSpark === 'enemy' && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 2, 0], opacity: [0, 1, 0] }}
                        className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-32 h-32 bg-white rounded-full blur-xl opacity-50" />
                        <Swords className="w-16 h-16 text-white absolute" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Text */}
                  <AnimatePresence>
                    {floatingText && floatingText.target === 'enemy' && (
                      <motion.div
                        key={floatingText.id}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -50 }}
                        exit={{ opacity: 0 }}
                        className={`absolute -top-12 left-1/2 -translate-x-1/2 text-3xl font-display z-30 ${floatingText.text.startsWith('+') ? 'text-green-400' : 'text-red-500'}`}
                      >
                        {floatingText.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={enemy.image} alt={enemy.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <motion.div 
                    className="absolute -top-4 -left-4 bg-red-500 text-white font-display px-3 py-1 rounded-lg text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    CPU
                  </motion.div>
                </div>
                <h2 className="text-2xl font-display uppercase mb-2">{enemy.name}</h2>
                <div className="w-48 h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                  />
                </div>
                <p className="font-mono text-xs mt-1 text-white/50">{enemy.hp} / {enemy.maxHp} HP</p>
              </motion.div>
            </div>

            {/* Controls & Logs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 glass-panel p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display uppercase text-xl flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    اضرب يا معلم
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${isPlayerTurn ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/50'}`}>
                    {isPlayerTurn ? "دورك يا بطل" : "الخصم بيفكر..."}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {player.moves.map((move) => (
                    <button
                      key={move.name}
                      disabled={!isPlayerTurn || isAnimating}
                      onClick={() => handleMove(move, true)}
                      className="group relative p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display uppercase text-lg">{move.name}</span>
                        {move.type === 'physical' && <Swords className="w-4 h-4 text-white/40" />}
                        {move.type === 'special' && <Zap className="w-4 h-4 text-orange-400" />}
                        {move.type === 'heal' && <Heart className="w-4 h-4 text-green-400" />}
                      </div>
                      <p className="text-[10px] text-white/40 leading-tight">{move.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 flex flex-col">
                <h3 className="font-display uppercase text-xl mb-4 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-white/40" />
                  إيه اللي بيحصل؟
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[150px] pr-2">
                  {logs.map((log) => (
                    <div key={log.id} className="text-xs font-mono flex gap-2">
                      <span className="text-white/20">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      <span className={
                        log.type === 'attack' ? 'text-red-400' : 
                        log.type === 'heal' ? 'text-green-400' : 
                        log.type === 'special' ? 'text-orange-400' : 
                        'text-blue-400'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === GameState.GAMEOVER && winner && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {winner.id === player?.id ? (
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
              ) : (
                <Skull className="w-24 h-24 text-red-500 mx-auto mb-6" />
              )}
              <h1 className="text-8xl md:text-9xl font-display uppercase mb-4">
                {winner.id === player?.id ? 'وحش الكون' : 'هارد لك'}
              </h1>
              <p className="text-2xl font-display uppercase text-white/50 mb-12">
                {winner.name} هو المعلم الكبير!
              </p>
              
              <button
                onClick={resetGame}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-display uppercase text-xl hover:bg-orange-500 hover:text-white transition-all mx-auto"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                العب تاني
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
