// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import {
  Train,
  GraduationCap,
  Music,
  BookOpen,
  Users,
  Clock,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Send,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  Calendar as CalendarIcon,
  MessageSquare,
  EyeOff,
  Repeat,
  Moon,
  Coffee,
  Palette,
  Briefcase,
  Snowflake,
  Sparkles
} from 'lucide-react';

// Конфигурация Firebase (проект amaliia-plan)
const firebaseConfig = {
  apiKey: "AIzaSyA1yrxFQboFkLj43d5CvqOVMhp9D7h8ER8",
  authDomain: "amaliia-plan.firebaseapp.com",
  projectId: "amaliia-plan",
  storageBucket: "amaliia-plan.firebasestorage.app",
  messagingSenderId: "885798349431",
  appId: "1:885798349431:web:2dcbec4a433e3354657472",
  measurementId: "G-LHHWD28D8B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DAYS = [
  { id: 1, short: 'Пн', full: 'Понедельник' },
  { id: 2, short: 'Вт', full: 'Вторник' },
  { id: 3, short: 'Ср', full: 'Среда' },
  { id: 4, short: 'Чт', full: 'Четверг' },
  { id: 5, short: 'Пт', full: 'Пятница' },
  { id: 6, short: 'Сб', full: 'Суббота' },
  { id: 0, short: 'Вс', full: 'Воскресенье' }
];

// 5 новогодних и фирменных игрушек для ёлки
const ORNAMENTS = [
  {
    id: 'heart',
    label: 'Сердечко',
    symbol: '❤️',
    bg: 'radial-gradient(circle at 30% 30%, #e87a90, #8f2d42)',
    glow: '0 0 12px rgba(232, 122, 144, 0.7)',
    border: 'border-[#f4a6b5]/70'
  },
  {
    id: 'physics',
    label: 'E=mc²',
    symbol: 'E=mc²',
    bg: 'radial-gradient(circle at 30% 30%, #6894b8, #273e54)',
    glow: '0 0 12px rgba(125, 174, 214, 0.7)',
    border: 'border-[#9ec7e8]/70'
  },
  {
    id: 'snowflake',
    label: 'Снежинка',
    symbol: '❄️',
    bg: 'radial-gradient(circle at 30% 30%, #9ad4e6, #356375)',
    glow: '0 0 12px rgba(154, 212, 230, 0.75)',
    border: 'border-[#cceef7]/75'
  },
  {
    id: 'gingerbread',
    label: 'Пряник',
    symbol: '🍪',
    bg: 'radial-gradient(circle at 30% 30%, #d4945a, #73431c)',
    glow: '0 0 12px rgba(212, 148, 90, 0.7)',
    border: 'border-[#f0c79e]/70'
  },
  {
    id: 'star',
    label: 'Огонёк',
    symbol: '✨',
    bg: 'radial-gradient(circle at 30% 30%, #f5c96b, #8f6519)',
    glow: '0 0 14px rgba(245, 201, 107, 0.85)',
    border: 'border-[#fae1a5]/75'
  }
];

// Координаты ветвей ёлки (в процентах), чтобы игрушки красиво висели по ярусам
const TREE_SLOTS = [
  { x: 50, y: 24 },
  { x: 42, y: 36 },
  { x: 58, y: 37 },
  { x: 36, y: 49 },
  { x: 50, y: 48 },
  { x: 64, y: 50 },
  { x: 31, y: 62 },
  { x: 44, y: 61 },
  { x: 57, y: 62 },
  { x: 69, y: 63 },
  { x: 27, y: 75 },
  { x: 40, y: 74 },
  { x: 53, y: 75 },
  { x: 65, y: 74 },
  { x: 74, y: 76 }
];

// Приглушённые вечерние оттенки категорий, гармонирующие с тёплыми огнями и вечерним небом
const CATEGORIES = {
  transit: {
    label: 'ÖBB / Дорога',
    friendStatus: 'В поезде / дороге в Линц',
    hex: '#365873',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(54, 88, 115, 0.42) 0%, rgba(25, 38, 52, 0.88) 100%)',
      borderColor: 'rgba(126, 175, 214, 0.35)'
    },
    badge: 'bg-[#365873]/55 text-[#c7e3fa] border border-[#7eafd6]/30',
    icon: Train
  },
  jku: {
    label: 'JKU Linz',
    friendStatus: 'На паре в JKU Linz',
    hex: '#574a7a',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(87, 74, 122, 0.44) 0%, rgba(38, 32, 54, 0.88) 100%)',
      borderColor: 'rgba(166, 148, 214, 0.35)'
    },
    badge: 'bg-[#574a7a]/55 text-[#dfd6f7] border border-[#a694d6]/30',
    icon: GraduationCap
  },
  khpi: {
    label: 'НТУ «ХПІ»',
    friendStatus: 'Закрывает лабы/контрольные ХПІ',
    hex: '#8a6636',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(138, 102, 54, 0.42) 0%, rgba(56, 41, 24, 0.88) 100%)',
      borderColor: 'rgba(227, 182, 118, 0.38)'
    },
    badge: 'bg-[#8a6636]/55 text-[#f7e1be] border border-[#e3b676]/30',
    icon: BookOpen
  },
  tutoring: {
    label: 'Занятие с Варей',
    friendStatus: 'Помогает Варе с учёбой',
    hex: '#346958',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(52, 105, 88, 0.42) 0%, rgba(24, 48, 41, 0.88) 100%)',
      borderColor: 'rgba(118, 196, 171, 0.36)'
    },
    badge: 'bg-[#346958]/55 text-[#c5ede0] border border-[#76c4ab]/30',
    icon: Users
  },
  vocal: {
    label: 'Вокал / Допы',
    friendStatus: 'На вокале или дополнительных занятиях',
    hex: '#7d4054',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(125, 64, 84, 0.42) 0%, rgba(54, 28, 37, 0.88) 100%)',
      borderColor: 'rgba(214, 129, 157, 0.36)'
    },
    badge: 'bg-[#7d4054]/55 text-[#f5ccd9] border border-[#d6819d]/30',
    icon: Music
  },
  sleep: {
    label: 'Сон',
    friendStatus: 'Спит ❄️ (не будить)',
    hex: '#313d63',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(49, 61, 99, 0.44) 0%, rgba(22, 27, 46, 0.90) 100%)',
      borderColor: 'rgba(122, 143, 207, 0.34)'
    },
    badge: 'bg-[#313d63]/60 text-[#c7d4fa] border border-[#7a8fcf]/30',
    icon: Moon
  },
  rest: {
    label: 'Отдых / Игры / Чилл',
    friendStatus: 'Отдыхает (можно звать в ДС или катку)',
    hex: '#33676e',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(51, 103, 110, 0.42) 0%, rgba(23, 46, 50, 0.88) 100%)',
      borderColor: 'rgba(116, 194, 204, 0.36)'
    },
    badge: 'bg-[#33676e]/55 text-[#c4ecf2] border border-[#74c2cc]/30',
    icon: Coffee
  },
  hobby: {
    label: 'Хобби / Творчество',
    friendStatus: 'Занята творчеством / музыкой / рукоделием',
    hex: '#694275',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(105, 66, 117, 0.42) 0%, rgba(46, 29, 52, 0.88) 100%)',
      borderColor: 'rgba(189, 134, 207, 0.36)'
    },
    badge: 'bg-[#694275]/55 text-[#ebd0f5] border border-[#bd86cf]/30',
    icon: Palette
  },
  errands: {
    label: 'Дела / Поручения',
    friendStatus: 'Занята личными делами',
    hex: '#855135',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(133, 81, 53, 0.44) 0%, rgba(54, 33, 23, 0.88) 100%)',
      borderColor: 'rgba(219, 148, 110, 0.38)'
    },
    badge: 'bg-[#855135]/55 text-[#f5d3c1] border border-[#db946e]/30',
    icon: Briefcase
  }
};

