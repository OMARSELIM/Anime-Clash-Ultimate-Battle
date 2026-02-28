import { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'goku',
    name: 'Goku el-Sa\'idi',
    title: 'أقوى واحد في الصعيد',
    image: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=800&auto=format&fit=crop',
    color: '#f59e0b',
    hp: 130,
    maxHp: 130,
    attack: 28,
    defense: 18,
    moves: [
      { name: 'ضربة النبوت', damage: 18, type: 'physical', description: 'ضربة قوية بالنبوت الصعيدي الأصيل.' },
      { name: 'كاميهاميها النار', damage: 45, type: 'special', description: 'طاقة هائلة تطلع من القلب.' },
      { name: 'طعمية السنزو', damage: -35, type: 'heal', description: 'طعمية سخنة بترجع الصحة في ثانية.' }
    ]
  },
  {
    id: 'naruto',
    name: 'Naruto el-Gada\'',
    title: 'بطل الحتة وكل المناطق',
    image: 'https://images.unsplash.com/photo-1578632738980-43318b5c9440?q=80&w=800&auto=format&fit=crop',
    color: '#ea580c',
    hp: 110,
    maxHp: 110,
    attack: 22,
    defense: 12,
    moves: [
      { name: 'ضربة المعلم', damage: 15, type: 'physical', description: 'ضربة سريعة من ابن البلد.' },
      { name: 'راسينجان الملوخية', damage: 38, type: 'special', description: 'دوامة طاقة خضراء جبارة.' },
      { name: 'باور الكشري', damage: -30, type: 'heal', description: 'طبق كشري بالدقة يخليك وحش.' }
    ]
  },
  {
    id: 'luffy',
    name: 'Luffy el-Bahhar',
    title: 'ملك بحري وإسكندرية',
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=800&auto=format&fit=crop',
    color: '#dc2626',
    hp: 120,
    maxHp: 120,
    attack: 24,
    defense: 22,
    moves: [
      { name: 'بستول البحر', damage: 20, type: 'physical', description: 'إيد بتتمط من هنا لإسكندرية.' },
      { name: 'ريد هوك الفحم', damage: 40, type: 'special', description: 'ضربة نار كأنها طالعة من شواية.' },
      { name: 'أكلة سمك', damage: -25, type: 'heal', description: 'وجبة سي فود ترد الروح.' }
    ]
  },
  {
    id: 'knight-moon',
    name: 'Fares el-Qamar',
    title: 'حارس النيل والليل',
    image: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=800&auto=format&fit=crop',
    color: '#94a3b8',
    hp: 125,
    maxHp: 125,
    attack: 26,
    defense: 20,
    moves: [
      { name: 'خبطة الهلال', damage: 22, type: 'physical', description: 'ضربة قوية زي موج النيل.' },
      { name: 'شعاع الأهرامات', damage: 48, type: 'special', description: 'طاقة قديمة من قلب الهرم.' },
      { name: 'شاي العصاري', damage: -32, type: 'heal', description: 'كوباية شاي تعدل الدماغ وتداوي الجروح.' }
    ]
  }
];
