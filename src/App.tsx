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
  Snowflake
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

// Разные, но приглушённые зимние оттенки для каждой категории
const CATEGORIES = {
  transit: {
    label: 'ÖBB / Дорога',
    friendStatus: 'В поезде / дороге в Линц',
    hex: '#2b546e',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(43, 84, 110, 0.34) 0%, rgba(22, 42, 56, 0.88) 100%)',
      borderColor: 'rgba(104, 165, 201, 0.38)'
    },
    badge: 'bg-[#2b546e]/45 text-[#b8dcf0] border border-[#68a5c9]/30',
    icon: Train
  },
  jku: {
    label: 'JKU Linz',
    friendStatus: 'На паре в JKU Linz',
    hex: '#483f6e',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(72, 63, 110, 0.36) 0%, rgba(36, 32, 58, 0.88) 100%)',
      borderColor: 'rgba(148, 134, 209, 0.38)'
    },
    badge: 'bg-[#483f6e]/45 text-[#d2caf2] border border-[#9486d1]/30',
    icon: GraduationCap
  },
  khpi: {
    label: 'НТУ «ХПІ»',
    friendStatus: 'Закрывает лабы/контрольные ХПІ',
    hex: '#6e562b',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(110, 86, 43, 0.34) 0%, rgba(56, 44, 22, 0.88) 100%)',
      borderColor: 'rgba(204, 164, 92, 0.38)'
    },
    badge: 'bg-[#6e562b]/45 text-[#ebd5a7] border border-[#cca45c]/30',
    icon: BookOpen
  },
  tutoring: {
    label: 'Занятие с Варей',
    friendStatus: 'Помогает Варе с учёбой',
    hex: '#2b6355',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(43, 99, 85, 0.35) 0%, rgba(22, 50, 43, 0.88) 100%)',
      borderColor: 'rgba(102, 189, 167, 0.38)'
    },
    badge: 'bg-[#2b6355]/45 text-[#b6e6da] border border-[#66bda7]/30',
    icon: Users
  },
  vocal: {
    label: 'Вокал / Допы',
    friendStatus: 'На вокале или дополнительных занятиях',
    hex: '#6e384b',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(110, 56, 75, 0.35) 0%, rgba(56, 28, 38, 0.88) 100%)',
      borderColor: 'rgba(204, 114, 146, 0.38)'
    },
    badge: 'bg-[#6e384b]/45 text-[#f0c2d2] border border-[#cc7292]/30',
    icon: Music
  },
  sleep: {
    label: 'Сон',
    friendStatus: 'Спит ❄️ (не будить)',
    hex: '#29395c',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(41, 57, 92, 0.36) 0%, rgba(20, 28, 46, 0.90) 100%)',
      borderColor: 'rgba(104, 132, 194, 0.35)'
    },
    badge: 'bg-[#29395c]/50 text-[#bacaf0] border border-[#6884c2]/30',
    icon: Moon
  },
  rest: {
    label: 'Отдых / Игры / Чилл',
    friendStatus: 'Отдыхает (можно звать в ДС или катку)',
    hex: '#285e63',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(40, 94, 99, 0.35) 0%, rgba(20, 47, 50, 0.88) 100%)',
      borderColor: 'rgba(96, 184, 191, 0.38)'
    },
    badge: 'bg-[#285e63]/45 text-[#b5e4e8] border border-[#60b8bf]/30',
    icon: Coffee
  },
  hobby: {
    label: 'Хобби / Творчество',
    friendStatus: 'Занята творчеством / музыкой / рукоделием',
    hex: '#593869',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(89, 56, 105, 0.35) 0%, rgba(45, 28, 53, 0.88) 100%)',
      borderColor: 'rgba(176, 118, 204, 0.38)'
    },
    badge: 'bg-[#593869]/45 text-[#e2c4f0] border border-[#b076cc]/30',
    icon: Palette
  },
  errands: {
    label: 'Дела / Поручения',
    friendStatus: 'Занята личными делами',
    hex: '#6e452b',
    surfaceStyle: {
      background: 'linear-gradient(135deg, rgba(110, 69, 43, 0.35) 0%, rgba(56, 35, 22, 0.88) 100%)',
      borderColor: 'rgba(204, 134, 90, 0.38)'
    },
    badge: 'bg-[#6e452b]/45 text-[#edc7af] border border-[#cc865a]/30',
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

const SNOWFLAKES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 19 + 7) % 98}%`,
  delay: `${(i * 1.3) % 10}s`,
  duration: `${12 + (i % 7) * 2.5}s`,
  size: i % 3 === 0 ? 4 : 2.5,
  opacity: 0.16 + (i % 4) * 0.06
}));

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

/**
 * Группирует события дня:
 * 1) Если события соприкасаются (endA >= startB) или нахлёстываются, но не лежат целиком внутри одного длинного блока —
 *    объединяет их в единую карточку с плавным градиентом между их цветами.
 * 2) Если событие лежит целиком внутри более длинного события (startInner >= startOuter && endInner <= endOuter) —
 *    показывает его внутри внешнего блока с градиентом по бокам между цветом внешнего и внутреннего занятия.
 */
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

    // Проверяем, лежит ли событие целиком внутри какого-то уже существующего блока
    const parentBlock = blocks.find(
      (b) => s >= b.startMin && e <= b.endMin && !(s === b.startMin && e === b.endMin)
    );

    if (parentBlock) {
      parentBlock.nested.push({ ...ev, startMin: s, endMin: e });
      return;
    }

    // Проверяем, соприкасается ли или пересекается ли событие с последним блоком
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
          return `${hex}59 ${pct}%`;
        })
        .join(', ');
      cardStyle = {
        background: `linear-gradient(120deg, ${stops}, rgba(14, 23, 26, 0.92) 100%)`,
        borderColor: `${uniqueColors[0]}99`
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

    return () => {
      unsubEvents();
      unsubDeadlines();
      unsubPings();
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
    <div className="min-h-screen bg-gradient-to-b from-[#0b1214] via-[#0e171a] to-[#0a1012] text-[#dce8eb] font-sans selection:bg-[#497078]/40 relative overflow-x-hidden">
      <style>{`
        @keyframes winterSnow {
          0% { transform: translateY(-10vh) translateX(0px); }
          50% { transform: translateY(50vh) translateX(12px); }
          100% { transform: translateY(110vh) translateX(-8px); }
        }
        .snowflake-dot {
          animation-name: winterSnow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {SNOWFLAKES.map((s) => (
          <span
            key={s.id}
            className="snowflake-dot absolute top-0 rounded-full bg-[#cfe3e8]"
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

      <header className="border-b border-[#22353b]/80 bg-[#0e171a]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2b4952] to-[#1a2e34] border border-[#456d78]/50 flex items-center justify-center shadow-lg shadow-black/30">
              <Snowflake className="w-5 h-5 text-[#c5e0e8]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#eaf4f7] flex items-center gap-2">
                Amaliia · Winter Study OS
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-[#19292e] border border-[#2c444c] text-[#9eb9c2]">
                  AT · {austriaNow.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </h1>
              <p className="text-xs text-[#89a6af]">
                JKU Linz (B2 + Physik) · НТУ «ХПІ» · ÖBB Bad Schallerbach ↔ Linz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#223c42] border border-[#436e78] text-[#cde6ed] text-sm font-medium hover:bg-[#2a4950] transition"
              >
                <Unlock className="w-4 h-4" />
                Режим Амалии (Выйти)
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#162327] border border-[#2b424a] text-[#cde0e6] text-sm font-medium hover:bg-[#1d2e33] transition"
              >
                <Lock className="w-4 h-4 text-[#8eb8c4]" />
                Я Амалия
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
        <div className="rounded-2xl p-4 border border-[#2c464e]/80 bg-gradient-to-r from-[#142226]/90 to-[#111c20]/90 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                currentStatus.busy ? 'bg-[#7fa6b0]' : 'bg-[#9fd1c9]'
              }`}
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-[#7e9ca6]">Статус прямо сейчас</div>
              <div className="font-semibold text-[#eaf4f7]">{currentStatus.label}</div>
              <div className="text-xs text-[#9db8c2]">{currentStatus.detail}</div>
            </div>
          </div>
          <div className="text-xs text-[#8eaab3] bg-[#0d1518]/80 px-3 py-2 rounded-xl border border-[#213339]">
            {isAdmin
              ? `Входящих пингов от друзей: ${pings.length}`
              : 'Гостевой режим просмотра · редактирование закрыто'}
          </div>
        </div>

        <div className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 rounded-xl bg-[#18272c] hover:bg-[#21353c] text-[#cde0e6] transition"
              title="Предыдущая неделя"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-[#0e171a] border border-[#24383f] flex items-center gap-2 text-sm font-medium text-[#e1eff2]">
              <CalendarIcon className="w-4 h-4 text-[#8eb8c4]" />
              <span>
                KW {activeKW} · с {weekDatesMap[1]}
              </span>
            </div>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 rounded-xl bg-[#18272c] hover:bg-[#21353c] text-[#cde0e6] transition"
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
                  ? 'bg-[#2a4750] border-[#4b7682] text-[#eef7fa]'
                  : 'bg-[#162327] border-[#263b42] text-[#9eb9c2] hover:bg-[#1c2c31]'
              }`}
            >
              Текущая неделя
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-3 py-1.5 rounded-lg bg-[#162327] border border-[#263b42] text-[#9eb9c2] hover:bg-[#1c2c31] transition"
            >
              +1 неделя
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {DAYS.map((d) => {
            const count = weekEvents.filter((e) => e.day === d.id).length;
            const active = selectedDay === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  active
                    ? 'bg-gradient-to-b from-[#233b42] to-[#192b30] border-[#4c7782] text-[#eef7fa] shadow-md shadow-black/30'
                    : 'bg-[#121d21]/85 border-[#213339] text-[#83a0a8] hover:border-[#344f57] hover:text-[#cde0e6]'
                }`}
              >
                <span className="text-xs font-bold">{d.short}</span>
                <span className="text-[11px] opacity-80">{weekDatesMap[d.id]}</span>
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    count > 0 ? 'bg-[#315059] text-[#d5ebf2]' : 'bg-[#0e171a] text-[#5e7880]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#eaf4f7]">
                {DAYS.find((d) => d.id === selectedDay)?.full} ({weekDatesMap[selectedDay]})
              </h2>
              <span className="text-xs text-[#83a0a8]">
                Событий: {selectedDayEvents.length}
              </span>
            </div>

            {scheduleBlocks.length === 0 ? (
              <div className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-8 text-center text-[#8eaab3] text-sm">
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
                        <div className="px-4 py-1.5 text-[11px] font-medium text-[#d8ecf2] bg-black/25 border-b border-white/10 flex items-center justify-between">
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
                                  <span className="font-mono text-sm font-bold text-[#f0f8fa]">
                                    {ev.start} – {ev.end}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${cat.badge}`}>
                                    {cat.label}
                                  </span>
                                  {ev.isRecurring && (
                                    <span className="text-[11px] text-[#9cb8c2] flex items-center gap-1">
                                      <Repeat className="w-3 h-3" /> еженедельно
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base font-semibold text-[#f3fafc] flex items-center gap-2">
                                  <IconComponent className="w-4 h-4 shrink-0 text-[#cfe6ed]" />
                                  <span>{ev.title}</span>
                                </h3>
                                {ev.location && (
                                  <div className="text-xs text-[#c7dee6] font-medium">{ev.location}</div>
                                )}
                                {ev.details && (
                                  <p className="text-xs text-[#9cb8c2] leading-relaxed pt-0.5">{ev.details}</p>
                                )}
                              </div>

                              {isAdmin && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {ev.isRecurring && (
                                    <button
                                      onClick={() => handleHideForThisWeek(ev)}
                                      title="Скрыть только на эту неделю"
                                      className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-[#c7dee6] transition"
                                    >
                                      <EyeOff className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteEvent(ev)}
                                    title="Удалить полностью"
                                    className="p-2 rounded-lg bg-black/30 hover:bg-rose-950/60 text-[#d9a3ad] transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Вложенные события внутри длинного блока — с градиентом по бокам */}
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
                                    <span className="font-mono text-xs font-bold text-[#f3fafc]">
                                      {inner.start} – {inner.end}
                                    </span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${innerCat.badge}`}>
                                      {innerCat.label}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-[#d8ecf2]">
                                      внутри блока
                                    </span>
                                  </div>
                                  <div className="text-sm font-semibold text-[#f3fafc] flex items-center gap-2">
                                    <InnerIcon className="w-4 h-4 shrink-0 text-[#e2f2f7]" />
                                    <span>{inner.title}</span>
                                  </div>
                                  {(inner.location || inner.details) && (
                                    <div className="text-xs text-[#cfe4eb]">
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
                                        className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 text-[#d8ecf2] transition"
                                      >
                                        <EyeOff className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteEvent(inner)}
                                      title="Удалить полностью"
                                      className="p-1.5 rounded-lg bg-black/35 hover:bg-rose-950/60 text-[#d9a3ad] transition"
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
              <div className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#8eb8c4]">
                  Свободные окна для учёбы (ХПІ / Физика JKU)
                </div>
                {freeWindows.length === 0 ? (
                  <p className="text-xs text-[#83a0a8]">Плотный день, больших окон между парами нет.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {freeWindows.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-xl bg-[#0e171a] border border-[#263b42] text-[#cde0e6]"
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
                className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-4 space-y-3"
              >
                <div className="text-sm font-semibold text-[#eaf4f7] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#8eb8c4]" />
                  Добавить пару, поезд, сон или отдых
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: Number(e.target.value) })}
                    className="bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
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
                    className="bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                  />
                  <input
                    type="time"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
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
                    className="bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                  />
                  <input
                    type="text"
                    placeholder="Место / Аудитория / Игра"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Заметки (номер поезда, пересадка, тема)"
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                  className="w-full bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#a5c0c9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.isRecurring}
                      onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                      className="rounded border-[#263b42] bg-[#0e171a]"
                    />
                    Повторять каждую неделю (иначе только на KW {activeKW})
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2a4952] hover:bg-[#355a66] border border-[#4a7785] text-[#eef7fa] text-xs font-semibold transition"
                  >
                    Сохранить в облако
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-5">
            <div className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#eaf4f7]">
                <Bell className="w-4 h-4 text-[#8eb8c4]" />
                Пингануть Амалию
              </div>

              <input
                type="text"
                placeholder="Твоё имя (Настя, Варя, Ваня...)"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
              />

              <div className="space-y-1.5">
                {QUICK_PINGS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendPing(q)}
                    className="w-full text-left text-xs p-3 rounded-xl bg-gradient-to-r from-[#18282d] to-[#142226] hover:from-[#21363d] hover:to-[#1b2d33] border border-[#2f4b54] text-[#dcecf0] transition leading-snug"
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
                  className="flex-1 bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                />
                <button
                  type="button"
                  onClick={() => sendPing()}
                  className="px-3 py-2 rounded-xl bg-[#2a4952] hover:bg-[#355a66] border border-[#4a7785] text-[#eef7fa] transition"
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

            {isAdmin && (
              <div className="bg-[#121d21]/90 border border-[#324f59] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#eaf4f7]">
                    <MessageSquare className="w-4 h-4 text-[#8eb8c4]" />
                    Входящие от друзей
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#223940] text-[#b4d6de]">
                    {pings.length}
                  </span>
                </div>
                {pings.length === 0 ? (
                  <p className="text-xs text-[#83a0a8]">Пока новых сообщений нет.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pings.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-[#0e171a] border border-[#24383f] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[#83a0a8]">
                          <span className="font-semibold text-[#9dc4cf]">{p.from}</span>
                          <div className="flex items-center gap-2">
                            <span>{p.timeLabel}</span>
                            <button
                              onClick={() => deletePing(p.id)}
                              className="text-[#6b8790] hover:text-[#c799a2]"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#dce8eb] leading-snug">{p.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#eaf4f7]">
                    <Clock className="w-4 h-4 text-[#8eb8c4]" />
                    Таймер фокуса
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customMinutes}
                      onChange={(e) => applyCustomMinutes(e.target.value)}
                      className="w-16 bg-[#0e171a] border border-[#263b42] rounded-lg px-2 py-1 text-xs text-[#e1eff2] text-center"
                    />
                    <span className="text-xs text-[#83a0a8]">мин</span>
                  </div>
                </div>

                <div className="text-3xl font-mono font-bold text-center py-2 text-[#eef7fa] tracking-wider">
                  {formattedTimer}
                </div>

                <div className="flex justify-center gap-1.5">
                  {[15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyCustomMinutes(m)}
                      className="px-2.5 py-1 rounded-lg bg-[#0e171a] hover:bg-[#19282d] border border-[#263b42] text-xs text-[#a5c0c9]"
                    >
                      {m}м
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((r) => !r)}
                    className="flex-1 py-2 rounded-xl bg-[#2a4952] hover:bg-[#355a66] border border-[#4a7785] text-[#eef7fa] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Пауза' : 'Старт'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCustomMinutes(customMinutes)}
                    className="px-3 py-2 rounded-xl bg-[#18272c] hover:bg-[#21353c] text-[#cde0e6] text-xs transition"
                    title="Сброс"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="bg-[#121d21]/90 border border-[#24383f] rounded-2xl p-4 space-y-3">
                <div className="text-sm font-semibold text-[#eaf4f7]">Дедлайны (JKU & ХПІ)</div>
                <form onSubmit={handleAddDeadline} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Что сдать (контрольная, эссе B2...)"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                    className="w-full bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newDeadline.course}
                      onChange={(e) => setNewDeadline({ ...newDeadline, course: e.target.value })}
                      className="bg-[#0e171a] border border-[#263b42] rounded-xl px-2.5 py-2 text-xs text-[#e1eff2]"
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
                      className="flex-1 bg-[#0e171a] border border-[#263b42] rounded-xl px-3 py-2 text-xs text-[#e1eff2]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-[#2a4952] hover:bg-[#355a66] border border-[#4a7785] text-[#eef7fa] text-xs font-semibold"
                    >
                      +
                    </button>
                  </div>
                </form>

                <div className="space-y-1.5">
                  {deadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#0e171a] border border-[#24383f] text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={dl.done}
                          onChange={() => toggleDeadline(dl)}
                          className="rounded border-[#263b42] bg-[#121d21]"
                        />
                        <span className={dl.done ? 'line-through text-[#637e87]' : 'text-[#dce8eb]'}>
                          <strong className="text-[#9dc4cf]">[{dl.course}]</strong> {dl.title}{' '}
                          {dl.due && <span className="text-[#83a0a8]">({dl.due})</span>}
                        </span>
                      </label>
                      <button
                        onClick={() => deleteDeadline(dl.id)}
                        className="text-[#6b8790] hover:text-[#c799a2]"
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

      {showPinModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handlePinSubmit}
            className="bg-[#121d21] border border-[#2e4952] rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#223940] text-[#9dc4cf] flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#eaf4f7]">Доступ владельца</h3>
              <p className="text-xs text-[#83a0a8]">Введите код доступа</p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
              className="w-full text-center tracking-[0.5em] text-lg bg-[#0e171a] border border-[#2c464e] rounded-xl px-4 py-2.5 text-[#eef7fa] focus:outline-none focus:border-[#538391]"
            />
            {pinError && <p className="text-xs text-[#c799a2] text-center">Неверный код</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="flex-1 py-2 rounded-xl bg-[#18272c] text-[#9eb9c2] text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#2a4952] hover:bg-[#355a66] border border-[#4a7785] text-[#eef7fa] text-xs font-semibold"
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