const INITIAL_EVENTS = [
  {
    id: 'seed_mon_train',
    day: 1,
    start: '07:19',
    end: '08:13',
    title: 'Поезд ÖBB → JKU Linz',
    location: 'Bad Schallerbach Bstg. 2 → Linz Hbf → JKU',
    details: '07:19 REX 50 (Zug 1777) до Linz Hbf (07:47), пересадка 07:55 Bus 311 → 08:13 JKU Altenberger Str.',
    category: 'transit',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_mon_ue_schr',
    day: 1,
    start: '08:30',
    end: '10:00',
    title: 'UE Deutsch - Schriftliche Produktionen B2',
    location: 'MZ 113B (534.D85)',
    details: 'Также сдача ABGABE KS Deutsch als Fremdsprache B2',
    category: 'jku',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_mon_ue_gram',
    day: 1,
    start: '10:15',
    end: '11:45',
    title: 'UE Deutsch - Grammatik B2',
    location: 'MZ 113B (534.D80)',
    details: 'Практика грамматики B2',
    category: 'jku',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_tue_train',
    day: 2,
    start: '10:40',
    end: '11:41',
    title: 'Поезд ÖBB → JKU Linz',
    location: 'Bad Schallerbach Bstg. 2 → Linz Hbf → JKU',
    details: '10:40 R 51 (Zug 5965) до Linz Hbf (11:10), пересадка 11:17 Tram 2 → 11:41 JKU Schleife',
    category: 'transit',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_tue_physik',
    day: 2,
    start: '12:00',
    end: '13:30',
    title: 'KV Physik (VLG - Teil 2: Waves & Relativity)',
    location: 'P 004 (314.802)',
    details: 'Лекция по физике на английском',
    category: 'jku',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_tue_ks_de',
    day: 2,
    start: '13:45',
    end: '17:00',
    title: 'KS Deutsch als Fremdsprache B2',
    location: 'MZ 201B (534.D75)',
    details: 'Основной курс немецкого B2',
    category: 'jku',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_wed_varya',
    day: 3,
    start: '14:30',
    end: '15:30',
    title: 'Занятие с Варей',
    location: 'Помощь с учёбой',
    details: 'Ориентировочно с 14:00 до 15:30 (1 час)',
    category: 'tutoring',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_wed_vocal',
    day: 3,
    start: '17:00',
    end: '18:00',
    title: 'Урок вокала',
    location: '1 час',
    details: 'Академический вокал',
    category: 'vocal',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_wed_de_extra',
    day: 3,
    start: '19:00',
    end: '20:00',
    title: 'Дополнительный немецкий',
    location: '1 час',
    details: 'Индивидуальное занятие B2',
    category: 'vocal',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_thu_train',
    day: 4,
    start: '12:40',
    end: '13:43',
    title: 'Поезд ÖBB → JKU Linz',
    location: 'Bad Schallerbach Bstg. 2 → Linz Hbf → JKU',
    details: '12:40 R 50 (Zug 5919) до Linz Hbf (13:10), пересадка 13:18 Tram 2 → 13:43 JKU Schleife',
    category: 'transit',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_thu_ks_de',
    day: 4,
    start: '13:45',
    end: '17:00',
    title: 'KS Deutsch als Fremdsprache B2',
    location: 'MZ 113B (534.D75)',
    details: 'Основной курс немецкого B2',
    category: 'jku',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  },
  {
    id: 'seed_fri_vocal',
    day: 5,
    start: '15:30',
    end: '16:30',
    title: 'Урок вокала',
    location: '1 час',
    details: 'Занятие по вокалу',
    category: 'vocal',
    isRecurring: true,
    weekKey: 'recurring',
    hiddenWeeks: []
  }
];

const QUICK_PINGS = [
  'Амалия Владимировна, когда там соизволите выйти? ❄️'
];

