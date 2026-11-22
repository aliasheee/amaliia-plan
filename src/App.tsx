import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
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
  Sparkles,
  Calendar as CalendarIcon,
  MessageSquare,
  EyeOff,
  Repeat
} from 'lucide-react';

// Твоя конфигурация Firebase (проект amaliia-plan)
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

const CATEGORIES = {
  transit: {
    label: 'ÖBB / Дорога',
    friendStatus: 'В поезде / дороге в Линц',
    color: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
    badge: 'bg-sky-500/20 text-sky-300',
    icon: Train
  },
  jku: {
    label: 'JKU Linz',
    friendStatus: 'На паре в JKU Linz',
    color: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
    badge: 'bg-violet-500/20 text-violet-300',
    icon: GraduationCap
  },
  khpi: {
    label: 'НТУ «ХПІ»',
    friendStatus: 'Закрывает лабы/контрольные ХПІ',
    color: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    badge: 'bg-amber-500/20 text-amber-300',
    icon: BookOpen
  },
  tutoring: {
    label: 'Занятие с Варей',
    friendStatus: 'Помогает Варе с учёбой',
    color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-300',
    icon: Users
  },
  vocal: {
    label: 'Вокал / Немецкий',
    friendStatus: 'На вокале или доп. немецком',
    color: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
    badge: 'bg-rose-500/20 text-rose-300',
    icon: Music
  }
};

