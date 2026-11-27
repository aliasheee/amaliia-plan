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
  Sparkles,
  CheckSquare,
  Square
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

// Чистые вечерние оттенки категорий с чистым акцентом без смешивания в муть
const CATEGORIES = {
  transit: {
    label: 'ÖBB / Дорога',
    friendStatus: 'В поезде / дороге в Линц',
    hex: '#4ea3e3',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(78, 163, 227, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #4ea3e3'
    },
    badge: 'bg-[#254b6b]/70 text-[#cfe9ff] border border-[#6cb8f2]/35',
    icon: Train
  },
  jku: {
    label: 'JKU Linz',
    friendStatus: 'На паре в JKU Linz',
    hex: '#9279e6',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(146, 121, 230, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #9279e6'
    },
    badge: 'bg-[#3d3169]/70 text-[#e5dcff] border border-[#ab96f5]/35',
    icon: GraduationCap
  },
  khpi: {
    label: 'НТУ «ХПІ»',
    friendStatus: 'Закрывает лабы/контрольные ХПІ',
    hex: '#e8aa48',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(232, 170, 72, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #e8aa48'
    },
    badge: 'bg-[#66491c]/70 text-[#ffebc2] border border-[#f2be68]/35',
    icon: BookOpen
  },
  tutoring: {
    label: 'Занятие с Варей',
    friendStatus: 'Помогает Варе с учёбой',
    hex: '#46c79e',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(70, 199, 158, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #46c79e'
    },
    badge: 'bg-[#1f5947]/70 text-[#cbf7e9] border border-[#6cd9b6]/35',
    icon: Users
  },
  vocal: {
    label: 'Вокал / Допы',
    friendStatus: 'На вокале или дополнительных занятиях',
    hex: '#de6b97',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(222, 107, 151, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #de6b97'
    },
    badge: 'bg-[#61273e]/70 text-[#ffd6e6] border border-[#ed8bb1]/35',
    icon: Music
  },
  sleep: {
    label: 'Сон',
    friendStatus: 'Спит ❄️ (не будить)',
    hex: '#5c7ce0',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(92, 124, 224, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #5c7ce0'
    },
    badge: 'bg-[#26386e]/70 text-[#d4e0ff] border border-[#7f9cf2]/35',
    icon: Moon
  },
  rest: {
    label: 'Отдых / Игры / Чилл',
    friendStatus: 'Отдыхает (можно звать в ДС или катку)',
    hex: '#46bdcc',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(70, 189, 204, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #46bdcc'
    },
    badge: 'bg-[#1e545c]/70 text-[#ccf4fa] border border-[#6cd0de]/35',
    icon: Coffee
  },
  hobby: {
    label: 'Хобби / Творчество',
    friendStatus: 'Занята творчеством / музыкой / рукоделием',
    hex: '#b577cc',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(181, 119, 204, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #b577cc'
    },
    badge: 'bg-[#4f2e5c]/70 text-[#f2d9fc] border border-[#cb96e0]/35',
    icon: Palette
  },
  errands: {
    label: 'Дела / Поручения',
    friendStatus: 'Занята личными делами',
    hex: '#69a6e0',
    rowStyle: {
      background: 'linear-gradient(90deg, rgba(105, 166, 224, 0.16) 0%, rgba(18, 28, 46, 0.92) 55%)',
      borderLeft: '4px solid #69a6e0'
    },
    badge: 'bg-[#2a4a6b]/70 text-[#d6ebff] border border-[#8abef0]/35',
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

  return blocks.map((b) => ({
    ...b,
    startLabel: minutesToTime(b.startMin),
    endLabel: minutesToTime(b.endMin),
    isMerged: b.events.length > 1
  }));
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
    isRecurring: true
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

  const sortedDeadlines = useMemo(() => {
    return [...deadlines].sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)));
  }, [deadlines]);

  const activeDeadlinesCount = useMemo(
    () => deadlines.filter((d) => !d.done).length,
    [deadlines]
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
    await addDoc(collection(db, 'deadlines'), {
      ...newDeadline,
      title: newDeadline.title.trim(),
      due: newDeadline.due.trim(),
      done: false
    });
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
      className="min-h-screen text-[#e6eef5] font-sans selection:bg-[#6fa8dc]/30 relative overflow-x-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 20% 88%, rgba(232, 178, 102, 0.14) 0%, transparent 45%), radial-gradient(ellipse at 82% 20%, rgba(92, 138, 186, 0.16) 0%, transparent 50%), linear-gradient(180deg, #111927 0%, #162033 52%, #192233 100%)'
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
          50% { opacity: 1; transform: scale(1.14); }
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

      {/* Падающий снег */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {SNOWFLAKES.map((s) => (
          <span
            key={s.id}
            className="snowflake-dot absolute top-0 rounded-full bg-[#e8f2fc]"
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

      {/* Шапка + гирлянда */}
      <header className="border-b border-[#8bb8e3]/15 bg-[#111826]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2b4c70] to-[#172638] border border-[#8bb8e3]/35 flex items-center justify-center shadow-[0_0_16px_rgba(139,184,227,0.2)]">
              <Snowflake className="w-5 h-5 text-[#d6ecff]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#f2f7fc] flex items-center gap-2">
                Amaliia · Winter Study OS
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#1c283d] border border-[#8bb8e3]/25 text-[#c5dcf2]">
                  AT · {austriaNow.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </h1>
              <p className="text-xs text-[#9cb2c7]">
                JKU Linz (B2 + Physik) · НТУ «ХПІ» · ÖBB Bad Schallerbach ↔ Linz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#24405e] border border-[#8bb8e3]/45 text-[#e6f2fc] text-sm font-medium hover:bg-[#2d5075] transition"
              >
                <Unlock className="w-4 h-4" />
                Режим Амалии (Выйти)
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a2538]/90 border border-[#8bb8e3]/25 text-[#dceaf7] text-sm font-medium hover:bg-[#22314a] transition"
              >
                <Lock className="w-4 h-4 text-[#ffd48a]" />
                Я Амалия
              </button>
            )}
          </div>
        </div>

        {/* Тёплая гирлянда под шапкой */}
        <div className="relative h-4 overflow-hidden border-t border-[#ffd48a]/10 bg-[#0e1420]/75">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 18">
            <path
              d="M0,2 Q150,15 300,3 T600,3 T900,3 T1200,3"
              fill="none"
              stroke="rgba(255, 212, 138, 0.25)"
              strokeWidth="1.2"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {GARLAND_BULBS.map((b) => (
              <span
                key={b}
                className="garland-bulb w-2 h-2 rounded-full"
                style={{
                  backgroundColor: b % 2 === 0 ? '#ffd48a' : '#f5b064',
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
        {/* Текущий статус */}
        <div className="rounded-2xl p-4 border border-[#8bb8e3]/20 bg-gradient-to-r from-[#172236]/90 via-[#1a263b]/90 to-[#162033]/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-black/25">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                currentStatus.busy
                  ? 'bg-[#ffd48a] shadow-[0_0_10px_#ffd48a]'
                  : 'bg-[#8be0cf] shadow-[0_0_10px_#8be0cf]'
              }`}
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-[#8fa7bd]">Статус прямо сейчас</div>
              <div className="font-semibold text-[#f2f7fc]">{currentStatus.label}</div>
              <div className="text-xs text-[#b8cde0]">{currentStatus.detail}</div>
            </div>
          </div>
          <div className="text-xs text-[#b8cde0] bg-[#101826]/85 px-3 py-2 rounded-xl border border-[#8bb8e3]/20">
            {isAdmin
              ? `Входящих пингов от друзей: ${pings.length}`
              : 'Гостевой режим просмотра · редактирование закрыто'}
          </div>
        </div>

        {/* Навигация по неделям */}
        <div className="bg-[#162033]/85 border border-[#8bb8e3]/20 backdrop-blur-md rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 rounded-xl bg-[#1e2c45] hover:bg-[#273959] text-[#e6f2fc] transition"
              title="Предыдущая неделя"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-[#101826] border border-[#8bb8e3]/20 flex items-center gap-2 text-sm font-medium text-[#f2f7fc]">
              <CalendarIcon className="w-4 h-4 text-[#8bb8e3]" />
              <span>
                KW {activeKW} · с {weekDatesMap[1]}
              </span>
            </div>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 rounded-xl bg-[#1e2c45] hover:bg-[#273959] text-[#e6f2fc] transition"
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
                  ? 'bg-[#2a4a6e] border-[#8bb8e3]/60 text-[#f5faff]'
                  : 'bg-[#1c283d] border-[#8bb8e3]/20 text-[#b8cde0] hover:bg-[#24344f]'
              }`}
            >
              Текущая неделя
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-3 py-1.5 rounded-lg bg-[#1c283d] border border-[#8bb8e3]/20 text-[#b8cde0] hover:bg-[#24344f] transition"
            >
              +1 неделя
            </button>
          </div>
        </div>

        {/* Дни недели */}
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
                    ? 'bg-gradient-to-b from-[#2c4e73]/90 to-[#1c2f47]/90 border-[#8bb8e3]/65 text-[#f5faff] shadow-[0_0_15px_rgba(139,184,227,0.18)]'
                    : 'bg-[#162033]/80 border-[#8bb8e3]/15 text-[#94acc2] hover:border-[#8bb8e3]/35 hover:text-[#e6f2fc]'
                }`}
              >
                <span className="text-xs font-bold">{d.short}</span>
                <span className="text-[11px] opacity-80">{weekDatesMap[d.id]}</span>
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    count > 0 ? 'bg-[#365b85]/75 text-[#e6f3ff]' : 'bg-[#101826] text-[#647b91]'
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
              <h2 className="text-base font-semibold text-[#f2f7fc]">
                {DAYS.find((d) => d.id === selectedDay)?.full} ({weekDatesMap[selectedDay]})
              </h2>
              <span className="text-xs text-[#94acc2]">
                Событий: {selectedDayEvents.length}
              </span>
            </div>

            {scheduleBlocks.length === 0 ? (
              <div className="bg-[#162033]/85 border border-[#8bb8e3]/20 rounded-2xl p-8 text-center text-[#b8cde0] text-sm">
                На этот день пары и поездки не запланированы — можно спокойно закрывать лабы ХПІ, учить физику или отдыхать.
              </div>
            ) : (
              <div className="space-y-3.5">
                {scheduleBlocks.map((block) => {
                  const outerHex = (CATEGORIES[block.events[0].category] || CATEGORIES.jku).hex;

                  return (
                    <div
                      key={block.id}
                      className="rounded-2xl border border-[#8bb8e3]/25 bg-[#121c2e]/92 backdrop-blur-md shadow-lg shadow-black/25 overflow-hidden transition"
                    >
                      {block.isMerged && (
                        <div className="px-4 py-1.5 text-[11px] font-medium text-[#d7e8f7] bg-[#0d1422]/90 border-b border-[#8bb8e3]/15 flex items-center justify-between">
                          <span>Связанные занятия · {block.startLabel} – {block.endLabel}</span>
                          <span className="text-[#8fa7bd]">стык по времени</span>
                        </div>
                      )}

                      <div className="divide-y divide-[#8bb8e3]/15">
                        {block.events.map((ev) => {
                          const cat = CATEGORIES[ev.category] || CATEGORIES.jku;
                          const IconComponent = cat.icon;

                          return (
                            <div
                              key={ev.id}
                              style={cat.rowStyle}
                              className="p-4 flex items-start justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-sm font-bold text-[#f5faff]">
                                    {ev.start} – {ev.end}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${cat.badge}`}>
                                    {cat.label}
                                  </span>
                                  {ev.isRecurring && (
                                    <span className="text-[11px] text-[#a9c2d9] flex items-center gap-1">
                                      <Repeat className="w-3 h-3" /> еженедельно
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-semibold text-[#ffffff] flex items-center gap-2">
                                  <IconComponent className="w-4 h-4 shrink-0" style={{ color: cat.hex }} />
                                  <span>{ev.title}</span>
                                </h3>
                                {ev.location && (
                                  <div className="text-xs text-[#d2e4f5] font-medium">{ev.location}</div>
                                )}
                                {ev.details && (
                                  <p className="text-xs text-[#a9c2d9] leading-relaxed pt-0.5">{ev.details}</p>
                                )}
                              </div>

                              {isAdmin && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {ev.isRecurring && (
                                    <button
                                      onClick={() => handleHideForThisWeek(ev)}
                                      title="Скрыть только на эту неделю"
                                      className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-[#d2e4f5] transition"
                                    >
                                      <EyeOff className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteEvent(ev)}
                                    title="Удалить полностью"
                                    className="p-2 rounded-lg bg-black/30 hover:bg-rose-950/60 text-[#f2b6c2] transition"
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
                        <div className="px-4 pb-4 pt-2 space-y-2.5 bg-[#0e1624]/60">
                          {block.nested.map((inner) => {
                            const innerCat = CATEGORIES[inner.category] || CATEGORIES.jku;
                            const InnerIcon = innerCat.icon;

                            return (
                              <div
                                key={inner.id}
                                style={{
                                  ...innerCat.rowStyle,
                                  borderColor: `${outerHex}55`
                                }}
                                className="rounded-xl p-3.5 border flex items-start justify-between gap-3"
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#ffffff]">
                                      {inner.start} – {inner.end}
                                    </span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${innerCat.badge}`}>
                                      {innerCat.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a2840] text-[#c8ddf0]">
                                      внутри блока
                                    </span>
                                  </div>
                                  <div className="text-sm font-semibold text-[#ffffff] flex items-center gap-2">
                                    <InnerIcon className="w-4 h-4 shrink-0" style={{ color: innerCat.hex }} />
                                    <span>{inner.title}</span>
                                  </div>
                                  {(inner.location || inner.details) && (
                                    <div className="text-xs text-[#dcebf7]">
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
                                        className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 text-[#e6f2fc] transition"
                                      >
                                        <EyeOff className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteEvent(inner)}
                                      title="Удалить полностью"
                                      className="p-1.5 rounded-lg bg-black/35 hover:bg-rose-950/60 text-[#f2b6c2] transition"
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

            {/* Свободные окна */}
            {isAdmin && (
              <div className="bg-[#162033]/85 border border-[#8bb8e3]/20 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#9ec7ed]">
                  Свободные окна для учёбы (ХПІ / Физика JKU)
                </div>
                {freeWindows.length === 0 ? (
                  <p className="text-xs text-[#94acc2]">Плотный день, больших окон между парами нет.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {freeWindows.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#101826] border border-[#8bb8e3]/20 text-[#dceaf7]"
                      >
                        {w.from} – {w.to} ({Math.floor(w.mins / 60)}ч {w.mins % 60}м)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Форма добавления события */}
            {isAdmin && (
              <form
                onSubmit={handleAddEvent}
                className="bg-[#162033]/90 border border-[#8bb8e3]/25 rounded-2xl p-4 space-y-3.5"
              >
                <div className="text-sm font-semibold text-[#f2f7fc] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#8bb8e3]" />
                  Добавить пару, поезд, сон или отдых
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: Number(e.target.value) })}
                    className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
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
                    className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                  />
                  <input
                    type="time"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
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
                    className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                  />
                  <input
                    type="text"
                    placeholder="Место / Аудитория / Игра"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Заметки (номер поезда, пересадка, тема)"
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                  className="w-full bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, isRecurring: !newEvent.isRecurring })}
                    className={`flex items-center justify-between sm:justify-start gap-3 px-3.5 py-2.5 rounded-xl border text-left transition ${
                      newEvent.isRecurring
                        ? 'bg-[#254569] border-[#8bb8e3] text-[#ffffff] shadow-[0_0_12px_rgba(139,184,227,0.2)]'
                        : 'bg-[#101826] border-[#8bb8e3]/25 text-[#a9c2d9] hover:border-[#8bb8e3]/50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <Repeat className="w-4 h-4 text-[#9ec7ed]" />
                      {newEvent.isRecurring
                        ? 'Повторять каждую неделю: ВКЛ'
                        : `Только на эту неделю (KW ${activeKW})`}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        newEvent.isRecurring
                          ? 'bg-[#8bb8e3]/25 text-[#e6f3ff]'
                          : 'bg-[#1d2a40] text-[#8fa7bd]'
                      }`}
                    >
                      {newEvent.isRecurring ? 'Еженедельно' : 'Разово'}
                    </span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2d527a] hover:bg-[#386596] border border-[#8bb8e3]/50 text-[#ffffff] text-xs font-semibold transition"
                  >
                    Сохранить в облако
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Правая колонка */}
          <div className="space-y-5">
            {/* Пингануть Амалию */}
            <div className="bg-[#162033]/85 border border-[#8bb8e3]/20 backdrop-blur-md rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#f2f7fc]">
                <Bell className="w-4 h-4 text-[#ffd48a]" />
                Пингануть Амалию
              </div>

              <input
                type="text"
                placeholder="Твоё имя (Настя, Варя, Аріна...)"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
              />

              <div className="space-y-1.5">
                {QUICK_PINGS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendPing(q)}
                    className="w-full text-left text-xs p-3 rounded-xl bg-gradient-to-r from-[#223452] to-[#19263d] hover:from-[#2b4269] hover:to-[#20314f] border border-[#8bb8e3]/30 text-[#f2f7fc] transition leading-snug"
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
                  className="flex-1 bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                />
                <button
                  type="button"
                  onClick={() => sendPing()}
                  className="px-3 py-2 rounded-xl bg-[#2d527a] hover:bg-[#386596] border border-[#8bb8e3]/50 text-[#ffffff] transition"
                  title="Отправить"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {pingSent && (
                <div className="text-xs text-[#8be0cf] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Маячок улетел Амалии!
                </div>
              )}
            </div>

            {/* Ёлка друзей */}
            <div className="bg-gradient-to-b from-[#172236]/90 to-[#131c2e]/90 border border-[#8bb8e3]/25 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-lg shadow-black/25">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#f2f7fc]">
                  <Sparkles className="w-4 h-4 text-[#ffd48a]" />
                  Ёлка друзей
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#223452] border border-[#8bb8e3]/30 text-[#d8ebfc]">
                  игрушек: {treeOrnaments.length}
                </span>
              </div>

              <div className="relative h-64 rounded-xl bg-gradient-to-b from-[#0e1522] via-[#131d30] to-[#172236] border border-[#8bb8e3]/15 overflow-hidden flex items-center justify-center">
                <div
                  className="absolute w-44 h-44 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 212, 138, 0.18) 0%, transparent 70%)'
                  }}
                />

                <svg viewBox="0 0 200 220" className="w-52 h-60 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]">
                  <circle cx="100" cy="18" r="7" fill="#ffd98e" opacity="0.95" />
                  <circle cx="100" cy="18" r="14" fill="#ffd98e" opacity="0.22" />
                  <rect x="91" y="182" width="18" height="24" rx="3" fill="#2c3e59" />
                  <polygon points="100,24 62,76 138,76" fill="#1b3838" stroke="#3c6e6e" strokeWidth="1" />
                  <polygon points="100,56 50,124 150,124" fill="#173233" stroke="#3c6e6e" strokeWidth="1" />
                  <polygon points="100,96 36,184 164,184" fill="#132b2c" stroke="#3c6e6e" strokeWidth="1" />
                  <path d="M72,66 Q100,78 128,66" fill="none" stroke="#ffd48a" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.85" />
                  <path d="M58,112 Q100,128 142,112" fill="none" stroke="#ffd48a" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.85" />
                  <path d="M46,164 Q100,182 154,164" fill="none" stroke="#ffd48a" strokeWidth="1.2" strokeDasharray="2 4" opacity="0.85" />
                </svg>

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
                      <span className="mt-0.5 px-1.5 py-0.2 rounded bg-[#0d1420]/85 text-[9px] text-[#e6f2fc] whitespace-nowrap max-w-[74px] truncate border border-[#8bb8e3]/25">
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
                            ? 'bg-[#2a4a6e] border-[#ffd48a] text-[#ffffff] shadow-[0_0_10px_rgba(255,212,138,0.22)]'
                            : 'bg-[#101826] border-[#8bb8e3]/15 text-[#b8cde0] hover:border-[#8bb8e3]/40'
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
                    className="flex-1 bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-[#2d527a] hover:bg-[#386596] border border-[#8bb8e3]/50 text-[#ffffff] text-xs font-semibold transition whitespace-nowrap"
                  >
                    Повесить
                  </button>
                </div>

                {ornamentAdded && (
                  <div className="text-xs text-[#ffd48a] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Игрушка теперь светится на ёлке!
                  </div>
                )}
              </form>
            </div>

            {/* Входящие пинги */}
            {isAdmin && (
              <div className="bg-[#162033]/85 border border-[#8bb8e3]/25 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#f2f7fc]">
                    <MessageSquare className="w-4 h-4 text-[#8bb8e3]" />
                    Входящие от друзей
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#223452] text-[#d8ebfc]">
                    {pings.length}
                  </span>
                </div>
                {pings.length === 0 ? (
                  <p className="text-xs text-[#94acc2]">Пока новых сообщений нет.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pings.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-[#101826] border border-[#8bb8e3]/20 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[#94acc2]">
                          <span className="font-semibold text-[#9ec7ed]">{p.from}</span>
                          <div className="flex items-center gap-2">
                            <span>{p.timeLabel}</span>
                            <button
                              onClick={() => deletePing(p.id)}
                              className="text-[#728ba3] hover:text-[#f2b6c2]"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#e6eef5] leading-snug">{p.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Таймер фокуса */}
            {isAdmin && (
              <div className="bg-[#162033]/85 border border-[#8bb8e3]/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#f2f7fc]">
                    <Clock className="w-4 h-4 text-[#8bb8e3]" />
                    Таймер фокуса
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customMinutes}
                      onChange={(e) => applyCustomMinutes(e.target.value)}
                      className="w-16 bg-[#101826] border border-[#8bb8e3]/25 rounded-lg px-2 py-1 text-xs text-[#f2f7fc] text-center"
                    />
                    <span className="text-xs text-[#94acc2]">мин</span>
                  </div>
                </div>

                <div className="text-3xl font-mono font-bold text-center py-2 text-[#ffffff] tracking-wider">
                  {formattedTimer}
                </div>

                <div className="flex justify-center gap-1.5">
                  {[15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyCustomMinutes(m)}
                      className="px-2.5 py-1 rounded-lg bg-[#101826] hover:bg-[#1d2b42] border border-[#8bb8e3]/20 text-xs text-[#b8cde0]"
                    >
                      {m}м
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((r) => !r)}
                    className="flex-1 py-2 rounded-xl bg-[#2d527a] hover:bg-[#386596] border border-[#8bb8e3]/50 text-[#ffffff] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Пауза' : 'Старт'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCustomMinutes(customMinutes)}
                    className="px-3 py-2 rounded-xl bg-[#1e2c45] hover:bg-[#273959] text-[#e6f2fc] text-xs transition"
                    title="Сброс"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Дедлайны */}
            {isAdmin && (
              <div className="bg-[#162033]/85 border border-[#8bb8e3]/20 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#f2f7fc]">Дедлайны (JKU & ХПІ)</div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1e2e47] border border-[#8bb8e3]/25 text-[#b8cde0]">
                    активно: {activeDeadlinesCount}
                  </span>
                </div>

                <form onSubmit={handleAddDeadline} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Что сдать (контрольная, лаба, эссе B2...)"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                    className="w-full bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={newDeadline.course}
                      onChange={(e) => setNewDeadline({ ...newDeadline, course: e.target.value })}
                      className="bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-2.5 py-2 text-xs text-[#f2f7fc]"
                    >
                      <option value="НТУ «ХПІ»">НТУ «ХПІ»</option>
                      <option value="JKU Deutsch B2">JKU Deutsch B2</option>
                      <option value="JKU Physik">JKU Physik</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Срок (напр. Пн 30.11)"
                        value={newDeadline.due}
                        onChange={(e) => setNewDeadline({ ...newDeadline, due: e.target.value })}
                        className="flex-1 min-w-0 bg-[#101826] border border-[#8bb8e3]/25 rounded-xl px-3 py-2 text-xs text-[#f2f7fc]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-xl bg-[#2d527a] hover:bg-[#386596] border border-[#8bb8e3]/50 text-[#ffffff] text-xs font-semibold shrink-0"
                        title="Добавить дедлайн"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {sortedDeadlines.length === 0 ? (
                    <p className="text-xs text-[#7c94ab] text-center py-2">Пока дедлайнов нет.</p>
                  ) : (
                    sortedDeadlines.map((dl) => (
                      <div
                        key={dl.id}
                        className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl border text-xs transition ${
                          dl.done
                            ? 'bg-[#101724]/60 border-[#8bb8e3]/10 opacity-70'
                            : 'bg-[#101826] border-[#8bb8e3]/25'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleDeadline(dl)}
                          className="flex items-start gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                        >
                          {dl.done ? (
                            <CheckSquare className="w-4 h-4 text-[#8be0cf] shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-[#8bb8e3] shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0 space-y-0.5">
                            <div
                              className={`font-medium break-words ${
                                dl.done ? 'line-through text-[#728ba3]' : 'text-[#f2f7fc]'
                              }`}
                            >
                              {dl.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="px-1.5 py-0.2 rounded bg-[#223452] text-[#b8d8f5] font-medium">
                                {dl.course}
                              </span>
                              {dl.due && <span className="text-[#ffd48a]">до {dl.due}</span>}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDeadline(dl.id)}
                          className="text-[#728ba3] hover:text-[#f2b6c2] p-1 shrink-0"
                          title="Удалить дедлайн"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
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
            className="bg-[#162033] border border-[#8bb8e3]/35 rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#223452] text-[#ffd48a] flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#f2f7fc]">Доступ владельца</h3>
              <p className="text-xs text-[#94acc2]">Введите код доступа</p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
              className="w-full text-center tracking-[0.5em] text-lg bg-[#101826] border border-[#8bb8e3]/30 rounded-xl px-4 py-2.5 text-[#ffffff] focus:outline-none focus:border-[#8bb8e3]"
            />
            {pinError && <p className="text-xs text-[#f2b6c2] text-center">Неверный код</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#1e2c45] text-[#b8cde0] text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#2d527a] hover:bg-[#386596] border border-[#8bb8e3]/50 text-[#ffffff] text-xs font-semibold"
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