const SNOWFLAKES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 5) % 98}%`,
  delay: `${(i * 1.1) % 10}s`,
  duration: `${11 + (i % 6) * 2.3}s`,
  size: i % 3 === 0 ? 4 : 2.5,
  opacity: 0.22 + (i % 4) * 0.07
}));

const GARLAND_BULBS = Array.from({ length: 24 }, (_, i) => i);

function getWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatWeekKey(mondayDate) {
  const y = mondayDate.getFullYear();
  const m = String(mondayDate.getMonth() + 1).padStart(2, '0');
  const d = String(mondayDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function groupScheduleBlocks(dayEvents) {
  if (!dayEvents.length) return [];

  const sorted = [...dayEvents].sort((a, b) => {
    const sA = timeToMinutes(a.start);
    const sB = timeToMinutes(b.start);
    if (sA !== sB) return sA - sB;
    return timeToMinutes(b.end) - timeToMinutes(a.end);
  });

  const blocks = [];

  sorted.forEach((ev) => {
    const s = timeToMinutes(ev.start);
    const e = Math.max(s, timeToMinutes(ev.end));

    const parentBlock = blocks.find(
      (b) => s >= b.startMin && e <= b.endMin && !(s === b.startMin && e === b.endMin)
    );

    if (parentBlock) {
      parentBlock.nested.push({ ...ev, startMin: s, endMin: e });
      return;
    }

    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock && s <= lastBlock.endMin) {
      lastBlock.events.push({ ...ev, startMin: s, endMin: e });
      lastBlock.endMin = Math.max(lastBlock.endMin, e);
    } else {
      blocks.push({
        id: `block_${ev.id}`,
        startMin: s,
        endMin: e,
        events: [{ ...ev, startMin: s, endMin: e }],
        nested: []
      });
    }
  });

  return blocks.map((b) => {
    const colors = b.events.map((ev) => (CATEGORIES[ev.category] || CATEGORIES.jku).hex);
    const uniqueColors = [...new Set(colors)];

    let cardStyle;
    if (uniqueColors.length > 1) {
      const stops = uniqueColors
        .map((hex, idx) => {
          const pct = Math.round((idx / (uniqueColors.length - 1)) * 100);
          return `${hex}66 ${pct}%`;
        })
        .join(', ');
      cardStyle = {
        background: `linear-gradient(120deg, ${stops}, rgba(23, 27, 38, 0.90) 100%)`,
        borderColor: `${uniqueColors[0]}88`
      };
    } else {
      const cat = CATEGORIES[b.events[0].category] || CATEGORIES.jku;
      cardStyle = cat.surfaceStyle;
    }

    return {
      ...b,
      startLabel: minutesToTime(b.startMin),
      endLabel: minutesToTime(b.endMin),
      cardStyle,
      isMerged: b.events.length > 1
    };
  });
}

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [events, setEvents] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [pings, setPings] = useState([]);
  const [treeOrnaments, setTreeOrnaments] = useState([]);

  const [ornamentAuthor, setOrnamentAuthor] = useState('');
  const [selectedOrnamentType, setSelectedOrnamentType] = useState('heart');
  const [ornamentAdded, setOrnamentAdded] = useState(false);

  const [weekOffset, setWeekOffset] = useState(0);

  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 1 : d;
  });

  const [newEvent, setNewEvent] = useState({
    day: 1,
    start: '14:00',
    end: '15:30',
    title: '',
    location: '',
    details: '',
    category: 'khpi',
    isRecurring: false
  });

  const [newDeadline, setNewDeadline] = useState({ title: '', course: 'НТУ «ХПІ»', due: '' });

  const [friendName, setFriendName] = useState('');
  const [pingMessage, setPingMessage] = useState('');
  const [pingSent, setPingSent] = useState(false);

  const [customMinutes, setCustomMinutes] = useState(45);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  const [austriaNow, setAustriaNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setAustriaNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const eventsRef = collection(db, 'schedule_events');

    const initAndSubscribe = async () => {
      const snap = await getDocs(eventsRef);
      if (snap.empty) {
        const batch = writeBatch(db);
        INITIAL_EVENTS.forEach((ev) => {
          batch.set(doc(eventsRef, ev.id), ev);
        });
        await batch.commit();
      }
    };

    initAndSubscribe();

    const unsubEvents = onSnapshot(eventsRef, (snapshot) => {
      const seen = new Set();
      const list = [];
      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        const uniqueKey = `${data.day}_${data.start}_${data.title}_${data.weekKey || 'recurring'}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          list.push(data);
        }
      });
      setEvents(list);
    });

    const unsubDeadlines = onSnapshot(collection(db, 'deadlines'), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setDeadlines(list);
    });

    const unsubPings = onSnapshot(collection(db, 'friend_pings'), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPings(list);
    });

    const unsubOrnaments = onSnapshot(collection(db, 'tree_ornaments'), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setTreeOrnaments(list);
    });

    return () => {
      unsubEvents();
      unsubDeadlines();
      unsubPings();
      unsubOrnaments();
    };
  }, [user]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const activeMonday = useMemo(() => {
    const base = getWeekMonday(austriaNow);
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }, [austriaNow, weekOffset]);

  const activeWeekKey = formatWeekKey(activeMonday);
  const activeKW = getISOWeekNumber(activeMonday);

  const weekDatesMap = useMemo(() => {
    const map = {};
    DAYS.forEach((d, idx) => {
      const dt = new Date(activeMonday);
      dt.setDate(activeMonday.getDate() + idx);
      map[d.id] = `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}`;
    });
    return map;
  }, [activeMonday]);

  const weekEvents = useMemo(() => {
    return events
      .filter((ev) => {
        if (ev.hiddenWeeks && ev.hiddenWeeks.includes(activeWeekKey)) return false;
        if (ev.isRecurring || ev.weekKey === 'recurring') return true;
        return ev.weekKey === activeWeekKey;
      })
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [events, activeWeekKey]);

  const selectedDayEvents = useMemo(
    () => weekEvents.filter((e) => e.day === selectedDay),
    [weekEvents, selectedDay]
  );

  const scheduleBlocks = useMemo(
    () => groupScheduleBlocks(selectedDayEvents),
    [selectedDayEvents]
  );

  const currentStatus = useMemo(() => {
    const day = austriaNow.getDay();
    const mins = austriaNow.getHours() * 60 + austriaNow.getMinutes();
    const todayKey = formatWeekKey(getWeekMonday(austriaNow));

    const matchingNow = events
      .filter((ev) => {
        if (ev.day !== day) return false;
        if (ev.hiddenWeeks && ev.hiddenWeeks.includes(todayKey)) return false;
        const appliesToday = ev.isRecurring || ev.weekKey === 'recurring' || ev.weekKey === todayKey;
        if (!appliesToday) return false;
        return mins >= timeToMinutes(ev.start) && mins <= timeToMinutes(ev.end);
      })
      .sort((a, b) => timeToMinutes(b.start) - timeToMinutes(a.start));

    const activeNow = matchingNow[0];

    if (activeNow) {
      const cat = CATEGORIES[activeNow.category] || CATEGORIES.jku;
      const isFreeToPing = activeNow.category === 'rest';
      return {
        busy: !isFreeToPing,
        label: cat.friendStatus,
        detail: `${activeNow.title} (${activeNow.start}–${activeNow.end})`
      };
    }
    return {
      busy: false,
      label: 'Свободна (можно пингануть или позвать в ДС)',
      detail: 'Сейчас нет пар и поездов'
    };
  }, [events, austriaNow]);

  const freeWindows = useMemo(() => {
    const windows = [];
    let cursor = 9 * 60;
    const endOfDay = 21 * 60;

    selectedDayEvents.forEach((ev) => {
      const s = timeToMinutes(ev.start);
      const e = timeToMinutes(ev.end);
      if (s - cursor >= 60) {
        windows.push({
          from: minutesToTime(cursor),
          to: ev.start,
          mins: s - cursor
        });
      }
      cursor = Math.max(cursor, e);
    });

    if (endOfDay - cursor >= 60) {
      windows.push({
        from: minutesToTime(cursor),
        to: '21:00',
        mins: endOfDay - cursor
      });
    }
    return windows;
  }, [selectedDayEvents]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1603') {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const fallbackTitle = CATEGORIES[newEvent.category]?.label || 'Событие';
    const titleToSave = newEvent.title.trim() || fallbackTitle;
    await addDoc(collection(db, 'schedule_events'), {
      ...newEvent,
      title: titleToSave,
      day: Number(newEvent.day),
      weekKey: newEvent.isRecurring ? 'recurring' : activeWeekKey,
      hiddenWeeks: []
    });
    setNewEvent({ ...newEvent, title: '', location: '', details: '' });
  };

  const handleDeleteEvent = async (ev) => {
    await deleteDoc(doc(db, 'schedule_events', ev.id));
  };

  const handleHideForThisWeek = async (ev) => {
    const nextHidden = [...(ev.hiddenWeeks || []), activeWeekKey];
    await updateDoc(doc(db, 'schedule_events', ev.id), { hiddenWeeks: nextHidden });
  };

  const handleAddDeadline = async (e) => {
    e.preventDefault();
    if (!newDeadline.title.trim()) return;
    await addDoc(collection(db, 'deadlines'), { ...newDeadline, done: false });
    setNewDeadline({ title: '', course: 'НТУ «ХПІ»', due: '' });
  };

  const toggleDeadline = async (dl) => {
    await updateDoc(doc(db, 'deadlines', dl.id), { done: !dl.done });
  };

  const deleteDeadline = async (id) => {
    await deleteDoc(doc(db, 'deadlines', id));
  };

  const sendPing = async (textToSend) => {
    const msg = (textToSend || pingMessage).trim();
    if (!msg) return;
    await addDoc(collection(db, 'friend_pings'), {
      from: friendName.trim() || 'Тайный друг',
      message: msg,
      createdAt: Date.now(),
      timeLabel: austriaNow.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    });
    setPingMessage('');
    setPingSent(true);
    setTimeout(() => setPingSent(false), 3500);
  };

  const deletePing = async (id) => {
    await deleteDoc(doc(db, 'friend_pings', id));
  };

  const handleHangOrnament = async (e) => {
    e.preventDefault();
    const author = (ornamentAuthor || friendName || 'Друг').trim();
    await addDoc(collection(db, 'tree_ornaments'), {
      author,
      type: selectedOrnamentType,
      createdAt: Date.now()
    });
    setOrnamentAuthor('');
    setOrnamentAdded(true);
    setTimeout(() => setOrnamentAdded(false), 3000);
  };

  const deleteOrnament = async (id) => {
    await deleteDoc(doc(db, 'tree_ornaments', id));
  };

  const applyCustomMinutes = (mins) => {
    const valid = Math.max(1, Math.min(300, Number(mins) || 25));
    setCustomMinutes(valid);
    setTimerRunning(false);
    setSecondsLeft(valid * 60);
  };

  const formattedTimer = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
    secondsLeft % 60
  ).padStart(2, '0')}`;

  return (
    <div
      className="min-h-screen text-[#ece6df] font-sans selection:bg-[#d99b52]/30 relative overflow-x-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 18% 92%, rgba(214, 146, 74, 0.22) 0%, transparent 48%), radial-gradient(ellipse at 85% 88%, rgba(201, 132, 62, 0.18) 0%, transparent 45%), linear-gradient(180deg, #1b2230 0%, #232836 45%, #2a252a 78%, #302422 100%)'
      }}
    >
      <style>{`
        @keyframes winterSnow {
          0% { transform: translateY(-10vh) translateX(0px); }
          50% { transform: translateY(50vh) translateX(12px); }
          100% { transform: translateY(110vh) translateX(-8px); }
        }
        @keyframes warmTwinkle {
          0%, 100% { opacity: 0.45; transform: scale(0.92); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        .snowflake-dot {
          animation-name: winterSnow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .garland-bulb {
          animation-name: warmTwinkle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* Мягкий падающий снег */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {SNOWFLAKES.map((s) => (
          <span
            key={s.id}
            className="snowflake-dot absolute top-0 rounded-full bg-[#f5efe6]"
            style={{
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: s.duration,
              animationDelay: s.delay
            }}
          />
        ))}
      </div>

      {/* Верхняя панель + тёплая рождественская гирлянда */}
      <header className="border-b border-[#f0be7a]/20 bg-[#1a202c]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d99b52]/35 to-[#3c3430] border border-[#f0be7a]/40 flex items-center justify-center shadow-[0_0_16px_rgba(240,190,122,0.25)]">
              <Snowflake className="w-5 h-5 text-[#fae0b8]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#fbf4ea] flex items-center gap-2">
                Amaliia · Winter Study OS
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#2a2c38] border border-[#f0be7a]/25 text-[#e6cfa8]">
                  AT · {austriaNow.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </h1>
              <p className="text-xs text-[#b5b0b8]">
                JKU Linz (B2 + Physik) · НТУ «ХПІ» · ÖBB Bad Schallerbach ↔ Linz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#4a392a]/80 border border-[#e6b373]/50 text-[#fae3c0] text-sm font-medium hover:bg-[#5c4734] transition"
              >
                <Unlock className="w-4 h-4" />
                Режим Амалии (Выйти)
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#252a38]/90 border border-[#f0be7a]/30 text-[#f2e4cf] text-sm font-medium hover:bg-[#313647] transition"
              >
                <Lock className="w-4 h-4 text-[#f0be7a]" />
                Я Амалия
              </button>
            )}
          </div>
        </div>

        {/* Тёплая гирлянда под шапкой */}
        <div className="relative h-4 overflow-hidden border-t border-[#f0be7a]/10 bg-[#151924]/70">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 18">
            <path
              d="M0,2 Q150,15 300,3 T600,3 T900,3 T1200,3"
              fill="none"
              stroke="rgba(240, 190, 122, 0.28)"
              strokeWidth="1.2"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {GARLAND_BULBS.map((b) => (
              <span
                key={b}
                className="garland-bulb w-2 h-2 rounded-full"
                style={{
                  backgroundColor: b % 2 === 0 ? '#ffd28a' : '#f5a95b',
                  boxShadow: '0 0 8px 2px rgba(255, 206, 128, 0.75)',
                  marginTop: b % 2 === 0 ? '3px' : '-2px',
                  animationDuration: `${2.2 + (b % 4) * 0.6}s`,
                  animationDelay: `${(b * 0.25) % 2}s`
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Виджет текущего статуса */}
        <div className="rounded-2xl p-4 border border-[#f0be7a]/25 bg-gradient-to-r from-[#232736]/85 via-[#282733]/85 to-[#2e2629]/85 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/20">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                currentStatus.busy
                  ? 'bg-[#e8b36b] shadow-[0_0_10px_#e8b36b]'
                  : 'bg-[#9fd1c9] shadow-[0_0_10px_#9fd1c9]'
              }`}
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-[#c4b4a1]">Статус прямо сейчас</div>
              <div className="font-semibold text-[#fbf4ea]">{currentStatus.label}</div>
              <div className="text-xs text-[#d6cabd]">{currentStatus.detail}</div>
            </div>
          </div>
          <div className="text-xs text-[#d4c5b4] bg-[#191d26]/80 px-3 py-2 rounded-xl border border-[#f0be7a]/20">
            {isAdmin
              ? `Входящих пингов от друзей: ${pings.length}`
              : 'Гостевой режим просмотра · редактирование закрыто'}
          </div>
        </div>

        {/* Навигация по неделям */}
        <div className="bg-[#202432]/85 border border-[#f0be7a]/20 backdrop-blur-md rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 rounded-xl bg-[#2a2f40] hover:bg-[#363b4f] text-[#f2e6d5] transition"
              title="Предыдущая неделя"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-[#181b26] border border-[#f0be7a]/20 flex items-center gap-2 text-sm font-medium text-[#f7ede0]">
              <CalendarIcon className="w-4 h-4 text-[#f0be7a]" />
              <span>
                KW {activeKW} · с {weekDatesMap[1]}
              </span>
            </div>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 rounded-xl bg-[#2a2f40] hover:bg-[#363b4f] text-[#f2e6d5] transition"
              title="Следующая неделя"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setWeekOffset(0)}
              className={`px-3 py-1.5 rounded-lg border transition ${
                weekOffset === 0
                  ? 'bg-[#4f3c2b] border-[#e6b373]/60 text-[#fdf3e6]'
                  : 'bg-[#262b3b] border-[#f0be7a]/20 text-[#d1c5b8] hover:bg-[#303547]'
              }`}
            >
              Текущая неделя
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-3 py-1.5 rounded-lg bg-[#262b3b] border border-[#f0be7a]/20 text-[#d1c5b8] hover:bg-[#303547] transition"
            >
              +1 неделя
            </button>
          </div>
        </div>

        {/* Переключатель дней недели */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAYS.map((d) => {
            const count = weekEvents.filter((e) => e.day === d.id).length;
            const active = selectedDay === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 backdrop-blur-sm ${
                  active
                    ? 'bg-gradient-to-b from-[#4a392b]/90 to-[#332927]/90 border-[#f0be7a]/65 text-[#fdf4e7] shadow-[0_0_15px_rgba(240,190,122,0.18)]'
                    : 'bg-[#202432]/80 border-[#f0be7a]/15 text-[#b5adb5] hover:border-[#f0be7a]/35 hover:text-[#f2e6d5]'
                }`}
              >
                <span className="text-xs font-bold">{d.short}</span>
                <span className="text-[11px] opacity-80">{weekDatesMap[d.id]}</span>
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    count > 0 ? 'bg-[#6b4f35]/70 text-[#fae3c0]' : 'bg-[#181b26] text-[#7a7680]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Основная сетка */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: Расписание */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#fbf4ea]">
                {DAYS.find((d) => d.id === selectedDay)?.full} ({weekDatesMap[selectedDay]})
              </h2>
              <span className="text-xs text-[#bfb3a6]">
                Событий: {selectedDayEvents.length}
              </span>
            </div>

            {scheduleBlocks.length === 0 ? (
              <div className="bg-[#202432]/85 border border-[#f0be7a]/20 rounded-2xl p-8 text-center text-[#c7bab0] text-sm">
                На этот день пары и поездки не запланированы — можно спокойно закрывать лабы ХПІ, учить физику или отдыхать.
              </div>
            ) : (
              <div className="space-y-3.5">
                {scheduleBlocks.map((block) => {
                  const outerHex = (CATEGORIES[block.events[0].category] || CATEGORIES.jku).hex;

                  return (
                    <div
                      key={block.id}
                      style={block.cardStyle}
                      className="rounded-2xl border backdrop-blur-md shadow-lg shadow-black/25 overflow-hidden transition"
                    >
                      {block.isMerged && (
                        <div className="px-4 py-1.5 text-[11px] font-medium text-[#f5e8d7] bg-black/25 border-b border-white/10 flex items-center justify-between">
                          <span>Связанные занятия · {block.startLabel} – {block.endLabel}</span>
                          <span className="opacity-75">плавный переход</span>
                        </div>
                      )}

                      <div className="divide-y divide-white/10">
                        {block.events.map((ev, idx) => {
                          const cat = CATEGORIES[ev.category] || CATEGORIES.jku;
                          const IconComponent = cat.icon;

                          return (
                            <div
                              key={ev.id}
                              style={
                                block.isMerged && idx > 0
                                  ? {
                                      background: `linear-gradient(90deg, ${
                                        (CATEGORIES[block.events[idx - 1].category] || CATEGORIES.jku).hex
                                      }33 0%, ${cat.hex}44 100%)`
                                    }
                                  : undefined
                              }
                              className="p-4 flex items-start justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-[#fbf4ea]">
                                    {ev.start} – {ev.end}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${cat.badge}`}>
                                    {cat.label}
                                  </span>
                                  {ev.isRecurring && (
                                    <span className="text-[11px] text-[#cbbeb0] flex items-center gap-1">
                                      <Repeat className="w-3 h-3" /> еженедельно
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-semibold text-[#fdf7f0] flex items-center gap-2">
                                  <IconComponent className="w-4 h-4 shrink-0 text-[#f2d5ad]" />
                                  <span>{ev.title}</span>
                                </h3>
                                {ev.location && (
                                  <div className="text-xs text-[#e3d6c8] font-medium">{ev.location}</div>
                                )}
                                {ev.details && (
                                  <p className="text-xs text-[#c4b7a9] leading-relaxed pt-0.5">{ev.details}</p>
                                )}
                              </div>

                              {isAdmin && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {ev.isRecurring && (
                                    <button
                                      onClick={() => handleHideForThisWeek(ev)}
                                      title="Скрыть только на эту неделю"
                                      className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-[#e3d6c8] transition"
                                    >
                                      <EyeOff className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteEvent(ev)}
                                    title="Удалить полностью"
                                    className="p-2 rounded-lg bg-black/30 hover:bg-rose-950/60 text-[#e3a8b3] transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {block.nested.length > 0 && (
                        <div className="px-4 pb-4 pt-1 space-y-2.5">
                          {block.nested.map((inner) => {
                            const innerCat = CATEGORIES[inner.category] || CATEGORIES.jku;
                            const InnerIcon = innerCat.icon;

                            return (
                              <div
                                key={inner.id}
                                style={{
                                  background: `linear-gradient(90deg, ${outerHex}88 0%, ${innerCat.hex}99 16%, ${innerCat.hex}99 84%, ${outerHex}88 100%)`,
                                  borderColor: `${innerCat.hex}cc`
                                }}
                                className="rounded-xl p-3.5 border shadow-inner flex items-start justify-between gap-3"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#fdf7f0]">
                                      {inner.start} – {inner.end}
                                    </span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${innerCat.badge}`}>
                                      {innerCat.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-[#f5e8d7]">
                                      внутри блока
                                    </span>
                                  </div>
                                  <div className="text-sm font-semibold text-[#fdf7f0] flex items-center gap-2">
                                    <InnerIcon className="w-4 h-4 shrink-0 text-[#fae3c0]" />
                                    <span>{inner.title}</span>
                                  </div>
                                  {(inner.location || inner.details) && (
                                    <div className="text-xs text-[#ebdfd1]">
                                      {inner.location}
                                      {inner.location && inner.details ? ' · ' : ''}
                                      <span className="opacity-85">{inner.details}</span>
                                    </div>
                                  )}
                                </div>

                                {isAdmin && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    {inner.isRecurring && (
                                      <button
                                        onClick={() => handleHideForThisWeek(inner)}
                                        title="Скрыть только на эту неделю"
                                        className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 text-[#f5e8d7] transition"
                                      >
                                        <EyeOff className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteEvent(inner)}
                                      title="Удалить полностью"
                                      className="p-1.5 rounded-lg bg-black/35 hover:bg-rose-950/60 text-[#e3a8b3] transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isAdmin && (
              <div className="bg-[#202432]/85 border border-[#f0be7a]/20 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#f0be7a]">
                  Свободные окна для учёбы (ХПІ / Физика JKU)
                </div>
                {freeWindows.length === 0 ? (
                  <p className="text-xs text-[#b5adb5]">Плотный день, больших окон между парами нет.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {freeWindows.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#181b26] border border-[#f0be7a]/20 text-[#ebdfd1]"
                      >
                        {w.from} – {w.to} ({Math.floor(w.mins / 60)}ч {w.mins % 60}м)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <form
                onSubmit={handleAddEvent}
                className="bg-[#202432]/85 border border-[#f0be7a]/20 rounded-2xl p-4 space-y-3"
              >
                <div className="text-sm font-semibold text-[#fbf4ea] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#f0be7a]" />
                  Добавить пару, поезд, сон или отдых
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: Number(e.target.value) })}
                    className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  >
                    {DAYS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  />
                  <input
                    type="time"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  >
                    {Object.entries(CATEGORIES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Название (если пусто — подставится категория)"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  />
                  <input
                    type="text"
                    placeholder="Место / Аудитория / Игра"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Заметки (номер поезда, пересадка, тема)"
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                  className="w-full bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#d1c5b8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.isRecurring}
                      onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                      className="rounded border-[#f0be7a]/30 bg-[#181b26]"
                    />
                    Повторять каждую неделю (иначе только на KW {activeKW})
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#543f2d] hover:bg-[#694f38] border border-[#e6b373]/50 text-[#fdf3e6] text-xs font-semibold transition"
                  >
                    Сохранить в облако
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Правая колонка: Пинги, Ёлка друзей, Таймер, Дедлайны */}
          <div className="space-y-5">
            {/* Пингануть Амалию */}
            <div className="bg-[#202432]/85 border border-[#f0be7a]/20 backdrop-blur-md rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#fbf4ea]">
                <Bell className="w-4 h-4 text-[#f0be7a]" />
                Пингануть Амалию
              </div>

              <input
                type="text"
                placeholder="Твоё имя (Настя, Варя, Стеша...)"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
              />

              <div className="space-y-1.5">
                {QUICK_PINGS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendPing(q)}
                    className="w-full text-left text-xs p-3 rounded-xl bg-gradient-to-r from-[#3b302a] to-[#292733] hover:from-[#4d3e35] hover:to-[#353242] border border-[#f0be7a]/30 text-[#f7ede0] transition leading-snug"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Своё сообщение..."
                  value={pingMessage}
                  onChange={(e) => setPingMessage(e.target.value)}
                  className="flex-1 bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                />
                <button
                  type="button"
                  onClick={() => sendPing()}
                  className="px-3 py-2 rounded-xl bg-[#543f2d] hover:bg-[#694f38] border border-[#e6b373]/50 text-[#fdf3e6] transition"
                  title="Отправить"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {pingSent && (
                <div className="text-xs text-[#9fd1c9] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Маячок улетел Амалии!
                </div>
              )}
            </div>

            {/* Интерактивная рождественская ёлка друзей */}
            <div className="bg-gradient-to-b from-[#1e2433]/90 to-[#292328]/90 border border-[#f0be7a]/25 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-lg shadow-black/25">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#fbf4ea]">
                  <Sparkles className="w-4 h-4 text-[#ffd28a]" />
                  Ёлка друзей
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#3d3128] border border-[#f0be7a]/30 text-[#fae0b8]">
                  игрушек: {treeOrnaments.length}
                </span>
              </div>

              {/* Визуальная ёлка со светящимися гирляндами и игрушками */}
              <div className="relative h-64 rounded-xl bg-gradient-to-b from-[#161b26] via-[#1c202c] to-[#262022] border border-[#f0be7a]/15 overflow-hidden flex items-center justify-center">
                {/* Мягкое тёплое сияние за ёлкой */}
                <div
                  className="absolute w-44 h-44 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 206, 128, 0.22) 0%, transparent 70%)'
                  }}
                />

                {/* SVG силуэт ёлки */}
                <svg viewBox="0 0 200 220" className="w-52 h-60 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
                  {/* Звезда на макушке */}
                  <circle cx="100" cy="18" r="7" fill="#ffd98e" opacity="0.9" />
                  <circle cx="100" cy="18" r="14" fill="#ffd98e" opacity="0.22" />

                  {/* Ствол */}
                  <rect x="91" y="182" width="18" height="24" rx="3" fill="#4a3525" />

                  {/* Ярусы хвои */}
                  <polygon points="100,24 62,76 138,76" fill="#213834" stroke="#365952" strokeWidth="1" />
                  <polygon points="100,56 50,124 150,124" fill="#1d332f" stroke="#365952" strokeWidth="1" />
                  <polygon points="100,96 36,184 164,184" fill="#192c29" stroke="#365952" strokeWidth="1" />

                  {/* Тёплые нити гирлянды на ёлке */}
                  <path d="M72,66 Q100,78 128,66" fill="none" stroke="#ffd28a" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.8" />
                  <path d="M58,112 Q100,128 142,112" fill="none" stroke="#ffd28a" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.8" />
                  <path d="M46,164 Q100,182 154,164" fill="none" stroke="#ffd28a" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.8" />
                </svg>

                {/* Развешанные игрушки друзей */}
                {treeOrnaments.slice(0, TREE_SLOTS.length).map((item, idx) => {
                  const slot = TREE_SLOTS[idx];
                  const meta = ORNAMENTS.find((o) => o.id === item.type) || ORNAMENTS[0];
                  return (
                    <div
                      key={item.id}
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      className="group absolute z-10 flex flex-col items-center"
                    >
                      <div
                        style={{
                          background: meta.bg,
                          boxShadow: meta.glow
                        }}
                        className={`w-7 h-7 rounded-full border ${meta.border} flex items-center justify-center text-[10px] font-bold text-white cursor-default transition-transform group-hover:scale-125`}
                        title={`${item.author} (${meta.label})`}
                      >
                        {meta.symbol}
                      </div>
                      <span className="mt-0.5 px-1.5 py-0.2 rounded bg-black/70 text-[9px] text-[#fae8cc] whitespace-nowrap max-w-[74px] truncate border border-[#f0be7a]/25">
                        {item.author}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => deleteOrnament(item.id)}
                          className="hidden group-hover:flex absolute -top-2 -right-2 w-4 h-4 rounded-full bg-rose-900 text-white items-center justify-center text-[9px]"
                          title="Снять игрушку"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Форма выбора игрушки (из 5 вариантов) и имени */}
              <form onSubmit={handleHangOrnament} className="space-y-2.5">
                <div className="grid grid-cols-5 gap-1.5">
                  {ORNAMENTS.map((orn) => {
                    const active = selectedOrnamentType === orn.id;
                    return (
                      <button
                        key={orn.id}
                        type="button"
                        onClick={() => setSelectedOrnamentType(orn.id)}
                        className={`p-1.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                          active
                            ? 'bg-[#4a392a] border-[#ffd28a] text-[#fff6e8] shadow-[0_0_10px_rgba(255,210,138,0.25)]'
                            : 'bg-[#181b26] border-[#f0be7a]/15 text-[#c7bab0] hover:border-[#f0be7a]/40'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{orn.symbol}</span>
                        <span className="text-[9px] leading-tight truncate w-full">{orn.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={18}
                    placeholder="Подпиши игрушку (имя)..."
                    value={ornamentAuthor}
                    onChange={(e) => setOrnamentAuthor(e.target.value)}
                    className="flex-1 bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-[#543f2d] hover:bg-[#694f38] border border-[#e6b373]/50 text-[#fdf3e6] text-xs font-semibold transition whitespace-nowrap"
                  >
                    Повесить
                  </button>
                </div>

                {ornamentAdded && (
                  <div className="text-xs text-[#fae0b8] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd28a]" />
                    Игрушка теперь светится на ёлке!
                  </div>
                )}
              </form>
            </div>

            {/* Входящие пинги (только для Амалии) */}
            {isAdmin && (
              <div className="bg-[#202432]/85 border border-[#f0be7a]/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#fbf4ea]">
                    <MessageSquare className="w-4 h-4 text-[#f0be7a]" />
                    Входящие от друзей
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#4a392a] text-[#fae0b8]">
                    {pings.length}
                  </span>
                </div>
                {pings.length === 0 ? (
                  <p className="text-xs text-[#b5adb5]">Пока новых сообщений нет.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pings.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-[#181b26] border border-[#f0be7a]/20 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[#b5adb5]">
                          <span className="font-semibold text-[#f0be7a]">{p.from}</span>
                          <div className="flex items-center gap-2">
                            <span>{p.timeLabel}</span>
                            <button
                              onClick={() => deletePing(p.id)}
                              className="text-[#8a828c] hover:text-[#e3a8b3]"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#ece6df] leading-snug">{p.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Таймер фокуса (только для Амалии) */}
            {isAdmin && (
              <div className="bg-[#202432]/85 border border-[#f0be7a]/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#fbf4ea]">
                    <Clock className="w-4 h-4 text-[#f0be7a]" />
                    Таймер фокуса
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customMinutes}
                      onChange={(e) => applyCustomMinutes(e.target.value)}
                      className="w-16 bg-[#181b26] border border-[#f0be7a]/20 rounded-lg px-2 py-1 text-xs text-[#f2e6d5] text-center"
                    />
                    <span className="text-xs text-[#b5adb5]">мин</span>
                  </div>
                </div>

                <div className="text-3xl font-mono font-bold text-center py-2 text-[#fbf4ea] tracking-wider">
                  {formattedTimer}
                </div>

                <div className="flex justify-center gap-1.5">
                  {[15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyCustomMinutes(m)}
                      className="px-2.5 py-1 rounded-lg bg-[#181b26] hover:bg-[#2a2f40] border border-[#f0be7a]/20 text-xs text-[#d1c5b8]"
                    >
                      {m}м
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((r) => !r)}
                    className="flex-1 py-2 rounded-xl bg-[#543f2d] hover:bg-[#694f38] border border-[#e6b373]/50 text-[#fdf3e6] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Пауза' : 'Старт'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCustomMinutes(customMinutes)}
                    className="px-3 py-2 rounded-xl bg-[#2a2f40] hover:bg-[#363b4f] text-[#f2e6d5] text-xs transition"
                    title="Сброс"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Дедлайны (только для Амалии) */}
            {isAdmin && (
              <div className="bg-[#202432]/85 border border-[#f0be7a]/20 rounded-2xl p-4 space-y-3">
                <div className="text-sm font-semibold text-[#fbf4ea]">Дедлайны (JKU & ХПІ)</div>
                <form onSubmit={handleAddDeadline} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Что сдать (контрольная, эссе B2...)"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                    className="w-full bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newDeadline.course}
                      onChange={(e) => setNewDeadline({ ...newDeadline, course: e.target.value })}
                      className="bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-2.5 py-2 text-xs text-[#f2e6d5]"
                    >
                      <option value="НТУ «ХПІ»">НТУ «ХПІ»</option>
                      <option value="JKU Deutsch B2">JKU Deutsch B2</option>
                      <option value="JKU Physik">JKU Physik</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Срок (напр. Пн 30.11)"
                      value={newDeadline.due}
                      onChange={(e) => setNewDeadline({ ...newDeadline, due: e.target.value })}
                      className="flex-1 bg-[#181b26] border border-[#f0be7a]/20 rounded-xl px-3 py-2 text-xs text-[#f2e6d5]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-[#543f2d] hover:bg-[#694f38] border border-[#e6b373]/50 text-[#fdf3e6] text-xs font-semibold"
                    >
                      +
                    </button>
                  </div>
                </form>

                <div className="space-y-1.5">
                  {deadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#181b26] border border-[#f0be7a]/15 text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={dl.done}
                          onChange={() => toggleDeadline(dl)}
                          className="rounded border-[#f0be7a]/30 bg-[#202432]"
                        />
                        <span className={dl.done ? 'line-through text-[#7a7680]' : 'text-[#ece6df]'}>
                          <strong className="text-[#f0be7a]">[{dl.course}]</strong> {dl.title}{' '}
                          {dl.due && <span className="text-[#b5adb5]">({dl.due})</span>}
                        </span>
                      </label>
                      <button
                        onClick={() => deleteDeadline(dl.id)}
                        className="text-[#8a828c] hover:text-[#e3a8b3]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно входа */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handlePinSubmit}
            className="bg-[#202432] border border-[#f0be7a]/35 rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#4a392a] text-[#fae0b8] flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#fbf4ea]">Доступ владельца</h3>
              <p className="text-xs text-[#b5adb5]">Введите код доступа</p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
              className="w-full text-center tracking-[0.5em] text-lg bg-[#181b26] border border-[#f0be7a]/30 rounded-xl px-4 py-2.5 text-[#fdf4e7] focus:outline-none focus:border-[#f0be7a]"
            />
            {pinError && <p className="text-xs text-[#e3a8b3] text-center">Неверный код</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#2a2f40] text-[#d1c5b8] text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#543f2d] hover:bg-[#694f38] border border-[#e6b373]/50 text-[#fdf3e6] text-xs font-semibold"
              >
                Войти
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}