// Стартовое расписание (фиксированные ID — никаких дублей)
const INITIAL_EVENTS = [
  // Понедельник
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
  // Вторник
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
  // Среда
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
  // Четверг
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
  // Пятница
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
  'Амалия Владимировна, в котором часу вы будете свободны, сударыня, чтобы поколебать с вами молекулы газа? ⚛️',
  'Сударыня Амалия Владимировна, соизволите ли вы после пар заскочить за бабл-ті на Taubenmarkt? 🧋',
  'Амалия Владимировна, докладываю: поезда ÖBB не вечны, а катка в Valorant сама себя не сыграет. Когда в ДС? 🎮'
];

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

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [events, setEvents] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [pings, setPings] = useState([]);

  // Навигация по неделям (по умолчанию старт с понедельника KW 48 — 23.11.2026)
  const [weekOffset, setWeekOffset] = useState(() => {
    const now = new Date();
    const currentMon = getWeekMonday(now);
    const targetMon = new Date(2026, 10, 23); // 23 ноября 2026
    const diffWeeks = Math.round((targetMon - currentMon) / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks > 0 ? diffWeeks : 0;
  });

  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 1 : d;
  });

  // Форма добавления события
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

  // Форма дедлайна
  const [newDeadline, setNewDeadline] = useState({ title: '', course: 'НТУ «ХПІ»', due: '' });

  // Форма пинга от друга
  const [friendName, setFriendName] = useState('');
  const [pingMessage, setPingMessage] = useState('');
  const [pingSent, setPingSent] = useState(false);

  // Обычный настраиваемый таймер фокуса
  const [customMinutes, setCustomMinutes] = useState(45);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Австрийское время в реальном времени
  const [austriaNow, setAustriaNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setAustriaNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Авторизация Firebase
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Загрузка расписания и защита от дубликатов
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

  // Таймер обратного отсчёта
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

  // Даты для каждого дня выбранной недели
  const weekDatesMap = useMemo(() => {
    const map = {};
    DAYS.forEach((d, idx) => {
      const dt = new Date(activeMonday);
      dt.setDate(activeMonday.getDate() + idx);
      map[d.id] = `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}`;
    });
    return map;
  }, [activeMonday]);

  // Отфильтрованные события на текущую выбранную неделю
  const weekEvents = useMemo(() => {
    return events
      .filter((ev) => {
        if (ev.hiddenWeeks && ev.hiddenWeeks.includes(activeWeekKey)) return false;
        if (ev.isRecurring || ev.weekKey === 'recurring') return true;
        return ev.weekKey === activeWeekKey;
      })
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [events, activeWeekKey]);

  // Статус Амалии прямо сейчас
  const currentStatus = useMemo(() => {
    const day = austriaNow.getDay();
    const mins = austriaNow.getHours() * 60 + austriaNow.getMinutes();
    const todayKey = formatWeekKey(getWeekMonday(austriaNow));

    const activeNow = events.find((ev) => {
      if (ev.day !== day) return false;
      if (ev.hiddenWeeks && ev.hiddenWeeks.includes(todayKey)) return false;
      const appliesToday = ev.isRecurring || ev.weekKey === 'recurring' || ev.weekKey === todayKey;
      if (!appliesToday) return false;
      return mins >= timeToMinutes(ev.start) && mins <= timeToMinutes(ev.end);
    });

    if (activeNow) {
      const cat = CATEGORIES[activeNow.category] || CATEGORIES.jku;
      return {
        busy: true,
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

  // Свободные окна для учёбы в выбранный день
  const freeWindows = useMemo(() => {
    const dayEvs = weekEvents.filter((e) => e.day === selectedDay);
    const windows = [];
    let cursor = 9 * 60; // с 09:00
    const endOfDay = 21 * 60; // до 21:00

    dayEvs.forEach((ev) => {
      const s = timeToMinutes(ev.start);
      const e = timeToMinutes(ev.end);
      if (s - cursor >= 60) {
        windows.push({
          from: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
          to: ev.start,
          mins: s - cursor
        });
      }
      cursor = Math.max(cursor, e);
    });

    if (endOfDay - cursor >= 60) {
      windows.push({
        from: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
        to: '21:00',
        mins: endOfDay - cursor
      });
    }
    return windows;
  }, [weekEvents, selectedDay]);

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
    if (!newEvent.title.trim()) return;
    await addDoc(collection(db, 'schedule_events'), {
      ...newEvent,
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
    <div className="min-h-screen bg-[#0d0f14] text-slate-100 font-sans selection:bg-violet-500/30">
      {/* Верхняя панель */}
      <header className="border-b border-slate-800/80 bg-[#12151e]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Amaliia · Study & Transit OS
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  AT · {austriaNow.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                JKU Linz (B2 + Physik) · НТУ «ХПІ» · ÖBB Bad Schallerbach ↔ Linz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-medium hover:bg-emerald-500/25 transition"
              >
                <Unlock className="w-4 h-4" />
                Режим Амалии (Выйти)
              </button>
            ) : (
              <button
                onClick={() => setShowPinModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-700 transition"
              >
                <Lock className="w-4 h-4 text-violet-400" />
                Я Амалия
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Виджет текущего статуса */}
        <div
          className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            currentStatus.busy
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                currentStatus.busy ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Статус прямо сейчас</div>
              <div className="font-semibold text-white">{currentStatus.label}</div>
              <div className="text-xs text-slate-300">{currentStatus.detail}</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800">
            {isAdmin
              ? `Входящих пингов от друзей: ${pings.length}`
              : 'Гостевой режим просмотра · редактирование закрыто'}
          </div>
        </div>

        {/* Навигация по неделям */}
        <div className="bg-[#141824] border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Предыдущая неделя"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="w-4 h-4 text-violet-400" />
              <span>
                KW {activeKW} · с {weekDatesMap[1]}
              </span>
            </div>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
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
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Текущая неделя
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
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
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  active
                    ? 'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-950/30'
                    : 'bg-[#141824] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">{d.short}</span>
                <span className="text-[11px] opacity-80">{weekDatesMap[d.id]}</span>
                <span
                  className={`text-[10px] px-1.5 rounded-full ${
                    count > 0 ? 'bg-violet-500/30 text-violet-200' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Основная сетка: Расписание + Боковая панель */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: События дня */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                {DAYS.find((d) => d.id === selectedDay)?.full} ({weekDatesMap[selectedDay]})
              </h2>
              <span className="text-xs text-slate-400">
                Событий: {weekEvents.filter((e) => e.day === selectedDay).length}
              </span>
            </div>

            {weekEvents.filter((e) => e.day === selectedDay).length === 0 ? (
              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
                На этот день пары и поездки не запланированы — можно спокойно закрывать лабы ХПІ, учить физику или отдыхать.
              </div>
            ) : (
              <div className="space-y-3">
                {weekEvents
                  .filter((e) => e.day === selectedDay)
                  .map((ev) => {
                    const cat = CATEGORIES[ev.category] || CATEGORIES.jku;
                    const IconComponent = cat.icon;
                    return (
                      <div
                        key={ev.id}
                        className={`rounded-2xl p-4 border transition ${cat.color} bg-[#141824]`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white">
                                {ev.start} – {ev.end}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${cat.badge}`}>
                                {cat.label}
                              </span>
                              {ev.isRecurring && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Repeat className="w-3 h-3" /> еженедельно
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                              <IconComponent className="w-4 h-4 shrink-0" />
                              {ev.title}
                            </h3>
                            {ev.location && (
                              <div className="text-xs text-slate-300 font-medium">{ev.location}</div>
                            )}
                            {ev.details && (
                              <p className="text-xs text-slate-400 leading-relaxed pt-1">{ev.details}</p>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-1 shrink-0">
                              {ev.isRecurring && (
                                <button
                                  onClick={() => handleHideForThisWeek(ev)}
                                  title="Скрыть только на эту неделю"
                                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                                >
                                  <EyeOff className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteEvent(ev)}
                                title="Удалить полностью"
                                className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Подсказка свободных окон для учёбы (видна только Амалии) */}
            {isAdmin && (
              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                  Свободные окна для учёбы (ХПІ / Физика JKU)
                </div>
                {freeWindows.length === 0 ? (
                  <p className="text-xs text-slate-400">Плотный день, больших окон между парами нет.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {freeWindows.map((w, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200"
                      >
                        {w.from} – {w.to} ({Math.floor(w.mins / 60)}ч {w.mins % 60}м)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Форма добавления события (только для Амалии) */}
            {isAdmin && (
              <form
                onSubmit={handleAddEvent}
                className="bg-[#141824] border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-violet-400" />
                  Добавить пару, поезд или занятие
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={newEvent.day}
                    onChange={(e) => setNewEvent({ ...newEvent, day: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
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
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="time"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
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
                    placeholder="Название (например, Лаба по программированию ХПІ)"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Аудитория / Платформа / Ссылка"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Заметки (номер поезда, пересадка, тема)"
                  value={newEvent.details}
                  onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.isRecurring}
                      onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-violet-500"
                    />
                    Повторять каждую неделю (иначе только на KW {activeKW})
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition"
                  >
                    Сохранить в облако
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Правая колонка: Пинг от друзей + Таймер + Дедлайны */}
          <div className="space-y-5">
            {/* Виджет для друзей: Пингануть Амалию */}
            <div className="bg-[#141824] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bell className="w-4 h-4 text-violet-400" />
                Пингануть Амалию
              </div>
              <p className="text-xs text-slate-400">
                Посмотрел расписание? Оставь быстрый маячок, чтобы не отвлекать во время пары или поезда:
              </p>

              <input
                type="text"
                placeholder="Твоё имя (Настя, Стеша, Варя...)"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />

              <div className="space-y-1.5">
                {QUICK_PINGS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendPing(q)}
                    className="w-full text-left text-xs p-2.5 rounded-xl bg-slate-900/90 hover:bg-violet-600/20 border border-slate-800 hover:border-violet-500/40 text-slate-200 transition leading-snug"
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
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => sendPing()}
                  className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition"
                  title="Отправить"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {pingSent && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Маячок улетел Амалии!
                </div>
              )}
            </div>

            {/* Входящие пинги от друзей (видны только Амалии) */}
            {isAdmin && (
              <div className="bg-[#141824] border border-violet-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    Входящие от друзей
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                    {pings.length}
                  </span>
                </div>
                {pings.length === 0 ? (
                  <p className="text-xs text-slate-400">Пока новых сообщений нет.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pings.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-violet-300">{p.from}</span>
                          <div className="flex items-center gap-2">
                            <span>{p.timeLabel}</span>
                            <button
                              onClick={() => deletePing(p.id)}
                              className="text-slate-500 hover:text-rose-400"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-200 leading-snug">{p.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Настраиваемый таймер фокуса (только для Амалии) */}
            {isAdmin && (
              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Clock className="w-4 h-4 text-sky-400" />
                    Таймер фокуса
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={customMinutes}
                      onChange={(e) => applyCustomMinutes(e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center"
                    />
                    <span className="text-xs text-slate-400">мин</span>
                  </div>
                </div>

                <div className="text-3xl font-mono font-bold text-center py-2 text-white tracking-wider">
                  {formattedTimer}
                </div>

                <div className="flex justify-center gap-1.5">
                  {[15, 25, 45, 60].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => applyCustomMinutes(m)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300"
                    >
                      {m}м
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((r) => !r)}
                    className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {timerRunning ? 'Пауза' : 'Старт'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCustomMinutes(customMinutes)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                    title="Сброс"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Закрытый трекер дедлайнів (виден только Амалии) */}
            {isAdmin && (
              <div className="bg-[#141824] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="text-sm font-semibold text-white">Дедлайны (JKU & ХПІ)</div>
                <form onSubmit={handleAddDeadline} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Что сдать (контрольная, эссе B2...)"
                    value={newDeadline.title}
                    onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newDeadline.course}
                      onChange={(e) => setNewDeadline({ ...newDeadline, course: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                    >
                      <option value="НТУ «ХПІ»">НТУ «ХПІ»</option>
                      <option value="JKU Deutsch B2">JKU Deutsch B2</option>
                      <option value="JKU Physik">JKU Physik</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Срок (напр. Пн 23.11)"
                      value={newDeadline.due}
                      onChange={(e) => setNewDeadline({ ...newDeadline, due: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
                    >
                      +
                    </button>
                  </div>
                </form>

                <div className="space-y-1.5">
                  {deadlines.map((dl) => (
                    <div
                      key={dl.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={dl.done}
                          onChange={() => toggleDeadline(dl)}
                          className="rounded border-slate-700 bg-slate-800 text-violet-500"
                        />
                        <span className={dl.done ? 'line-through text-slate-500' : 'text-slate-200'}>
                          <strong className="text-violet-300">[{dl.course}]</strong> {dl.title}{' '}
                          {dl.due && <span className="text-slate-400">({dl.due})</span>}
                        </span>
                      </label>
                      <button
                        onClick={() => deleteDeadline(dl.id)}
                        className="text-slate-500 hover:text-rose-400"
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

      {/* Модальное окно входа (без подсказок PIN-кода) */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handlePinSubmit}
            className="bg-[#141824] border border-slate-700 rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl"
          >
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Доступ владельца</h3>
              <p className="text-xs text-slate-400">Введите код доступа</p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              autoFocus
              className="w-full text-center tracking-[0.5em] text-lg bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
            />
            {pinError && <p className="text-xs text-rose-400 text-center">Неверный код</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
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