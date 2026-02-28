import { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'goku',
    name: 'Son Goku',
    title: 'The Legendary Super Saiyan',
    image: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=800&auto=format&fit=crop', // Placeholder for Goku-like vibe
    color: '#f59e0b', // Orange
    hp: 120,
    maxHp: 120,
    attack: 25,
    defense: 15,
    moves: [
      { name: 'Punch', damage: 15, type: 'physical', description: 'A standard martial arts strike.' },
      { name: 'Kamehameha', damage: 40, type: 'special', description: 'A powerful energy blast.' },
      { name: 'Senzu Bean', damage: -30, type: 'heal', description: 'Heals wounds instantly.' }
    ]
  },
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    title: 'The Seventh Hokage',
    image: 'https://images.unsplash.com/photo-1578632738980-43318b5c9440?q=80&w=800&auto=format&fit=crop', // Placeholder for Naruto vibe
    color: '#ea580c', // Darker Orange
    hp: 100,
    maxHp: 100,
    attack: 20,
    defense: 10,
    moves: [
      { name: 'Kunai Throw', damage: 12, type: 'physical', description: 'Quick projectile attack.' },
      { name: 'Rasengan', damage: 35, type: 'special', description: 'A swirling ball of chakra.' },
      { name: 'Nine-Tails Chakra', damage: -25, type: 'heal', description: 'Rapid regeneration.' }
    ]
  },
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    title: 'Future King of the Pirates',
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop', // Placeholder for Luffy vibe
    color: '#dc2626', // Red
    hp: 110,
    maxHp: 110,
    attack: 22,
    defense: 20,
    moves: [
      { name: 'Pistol', damage: 18, type: 'physical', description: 'Stretching punch.' },
      { name: 'Red Hawk', damage: 38, type: 'special', description: 'Fire-infused strike.' },
      { name: 'Meat Feast', damage: -20, type: 'heal', description: 'Eating to recover energy.' }
    ]
  },
  {
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    title: 'Substitute Shinigami',
    image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=800&auto=format&fit=crop', // Placeholder for Ichigo vibe
    color: '#4f46e5', // Indigo
    hp: 95,
    maxHp: 95,
    attack: 28,
    defense: 12,
    moves: [
      { name: 'Slash', damage: 20, type: 'physical', description: 'A quick sword strike.' },
      { name: 'Getsuga Tensho', damage: 45, type: 'special', description: 'A massive wave of spiritual energy.' },
      { name: 'Soul Focus', damage: -15, type: 'heal', description: 'Calming the spirit to heal.' }
    ]
  },
  {
    id: 'knight-moon',
    name: 'Knight Moon',
    title: 'The Lunar Guardian',
    image: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=800&auto=format&fit=crop',
    color: '#94a3b8',
    hp: 115,
    maxHp: 115,
    attack: 24,
    defense: 18,
    moves: [
      { name: 'Lunar Strike', damage: 18, type: 'physical', description: 'A heavy strike infused with lunar energy.' },
      { name: 'Crescent Beam', damage: 42, type: 'special', description: 'A concentrated beam of moonlight.' },
      { name: 'Moonlight Grace', damage: -28, type: 'heal', description: 'Bathing in moonlight to heal wounds.' }
    ]
  }
];
