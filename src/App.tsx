/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Heart, Zap, RotateCcw, Trophy, Skull, ChevronRight } from 'lucide-react';
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

  const addLog = (message: string, type: BattleLog['type']) => {
    setLogs(prev => [{ id: Math.random().toString(36).substr(2, 9), message, type }, ...prev].slice(0, 5));
  };

  const selectCharacter = (char: Character) => {
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

    await new Promise(resolve => setTimeout(resolve, 600));

    if (move.type === 'heal') {
      const healAmount = Math.abs(move.damage);
      if (isPlayer) {
        setPlayer(prev => prev ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) } : null);
      } else {
        setEnemy(prev => prev ? { ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount) } : null);
      }
      addLog(`${attacker.name} استعاد ${healAmount} من نقاط الحياة!`, 'heal');
    } else {
      // Calculate damage with some randomness and defense
      const baseDamage = move.damage + (attacker.attack * 0.5);
      const mitigatedDamage = Math.max(5, Math.floor(baseDamage - (defender.defense * 0.3)));
      
      if (isPlayer) {
        setEnemy(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - mitigatedDamage) } : null);
      } else {
        setPlayer(prev => prev ? { ...prev, hp: Math.max(0, prev.hp - mitigatedDamage) } : null);
      }
      addLog(`${defender.name} تلقى ${mitigatedDamage} ضرر!`, 'attack');
    }

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
      } else if (player && player.hp <= 0) {
        setWinner(enemy);
        setGameState(GameState.GAMEOVER);
      }
    }
  }, [player?.hp, enemy?.hp, gameState]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8" dir="rtl">
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
                صراع <span className="text-orange-500">الأنمي</span>
              </motion.h1>
              <p className="text-white/50 uppercase tracking-widest text-sm font-semibold">اختر بطللك</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CHARACTERS.map((char) => (
                <motion.button
                  key={char.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectCharacter(char)}
                  className="relative group overflow-hidden rounded-3xl aspect-[3/4] text-right"
                >
                  <img 
                    src={char.image} 
                    alt={char.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-0 right-0 p-6 w-full">
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
            <div className="relative h-[400px] md:h-[500px] w-full glass-panel overflow-hidden flex items-center justify-between px-8 md:px-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
              
              {/* Player */}
              <motion.div 
                className="relative z-10 flex flex-col items-center"
                animate={isAnimating && isPlayerTurn ? { x: [0, -100, 0] } : {}}
              >
                <div className="relative mb-4">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={player.image} alt={player.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <motion.div 
                    className="absolute -top-4 -left-4 bg-orange-500 text-black font-display px-3 py-1 rounded-lg text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    أنت
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
                <div className="text-6xl md:text-8xl font-display text-white/10 italic">ضد</div>
              </div>

              {/* Enemy */}
              <motion.div 
                className="relative z-10 flex flex-col items-center"
                animate={isAnimating && !isPlayerTurn ? { x: [0, 100, 0] } : {}}
              >
                <div className="relative mb-4">
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/20 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    <img src={enemy.image} alt={enemy.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <motion.div 
                    className="absolute -top-4 -right-4 bg-red-500 text-white font-display px-3 py-1 rounded-lg text-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    الخصم
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
                    الحركات
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${isPlayerTurn ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/50'}`}>
                    {isPlayerTurn ? "دورك الآن" : "الخصم يفكر..."}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {player.moves.map((move) => (
                    <button
                      key={move.name}
                      disabled={!isPlayerTurn || isAnimating}
                      onClick={() => handleMove(move, true)}
                      className="group relative p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-right"
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
                  سجل المعركة
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[150px] pr-2">
                  {logs.map((log) => (
                    <div key={log.id} className="text-xs font-mono flex gap-2">
                      <span className="text-white/20">[{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
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
                {winner.id === player?.id ? 'انتصار' : 'هزيمة'}
              </h1>
              <p className="text-2xl font-display uppercase text-white/50 mb-12">
                {winner.name} هو البطل!
              </p>
              
              <button
                onClick={resetGame}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-display uppercase text-xl hover:bg-orange-500 hover:text-white transition-all mx-auto"
              >
                <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                إعادة اللعب
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
