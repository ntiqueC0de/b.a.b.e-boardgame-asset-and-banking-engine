import React, {
  useReducer,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  Landmark,
  Users,
  History as HistoryIcon,
  Settings,
  ArrowRight,
  Plus,
  Trash2,
  Play,
  Check,
  X,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  Home,
  Building,
  Download,
  Upload,
  Info,
  Edit3,
  Award,
  Sun,
  Moon,
  Train,
  Zap,
  Droplet,
  Github,
  Plane,
  Car,
  Ship,
  Palette,
  PartyPopper,
  ArrowRightLeft,
  Coins,
  Handshake,
  Share2,
  LayoutGrid,
  List,
  BookOpen,
  RefreshCcw,
  Layers,
  Wand2,
} from "lucide-react";

// ==========================================
// SOUND ENGINE & HAPTICS (ZERO DEPENDENCY)
// ==========================================
let audioCtx = null;

const playSoundEffect = (type, enabled) => {
  if (!enabled) return;
  try {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "tap") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "flip") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    // Fail silently if audio is blocked
  }
};

const triggerHaptic = (pattern, enabled) => {
  if (!enabled) return;
  if (typeof window !== "undefined" && window.navigator?.vibrate) {
    window.navigator.vibrate(pattern);
  }
};

// ==========================================
// PURE CSS CONFETTI COMPONENT
// ==========================================
const Confetti = () => {
  const colors = [
    "#fce18a",
    "#ff7edb",
    "#8a2be2",
    "#4ade80",
    "#38bdf8",
    "#f87171",
  ];
  const pieces = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: colors[Math.floor(Math.random() * colors.length)],
    animationDuration: `${Math.random() * 3 + 2}s`,
    animationDelay: `${Math.random() * 2}s`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-[500] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-[-20px] w-2 h-4 rounded-sm"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animation: `confettiFall ${p.animationDuration} linear ${p.animationDelay} infinite`,
          }}
        />
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `@keyframes confettiFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`,
        }}
      />
    </div>
  );
};

// ==========================================
// DATA & CONSTANTS
// ==========================================
const generateId = () => Math.random().toString(36).substring(2, 15);

const PLAYER_COLORS = [
  {
    name: "Rose",
    bg: "bg-rose-500",
    text: "text-rose-500",
    border: "border-rose-500",
  },
  {
    name: "Sky",
    bg: "bg-sky-500",
    text: "text-sky-500",
    border: "border-sky-500",
  },
  {
    name: "Emerald",
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500",
  },
  {
    name: "Amber",
    bg: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500",
  },
  {
    name: "Violet",
    bg: "bg-violet-500",
    text: "text-violet-500",
    border: "border-violet-500",
  },
  {
    name: "Fuchsia",
    bg: "bg-fuchsia-500",
    text: "text-fuchsia-500",
    border: "border-fuchsia-500",
  },
];

const PRESET_COLORS = [
  { label: "Pink", hex: "#ec4899" },
  { label: "Purple", hex: "#a855f7" },
  { label: "Green", hex: "#22c55e" },
  { label: "Yellow", hex: "#eab308" },
  { label: "Blue", hex: "#3b82f6" },
  { label: "Cyan", hex: "#06b6d4" },
];

const DEFAULT_ACTION_CARDS = [
  {
    id: "ac1",
    title: "Bank Error in Your Favor",
    desc: "Collect $200 immediately.",
    type: "reward",
    icon: "Coins",
  },
  {
    id: "ac2",
    title: "Speeding Fine",
    desc: "Pay $15 for speeding.",
    type: "penalty",
    icon: "Car",
  },
  {
    id: "ac3",
    title: "Go to Jail",
    desc: "Go directly to Jail. Do not pass Go. Do not collect $200.",
    type: "penalty",
    icon: "AlertOctagon",
  },
  {
    id: "ac4",
    title: "Street Repairs",
    desc: "Pay $40 per house and $115 per hotel you own.",
    type: "penalty",
    icon: "Building",
  },
  {
    id: "ac5",
    title: "Won Beauty Contest",
    desc: "Collect $10 from the Bank.",
    type: "reward",
    icon: "Award",
  },
  {
    id: "ac6",
    title: "Chairman of the Board",
    desc: "Pay each player $50.",
    type: "penalty",
    icon: "Users",
  },
  {
    id: "ac7",
    title: "Dividend",
    desc: "The Bank pays you a dividend of $50.",
    type: "reward",
    icon: "TrendingUp",
  },
  {
    id: "ac8",
    title: "Advance to Go",
    desc: "Advance directly to Go and collect $200.",
    type: "reward",
    icon: "ArrowRight",
  },
  {
    id: "ac9",
    title: "Tax Audit",
    desc: "Pay $100 in unexpected taxes.",
    type: "penalty",
    icon: "TrendingDown",
  },
  {
    id: "ac10",
    title: "Inheritance",
    desc: "You inherit $100.",
    type: "reward",
    icon: "Landmark",
  },
  {
    id: "ac11",
    title: "Elected Official",
    desc: "Collect $50 from every player for campaign funds.",
    type: "chaos",
    icon: "Handshake",
  },
  {
    id: "ac12",
    title: "Chaos Magic",
    desc: "Swap properties with a player of your choice (Value must be roughly equal).",
    type: "chaos",
    icon: "Zap",
  },
];

const DEFAULT_PROPERTIES = [
  {
    id: "p1",
    name: "Mediterranean Ave",
    group: "Brown",
    color: "bg-[#8B4513]",
    price: 60,
    build: 50,
    hotel: 50,
    mort: 30,
    type: "street",
  },
  {
    id: "p2",
    name: "Baltic Ave",
    group: "Brown",
    color: "bg-[#8B4513]",
    price: 60,
    build: 50,
    hotel: 50,
    mort: 30,
    type: "street",
  },
  {
    id: "p3",
    name: "Reading Railroad",
    group: "Railroad",
    color: "bg-[#171717]",
    price: 200,
    mort: 100,
    type: "railroad",
    icon: "Train",
  },
  {
    id: "p4",
    name: "Oriental Ave",
    group: "Light Blue",
    color: "bg-[#87CEEB]",
    price: 100,
    build: 50,
    hotel: 50,
    mort: 50,
    type: "street",
    text: "text-neutral-900",
  },
  {
    id: "p5",
    name: "Vermont Ave",
    group: "Light Blue",
    color: "bg-[#87CEEB]",
    price: 100,
    build: 50,
    hotel: 50,
    mort: 50,
    type: "street",
    text: "text-neutral-900",
  },
  {
    id: "p6",
    name: "Connecticut Ave",
    group: "Light Blue",
    color: "bg-[#87CEEB]",
    price: 120,
    build: 50,
    hotel: 50,
    mort: 60,
    type: "street",
    text: "text-neutral-900",
  },
  {
    id: "p7",
    name: "St. Charles Place",
    group: "Pink",
    color: "bg-[#FF69B4]",
    price: 140,
    build: 100,
    hotel: 100,
    mort: 70,
    type: "street",
  },
  {
    id: "p8",
    name: "Electric Company",
    group: "Utility",
    color: "bg-[#d4d4d8]",
    text: "text-neutral-900",
    price: 150,
    mort: 75,
    type: "utility",
    icon: "Zap",
  },
  {
    id: "p9",
    name: "States Ave",
    group: "Pink",
    color: "bg-[#FF69B4]",
    price: 140,
    build: 100,
    hotel: 100,
    mort: 70,
    type: "street",
  },
  {
    id: "p10",
    name: "Virginia Ave",
    group: "Pink",
    color: "bg-[#FF69B4]",
    price: 160,
    build: 100,
    hotel: 100,
    mort: 80,
    type: "street",
  },
  {
    id: "p11",
    name: "Penn. Railroad",
    group: "Railroad",
    color: "bg-[#171717]",
    price: 200,
    mort: 100,
    type: "railroad",
    icon: "Train",
  },
  {
    id: "p12",
    name: "St. James Place",
    group: "Orange",
    color: "bg-[#FF8C00]",
    price: 180,
    build: 100,
    hotel: 100,
    mort: 90,
    type: "street",
  },
  {
    id: "p13",
    name: "Tennessee Ave",
    group: "Orange",
    color: "bg-[#FF8C00]",
    price: 180,
    build: 100,
    hotel: 100,
    mort: 90,
    type: "street",
  },
  {
    id: "p14",
    name: "New York Ave",
    group: "Orange",
    color: "bg-[#FF8C00]",
    price: 200,
    build: 100,
    hotel: 100,
    mort: 100,
    type: "street",
  },
  {
    id: "p15",
    name: "Kentucky Ave",
    group: "Red",
    color: "bg-[#FF0000]",
    price: 220,
    build: 150,
    hotel: 150,
    mort: 110,
    type: "street",
  },
  {
    id: "p16",
    name: "Indiana Ave",
    group: "Red",
    color: "bg-[#FF0000]",
    price: 220,
    build: 150,
    hotel: 150,
    mort: 110,
    type: "street",
  },
  {
    id: "p17",
    name: "Illinois Ave",
    group: "Red",
    color: "bg-[#FF0000]",
    price: 240,
    build: 150,
    hotel: 150,
    mort: 120,
    type: "street",
  },
  {
    id: "p18",
    name: "B. & O. Railroad",
    group: "Railroad",
    color: "bg-[#171717]",
    price: 200,
    mort: 100,
    type: "railroad",
    icon: "Train",
  },
  {
    id: "p19",
    name: "Atlantic Ave",
    group: "Yellow",
    color: "bg-[#FFD700]",
    text: "text-neutral-900",
    price: 260,
    build: 150,
    hotel: 150,
    mort: 130,
    type: "street",
  },
  {
    id: "p20",
    name: "Ventnor Ave",
    group: "Yellow",
    color: "bg-[#FFD700]",
    text: "text-neutral-900",
    price: 260,
    build: 150,
    hotel: 150,
    mort: 130,
    type: "street",
  },
  {
    id: "p21",
    name: "Water Works",
    group: "Utility",
    color: "bg-[#d4d4d8]",
    text: "text-neutral-900",
    price: 150,
    mort: 75,
    type: "utility",
    icon: "Droplet",
  },
  {
    id: "p22",
    name: "Marvin Gardens",
    group: "Yellow",
    color: "bg-[#FFD700]",
    text: "text-neutral-900",
    price: 280,
    build: 150,
    hotel: 150,
    mort: 140,
    type: "street",
  },
  {
    id: "p23",
    name: "Pacific Ave",
    group: "Green",
    color: "bg-[#008000]",
    price: 300,
    build: 200,
    hotel: 200,
    mort: 150,
    type: "street",
  },
  {
    id: "p24",
    name: "North Carolina Ave",
    group: "Green",
    color: "bg-[#008000]",
    price: 300,
    build: 200,
    hotel: 200,
    mort: 150,
    type: "street",
  },
  {
    id: "p25",
    name: "Pennsylvania Ave",
    group: "Green",
    color: "bg-[#008000]",
    price: 320,
    build: 200,
    hotel: 200,
    mort: 160,
    type: "street",
  },
  {
    id: "p26",
    name: "Short Line Railroad",
    group: "Railroad",
    color: "bg-[#171717]",
    price: 200,
    mort: 100,
    type: "railroad",
    icon: "Train",
  },
  {
    id: "p27",
    name: "Park Place",
    group: "Dark Blue",
    color: "bg-[#00008B]",
    price: 350,
    build: 200,
    hotel: 200,
    mort: 175,
    type: "street",
  },
  {
    id: "p28",
    name: "Boardwalk",
    group: "Dark Blue",
    color: "bg-[#00008B]",
    price: 400,
    build: 200,
    hotel: 200,
    mort: 200,
    type: "street",
  },
];

const THEMES = {
  dark: {
    base: "bg-neutral-950 text-neutral-100",
    card: "bg-neutral-900 border-neutral-800",
    header: "bg-neutral-950/80 border-neutral-900",
    nav: "bg-neutral-950 border-neutral-900",
    textMain: "text-white",
    textMuted: "text-neutral-400",
    textFaint: "text-neutral-600",
    border: "border-neutral-800",
    borderHover: "hover:border-neutral-700 hover:scale-[1.01]",
    input: "bg-neutral-950 border-neutral-800 text-white",
    numpad: "bg-neutral-800 text-white active:bg-neutral-700",
    numpadDel:
      "bg-neutral-900 border-neutral-800 text-rose-500 active:bg-neutral-800",
    modalOverlay: "bg-black/80",
    modalBg: "bg-neutral-900 border-neutral-800",
    modalHeader: "bg-neutral-950/50 border-neutral-800",
    actionTabNormal: "text-neutral-500 hover:bg-neutral-900",
    p2pTag: "bg-neutral-950 border-neutral-800 text-white",
    bankGradient: "from-neutral-900 to-neutral-950 border-neutral-800",
    isDark: true,
  },
  light: {
    base: "bg-slate-50 text-slate-900",
    card: "bg-white border-slate-200 shadow-sm",
    header: "bg-white/80 border-slate-200",
    nav: "bg-white border-slate-200",
    textMain: "text-slate-900",
    textMuted: "text-slate-500",
    textFaint: "text-slate-400",
    border: "border-slate-200",
    borderHover: "hover:border-slate-300 hover:scale-[1.01]",
    input: "bg-slate-100 border-slate-200 text-slate-900",
    numpad: "bg-slate-100 text-slate-900 active:bg-slate-200",
    numpadDel:
      "bg-slate-200 border-slate-300 text-rose-600 active:bg-slate-300",
    modalOverlay: "bg-slate-900/60",
    modalBg: "bg-white border-slate-200",
    modalHeader: "bg-slate-50 border-slate-200",
    actionTabNormal: "text-slate-500 hover:bg-slate-100",
    p2pTag: "bg-slate-50 border-slate-200 text-slate-900",
    bankGradient: "from-slate-100 to-white border-slate-200 shadow-sm",
    isDark: false,
  },
  midnight: {
    base: "bg-[#0b1120] text-slate-100",
    card: "bg-[#111827] border-[#1e293b]",
    header: "bg-[#0b1120]/80 border-[#0b1120]",
    nav: "bg-[#0b1120] border-[#1e293b]",
    textMain: "text-slate-50",
    textMuted: "text-slate-400",
    textFaint: "text-slate-600",
    border: "border-[#1e293b]",
    borderHover: "hover:border-[#334155] hover:scale-[1.01]",
    input: "bg-[#0b1120] border-[#1e293b] text-slate-50",
    numpad: "bg-[#1e293b] text-slate-50 active:bg-[#334155]",
    numpadDel:
      "bg-[#0f172a] border-[#1e293b] text-rose-500 active:bg-[#1e293b]",
    modalOverlay: "bg-[#020617]/80",
    modalBg: "bg-[#0f172a] border-[#1e293b]",
    modalHeader: "bg-[#0b1120] border-[#1e293b]",
    actionTabNormal: "text-slate-400 hover:bg-[#1e293b]",
    p2pTag: "bg-[#0b1120] border-[#1e293b] text-slate-50",
    bankGradient: "from-[#0f172a] to-[#0b1120] border-[#1e293b]",
    isDark: true,
  },
  coffee: {
    base: "bg-[#1c1917] text-[#f5f5f4]",
    card: "bg-[#292524] border-[#44403c]",
    header: "bg-[#1c1917]/80 border-[#1c1917]",
    nav: "bg-[#1c1917] border-[#44403c]",
    textMain: "text-[#fafaf9]",
    textMuted: "text-[#a8a29e]",
    textFaint: "text-[#78716c]",
    border: "border-[#44403c]",
    borderHover: "hover:border-[#57534e] hover:scale-[1.01]",
    input: "bg-[#1c1917] border-[#44403c] text-[#fafaf9]",
    numpad: "bg-[#44403c] text-[#fafaf9] active:bg-[#57534e]",
    numpadDel:
      "bg-[#292524] border-[#44403c] text-rose-400 active:bg-[#44403c]",
    modalOverlay: "bg-black/80",
    modalBg: "bg-[#292524] border-[#44403c]",
    modalHeader: "bg-[#1c1917] border-[#44403c]",
    actionTabNormal: "text-[#a8a29e] hover:bg-[#44403c]",
    p2pTag: "bg-[#1c1917] border-[#44403c] text-[#fafaf9]",
    bankGradient: "from-[#292524] to-[#1c1917] border-[#44403c]",
    isDark: true,
  },
  ocean: {
    base: "bg-[#082f49] text-sky-50",
    card: "bg-[#0f172a] border-[#0ea5e9]/50",
    header: "bg-[#082f49]/80 border-[#0ea5e9]/50",
    nav: "bg-[#082f49] border-[#0ea5e9]/50",
    textMain: "text-sky-100",
    textMuted: "text-sky-300",
    textFaint: "text-sky-500/50",
    border: "border-[#0369a1]",
    borderHover: "hover:border-[#38bdf8] hover:scale-[1.01]",
    input: "bg-[#0c4a6e] border-[#0ea5e9]/50 text-sky-50",
    numpad: "bg-[#0c4a6e] text-sky-50 active:bg-[#0284c7]",
    numpadDel:
      "bg-[#0f172a] border-[#0ea5e9]/50 text-rose-400 active:bg-[#0c4a6e]",
    modalOverlay: "bg-[#082f49]/80",
    modalBg: "bg-[#0f172a] border-[#0ea5e9]/50",
    modalHeader: "bg-[#082f49] border-[#0ea5e9]/50",
    actionTabNormal: "text-sky-400 hover:bg-[#0c4a6e]",
    p2pTag: "bg-[#082f49] border-[#0ea5e9]/50 text-sky-50",
    bankGradient: "from-[#0f172a] to-[#082f49] border-[#0ea5e9]/50",
    isDark: true,
  },
  forest: {
    base: "bg-[#022c22] text-emerald-50",
    card: "bg-[#064e3b] border-[#10b981]/50",
    header: "bg-[#022c22]/80 border-[#10b981]/50",
    nav: "bg-[#022c22] border-[#10b981]/50",
    textMain: "text-emerald-50",
    textMuted: "text-emerald-300",
    textFaint: "text-emerald-500/50",
    border: "border-[#047857]",
    borderHover: "hover:border-[#34d399] hover:scale-[1.01]",
    input: "bg-[#065f46] border-[#10b981]/50 text-emerald-50",
    numpad: "bg-[#065f46] text-emerald-50 active:bg-[#047857]",
    numpadDel:
      "bg-[#064e3b] border-[#10b981]/50 text-rose-400 active:bg-[#065f46]",
    modalOverlay: "bg-[#022c22]/80",
    modalBg: "bg-[#064e3b] border-[#10b981]/50",
    modalHeader: "bg-[#022c22] border-[#10b981]/50",
    actionTabNormal: "text-emerald-400 hover:bg-[#065f46]",
    p2pTag: "bg-[#022c22] border-[#10b981]/50 text-emerald-50",
    bankGradient: "from-[#064e3b] to-[#022c22] border-[#10b981]/50",
    isDark: true,
  },
  cyberpunk: {
    base: "bg-[#09090b] text-[#fdf4ff]",
    card: "bg-[#18181b] border-[#ec4899]/50",
    header: "bg-[#09090b]/80 border-[#ec4899]/50",
    nav: "bg-[#09090b] border-[#ec4899]/50",
    textMain: "text-[#fdf4ff]",
    textMuted: "text-[#f472b6]",
    textFaint: "text-[#be185d]",
    border: "border-[#db2777]",
    borderHover: "hover:border-[#f9a8d4] hover:scale-[1.01]",
    input: "bg-[#27272a] border-[#ec4899]/50 text-[#fdf4ff]",
    numpad: "bg-[#27272a] text-[#fdf4ff] active:bg-[#3f3f46]",
    numpadDel:
      "bg-[#18181b] border-[#ec4899]/50 text-rose-500 active:bg-[#27272a]",
    modalOverlay: "bg-[#09090b]/90",
    modalBg: "bg-[#18181b] border-[#ec4899]/50",
    modalHeader: "bg-[#09090b] border-[#ec4899]/50",
    actionTabNormal: "text-[#f472b6] hover:bg-[#27272a]",
    p2pTag: "bg-[#09090b] border-[#ec4899]/50 text-[#fdf4ff]",
    bankGradient: "from-[#18181b] to-[#09090b] border-[#ec4899]/50",
    isDark: true,
  },
};

const INITIAL_STATE = {
  phase: "setup",
  players: [],
  history: [],
  board: JSON.parse(JSON.stringify(DEFAULT_PROPERTIES)),
  propertyState: {},
  treasureBucket: 0,
  actionDeck: [],
  lastDrawnCard: null,
  settings: {
    startingBalance: 1500,
    enableDebt: true,
    enableDebtLimit: true,
    maxDebt: 1000,
    unmortgageInterest: 10,
    housesBeforeHotel: 4,
    enableTreasureBucket: true,
    trueDeckMode: false,
    enableSounds: true,
    enableHaptics: true,
    theme: "dark",
    customColors: [],
    deckConfig: JSON.parse(JSON.stringify(DEFAULT_ACTION_CARDS)),
  },
  setupError: null,
  pendingBmsAlert: null,
  pendingJackpotAlert: null,
  pendingTradeAlert: null,
};

// ==========================================
// ENGINE LOGIC: BMS DETECTION
// ==========================================
const checkBmsGroup = (board, propState, propertyId, newOwnerId) => {
  const propDef = board.find((p) => p.id === propertyId);
  if (
    !propDef ||
    !propDef.group ||
    propDef.group === "Railroad" ||
    propDef.group === "Utility" ||
    propDef.group === "Custom"
  )
    return null;

  const groupProps = board.filter((p) => p.group === propDef.group);
  if (groupProps.length === 0) return null;

  const isNowBmsGroup = groupProps.every((p) => {
    if (p.id === propertyId) return true;
    return propState[p.id]?.ownerId === newOwnerId;
  });

  const wasBmsGroup = groupProps.every(
    (p) => propState[p.id]?.ownerId === newOwnerId,
  );

  if (isNowBmsGroup && !wasBmsGroup) {
    return { group: propDef.group, color: propDef.color || "bg-neutral-500" };
  }
  return null;
};

const doesGroupHaveHouses = (board, propState, propertyId) => {
  const propDef = board.find((p) => p.id === propertyId);
  if (!propDef) return false;
  const groupProps = board.filter((p) => p.group === propDef.group);
  return groupProps.some((p) => propState[p.id]?.houses > 0);
};

// ==========================================
// REDUCER
// ==========================================
function gameReducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE": {
      const loadedSettings = action.payload.settings || {};
      if (!loadedSettings.deckConfig) {
        loadedSettings.deckConfig = JSON.parse(
          JSON.stringify(DEFAULT_ACTION_CARDS),
        );
      }
      return {
        ...INITIAL_STATE,
        ...action.payload,
        settings: {
          ...INITIAL_STATE.settings,
          ...loadedSettings,
        },
      };
    }

    case "ADD_PLAYER": {
      const name = action.payload.name.trim();
      if (
        state.players.some((p) => p.name.toLowerCase() === name.toLowerCase())
      ) {
        return { ...state, setupError: "Name already exists!" };
      }
      if (state.players.length >= 6) return state;

      return {
        ...state,
        setupError: null,
        players: [
          ...state.players,
          {
            id: generateId(),
            name: name,
            color: PLAYER_COLORS[state.players.length % PLAYER_COLORS.length],
            balance: state.settings.startingBalance,
            debt: 0,
            isBankrupt: false,
          },
        ],
      };
    }

    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      };

    case "CLEAR_SETUP_ERROR":
      return { ...state, setupError: null };

    case "UPDATE_BOARD":
      return { ...state, board: action.payload };

    case "RESET_BOARD_DEFAULTS":
      return {
        ...state,
        board: JSON.parse(JSON.stringify(DEFAULT_PROPERTIES)),
      };

    case "START_GAME":
      if (state.players.length < 2) return state;
      return {
        ...state,
        phase: "playing",
        actionDeck: state.settings.deckConfig.map((c) => c.id),
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            type: "SYSTEM",
            message: "Game Started",
            amount: 0,
          },
        ],
      };

    case "RESET_GAME":
      return { ...INITIAL_STATE, board: state.board, settings: state.settings };

    case "TRANSACT": {
      const { from, to, amount, type, msgOverride } = action.payload;
      let amountNum = parseInt(amount, 10);

      if (from === "BUCKET") {
        amountNum = state.treasureBucket || 0;
      }

      if (isNaN(amountNum) || amountNum <= 0) return state;

      let newPlayers = [...state.players];
      let triggeredBankruptcy = null;
      let historyMsg = msgOverride;
      let newTreasureBucket = state.treasureBucket || 0;
      let pendingJackpotAlert = null;

      if (from !== "BANK" && from !== "BUCKET") {
        const senderIdx = newPlayers.findIndex((p) => p.id === from);
        if (senderIdx === -1) return state;

        newPlayers[senderIdx].balance -= amountNum;
        if (newPlayers[senderIdx].balance === 0) {
          triggeredBankruptcy = newPlayers[senderIdx].id;
        }

        if (!historyMsg) {
          if (to === "BANK")
            historyMsg = `${newPlayers[senderIdx].name} paid the Bank`;
          else if (to === "BUCKET")
            historyMsg = `${newPlayers[senderIdx].name} paid to Treasure Bucket`;
          else {
            const receiver = newPlayers.find((p) => p.id === to);
            historyMsg = `${newPlayers[senderIdx].name} paid ${receiver?.name}`;
          }
        }
      }

      if (to === "BUCKET") {
        newTreasureBucket += amountNum;
      } else if (from === "BUCKET") {
        newTreasureBucket = 0;
        const receiver = newPlayers.find((p) => p.id === to);
        if (!historyMsg)
          historyMsg = `${receiver?.name} claimed Treasure Bucket`;
        pendingJackpotAlert = { playerName: receiver?.name, amount: amountNum };
      }

      if (to !== "BANK" && to !== "BUCKET") {
        const receiverIdx = newPlayers.findIndex((p) => p.id === to);
        if (receiverIdx > -1 && !newPlayers[receiverIdx].isBankrupt) {
          newPlayers[receiverIdx].balance += amountNum;
        }

        if (!historyMsg && from === "BANK") {
          historyMsg = `Bank transferred Go Cash/Bonus`;
        }
      }

      return {
        ...state,
        players: newPlayers,
        treasureBucket: newTreasureBucket,
        error: null,
        pendingBankruptcy: triggeredBankruptcy,
        pendingJackpotAlert: pendingJackpotAlert || state.pendingJackpotAlert,
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            from,
            to,
            amount: amountNum,
            type,
            message: historyMsg,
          },
          ...state.history,
        ],
      };
    }

    case "TAKE_LOAN": {
      const { playerId, amount } = action.payload;
      const amountNum = parseInt(amount, 10);
      let newPlayers = [...state.players];
      const pIdx = newPlayers.findIndex((p) => p.id === playerId);
      const pName = newPlayers[pIdx].name;

      newPlayers[pIdx].balance += amountNum;
      newPlayers[pIdx].debt =
        parseInt(newPlayers[pIdx].debt || 0, 10) + amountNum;

      return {
        ...state,
        players: newPlayers,
        error: null,
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            from: "BANK",
            to: playerId,
            amount: amountNum,
            type: "SYSTEM",
            message: `${pName} took a loan`,
          },
          ...state.history,
        ],
      };
    }

    case "REPAY_LOAN": {
      const { playerId, amount } = action.payload;
      const amountNum = parseInt(amount, 10);
      let newPlayers = [...state.players];
      const pIdx = newPlayers.findIndex((p) => p.id === playerId);
      const pName = newPlayers[pIdx].name;

      newPlayers[pIdx].balance -= amountNum;
      newPlayers[pIdx].debt -= amountNum;

      return {
        ...state,
        players: newPlayers,
        error: null,
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            from: playerId,
            to: "BANK",
            amount: amountNum,
            type: "SYSTEM",
            message: `${pName} repaid debt`,
          },
          ...state.history,
        ],
      };
    }

    case "EXECUTE_TRADE": {
      const { p1Id, p2Id, p1Offer, p2Offer } = action.payload;
      let newPlayers = [...state.players];
      let newPropState = { ...state.propertyState };

      const p1Idx = newPlayers.findIndex((p) => p.id === p1Id);
      const p2Idx = newPlayers.findIndex((p) => p.id === p2Id);
      if (p1Idx === -1 || p2Idx === -1) return state;

      const p1Name = newPlayers[p1Idx].name;
      const p2Name = newPlayers[p2Idx].name;

      newPlayers[p1Idx].balance =
        newPlayers[p1Idx].balance - p1Offer.cash + p2Offer.cash;
      newPlayers[p2Idx].balance =
        newPlayers[p2Idx].balance - p2Offer.cash + p1Offer.cash;

      let p1GotBms = null;
      let p2GotBms = null;

      (p1Offer.props || []).forEach((pid) => {
        const propExists = state.board.find((b) => b.id === pid);
        if (propExists) {
          const m = checkBmsGroup(state.board, newPropState, pid, p2Id);
          if (m)
            p2GotBms = {
              playerName: p2Name,
              groupName: m.group,
              color: m.color,
            };
          newPropState[pid] = { ...newPropState[pid], ownerId: p2Id };
        }
      });

      (p2Offer.props || []).forEach((pid) => {
        const propExists = state.board.find((b) => b.id === pid);
        if (propExists) {
          const m = checkBmsGroup(state.board, newPropState, pid, p1Id);
          if (m)
            p1GotBms = {
              playerName: p1Name,
              groupName: m.group,
              color: m.color,
            };
          newPropState[pid] = { ...newPropState[pid], ownerId: p1Id };
        }
      });

      let triggeredBankruptcy = null;
      if (newPlayers[p1Idx].balance === 0) triggeredBankruptcy = p1Id;
      else if (newPlayers[p2Idx].balance === 0) triggeredBankruptcy = p2Id;

      return {
        ...state,
        players: newPlayers,
        propertyState: newPropState,
        error: null,
        pendingBankruptcy: triggeredBankruptcy,
        pendingBmsAlert: p1GotBms || p2GotBms || null,
        pendingTradeAlert: { p1Name, p2Name },
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            from: p1Id,
            to: p2Id,
            amount: 0,
            type: "PROPERTY",
            message: `Trade executed between ${p1Name} & ${p2Name}`,
          },
          ...state.history,
        ],
      };
    }

    case "PROPERTY_ACTION": {
      const { actionType, propertyId, playerId, amount, targetPlayerId } =
        action.payload;
      const propDef = state.board.find((p) => p.id === propertyId);
      let newPlayers = [...state.players];
      let newPropState = { ...state.propertyState };
      let historyMsg = "";
      let newlyFormedBms = null;

      const pIdx = newPlayers.findIndex((p) => p.id === playerId);
      if (pIdx === -1) return state;

      const pName = newPlayers[pIdx].name;
      const pState = newPropState[propertyId] || {
        ownerId: null,
        houses: 0,
        mortgaged: false,
      };

      if (actionType === "TRANSFER") {
        newlyFormedBms = checkBmsGroup(
          state.board,
          state.propertyState,
          propertyId,
          targetPlayerId,
        );
        newPropState[propertyId] = { ...pState, ownerId: targetPlayerId };
        const receiver = newPlayers.find((p) => p.id === targetPlayerId);
        historyMsg = `${pName} transferred ${propDef.name} to ${receiver.name}`;
      } else {
        if (["BUY", "BUILD", "UNMORTGAGE"].includes(actionType)) {
          newPlayers[pIdx].balance -= amount;
        } else if (["MORTGAGE", "SELL_BUILD"].includes(actionType)) {
          newPlayers[pIdx].balance += amount;
        }

        if (actionType === "BUY") {
          newlyFormedBms = checkBmsGroup(
            state.board,
            state.propertyState,
            propertyId,
            playerId,
          );
          newPropState[propertyId] = {
            ownerId: playerId,
            houses: 0,
            mortgaged: false,
          };
          historyMsg =
            amount === propDef.price
              ? `${pName} bought ${propDef.name}`
              : `${pName} bought ${propDef.name} for custom price $${amount}`;
        } else if (actionType === "BUILD") {
          newPropState[propertyId] = { ...pState, houses: pState.houses + 1 };
          historyMsg =
            newPropState[propertyId].houses >
            (state.settings.housesBeforeHotel ?? 4)
              ? `${pName} built a Hotel on ${propDef.name}`
              : `${pName} built a House on ${propDef.name}`;
        } else if (actionType === "SELL_BUILD") {
          newPropState[propertyId] = { ...pState, houses: pState.houses - 1 };
          historyMsg =
            pState.houses >= (state.settings.housesBeforeHotel ?? 4)
              ? `${pName} sold a Hotel on ${propDef.name}`
              : `${pName} sold a House on ${propDef.name}`;
        } else if (actionType === "MORTGAGE") {
          newPropState[propertyId] = { ...pState, mortgaged: true };
          historyMsg = `${pName} mortgaged ${propDef.name}`;
        } else if (actionType === "UNMORTGAGE") {
          newPropState[propertyId] = { ...pState, mortgaged: false };
          historyMsg = `${pName} unmortgaged ${propDef.name}`;
        }
      }

      let triggeredBankruptcy = null;
      if (newPlayers[pIdx].balance === 0) triggeredBankruptcy = playerId;

      return {
        ...state,
        players: newPlayers,
        propertyState: newPropState,
        error: null,
        pendingBankruptcy: triggeredBankruptcy,
        pendingBmsAlert: newlyFormedBms
          ? {
              playerName:
                actionType === "TRANSFER"
                  ? state.players.find((p) => p.id === targetPlayerId).name
                  : pName,
              groupName: newlyFormedBms.group,
              color: newlyFormedBms.color,
            }
          : null,
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            from: ["BUY", "BUILD", "UNMORTGAGE", "TRANSFER"].includes(
              actionType,
            )
              ? playerId
              : "BANK",
            to: ["MORTGAGE", "SELL_BUILD"].includes(actionType)
              ? playerId
              : actionType === "TRANSFER"
                ? targetPlayerId
                : "BANK",
            amount: amount || 0,
            type: "PROPERTY",
            message: historyMsg,
          },
          ...state.history,
        ],
      };
    }

    case "DRAW_ACTION_CARD": {
      const { playerId } = action.payload;
      const p = state.players.find((x) => x.id === playerId);
      if (!p) return state;

      let currentDeck = state.actionDeck || [];
      const isTrueDeck = state.settings.trueDeckMode;

      if (currentDeck.length === 0) {
        currentDeck = state.settings.deckConfig.map((c) => c.id);
      }

      // Fallback if deck is still somehow empty (e.g. all cards deleted in editor)
      if (currentDeck.length === 0) return state;

      const randomIndex = Math.floor(Math.random() * currentDeck.length);
      const drawnCardId = currentDeck[randomIndex];
      const drawnCardDef =
        state.settings.deckConfig.find((c) => c.id === drawnCardId) ||
        state.settings.deckConfig[0];

      let newDeck = [...currentDeck];
      if (isTrueDeck) {
        newDeck.splice(randomIndex, 1);
      }

      let shuffleTriggered = false;
      if (isTrueDeck && newDeck.length === 0) {
        shuffleTriggered = true;
        newDeck = state.settings.deckConfig.map((c) => c.id);
      }

      let newHistory = [
        {
          id: generateId(),
          timestamp: Date.now(),
          from: "SYSTEM",
          to: playerId,
          amount: 0,
          type: "SYSTEM",
          message: `${p.name} drew: ${drawnCardDef.title}`,
        },
        ...state.history,
      ];

      if (shuffleTriggered) {
        newHistory = [
          {
            id: generateId(),
            timestamp: Date.now(),
            from: "SYSTEM",
            to: "BANK",
            amount: 0,
            type: "SYSTEM",
            message: `Action Deck Reshuffled`,
          },
          ...newHistory,
        ];
      }

      return {
        ...state,
        actionDeck: newDeck,
        lastDrawnCard: {
          ...drawnCardDef,
          drawnBy: p.name,
          drawnById: p.id,
          timestamp: Date.now(),
        },
        history: newHistory,
      };
    }

    case "UPDATE_DECK_CARD": {
      const { idx, updates } = action.payload;
      const newDeckConfig = [...state.settings.deckConfig];
      newDeckConfig[idx] = { ...newDeckConfig[idx], ...updates };
      return {
        ...state,
        settings: { ...state.settings, deckConfig: newDeckConfig },
        actionDeck: [], // force reshuffle on structural changes
      };
    }

    case "ADD_DECK_CARD": {
      const newDeckConfig = [
        ...state.settings.deckConfig,
        {
          id: generateId(),
          title: "New Action Card",
          desc: "Rule description goes here.",
          type: "reward",
          icon: "BookOpen",
        },
      ];
      return {
        ...state,
        settings: { ...state.settings, deckConfig: newDeckConfig },
        actionDeck: [], // force reshuffle on structural changes
      };
    }

    case "REMOVE_DECK_CARD": {
      const newDeckConfig = [...state.settings.deckConfig];
      newDeckConfig.splice(action.payload, 1);
      return {
        ...state,
        settings: { ...state.settings, deckConfig: newDeckConfig },
        actionDeck: [], // force reshuffle on structural changes
      };
    }

    case "RESET_DECK_DEFAULTS": {
      return {
        ...state,
        settings: {
          ...state.settings,
          deckConfig: JSON.parse(JSON.stringify(DEFAULT_ACTION_CARDS)),
        },
        actionDeck: [],
      };
    }

    case "CLEAR_ALERTS":
      return {
        ...state,
        pendingBmsAlert: null,
        pendingJackpotAlert: null,
        pendingTradeAlert: null,
      };

    case "BANKRUPT_PLAYER": {
      const pId = action.payload;
      let newPropState = { ...state.propertyState };
      Object.keys(newPropState).forEach((key) => {
        if (newPropState[key].ownerId === pId) delete newPropState[key];
      });

      return {
        ...state,
        players: state.players.map((p) =>
          p.id === pId ? { ...p, balance: 0, debt: 0, isBankrupt: true } : p,
        ),
        propertyState: newPropState,
        pendingBankruptcy: null,
        history: [
          {
            id: generateId(),
            timestamp: Date.now(),
            from: pId,
            to: "BANK",
            amount: 0,
            type: "BANKRUPTCY",
            message: "Declared Bankruptcy",
          },
          ...state.history,
        ],
      };
    }

    case "DISMISS_BANKRUPTCY":
      return { ...state, pendingBankruptcy: null };

    case "END_GAME_RANKING":
      return { ...state, phase: "game_over", pendingBankruptcy: null };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "UPDATE_SETTINGS": {
      const newSettings = { ...state.settings, ...action.payload };
      let updatedPlayers = state.players;
      if (
        state.phase === "setup" &&
        action.payload.startingBalance !== undefined
      ) {
        updatedPlayers = state.players.map((p) => ({
          ...p,
          balance: action.payload.startingBalance,
        }));
      }
      return { ...state, settings: newSettings, players: updatedPlayers };
    }

    default:
      return state;
  }
}

// Helper to render dynamic lucide icons
const renderDynamicIcon = (iconName, size, className) => {
  const IconComp =
    {
      Train,
      Zap,
      Droplet,
      Plane,
      Car,
      Ship,
      Coins,
      AlertOctagon,
      Building,
      Award,
      Users,
      TrendingUp,
      ArrowRight,
      TrendingDown,
      Landmark,
      Handshake,
    }[iconName] || BookOpen;
  return <IconComp size={size} className={className} />;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [activeTab, setActiveTab] = useState("home");
  const [assetView, setAssetView] = useState("list");

  const t = THEMES[state.settings.theme] || THEMES.dark;
  const isDark = t.isDark;

  // Haptic/Audio wrappers mapped to settings
  const doHaptic = useCallback(
    (pattern = 40) => {
      triggerHaptic(pattern, state.settings.enableHaptics !== false);
    },
    [state.settings.enableHaptics],
  );

  const doAudio = useCallback(
    (type) => {
      playSoundEffect(type, state.settings.enableSounds !== false);
    },
    [state.settings.enableSounds],
  );

  // UI States
  const [modalConfig, setModalConfig] = useState(null);
  const [txType, setTxType] = useState("PAY_PLAYER");
  const [targetId, setTargetId] = useState("");
  const [amountStr, setAmountStr] = useState("0");
  const [newPlayerName, setNewPlayerName] = useState("");

  // Derived states to fix reference errors
  const activeP = modalConfig
    ? state.players.find((p) => p.id === modalConfig.activePlayerId)
    : null;
  const availableTargets = activeP
    ? state.players.filter((p) => p.id !== activeP.id && !p.isBankrupt)
    : [];

  const [activePropId, setActivePropId] = useState(null);
  const [propConfirmAction, setPropConfirmAction] = useState(null);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [boardResetConfirm, setBoardResetConfirm] = useState(false);
  const [showAddPropType, setShowAddPropType] = useState(false);

  // Custom Color Picker logic
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const [tempCustomColor, setTempCustomColor] = useState("#ffffff");

  const [customBuyPrice, setCustomBuyPrice] = useState("");
  const [isEditingBuyPrice, setIsEditingBuyPrice] = useState(false);

  // Deck Editor UI State
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [deckResetConfirm, setDeckResetConfirm] = useState(false);

  // Trade Wizard State
  const [tradeWizard, setTradeWizard] = useState(null);

  // Action Deck UI State
  const [showDeckPlayerSelect, setShowDeckPlayerSelect] = useState(false);
  const [cardFlipState, setCardFlipState] = useState(false);
  const [visibleCardData, setVisibleCardData] = useState(null);

  const [endGameConfirm, setEndGameConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const [bankModal, setBankModal] = useState(false);
  const [bucketModal, setBucketModal] = useState(false);

  // Alerts
  const [bmsAlert, setBmsAlert] = useState(null);
  const [jackpotAlert, setJackpotAlert] = useState(null);
  const [tradeAlert, setTradeAlert] = useState(null);

  const prevHistoryLength = useRef(state.history.length);
  const prevDrawnCardTimestamp = useRef(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
    if (type === "success") {
      doAudio("success");
      doHaptic(40);
    }
    if (type === "error") {
      doAudio("error");
      doHaptic([50, 50, 50]);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("bms_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD_STATE", payload: parsed });
        if (parsed.phase === "playing") {
          setActiveTab("home");
        }
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bms_state", JSON.stringify(state));
  }, [state]);

  // Make sure we default to the Home tab on state changes like starting a game
  useEffect(() => {
    if (state.phase === "playing") {
      setActiveTab("home");
    }
  }, [state.phase]);

  // Set the default buy price when Property Modal is opened
  useEffect(() => {
    if (activePropId) {
      const p = state.board.find((b) => b.id === activePropId);
      if (p) {
        setCustomBuyPrice(p.price.toString());
        setIsEditingBuyPrice(false);
      }
    }
  }, [activePropId, state.board]);

  // Listen for History Growth (Transaction Success)
  useEffect(() => {
    if (state.history.length > prevHistoryLength.current) {
      const lastTx = state.history[0];
      // Do not popup a toast for Action Card draws, they have a visual card representation
      if (!lastTx.message.includes("drew:")) {
        showToast(lastTx.message || "Transaction Complete", "success");
      }

      setModalConfig(null);
      setActivePropId(null);
      setPropConfirmAction(null);
      setTradeWizard(null);
      setBankModal(false);
      setBucketModal(false);
      setTxType("PAY_PLAYER");
      setTargetId("");
      setAmountStr("0");
    }
    prevHistoryLength.current = state.history.length;
  }, [state.history.length]);

  // Handle Full Screen Alerts
  useEffect(() => {
    if (
      state.pendingBmsAlert ||
      state.pendingJackpotAlert ||
      state.pendingTradeAlert
    ) {
      if (state.pendingBmsAlert) setBmsAlert(state.pendingBmsAlert);
      if (state.pendingJackpotAlert) setJackpotAlert(state.pendingJackpotAlert);
      if (state.pendingTradeAlert) setTradeAlert(state.pendingTradeAlert);

      dispatch({ type: "CLEAR_ALERTS" });
      doAudio("success");
      doHaptic([100, 50, 100, 50, 100]); // Celebration Haptic

      // Auto-dismiss after 5s if user hasn't clicked/tapped
      const timer = setTimeout(() => {
        setBmsAlert(null);
        setJackpotAlert(null);
        setTradeAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [
    state.pendingBmsAlert,
    state.pendingJackpotAlert,
    state.pendingTradeAlert,
    doAudio,
    doHaptic,
  ]);

  // Watch for new Action Card drawn to trigger flip animation
  useEffect(() => {
    if (
      state.lastDrawnCard &&
      state.lastDrawnCard.timestamp !== prevDrawnCardTimestamp.current
    ) {
      prevDrawnCardTimestamp.current = state.lastDrawnCard.timestamp;
      setVisibleCardData(state.lastDrawnCard);

      // Small delay to ensure render before animation triggers
      setTimeout(() => {
        doAudio("flip");
        doHaptic(30);
        setCardFlipState(true);
      }, 50);
    }
  }, [state.lastDrawnCard, doAudio, doHaptic]);

  // Instant dismissal of celebration alerts via keyboard
  useEffect(() => {
    const handleKeyDown = () => {
      if (bmsAlert) setBmsAlert(null);
      if (jackpotAlert) setJackpotAlert(null);
      if (tradeAlert) setTradeAlert(null);
      if (cardFlipState) setCardFlipState(false);
    };

    if (bmsAlert || jackpotAlert || tradeAlert || cardFlipState) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bmsAlert, jackpotAlert, tradeAlert, cardFlipState]);

  const clickHandler = (actionFn) => {
    return (e) => {
      doAudio("tap");
      doHaptic(10);
      actionFn(e);
    };
  };

  const closeModals = () => {
    setModalConfig(null);
    setActivePropId(null);
    setPropConfirmAction(null);
    setTradeWizard(null);
    setBankModal(false);
    setBucketModal(false);
    setShowDeckPlayerSelect(false);
    setTxType("PAY_PLAYER");
    setTargetId("");
    setAmountStr("0");
    setColorPickerTarget(null);
  };

  const handleNumpad = (val) => {
    doHaptic(10);
    if (val === "DEL")
      setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    else if (val === "00")
      setAmountStr((prev) => (prev === "0" ? "0" : prev + "00"));
    else setAmountStr((prev) => (prev === "0" ? val : prev + val));
  };

  // Pre-Transaction UI Barrier (Insufficient Funds Checks)
  const executeTx = () => {
    if (amountStr === "0" || !activeP) return;

    const amountNum = parseInt(amountStr, 10);
    const activePlayerId = activeP.id;

    if (
      txType === "PAY_PLAYER" ||
      txType === "PAY_BANK" ||
      txType === "PAY_BUCKET"
    ) {
      if (activeP.balance < amountNum) {
        showToast("Insufficient funds! Take a loan first.", "error");
        return;
      }
    }

    if (txType === "REPAY") {
      if (activeP.balance < amountNum) {
        showToast("Insufficient funds to repay.", "error");
        return;
      }
    }

    if (txType === "DEBT") {
      if (activeP.balance >= 200) {
        showToast("Loans only available when cash is below $200.", "error");
        return;
      }
      const ownsDevelopedProperty = Object.entries(state.propertyState).some(
        ([propId, pState]) =>
          pState.ownerId === activePlayerId && pState.houses > 0,
      );
      if (ownsDevelopedProperty) {
        showToast("Cannot take debt while owning Houses/Hotels.", "error");
        return;
      }
      if (state.settings.enableDebtLimit) {
        const maxDebt = parseInt(state.settings.maxDebt, 10) || 0;
        if (maxDebt > 0 && (activeP.debt || 0) + amountNum > maxDebt) {
          showToast(`Debt limit exceeded (Max $${maxDebt}).`, "error");
          return;
        }
      }
    }

    let action;
    if (txType === "DEBT") {
      action = {
        type: "TAKE_LOAN",
        payload: { playerId: activePlayerId, amount: amountStr },
      };
    } else if (txType === "REPAY") {
      action = {
        type: "REPAY_LOAN",
        payload: { playerId: activePlayerId, amount: amountStr },
      };
    } else {
      let from = "BANK",
        to = "BANK",
        type = "TRANSFER";
      if (txType === "PAY_PLAYER") {
        if (!targetId) return;
        from = activePlayerId;
        to = targetId;
        type = "P2P";
      } else if (txType === "PAY_BANK") {
        from = activePlayerId;
        type = "P2B";
      } else if (txType === "PAY_BUCKET") {
        from = activePlayerId;
        to = "BUCKET";
        type = "P2B";
      }
      action = {
        type: "TRANSACT",
        payload: { from, to, amount: amountStr, type },
      };
    }
    dispatch(action);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(state);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dlAnchorElem = document.createElement("a");
      dlAnchorElem.setAttribute("href", url);
      dlAnchorElem.setAttribute(
        "download",
        `bms_save_${new Date().getTime()}.json`,
      );
      dlAnchorElem.click();
      URL.revokeObjectURL(url);
      showToast("Game state exported!", "success");
    } catch (e) {
      showToast("Export failed.", "error");
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json && json.players && Array.isArray(json.players)) {
          dispatch({ type: "LOAD_STATE", payload: json });
          showToast("Game state loaded successfully!", "success");
        } else {
          showToast("Invalid save file format.", "error");
        }
      } catch (err) {
        showToast("Error reading file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset the input
  };

  const updateBoardItem = (idx, updates) => {
    const newBoard = [...state.board];
    newBoard[idx] = { ...newBoard[idx], ...updates };
    dispatch({ type: "UPDATE_BOARD", payload: newBoard });
  };

  const removeBoardItem = (idx) => {
    const newBoard = [...state.board];
    newBoard.splice(idx, 1);
    dispatch({ type: "UPDATE_BOARD", payload: newBoard });
    showToast("Property deleted", "success");
  };

  const addBoardItem = (type) => {
    const newBoard = [
      ...state.board,
      {
        id: generateId(),
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        group:
          type === "street"
            ? "Custom"
            : type === "railroad"
              ? "Railroad"
              : "Utility",
        color:
          type === "street"
            ? "bg-[#888888]"
            : type === "railroad"
              ? "bg-[#171717]"
              : "bg-[#d4d4d8]",
        price: type === "street" ? 100 : type === "railroad" ? 200 : 150,
        build: type === "street" ? 50 : undefined,
        hotel: type === "street" ? 50 : undefined,
        mort: 50,
        type: type,
        icon:
          type === "railroad"
            ? "Train"
            : type === "utility"
              ? "Zap"
              : undefined,
        text: type === "utility" ? "text-neutral-900" : undefined,
      },
    ];
    dispatch({ type: "UPDATE_BOARD", payload: newBoard });
    showToast("New property added", "success");
  };

  const updateDeckItem = (idx, updates) => {
    dispatch({ type: "UPDATE_DECK_CARD", payload: { idx, updates } });
  };

  // ==========================================
  // VIEW: TRADE WIZARD
  // ==========================================
  const renderTradeWizard = () => {
    if (!tradeWizard) return null;
    const p1 = state.players.find((p) => p.id === tradeWizard.p1Id);
    if (!p1) {
      closeModals();
      return null;
    }

    // Step 1: Select Partner
    if (tradeWizard.step === 1) {
      return (
        <div
          className={`absolute inset-0 z-[300] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ease-out ${t.modalOverlay}`}
        >
          <div
            className={`w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl border-t sm:border shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300 ease-out relative ${t.modalBg}`}
          >
            <div
              className={`px-6 py-4 flex justify-between items-center rounded-t-3xl border-b ${t.modalHeader}`}
            >
              <div>
                <h3 className={`font-bold leading-tight ${t.textMain}`}>
                  Trade Wizard
                </h3>
                <span
                  className={`text-xs uppercase font-bold tracking-widest ${t.textMuted}`}
                >
                  Select Partner
                </span>
              </div>
              <button
                onClick={closeModals}
                className={`p-3 rounded-full transition-colors ${t.textMuted} hover:bg-black/10 ${t.textMain}`}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {state.players
                  .filter((p) => p.id !== p1.id && !p.isBankrupt)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={clickHandler(() =>
                        setTradeWizard((prev) => ({
                          ...prev,
                          step: 2,
                          p2Id: p.id,
                        })),
                      )}
                      className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${t.card} ${t.borderHover}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${p.color.bg}`}
                      ></div>
                      <span className={`font-bold ${t.textMain}`}>
                        {p.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Build Trade
    const p2 = state.players.find((p) => p.id === tradeWizard.p2Id);
    if (!p2) {
      closeModals();
      return null;
    }

    const toggleTradeProp = (propId, isP1) => {
      if (doesGroupHaveHouses(state.board, state.propertyState, propId)) {
        showToast(
          "Cannot trade properties while houses exist in its color group. Sell houses first.",
          "error",
        );
        return;
      }
      setTradeWizard((prev) => {
        const offerObj = isP1 ? prev.p1Offer : prev.p2Offer;
        const list = offerObj?.props || [];
        const newList = list.includes(propId)
          ? list.filter((id) => id !== propId)
          : [...list, propId];
        return {
          ...prev,
          [isP1 ? "p1Offer" : "p2Offer"]: {
            ...offerObj,
            props: newList,
          },
        };
      });
    };

    const handleExecuteTrade = () => {
      dispatch({ type: "CLEAR_ERROR" });
      const p1CashNum = parseInt(tradeWizard.p1Offer?.cash, 10) || 0;
      const p2CashNum = parseInt(tradeWizard.p2Offer?.cash, 10) || 0;

      if (p1.balance < p1CashNum) {
        showToast(`${p1.name} has insufficient funds for this trade!`, "error");
        return;
      }
      if (p2.balance < p2CashNum) {
        showToast(`${p2.name} has insufficient funds for this trade!`, "error");
        return;
      }

      // Check if BOTH sides are offering empty
      const p1HasOffer =
        p1CashNum > 0 || (tradeWizard.p1Offer?.props?.length || 0) > 0;
      const p2HasOffer =
        p2CashNum > 0 || (tradeWizard.p2Offer?.props?.length || 0) > 0;

      if (!p1HasOffer || !p2HasOffer) {
        showToast(
          "Both players must offer property or cash to complete a trade.",
          "error",
        );
        return;
      }

      dispatch({
        type: "EXECUTE_TRADE",
        payload: {
          p1Id: p1.id,
          p2Id: p2.id,
          p1Offer: { cash: p1CashNum, props: tradeWizard.p1Offer?.props || [] },
          p2Offer: { cash: p2CashNum, props: tradeWizard.p2Offer?.props || [] },
        },
      });
    };

    const renderTradeSection = (player, offer, isP1) => {
      const ownedProps = state.board.filter(
        (b) => state.propertyState[b.id]?.ownerId === player.id,
      );

      return (
        <div
          className={`p-4 rounded-2xl border flex flex-col h-full ${t.card}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h4 className={`font-bold flex items-center gap-2 ${t.textMain}`}>
              <div
                className={`w-3 h-3 rounded-full ${player.color.bg} shadow-sm`}
              ></div>{" "}
              {player.name} Gives
            </h4>
            <span className={`text-xs font-bold ${t.textMuted}`}>
              Bal: ${player.balance}
            </span>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex justify-between items-end">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}
              >
                Cash Offer
              </span>
              <span
                className={`text-xl font-black ${isP1 ? "text-sky-500" : "text-emerald-500"}`}
              >
                ${offer?.cash || 0}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={player.balance}
              step="10"
              value={offer?.cash || 0}
              onChange={(e) =>
                setTradeWizard((prev) => ({
                  ...prev,
                  [isP1 ? "p1Offer" : "p2Offer"]: {
                    ...prev[isP1 ? "p1Offer" : "p2Offer"],
                    cash: parseInt(e.target.value, 10),
                  },
                }))
              }
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-black/10 dark:bg-white/10 ${isP1 ? "accent-sky-500" : "accent-emerald-500"}`}
            />
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1 hide-scrollbar min-h-[100px] max-h-[150px]">
            {ownedProps.length === 0 && (
              <p className={`text-xs italic mt-2 text-center ${t.textFaint}`}>
                No properties owned.
              </p>
            )}
            {ownedProps.map((p) => {
              const isSelected = (offer?.props || []).includes(p.id);
              const groupHasHouses = doesGroupHaveHouses(
                state.board,
                state.propertyState,
                p.id,
              );
              return (
                <div
                  key={p.id}
                  onClick={clickHandler(() => toggleTradeProp(p.id, isP1))}
                  className={`border rounded-xl p-2.5 flex justify-between items-center cursor-pointer transition-all duration-200 ${isSelected ? `border-${isP1 ? "sky" : "emerald"}-500 shadow-sm ${t.p2pTag}` : `${t.input} ${groupHasHouses ? "opacity-30" : ""}`}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3 h-3 rounded-sm shrink-0 border border-black/10`}
                      style={
                        p.color.startsWith("bg-[")
                          ? { backgroundColor: p.color.slice(4, -1) }
                          : undefined
                      }
                    >
                      {!p.color.startsWith("bg-[") && (
                        <div className={`w-full h-full ${p.color}`} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold truncate ${t.textMain}`}
                    >
                      {p.name}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors ${isSelected ? (isP1 ? "bg-sky-500 border-sky-500" : "bg-emerald-500 border-emerald-500") : t.border}`}
                  >
                    {isSelected && <Check size={10} className="text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div
        className={`absolute inset-0 z-[300] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ease-out ${t.modalOverlay}`}
      >
        <div
          className={`w-full sm:w-[800px] sm:max-h-[85vh] h-[95%] sm:h-auto rounded-t-3xl sm:rounded-3xl border-t sm:border shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300 ease-out relative ${t.modalBg}`}
        >
          <header
            className={`px-6 py-4 border-b flex justify-between items-center shrink-0 rounded-t-3xl sm:rounded-t-3xl ${t.modalHeader}`}
          >
            <h2
              className={`font-black text-lg flex items-center gap-2 ${t.textMain}`}
            >
              <ArrowRightLeft size={18} /> Trade Ledger
            </h2>
            <button
              onClick={closeModals}
              className={`p-2 rounded-full transition-colors ${t.textMuted} hover:bg-black/10 ${t.textMain}`}
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              {renderTradeSection(p1, tradeWizard.p1Offer, true)}
              {/* Visual Divider for Mobile only */}
              <div className="flex justify-center -my-3 sm:hidden relative z-10 pointer-events-none">
                <div
                  className={`p-2 rounded-full border shadow-md ${t.card} ${t.textMuted}`}
                >
                  <ArrowRightLeft size={16} className="rotate-90" />
                </div>
              </div>
              {renderTradeSection(p2, tradeWizard.p2Offer, false)}
            </div>
          </div>

          <div className={`p-4 border-t shrink-0 ${t.card}`}>
            <button
              onClick={clickHandler(handleExecuteTrade)}
              className="w-full py-4 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Check size={24} /> Execute Trade
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW: DECK EDITOR (Rendered Outside Main Tree)
  // ==========================================
  const renderDeckEditor = () => {
    return (
      <div
        className={`absolute inset-0 z-[300] flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out ${t.base}`}
      >
        {deckResetConfirm && (
          <div
            className={`absolute inset-0 z-[400] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
          >
            <div
              className={`border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
            >
              <div className="text-center mb-6">
                <h2 className={`text-xl font-black mb-2 ${t.textMain}`}>
                  Reset Deck?
                </h2>
                <p className={`text-sm ${t.textMuted}`}>
                  This will wipe all custom cards. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clickHandler(() => setDeckResetConfirm(false))}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 ${t.input}`}
                >
                  Cancel
                </button>
                <button
                  onClick={clickHandler(() => {
                    dispatch({ type: "RESET_DECK_DEFAULTS" });
                    setDeckResetConfirm(false);
                    showToast("Deck reset to defaults");
                  })}
                  className="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        <header
          className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${t.card}`}
        >
          <h2
            className={`font-black text-lg flex items-center gap-2 ${t.textMain}`}
          >
            <Layers size={18} /> Edit Action Deck
          </h2>
          <button
            onClick={clickHandler(() => setIsEditingDeck(false))}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-200"
          >
            Done
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-24">
          <p className={`text-xs text-center mb-4 ${t.textMuted}`}>
            Edits update the deck immediately.
          </p>
          <button
            onClick={clickHandler(() => setDeckResetConfirm(true))}
            className={`w-full py-3 border border-rose-500/50 text-rose-500 rounded-xl font-bold mb-4 hover:bg-rose-500/10 transition-colors`}
          >
            Reset to Defaults
          </button>

          {state.settings.deckConfig.map((card, idx) => (
            <div
              key={card.id}
              className={`border rounded-2xl p-4 flex flex-col gap-3 ${t.card}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${card.type === "penalty" ? "bg-rose-500/20 text-rose-500" : card.type === "reward" ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"}`}
                >
                  {renderDynamicIcon(card.icon, 20, "")}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={card.title}
                    placeholder="Card Title"
                    onChange={(e) =>
                      updateDeckItem(idx, { title: e.target.value })
                    }
                    className={`w-full rounded-lg px-3 py-2 font-bold focus:outline-none border transition-colors ${t.input}`}
                  />
                  <textarea
                    value={card.desc}
                    placeholder="Description"
                    onChange={(e) =>
                      updateDeckItem(idx, { desc: e.target.value })
                    }
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none border transition-colors resize-none h-16 text-sm ${t.input}`}
                  />
                  <div className="flex gap-2">
                    <select
                      value={card.type}
                      onChange={(e) =>
                        updateDeckItem(idx, { type: e.target.value })
                      }
                      className={`flex-1 rounded-lg px-3 py-1.5 focus:outline-none border transition-colors text-xs font-bold uppercase tracking-widest ${t.input}`}
                    >
                      <option value="reward">Reward</option>
                      <option value="penalty">Penalty</option>
                      <option value="chaos">Chaos</option>
                    </select>
                    <select
                      value={card.icon}
                      onChange={(e) =>
                        updateDeckItem(idx, { icon: e.target.value })
                      }
                      className={`flex-1 rounded-lg px-3 py-1.5 focus:outline-none border transition-colors text-xs font-bold uppercase tracking-widest ${t.input}`}
                    >
                      <option value="Coins">Coins</option>
                      <option value="Award">Award</option>
                      <option value="TrendingUp">Graph Up</option>
                      <option value="ArrowRight">Arrow</option>
                      <option value="Landmark">Bank</option>
                      <option value="AlertOctagon">Alert</option>
                      <option value="Building">Building</option>
                      <option value="Car">Car</option>
                      <option value="Users">Users</option>
                      <option value="TrendingDown">Graph Down</option>
                      <option value="Handshake">Handshake</option>
                      <option value="Zap">Lightning</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={clickHandler(() =>
                    dispatch({ type: "REMOVE_DECK_CARD", payload: idx }),
                  )}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clickHandler(() => dispatch({ type: "ADD_DECK_CARD" }))}
            className={`w-full py-4 border-2 border-dashed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${t.textMuted} ${t.borderHover}`}
          >
            <Plus size={20} /> Add New Card
          </button>
        </div>
      </div>
    );
  };

  // ==========================================
  // VIEW: BOARD EDITOR (Rendered Outside Main Tree)
  // ==========================================
  const renderBoardEditor = () => {
    return (
      <div
        className={`absolute inset-0 z-[300] flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out ${t.base}`}
      >
        {/* Custom Reset Modal overlaying the editor */}
        {boardResetConfirm && (
          <div
            className={`absolute inset-0 z-[400] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
          >
            <div
              className={`border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
            >
              <div className="text-center mb-6">
                <h2 className={`text-xl font-black mb-2 ${t.textMain}`}>
                  Reset Board?
                </h2>
                <p className={`text-sm ${t.textMuted}`}>
                  This will wipe all custom names, colors, and prices. This
                  cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clickHandler(() => setBoardResetConfirm(false))}
                  className={`flex-1 py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 ${t.input}`}
                >
                  Cancel
                </button>
                <button
                  onClick={clickHandler(() => {
                    dispatch({ type: "RESET_BOARD_DEFAULTS" });
                    setBoardResetConfirm(false);
                    showToast("Board reset to defaults");
                  })}
                  className="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Robust Color Picker Overlay */}
        {colorPickerTarget !== null && (
          <div
            className={`absolute inset-0 z-[400] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
          >
            <div
              className={`border rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-black ${t.textMain}`}>
                  Select Color
                </h3>
                <button
                  onClick={clickHandler(() => setColorPickerTarget(null))}
                  className={`p-2 rounded-full hover:bg-black/10 ${t.textMuted}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <p
                  className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${t.textMuted}`}
                >
                  Presets
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={clickHandler(() => {
                        updateBoardItem(colorPickerTarget, {
                          color: `bg-[${c.hex}]`,
                        });
                        setColorPickerTarget(null);
                      })}
                      className="w-10 h-10 rounded-full shadow-sm border border-black/20 hover:scale-110 transition-transform active:scale-95"
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {state.settings.customColors?.length > 0 && (
                <div className="mb-4">
                  <p
                    className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${t.textMuted}`}
                  >
                    Custom
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {state.settings.customColors.map((hex, i) => (
                      <button
                        key={i}
                        onClick={clickHandler(() => {
                          updateBoardItem(colorPickerTarget, {
                            color: `bg-[${hex}]`,
                          });
                          setColorPickerTarget(null);
                        })}
                        className="w-10 h-10 rounded-full shadow-sm border border-black/20 hover:scale-110 transition-transform active:scale-95"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p
                  className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${t.textMuted}`}
                >
                  Add New Hex Color
                </p>
                <div className="flex gap-2 items-center">
                  {/* Robust native color picker fallback */}
                  <input
                    type="color"
                    value={tempCustomColor}
                    onChange={(e) => setTempCustomColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={tempCustomColor}
                    onChange={(e) => setTempCustomColor(e.target.value)}
                    placeholder="#HexCode"
                    className={`flex-1 font-bold rounded-xl px-3 py-3 border transition-colors focus:outline-none ${t.input}`}
                  />
                </div>
                <button
                  onClick={clickHandler(() => {
                    const newColors = [
                      ...new Set([
                        ...(state.settings.customColors || []),
                        tempCustomColor,
                      ]),
                    ].slice(-12);
                    dispatch({
                      type: "UPDATE_SETTINGS",
                      payload: { customColors: newColors },
                    });
                    updateBoardItem(colorPickerTarget, {
                      color: `bg-[${tempCustomColor}]`,
                    });
                    setColorPickerTarget(null);
                  })}
                  className="w-full mt-3 font-bold rounded-xl flex items-center justify-center gap-2 border transition-all active:scale-95 py-3 bg-emerald-500 text-white border-emerald-500 shadow-md"
                >
                  <Check size={16} /> Save & Select
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddPropType && (
          <div
            className={`absolute inset-0 z-[400] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
          >
            <div
              className={`border border-emerald-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
            >
              <h3
                className={`text-xl font-black text-center mb-4 ${t.textMain}`}
              >
                Select Asset Type
              </h3>
              <div className="grid gap-3">
                <button
                  onClick={clickHandler(() => {
                    addBoardItem("street");
                    setShowAddPropType(false);
                  })}
                  className={`p-4 rounded-xl border font-bold transition-colors ${t.input} hover:border-emerald-500 text-left`}
                >
                  🏡 Street (Buildable)
                </button>
                <button
                  onClick={clickHandler(() => {
                    addBoardItem("railroad");
                    setShowAddPropType(false);
                  })}
                  className={`p-4 rounded-xl border font-bold transition-colors ${t.input} hover:border-emerald-500 text-left`}
                >
                  🚆 Railroad
                </button>
                <button
                  onClick={clickHandler(() => {
                    addBoardItem("utility");
                    setShowAddPropType(false);
                  })}
                  className={`p-4 rounded-xl border font-bold transition-colors ${t.input} hover:border-emerald-500 text-left`}
                >
                  ⚡ Utility
                </button>
                <button
                  onClick={clickHandler(() => setShowAddPropType(false))}
                  className={`p-4 rounded-xl border font-bold mt-2 transition-colors ${t.card} text-rose-500`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <header
          className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${t.card}`}
        >
          <h2
            className={`font-black text-lg flex items-center gap-2 ${t.textMain}`}
          >
            <Edit3 size={18} /> Edit Board Assets
          </h2>
          <button
            onClick={clickHandler(() => setIsEditingBoard(false))}
            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 hover:scale-[1.02] transition-all duration-200"
          >
            Done
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar pb-24">
          <p className={`text-xs text-center mb-4 ${t.textMuted}`}>
            Changes save automatically and persist across new games.
          </p>
          <button
            onClick={clickHandler(() => setBoardResetConfirm(true))}
            className={`w-full py-3 border border-rose-500/50 text-rose-500 rounded-xl font-bold mb-4 hover:bg-rose-500/10 transition-colors`}
          >
            Reset to Defaults
          </button>

          {state.board.map((prop, idx) => {
            const hexColor = prop.color.startsWith("bg-[")
              ? prop.color.slice(4, -1)
              : "#888888";
            return (
              <div
                key={prop.id} // Fixes the typing focus bug
                className={`border rounded-2xl p-4 flex flex-col gap-3 ${t.card}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={clickHandler(() => setColorPickerTarget(idx))}
                    className={`w-8 h-8 rounded shrink-0 shadow-sm border border-black/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform overflow-hidden`}
                    style={{ backgroundColor: hexColor }}
                  >
                    {prop.icon &&
                      renderDynamicIcon(
                        prop.icon,
                        16,
                        "text-white relative z-10 pointer-events-none",
                      )}
                  </button>
                  <input
                    type="text"
                    value={prop.name}
                    onChange={(e) =>
                      updateBoardItem(idx, { name: e.target.value })
                    }
                    className={`flex-1 rounded-lg px-3 py-2 font-bold focus:outline-none border transition-colors ${t.input}`}
                  />
                  <button
                    onClick={clickHandler(() => removeBoardItem(idx))}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <span
                      className={`text-[10px] uppercase font-bold block mb-1 ${t.textMuted}`}
                    >
                      Price
                    </span>
                    <input
                      type="number"
                      value={prop.price === "" ? "" : prop.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateBoardItem(idx, {
                          price: val === "" ? "" : parseInt(val, 10),
                        });
                      }}
                      className={`w-full rounded-lg px-3 py-1.5 focus:outline-none border transition-colors ${t.input}`}
                    />
                  </div>
                  {prop.type === "street" && (
                    <>
                      <div className="flex-1">
                        <span
                          className={`text-[10px] uppercase font-bold block mb-1 ${t.textMuted}`}
                        >
                          House Cost
                        </span>
                        <input
                          type="number"
                          value={prop.build === "" ? "" : prop.build}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateBoardItem(idx, {
                              build: val === "" ? "" : parseInt(val, 10),
                            });
                          }}
                          className={`w-full rounded-lg px-3 py-1.5 focus:outline-none border transition-colors ${t.input}`}
                        />
                      </div>
                      <div className="flex-1">
                        <span
                          className={`text-[10px] uppercase font-bold block mb-1 ${t.textMuted}`}
                        >
                          Hotel Cost
                        </span>
                        <input
                          type="number"
                          value={
                            prop.hotel === "" ? "" : (prop.hotel ?? prop.build)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            updateBoardItem(idx, {
                              hotel: val === "" ? "" : parseInt(val, 10),
                            });
                          }}
                          className={`w-full rounded-lg px-3 py-1.5 focus:outline-none border transition-colors ${t.input}`}
                        />
                      </div>
                    </>
                  )}
                  {prop.type !== "street" && (
                    <div className="flex-1">
                      <span
                        className={`text-[10px] uppercase font-bold block mb-1 ${t.textMuted}`}
                      >
                        Type
                      </span>
                      <select
                        value={prop.type}
                        onChange={(e) =>
                          updateBoardItem(idx, {
                            type: e.target.value,
                            icon:
                              e.target.value === "railroad"
                                ? "Train"
                                : e.target.value === "utility"
                                  ? "Zap"
                                  : undefined,
                          })
                        }
                        className={`w-full rounded-lg px-3 py-1.5 focus:outline-none border transition-colors ${t.input}`}
                      >
                        <option value="street">Street</option>
                        <option value="railroad">Railroad</option>
                        <option value="utility">Utility</option>
                      </select>
                    </div>
                  )}
                  <div className="flex-1">
                    <span
                      className={`text-[10px] uppercase font-bold block mb-1 ${t.textMuted}`}
                    >
                      Mortgage
                    </span>
                    <input
                      type="number"
                      value={prop.mort === "" ? "" : prop.mort}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateBoardItem(idx, {
                          mort: val === "" ? "" : parseInt(val, 10),
                        });
                      }}
                      className={`w-full rounded-lg px-3 py-1.5 focus:outline-none border transition-colors ${t.input}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={clickHandler(() => setShowAddPropType(true))}
            className={`w-full py-4 border-2 border-dashed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${t.textMuted} ${t.borderHover}`}
          >
            <Plus size={20} /> Add New Property
          </button>
        </div>
      </div>
    );
  };

  const renderSetup = () => (
    <div className="flex-1 flex flex-col h-full relative">
      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <button
          onClick={clickHandler(() =>
            dispatch({
              type: "UPDATE_SETTINGS",
              payload: { theme: isDark ? "light" : "dark" },
            }),
          )}
          className={`p-3 rounded-full border ${t.card} ${t.textMuted} hover:${t.textMain} hover:scale-[1.05] active:scale-95 transition-all duration-200`}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="shrink-0 pt-12 pb-6 px-6 text-center animate-in fade-in duration-500 ease-out">
        <div className="bg-emerald-500/10 text-emerald-500 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4 ring-1 ring-emerald-500/30 transition-transform hover:scale-105 duration-300">
          <Landmark size={40} />
        </div>
        <h1 className={`text-4xl font-black tracking-tight ${t.textMain}`}>
          BMS
        </h1>
        <p className={`font-medium text-sm sm:text-base ${t.textMuted}`}>
          Boardgame Management System
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar space-y-6">
        <div
          className={`border rounded-3xl p-6 shadow-xl space-y-6 transition-colors duration-300 ${t.card}`}
        >
          <div
            className={`flex justify-between items-center p-4 rounded-2xl border ${t.modalHeader}`}
          >
            <span className={`font-bold text-sm ${t.textMain}`}>
              Starting Cash
            </span>
            <div
              className={`flex items-center gap-1 px-3 py-2 rounded-xl border focus-within:border-emerald-500/50 transition-colors ${t.input}`}
            >
              <span className="text-emerald-500 font-bold">$</span>
              <input
                type="number"
                value={
                  state.settings.startingBalance === 0
                    ? ""
                    : state.settings.startingBalance
                }
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SETTINGS",
                    payload: {
                      startingBalance: parseInt(e.target.value, 10) || 0,
                    },
                  })
                }
                className="bg-transparent font-black w-16 text-right focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4 px-1">
              <h2
                className={`text-sm font-bold uppercase tracking-widest ${t.textMuted}`}
              >
                Players ({state.players.length}/6)
              </h2>
              {state.setupError && (
                <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded animate-pulse">
                  {state.setupError}
                </span>
              )}
            </div>

            <div className="flex gap-2 relative mb-4">
              <input
                type="text"
                placeholder="Enter player name..."
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                  dispatch({ type: "CLEAR_SETUP_ERROR" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPlayerName.trim()) {
                    doAudio("tap");
                    doHaptic(10);
                    dispatch({
                      type: "ADD_PLAYER",
                      payload: { name: newPlayerName },
                    });
                    setNewPlayerName("");
                  }
                }}
                disabled={state.players.length >= 6}
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none disabled:opacity-50 transition-colors ${t.input}`}
              />
              <button
                onClick={clickHandler(() => {
                  if (newPlayerName.trim()) {
                    dispatch({
                      type: "ADD_PLAYER",
                      payload: { name: newPlayerName },
                    });
                    setNewPlayerName("");
                  }
                })}
                disabled={state.players.length >= 6 || !newPlayerName.trim()}
                className="bg-emerald-600 text-white px-4 rounded-xl font-bold hover:bg-emerald-500 hover:scale-[1.05] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 min-h-[100px]">
              {state.players.length === 0 ? (
                <div
                  className={`h-full flex items-center justify-center text-sm italic py-4 border border-dashed rounded-xl ${t.textFaint} ${t.border}`}
                >
                  Add players to begin...
                </div>
              ) : (
                state.players.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border animate-in slide-in-from-left-4 duration-300 ${t.modalHeader}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${p.color.bg} shadow-sm ring-2 ${isDark ? "ring-neutral-950" : "ring-white"}`}
                      ></div>
                      <span className={`font-bold ${t.textMain}`}>
                        {p.name}
                      </span>
                    </div>
                    <button
                      onClick={clickHandler(() =>
                        dispatch({ type: "REMOVE_PLAYER", payload: p.id }),
                      )}
                      className={`hover:text-rose-500 hover:scale-110 active:scale-95 transition-all p-1 ${t.textMuted}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`shrink-0 p-6 pt-2 space-y-3 relative z-10 ${t.base}`}>
        <button
          onClick={clickHandler(() => dispatch({ type: "START_GAME" }))}
          disabled={state.players.length < 2}
          className={`w-full py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-20 flex items-center justify-center gap-2 ${isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"}`}
        >
          <Play size={20} fill="currentColor" /> Initialize Bank
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={clickHandler(() => setIsEditingBoard(true))}
            className={`border py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${t.card} ${t.textMuted} ${t.borderHover}`}
          >
            <Edit3 size={16} /> Edit Board
          </button>
          <div className="relative">
            <input
              type="file"
              id="import-file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />
            <label
              htmlFor="import-file"
              className={`w-full h-full border py-3 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95 ${t.card} ${t.textMuted} ${t.borderHover}`}
            >
              <Download size={16} /> Load Game
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => {
    const rankedPlayers = state.players
      .map((p) => {
        let netWorth = p.balance - (p.debt || 0);
        let propValue = 0,
          buildValue = 0;
        Object.keys(state.propertyState).forEach((propId) => {
          const pState = state.propertyState[propId];
          if (pState.ownerId === p.id) {
            const propDef = state.board.find((b) => b.id === propId);
            if (pState.mortgaged) propValue += propDef.price / 2;
            else propValue += propDef.price;

            // Re-calculate dynamically based on houses/hotel
            if (pState.houses > 0) {
              const housesBeforeHotel = state.settings.housesBeforeHotel ?? 4;
              const hotelCost = propDef.hotel ?? propDef.build;
              if (pState.houses > housesBeforeHotel) {
                buildValue += housesBeforeHotel * propDef.build + hotelCost;
              } else {
                buildValue += pState.houses * propDef.build;
              }
            }
          }
        });
        return {
          ...p,
          netWorth: netWorth + propValue + buildValue,
          propValue,
          buildValue,
        };
      })
      .sort((a, b) => b.netWorth - a.netWorth);

    const handleShareResults = async () => {
      const text =
        `🏆 BMS Final Rankings 🏆\n\n` +
        rankedPlayers
          .map((p, i) => `${i + 1}. ${p.name}: $${p.netWorth.toLocaleString()}`)
          .join("\n");

      if (navigator.share) {
        try {
          await navigator.share({ title: "BMS Results", text });
          showToast("Results shared!", "success");
        } catch (e) {
          // Fallback if sharing is aborted or fails
        }
      } else {
        navigator.clipboard.writeText(text);
        showToast("Results copied to clipboard!", "success");
      }
    };

    return (
      <div className="flex-1 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-500 ease-out relative overflow-hidden">
        <Confetti />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mt-6 sm:mt-12 mb-8 relative z-10 shrink-0">
          <Award size={64} className="text-emerald-500 mx-auto mb-4" />
          <h1
            className={`text-4xl sm:text-5xl font-black tracking-tighter mb-2 ${t.textMain}`}
          >
            Game Over
          </h1>
          <p className={`font-medium ${t.textMuted}`}>
            Final Net Worth Rankings
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto w-full relative z-10 flex-1 overflow-y-auto pb-6 hide-scrollbar">
          {rankedPlayers.map((p, idx) => (
            <div
              key={p.id}
              className={`border rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 animate-in slide-in-from-bottom-8 ${t.card} ${idx === 0 ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-105" : ""}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shrink-0 ${idx === 0 ? "bg-amber-500 text-amber-950" : idx === 1 ? "bg-slate-300 text-slate-800" : idx === 2 ? "bg-[#cd7f32] text-white" : `${isDark ? "bg-neutral-800" : "bg-slate-200"} ${t.textMuted}`}`}
              >
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 truncate ${t.textMain}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.color.bg}`}
                  ></div>{" "}
                  <span className="truncate">{p.name}</span>
                </h3>
                <div
                  className={`flex gap-3 text-[10px] font-bold uppercase tracking-widest mt-1 flex-wrap ${t.textMuted}`}
                >
                  <span>Cash: ${p.balance}</span>
                  {p.debt > 0 && (
                    <span className="text-rose-500">Debt: -${p.debt}</span>
                  )}
                  <span>Assets: ${p.propValue + p.buildValue}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl sm:text-2xl font-black text-emerald-500">
                  ${p.netWorth.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 max-w-md mx-auto w-full space-y-3 relative z-10 pb-4 pt-4">
          <button
            onClick={clickHandler(handleShareResults)}
            className={`w-full py-3 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 border flex items-center justify-center gap-2 ${t.card} ${t.textMain} ${t.borderHover}`}
          >
            <Share2 size={20} /> Share Results
          </button>
          <button
            onClick={clickHandler(() => dispatch({ type: "RESET_GAME" }))}
            className={`w-full py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 ${isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"}`}
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* STRICT HEIGHT LOCK FOR VIEWPORT - DESKTOP BACKDROP */}
      <div
        className={`fixed inset-0 w-full flex justify-center transition-colors duration-300 overflow-hidden sm:p-6 sm:py-12 ${isDark ? "bg-black/90" : "bg-slate-300"}`}
      >
        {/* APP CONTAINER */}
        <div
          className={`w-full h-full font-sans flex flex-col max-w-md sm:rounded-[32px] sm:border shadow-2xl relative overflow-hidden transition-colors duration-300 ${t.base} ${t.border}`}
        >
          {state.phase === "setup" ? (
            renderSetup()
          ) : state.phase === "game_over" ? (
            renderGameOver()
          ) : (
            // MAIN GAME SCREEN
            <div className="flex flex-col h-full relative">
              <header
                className={`px-6 py-5 backdrop-blur-md border-b shrink-0 flex justify-between items-center transition-colors duration-300 ${t.header}`}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg">
                    <Landmark size={18} className="text-white" />
                  </div>
                  <span
                    className={`font-bold text-lg tracking-tight ${t.textMain}`}
                  >
                    BMS
                  </span>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto pb-[90px] hide-scrollbar relative">
                {activeTab === "home" && (
                  <div className="p-4 space-y-4 animate-in fade-in duration-300">
                    <div
                      className={`grid ${state.settings.enableTreasureBucket !== false ? "grid-cols-2" : "grid-cols-1"} gap-3`}
                    >
                      <button
                        onClick={clickHandler(() => setBankModal(true))}
                        className={`w-full border rounded-3xl p-5 relative overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${t.bankGradient} hover:border-emerald-500/50`}
                      >
                        <div
                          className={`absolute -right-2 -top-2 pointer-events-none transition-opacity ${isDark ? "opacity-5" : "opacity-[0.03] text-black"}`}
                        >
                          <Landmark size={90} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                          <div>
                            <p
                              className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${t.textMuted}`}
                            >
                              Central Bank
                            </p>
                            <p
                              className={`text-2xl font-black font-mono tracking-tighter ${t.textMain}`}
                            >
                              ∞
                            </p>
                          </div>
                          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 w-max mt-4">
                            Transfer
                          </span>
                        </div>
                      </button>

                      {state.settings.enableTreasureBucket !== false && (
                        <button
                          onClick={clickHandler(() => setBucketModal(true))}
                          className={`w-full border rounded-3xl p-5 relative overflow-hidden text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${t.card} hover:border-amber-500/50`}
                        >
                          <div
                            className={`absolute -right-2 -top-2 pointer-events-none transition-opacity ${isDark ? "opacity-5" : "opacity-[0.03] text-black"}`}
                          >
                            <Coins size={90} />
                          </div>
                          <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                              <p
                                className={`font-bold uppercase tracking-widest text-[10px] mb-1 ${t.textMuted}`}
                              >
                                Treasure Bucket
                              </p>
                              <p
                                className={`text-2xl font-black font-mono tracking-tighter ${state.treasureBucket > 0 ? "text-amber-500" : t.textMain}`}
                              >
                                ${state.treasureBucket || 0}
                              </p>
                            </div>
                            <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20 w-max mt-4">
                              Claim
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {state.players.map((p) => {
                        const propsCount = Object.values(
                          state.propertyState,
                        ).filter((prop) => prop.ownerId === p.id).length;
                        return (
                          <button
                            key={p.id}
                            onClick={clickHandler(() => {
                              if (!p.isBankrupt) {
                                setModalConfig({ activePlayerId: p.id });
                                setTargetId(
                                  state.players.find(
                                    (other) =>
                                      other.id !== p.id && !other.isBankrupt,
                                  )?.id || "",
                                );
                              }
                            })}
                            className={`text-left relative overflow-hidden rounded-3xl p-5 border transition-all duration-200 active:scale-[0.97]
                                ${p.isBankrupt ? `opacity-60 grayscale bg-neutral-500/10 ${t.border}` : `${t.card} ${t.borderHover}`}`}
                          >
                            <div
                              className={`absolute top-0 left-0 w-full h-1 ${p.color.bg}`}
                            ></div>
                            <div className="flex justify-between items-start mb-4">
                              <span
                                className={`font-bold truncate pr-2 ${t.textMain}`}
                              >
                                {p.name}
                              </span>
                              <div
                                className={`w-2.5 h-2.5 rounded-full mt-1.5 ${p.color.bg} shadow-sm`}
                              ></div>
                            </div>

                            <div className="flex items-end justify-between mb-3">
                              <div>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${t.textMuted}`}
                                >
                                  Balance
                                </span>
                                <span
                                  className={`text-2xl font-black tracking-tight ${p.isBankrupt ? "line-through opacity-50" : p.balance < 0 ? "text-rose-500" : t.textMain}`}
                                >
                                  ${p.balance.toLocaleString()}
                                </span>
                              </div>
                              {p.debt > 0 && (
                                <div className="text-right">
                                  <span className="text-rose-500/70 text-[10px] font-bold uppercase tracking-widest block mb-0.5">
                                    Debt
                                  </span>
                                  <span className="text-sm font-black text-rose-500">
                                    -${p.debt.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div
                              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg w-max border ${t.textMuted} ${t.modalHeader}`}
                            >
                              <Home size={10} /> {propsCount} Assets
                            </div>
                            {p.isBankrupt && (
                              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="bg-rose-500 text-white font-black px-3 py-1 rounded shadow-lg text-xs uppercase tracking-widest rotate-[-10deg]">
                                  Bankrupt
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "properties" && (
                  <div className="p-4 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}
                      >
                        Board Assets
                      </p>
                      <div
                        className={`flex items-center p-1 rounded-xl border ${t.modalHeader}`}
                      >
                        <button
                          onClick={clickHandler(() => setAssetView("list"))}
                          className={`p-2 rounded-lg transition-all ${assetView === "list" ? `${t.card} shadow-sm` : "opacity-50 hover:opacity-100"}`}
                        >
                          <List size={16} />
                        </button>
                        <button
                          onClick={clickHandler(() => setAssetView("grid"))}
                          className={`p-2 rounded-lg transition-all ${assetView === "grid" ? `${t.card} shadow-sm` : "opacity-50 hover:opacity-100"}`}
                        >
                          <LayoutGrid size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      className={
                        assetView === "grid"
                          ? "grid grid-cols-2 gap-3 pb-6"
                          : "space-y-2 pb-6"
                      }
                    >
                      {state.board.map((p) => {
                        const pState = state.propertyState[p.id] || {
                          ownerId: null,
                          houses: 0,
                          mortgaged: false,
                        };
                        const owner = pState.ownerId
                          ? state.players.find(
                              (player) => player.id === pState.ownerId,
                            )
                          : null;

                        const housesBeforeHotel =
                          state.settings.housesBeforeHotel ?? 4;
                        const maxBuildings = housesBeforeHotel + 1;

                        const hexColor = p.color.startsWith("bg-[")
                          ? p.color.slice(4, -1)
                          : "#888888";

                        if (assetView === "grid") {
                          return (
                            <div
                              key={p.id}
                              onClick={clickHandler(() =>
                                setActivePropId(p.id),
                              )}
                              className={`border rounded-xl flex flex-col cursor-pointer transition-all duration-200 active:scale-[0.98] overflow-hidden relative ${t.card} ${t.borderHover} ${pState.mortgaged ? "opacity-60" : ""}`}
                            >
                              <div
                                className="h-8 w-full flex items-center justify-center shrink-0 border-b border-black/10 relative"
                                style={
                                  p.color.startsWith("bg-[")
                                    ? { backgroundColor: hexColor }
                                    : undefined
                                }
                              >
                                {!p.color.startsWith("bg-[") && (
                                  <div
                                    className={`absolute inset-0 ${p.color}`}
                                  />
                                )}
                                {p.icon &&
                                  renderDynamicIcon(
                                    p.icon,
                                    14,
                                    "text-white relative z-10",
                                  )}
                              </div>
                              <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                                <span
                                  className={`font-bold text-sm leading-tight block ${t.textMain}`}
                                >
                                  {p.name}
                                </span>
                                <div className="flex flex-col gap-2">
                                  {owner ? (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          className={`w-2 h-2 rounded-full shrink-0 ${owner.color.bg}`}
                                        />
                                        <span
                                          className={`text-[10px] font-bold truncate ${t.textMain}`}
                                        >
                                          {owner.name}
                                        </span>
                                      </div>
                                      {p.type === "street" &&
                                        pState.houses > 0 && (
                                          <div className="flex gap-0.5">
                                            {pState.houses === maxBuildings ? (
                                              <Building
                                                size={12}
                                                className="text-rose-600 drop-shadow-md"
                                                fill="currentColor"
                                              />
                                            ) : (
                                              Array.from({
                                                length: pState.houses,
                                              }).map((_, i) => (
                                                <Home
                                                  key={i}
                                                  size={12}
                                                  className="text-emerald-500 drop-shadow-sm"
                                                  fill="currentColor"
                                                />
                                              ))
                                            )}
                                          </div>
                                        )}
                                      {pState.mortgaged && (
                                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                          Mortgaged
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-widest ${t.textFaint}`}
                                    >
                                      Bank • ${p.price}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // List View
                        return (
                          <div
                            key={p.id}
                            onClick={clickHandler(() => setActivePropId(p.id))}
                            className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all duration-200 active:scale-[0.98] relative overflow-hidden ${t.card} ${t.borderHover} ${pState.mortgaged ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-center gap-3 relative z-10 w-full">
                              <div
                                className="relative w-4 h-full min-h-[40px] flex items-center justify-center rounded-sm shrink-0 border border-black/10 shadow-sm overflow-hidden"
                                style={
                                  p.color.startsWith("bg-[")
                                    ? { backgroundColor: hexColor }
                                    : undefined
                                }
                              >
                                {!p.color.startsWith("bg-[") && (
                                  <div
                                    className={`absolute inset-0 ${p.color}`}
                                  />
                                )}
                                {p.icon &&
                                  renderDynamicIcon(
                                    p.icon,
                                    12,
                                    "text-white relative z-10",
                                  )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <span
                                  className={`font-bold text-sm block truncate leading-tight ${t.textMain}`}
                                >
                                  {p.name}
                                </span>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {owner ? (
                                    <>
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${owner.color.text} ${owner.color.border} ${t.modalHeader}`}
                                      >
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full ${owner.color.bg}`}
                                        />
                                        {owner.name}
                                      </span>
                                      {p.type === "street" &&
                                        pState.houses > 0 && (
                                          <div className="flex gap-0.5">
                                            {pState.houses === maxBuildings ? (
                                              <Building
                                                size={14}
                                                className="text-rose-600 drop-shadow-md"
                                                fill="currentColor"
                                              />
                                            ) : (
                                              Array.from({
                                                length: pState.houses,
                                              }).map((_, i) => (
                                                <Home
                                                  key={i}
                                                  size={14}
                                                  className="text-emerald-500 drop-shadow-sm"
                                                  fill="currentColor"
                                                />
                                              ))
                                            )}
                                          </div>
                                        )}
                                      {pState.mortgaged && (
                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                          Mortgaged
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${t.textFaint} ${t.modalHeader}`}
                                    >
                                      Bank • ${p.price}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* NEW ACTION CARDS TAB */}
                {activeTab === "cards" && (
                  <div className="p-6 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
                    <div className="absolute top-6 right-6">
                      <button
                        onClick={clickHandler(() => setIsEditingDeck(true))}
                        className={`p-2 rounded-xl border flex items-center gap-2 font-bold transition-colors text-xs uppercase tracking-widest ${t.card} ${t.textMuted} hover:${t.textMain} hover:border-emerald-500/50`}
                      >
                        <Settings size={14} /> Edit Deck
                      </button>
                    </div>

                    <div className="text-center mb-8 mt-4">
                      <h2
                        className={`text-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 ${t.textMain}`}
                      >
                        <Wand2 size={24} className="text-emerald-500" /> Action
                        Deck
                      </h2>
                      <p
                        className={`text-xs uppercase tracking-widest font-bold mt-1 ${t.textMuted}`}
                      >
                        {state.settings.trueDeckMode
                          ? `True Deck Mode (${state.actionDeck?.length || 0} left)`
                          : "Infinite Deck Mode"}
                      </p>
                    </div>

                    <div className="relative w-64 h-96 perspective-1000 group">
                      <div
                        className={`w-full h-full preserve-3d transition-transform duration-[800ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${cardFlipState ? "rotate-y-180" : ""}`}
                      >
                        {/* CARD BACK */}
                        <button
                          onClick={() => {
                            if (!cardFlipState) {
                              doAudio("tap");
                              doHaptic(10);
                              setShowDeckPlayerSelect(true);
                            }
                          }}
                          className={`absolute inset-0 backface-hidden w-full h-full rounded-3xl border-4 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 z-10 ${isDark ? "bg-neutral-900 border-emerald-500/50" : "bg-slate-900 border-emerald-500"}`}
                        >
                          <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-white/20"></div>
                          <BookOpen
                            size={48}
                            className="text-emerald-500 mb-4"
                          />
                          <span className="text-white font-black text-2xl tracking-widest uppercase">
                            Draw
                          </span>
                        </button>

                        {/* CARD FRONT */}
                        <div
                          className={`absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-3xl border shadow-2xl flex flex-col items-center text-center p-6 bg-white border-slate-200
                          ${visibleCardData?.type === "penalty" ? "shadow-[0_0_50px_rgba(225,29,72,0.6)]" : visibleCardData?.type === "reward" ? "shadow-[0_0_50px_rgba(16,185,129,0.6)]" : "shadow-xl"}
                        `}
                        >
                          {visibleCardData?.type === "reward" && <Confetti />}
                          <div
                            className={`w-full h-2 rounded-full mb-6 ${visibleCardData?.type === "penalty" ? "bg-rose-500" : visibleCardData?.type === "reward" ? "bg-emerald-500" : "bg-amber-500"}`}
                          />

                          <div
                            className={`p-4 rounded-full mb-4 ${visibleCardData?.type === "penalty" ? "bg-rose-100 text-rose-600" : visibleCardData?.type === "reward" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                          >
                            {visibleCardData?.icon &&
                              renderDynamicIcon(visibleCardData.icon, 32, "")}
                          </div>

                          <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">
                            {visibleCardData?.title}
                          </h3>
                          <p className="text-slate-600 font-medium text-sm mb-auto">
                            {visibleCardData?.desc}
                          </p>

                          <div className="w-full pt-4 mt-4 border-t border-slate-200 flex flex-col gap-1 relative z-20">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                              Drawn By
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {visibleCardData?.drawnBy}
                            </span>
                          </div>

                          <button
                            onClick={clickHandler((e) => {
                              e.stopPropagation();
                              setCardFlipState(false);
                            })}
                            className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-xs font-bold whitespace-nowrap hover:bg-black/70 active:scale-95 transition-all"
                          >
                            <RefreshCcw size={14} /> Discard & Reset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SELECT PLAYER TO DRAW OVERLAY */}
                    {showDeckPlayerSelect && (
                      <div
                        className={`absolute inset-0 z-[400] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
                      >
                        <div
                          className={`border rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-black ${t.textMain}`}>
                              Who is drawing?
                            </h3>
                            <button
                              onClick={clickHandler(() =>
                                setShowDeckPlayerSelect(false),
                              )}
                              className={`p-2 rounded-full hover:bg-black/10 ${t.textMuted}`}
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {state.players
                              .filter((p) => !p.isBankrupt)
                              .map((p) => (
                                <button
                                  key={p.id}
                                  onClick={clickHandler(() => {
                                    setShowDeckPlayerSelect(false);
                                    dispatch({
                                      type: "DRAW_ACTION_CARD",
                                      payload: { playerId: p.id },
                                    });
                                  })}
                                  className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${t.input} ${t.borderHover}`}
                                >
                                  <span
                                    className={`w-3 h-3 rounded-full ${p.color.bg}`}
                                  ></span>
                                  <span className={`font-bold ${t.textMain}`}>
                                    {p.name}
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="p-4 animate-in fade-in duration-300">
                    <h2
                      className={`text-sm font-bold uppercase tracking-widest mb-4 px-2 ${t.textMuted}`}
                    >
                      Ledger
                    </h2>
                    {state.history.length === 0 ? (
                      <div className={`text-center py-20 ${t.textFaint}`}>
                        No transactions recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {state.history.map((tx) => {
                          const isSystem = tx.type === "SYSTEM";
                          const isBankrupt = tx.type === "BANKRUPTCY";
                          const isProp = tx.type === "PROPERTY";
                          const fromP = state.players.find(
                            (p) => p.id === tx.from,
                          );
                          const toP = state.players.find((p) => p.id === tx.to);

                          return (
                            <div
                              key={tx.id}
                              className={`p-4 rounded-2xl flex items-center justify-between border transition-colors ${t.card}`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSystem ? "bg-slate-500/10 text-slate-500" : isBankrupt ? "bg-rose-500/10 text-rose-500" : isProp ? "bg-purple-500/10 text-purple-500" : tx.type === "B2P" ? "bg-emerald-500/10 text-emerald-500" : tx.type === "P2B" ? "bg-amber-500/10 text-amber-500" : "bg-sky-500/10 text-sky-500"}`}
                                >
                                  {isSystem ? (
                                    <Settings size={18} />
                                  ) : isBankrupt ? (
                                    <AlertOctagon size={18} />
                                  ) : isProp ? (
                                    <Home size={18} />
                                  ) : tx.type === "B2P" ? (
                                    <TrendingUp size={18} />
                                  ) : tx.type === "P2B" ? (
                                    <TrendingDown size={18} />
                                  ) : (
                                    <ArrowRight size={18} />
                                  )}
                                </div>
                                <div>
                                  {isSystem || isBankrupt || isProp ? (
                                    <p
                                      className={`font-medium text-sm ${t.textMain}`}
                                    >
                                      {tx.message}
                                    </p>
                                  ) : (
                                    <div className="flex items-center gap-1.5 flex-wrap text-sm sm:text-base font-medium">
                                      <span
                                        className={
                                          fromP
                                            ? fromP.color.text
                                            : tx.from === "BUCKET"
                                              ? "text-amber-500"
                                              : t.textFaint
                                        }
                                      >
                                        {fromP
                                          ? fromP.name
                                          : tx.from === "BUCKET"
                                            ? "Bucket"
                                            : "Bank"}
                                      </span>
                                      <span className={t.textFaint}>→</span>
                                      <span
                                        className={
                                          toP
                                            ? toP.color.text
                                            : tx.to === "BUCKET"
                                              ? "text-amber-500"
                                              : t.textFaint
                                        }
                                      >
                                        {toP
                                          ? toP.name
                                          : tx.to === "BUCKET"
                                            ? "Bucket"
                                            : "Bank"}
                                      </span>
                                    </div>
                                  )}
                                  <p
                                    className={`text-xs mt-0.5 ${t.textFaint}`}
                                  >
                                    {new Date(tx.timestamp).toLocaleTimeString(
                                      [],
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </p>
                                </div>
                              </div>
                              {(!isSystem || tx.amount > 0) && !isBankrupt && (
                                <div
                                  className={`font-black text-lg ${t.textMain}`}
                                >
                                  ${tx.amount.toLocaleString()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="p-4 space-y-4 animate-in fade-in duration-300">
                    <div
                      className={`border rounded-3xl p-6 transition-colors ${t.card}`}
                    >
                      <h3
                        className={`font-bold mb-1 flex items-center justify-between ${t.textMain}`}
                      >
                        <span>App Theme</span>
                        <Palette size={18} className="text-emerald-500" />
                      </h3>
                      <p className={`text-sm mb-4 ${t.textMuted}`}>
                        Select your preferred visual style.
                      </p>
                      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "dark" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "dark" ? "border-emerald-500 ring-1 ring-emerald-500 text-white bg-neutral-800" : t.input}`}
                        >
                          Dark
                        </button>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "light" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "light" ? "border-emerald-500 ring-1 ring-emerald-500 text-slate-900 bg-white" : t.input}`}
                        >
                          Light
                        </button>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "midnight" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "midnight" ? "border-emerald-500 ring-1 ring-emerald-500 text-slate-100 bg-[#1e293b]" : t.input}`}
                        >
                          Midnight
                        </button>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "coffee" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "coffee" ? "border-emerald-500 ring-1 ring-emerald-500 text-[#fafaf9] bg-[#44403c]" : t.input}`}
                        >
                          Coffee
                        </button>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "ocean" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "ocean" ? "border-emerald-500 ring-1 ring-emerald-500 text-sky-50 bg-[#0c4a6e]" : t.input}`}
                        >
                          Ocean
                        </button>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "forest" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "forest" ? "border-emerald-500 ring-1 ring-emerald-500 text-emerald-50 bg-[#065f46]" : t.input}`}
                        >
                          Forest
                        </button>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: { theme: "cyberpunk" },
                            }),
                          )}
                          className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold border transition-all duration-200 active:scale-95 ${state.settings.theme === "cyberpunk" ? "border-emerald-500 ring-1 ring-emerald-500 text-[#fdf4ff] bg-[#27272a]" : t.input}`}
                        >
                          Cyberpunk
                        </button>
                      </div>
                    </div>

                    <div
                      className={`border rounded-3xl p-6 transition-colors space-y-4 ${t.card}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`font-bold ${t.textMain}`}>
                            Sound Effects
                          </h3>
                        </div>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: {
                                enableSounds:
                                  state.settings.enableSounds === false
                                    ? true
                                    : false,
                              },
                            }),
                          )}
                          className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableSounds !== false ? "bg-emerald-500" : isDark ? "bg-neutral-700" : "bg-slate-300"}`}
                        >
                          <div
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${state.settings.enableSounds !== false ? "translate-x-6" : "translate-x-0"}`}
                          />
                        </button>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-black/10">
                        <div>
                          <h3 className={`font-bold ${t.textMain}`}>
                            Haptic Feedback
                          </h3>
                        </div>
                        <button
                          onClick={() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: {
                                enableHaptics:
                                  state.settings.enableHaptics === false
                                    ? true
                                    : false,
                              },
                            })
                          }
                          className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableHaptics !== false ? "bg-emerald-500" : isDark ? "bg-neutral-700" : "bg-slate-300"}`}
                        >
                          <div
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${state.settings.enableHaptics !== false ? "translate-x-6" : "translate-x-0"}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`border rounded-3xl p-6 transition-colors ${t.card}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className={`font-bold ${t.textMain}`}>
                            Action Deck System
                          </h3>
                          <p className={`text-xs ${t.textMuted}`}>
                            Use True Deck behavior (Finite cards, no repeats
                            until reshuffled).
                          </p>
                        </div>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: {
                                trueDeckMode: !state.settings.trueDeckMode,
                              },
                            }),
                          )}
                          className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.trueDeckMode ? "bg-emerald-500" : isDark ? "bg-neutral-700" : "bg-slate-300"}`}
                        >
                          <div
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${state.settings.trueDeckMode ? "translate-x-6" : "translate-x-0"}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`border rounded-3xl p-6 transition-colors ${t.card}`}
                    >
                      <h3 className={`font-bold mb-1 ${t.textMain}`}>
                        Construction Rules
                      </h3>
                      <p className={`text-sm mb-4 ${t.textMuted}`}>
                        Number of houses required before building a Hotel.
                      </p>
                      <div
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${t.input}`}
                      >
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={state.settings.housesBeforeHotel ?? 4}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: {
                                housesBeforeHotel:
                                  parseInt(e.target.value, 10) || 4,
                              },
                            })
                          }
                          className={`bg-transparent font-black w-full focus:outline-none ${t.textMain}`}
                        />
                        <span className="text-emerald-500 font-bold">
                          <Home size={18} />
                        </span>
                      </div>
                    </div>

                    <div
                      className={`border rounded-3xl p-6 transition-colors ${t.card}`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className={`font-bold ${t.textMain}`}>
                            Debt System
                          </h3>
                          <p className={`text-xs ${t.textMuted}`}>
                            Enable player loans.
                          </p>
                        </div>
                        <button
                          onClick={clickHandler(() =>
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: {
                                enableDebt: !state.settings.enableDebt,
                              },
                            }),
                          )}
                          className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableDebt ? "bg-emerald-500" : isDark ? "bg-neutral-700" : "bg-slate-300"}`}
                        >
                          <div
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${state.settings.enableDebt ? "translate-x-6" : "translate-x-0"}`}
                          />
                        </button>
                      </div>

                      {state.settings.enableDebt && (
                        <div
                          className={`pt-4 border-t animate-in fade-in slide-in-from-top-2 ${t.border}`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-sm font-bold ${t.textMain}`}>
                              Custom Debt Limit
                            </span>
                            <button
                              onClick={clickHandler(() =>
                                dispatch({
                                  type: "UPDATE_SETTINGS",
                                  payload: {
                                    enableDebtLimit:
                                      !state.settings.enableDebtLimit,
                                  },
                                }),
                              )}
                              className={`w-10 h-5 rounded-full transition-colors relative ${state.settings.enableDebtLimit ? "bg-sky-500" : isDark ? "bg-neutral-700" : "bg-slate-300"}`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${state.settings.enableDebtLimit ? "translate-x-5" : "translate-x-0"}`}
                              />
                            </button>
                          </div>
                          {state.settings.enableDebtLimit && (
                            <div
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${t.input}`}
                            >
                              <span className="text-sky-500 font-bold">$</span>
                              <input
                                type="number"
                                value={
                                  state.settings.maxDebt === 0
                                    ? ""
                                    : state.settings.maxDebt
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  dispatch({
                                    type: "UPDATE_SETTINGS",
                                    payload: {
                                      maxDebt:
                                        val === "" ? "" : parseInt(val, 10),
                                    },
                                  });
                                }}
                                className={`bg-transparent font-black w-full focus:outline-none ${t.textMain}`}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      className={`border rounded-3xl p-6 transition-colors ${t.card}`}
                    >
                      <h3 className={`font-bold mb-1 ${t.textMain}`}>
                        Unmortgage Penalty
                      </h3>
                      <p className={`text-sm mb-4 ${t.textMuted}`}>
                        Custom interest % when unmortgaging a property.
                      </p>
                      <div
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${t.input}`}
                      >
                        <input
                          type="number"
                          value={
                            state.settings.unmortgageInterest === 0
                              ? ""
                              : state.settings.unmortgageInterest
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            dispatch({
                              type: "UPDATE_SETTINGS",
                              payload: {
                                unmortgageInterest:
                                  val === "" ? "" : parseInt(val, 10),
                              },
                            });
                          }}
                          className={`bg-transparent font-black w-full focus:outline-none ${t.textMain}`}
                        />
                        <span className="text-emerald-500 font-bold">%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={clickHandler(() => setIsEditingBoard(true))}
                        className={`border font-bold py-4 rounded-3xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2 ${t.card} ${t.textMain} ${t.borderHover}`}
                      >
                        <Edit3 size={24} className="text-sky-500" /> Customize
                        Board
                      </button>
                      <button
                        onClick={clickHandler(handleExport)}
                        className={`border font-bold py-4 rounded-3xl transition-all duration-200 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center gap-2 ${t.card} ${t.textMain} ${t.borderHover}`}
                      >
                        <Upload size={24} className="text-emerald-500" /> Export
                        Save Data
                      </button>
                    </div>

                    <div
                      className={`border rounded-3xl p-6 transition-colors ${t.card}`}
                    >
                      <h3
                        className={`font-bold mb-4 flex items-center gap-2 ${t.textMain}`}
                      >
                        <Info size={18} className="text-emerald-500" /> About
                        BMS
                      </h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-bold ${t.textMain}`}>
                            Version 6.5.0 (Beta)
                          </p>
                          <p className={`text-sm ${t.textMuted}`}>
                            Developed by Yousuf with AI
                          </p>
                        </div>
                        <a
                          href="https://github.com/ntiqueC0de"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-3 rounded-full border transition-all duration-200 hover:scale-[1.05] active:scale-95 ${t.card} ${t.textMain} ${t.borderHover}`}
                        >
                          <Github size={24} />
                        </a>
                      </div>
                    </div>

                    <div className="bg-rose-500/10 rounded-3xl p-6 border border-rose-500/20">
                      <h3 className="text-rose-500 font-bold mb-4 flex items-center gap-2">
                        <AlertOctagon size={18} /> Danger Zone
                      </h3>
                      <button
                        onClick={clickHandler(() => setEndGameConfirm(true))}
                        className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mb-3"
                      >
                        End Game & Rank Players
                      </button>
                      <button
                        onClick={clickHandler(() => setResetConfirm(true))}
                        className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        Reset App
                      </button>
                    </div>
                  </div>
                )}
              </main>

              <nav
                className={`absolute bottom-0 w-full z-20 pb-safe transition-colors duration-300 backdrop-blur-xl border-t px-4 sm:px-6 py-4 flex justify-between items-center shrink-0 ${t.nav}`}
              >
                {[
                  { id: "home", icon: Users, label: "Home" },
                  { id: "properties", icon: Home, label: "Assets" },
                  { id: "cards", icon: BookOpen, label: "Cards" },
                  { id: "history", icon: HistoryIcon, label: "Ledger" },
                  { id: "settings", icon: Settings, label: "Settings" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={clickHandler(() => setActiveTab(tab.id))}
                    className={`flex flex-col items-center gap-1.5 w-16 transition-colors duration-200 ${activeTab === tab.id ? (isDark ? "text-white" : "text-slate-900") : t.textMuted}`}
                  >
                    <tab.icon
                      size={22}
                      className={
                        activeTab === tab.id
                          ? isDark
                            ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-transform scale-110"
                            : "transition-transform scale-110"
                          : "transition-transform scale-100"
                      }
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* OVERLAYS THAT MUST WORK EVERYWHERE */}
          {isEditingBoard && renderBoardEditor()}
          {isEditingDeck && renderDeckEditor()}
          {tradeWizard && renderTradeWizard()}

          {/* GLOBAL BMS GROUP POPUP OVERLAY */}
          {bmsAlert && (
            <div
              onClick={() => setBmsAlert(null)}
              className={`absolute inset-0 z-[400] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 fade-in duration-500 cursor-pointer ${t.modalOverlay} backdrop-blur-md`}
            >
              <PartyPopper
                size={80}
                className="text-emerald-500 mb-6 animate-bounce"
              />
              <div
                className={`border-4 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_80px_rgba(16,185,129,0.3)] ${t.modalBg}`}
                style={{
                  borderColor: bmsAlert.color.startsWith("bg-[")
                    ? bmsAlert.color.slice(4, -1)
                    : undefined,
                }}
              >
                <h2
                  className={`text-3xl font-black mb-2 uppercase tracking-tighter ${t.textMain}`}
                >
                  Group Complete!
                </h2>
                <p className={`text-lg font-bold ${t.textMuted}`}>
                  <span className={t.textMain}>{bmsAlert.playerName}</span> has
                  completed the{" "}
                  <span className={t.textMain}>{bmsAlert.groupName}</span>{" "}
                  group!
                </p>
                <p className={`text-xs mt-4 ${t.textFaint}`}>
                  Houses and Hotels can now be built. (Tap anywhere to dismiss)
                </p>
              </div>
            </div>
          )}

          {/* GLOBAL JACKPOT/BUCKET POPUP OVERLAY */}
          {jackpotAlert && (
            <div
              onClick={() => setJackpotAlert(null)}
              className={`absolute inset-0 z-[400] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 fade-in duration-500 cursor-pointer ${t.modalOverlay} backdrop-blur-md`}
            >
              <Confetti />
              <Coins
                size={100}
                className="text-amber-500 mb-6 animate-bounce drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]"
              />
              <div
                className={`border-4 border-amber-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_80px_rgba(245,158,11,0.3)] ${t.modalBg}`}
              >
                <h2
                  className={`text-4xl font-black mb-2 uppercase tracking-tighter ${t.textMain}`}
                >
                  Jackpot!
                </h2>
                <p className={`text-lg font-bold ${t.textMuted}`}>
                  <span className={t.textMain}>{jackpotAlert.playerName}</span>{" "}
                  claimed the Treasure Bucket!
                </p>
                <p className={`text-3xl font-black mt-4 text-amber-500`}>
                  +${jackpotAlert.amount.toLocaleString()}
                </p>
                <p
                  className={`text-[10px] uppercase font-bold mt-6 ${t.textFaint}`}
                >
                  Tap anywhere to dismiss
                </p>
              </div>
            </div>
          )}

          {/* GLOBAL TRADE POPUP OVERLAY */}
          {tradeAlert && (
            <div
              onClick={() => setTradeAlert(null)}
              className={`absolute inset-0 z-[400] flex flex-col items-center justify-center p-6 animate-in zoom-in-95 fade-in duration-500 cursor-pointer ${t.modalOverlay} backdrop-blur-md`}
            >
              <Confetti />
              <Handshake
                size={80}
                className="text-sky-500 mb-6 animate-bounce drop-shadow-[0_0_30px_rgba(14,165,233,0.5)]"
              />
              <div
                className={`border-4 border-sky-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_80px_rgba(14,165,233,0.3)] ${t.modalBg}`}
              >
                <h2
                  className={`text-3xl font-black mb-2 uppercase tracking-tighter ${t.textMain}`}
                >
                  Trade Complete!
                </h2>
                <p className={`text-lg font-bold ${t.textMuted}`}>
                  A deal was struck between{" "}
                  <span className={t.textMain}>{tradeAlert.p1Name}</span> and{" "}
                  <span className={t.textMain}>{tradeAlert.p2Name}</span>
                </p>
                <p
                  className={`text-[10px] uppercase font-bold mt-6 ${t.textFaint}`}
                >
                  Tap anywhere to dismiss
                </p>
              </div>
            </div>
          )}

          {/* BUCKET MODAL */}
          {bucketModal && (
            <div
              className={`absolute inset-0 z-[100] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ease-out ${t.modalOverlay}`}
            >
              <div
                className={`w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl border-t sm:border shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300 ease-out relative ${t.modalBg}`}
              >
                <div
                  className={`px-6 py-4 flex justify-between items-center rounded-t-3xl border-b shrink-0 ${t.modalHeader}`}
                >
                  <div>
                    <h3 className={`font-bold leading-tight ${t.textMain}`}>
                      Treasure Bucket
                    </h3>
                    <span
                      className={`text-xs uppercase font-bold tracking-widest text-amber-500`}
                    >
                      ${state.treasureBucket || 0} Available
                    </span>
                  </div>
                  <button
                    onClick={closeModals}
                    className={`p-3 rounded-full transition-colors ${t.textMuted} hover:bg-black/10 ${t.textMain}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto hide-scrollbar">
                  <div className="mb-4">
                    <label
                      className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${t.textMuted}`}
                    >
                      Select player to claim bucket
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {state.players
                        .filter((p) => !p.isBankrupt)
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={clickHandler(() => setTargetId(p.id))}
                            className={`px-4 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 ${targetId === p.id ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 scale-105" : `${t.input} ${t.textFaint} hover:border-amber-500/50`}`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full ${p.color.bg}`}
                            ></span>
                            <span className="font-bold">{p.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={clickHandler(() => {
                      if (!targetId || !state.treasureBucket) return;
                      dispatch({ type: "CLEAR_ERROR" });
                      dispatch({
                        type: "TRANSACT",
                        payload: {
                          from: "BUCKET",
                          to: targetId,
                          amount: state.treasureBucket,
                          type: "B2P",
                        },
                      });
                    })}
                    disabled={!targetId || !state.treasureBucket}
                    className={`w-full py-4 rounded-2xl text-lg font-black flex items-center justify-center gap-2 transition-all duration-200 ${!targetId || !state.treasureBucket ? "opacity-50 cursor-not-allowed " + t.input : "bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95"}`}
                  >
                    <Check size={24} strokeWidth={3} /> Claim Full Bucket
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BANK MODAL */}
          {bankModal && (
            <div
              className={`absolute inset-0 z-[100] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ease-out ${t.modalOverlay}`}
            >
              <div
                className={`w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl border-t sm:border shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300 ease-out relative ${t.modalBg}`}
              >
                <div
                  className={`px-6 py-4 flex justify-between items-center rounded-t-3xl border-b shrink-0 ${t.modalHeader}`}
                >
                  <div>
                    <h3 className={`font-bold leading-tight ${t.textMain}`}>
                      Central Bank
                    </h3>
                    <span
                      className={`text-xs uppercase font-bold tracking-widest ${t.textMuted}`}
                    >
                      Bank Transfer
                    </span>
                  </div>
                  <button
                    onClick={closeModals}
                    className={`p-3 rounded-full transition-colors ${t.textMuted} hover:bg-black/10 ${t.textMain}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto hide-scrollbar">
                  <div className="mb-4">
                    <label
                      className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${t.textMuted}`}
                    >
                      Recipient (Push Money To)
                    </label>
                    <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                      {state.players
                        .filter((p) => !p.isBankrupt)
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={clickHandler(() => setTargetId(p.id))}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all duration-200 ${targetId === p.id ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 scale-105" : `${t.input} ${t.textFaint} hover:border-emerald-500/50`}`}
                          >
                            {p.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div
                    className={`mb-4 rounded-2xl border py-2 flex flex-col items-center justify-center relative transition-colors ${t.card}`}
                  >
                    <div
                      className={`absolute top-2 left-3 text-[10px] font-black uppercase tracking-widest ${t.textFaint}`}
                    >
                      Amount
                    </div>
                    <div className="flex items-start justify-center gap-1">
                      <span
                        className={`text-xl mt-1.5 font-bold ${t.textMuted}`}
                      >
                        $
                      </span>
                      <span
                        className={`text-5xl font-black tracking-tighter truncate max-w-[250px] ${amountStr === "0" ? t.textFaint : "text-emerald-500"}`}
                      >
                        {parseInt(amountStr || 0, 10).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumpad(num.toString())}
                        className={`h-12 rounded-2xl text-2xl font-black transition-all ${t.numpad}`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => handleNumpad("00")}
                      className={`h-12 rounded-2xl text-lg font-black transition-all ${t.numpad}`}
                    >
                      00
                    </button>
                    <button
                      onClick={() => handleNumpad("0")}
                      className={`h-12 rounded-2xl text-2xl font-black transition-all ${t.numpad}`}
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleNumpad("DEL")}
                      className={`h-12 rounded-2xl flex items-center justify-center transition-all ${t.numpadDel}`}
                    >
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>

                  <button
                    onClick={clickHandler(() => {
                      if (!targetId || amountStr === "0") return;
                      dispatch({ type: "CLEAR_ERROR" });
                      dispatch({
                        type: "TRANSACT",
                        payload: {
                          from: "BANK",
                          to: targetId,
                          amount: amountStr,
                          type: "B2P",
                          msgOverride: "Bank transferred Go Cash/Bonus",
                        },
                      });
                    })}
                    disabled={!targetId || amountStr === "0"}
                    className={`w-full py-3 rounded-2xl text-lg font-black flex items-center justify-center gap-2 transition-all duration-200 ${!targetId || amountStr === "0" ? "opacity-50 cursor-not-allowed " + t.input : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"}`}
                  >
                    <Check size={24} strokeWidth={3} /> Send to Player
                  </button>

                  <div className="mt-8 pt-4 border-t border-black/10 flex justify-between items-center">
                    <div>
                      <h4 className={`font-bold ${t.textMain}`}>
                        Treasure Bucket
                      </h4>
                      <p
                        className={`text-[10px] uppercase font-bold tracking-widest ${t.textMuted}`}
                      >
                        Global visibility
                      </p>
                    </div>
                    <button
                      onClick={clickHandler(() =>
                        dispatch({
                          type: "UPDATE_SETTINGS",
                          payload: {
                            enableTreasureBucket:
                              state.settings.enableTreasureBucket === false
                                ? true
                                : false,
                          },
                        }),
                      )}
                      className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.enableTreasureBucket !== false ? "bg-amber-500" : isDark ? "bg-neutral-700" : "bg-slate-300"}`}
                    >
                      <div
                        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${state.settings.enableTreasureBucket !== false ? "translate-x-6" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROPERTY MODAL */}
          {activePropId &&
            (() => {
              const propDef = state.board.find((p) => p.id === activePropId);
              if (!propDef) return null;
              const pState = state.propertyState[activePropId] || {
                ownerId: null,
                houses: 0,
                mortgaged: false,
              };
              const isOwned = !!pState.ownerId;
              const owner = isOwned
                ? state.players.find((p) => p.id === pState.ownerId)
                : null;
              const unmortgageCost = Math.ceil(
                propDef.mort *
                  (1 + (state.settings.unmortgageInterest ?? 10) / 100),
              );

              const housesBeforeHotel = state.settings.housesBeforeHotel ?? 4;
              const maxBuildings = housesBeforeHotel + 1;
              const isNextHotel = pState.houses === housesBeforeHotel;
              const isCurrentHotel = pState.houses === maxBuildings;

              const nextBuildCost = isNextHotel
                ? (propDef.hotel ?? propDef.build)
                : propDef.build;
              const currentSellValue = isCurrentHotel
                ? (propDef.hotel ?? propDef.build) / 2
                : propDef.build / 2;

              const handlePropAction = () => {
                dispatch({ type: "CLEAR_ERROR" });

                // Pre-Transaction UI Barrier
                let cost = 0;
                if (propConfirmAction.type === "BUY")
                  cost = propConfirmAction.amount;
                if (propConfirmAction.type === "BUILD")
                  cost = propConfirmAction.amount;
                if (propConfirmAction.type === "UNMORTGAGE")
                  cost = unmortgageCost;

                const activePlayerToCheck =
                  propConfirmAction.type === "BUY"
                    ? state.players.find(
                        (p) => p.id === propConfirmAction.playerId,
                      )
                    : owner;

                if (cost > 0 && activePlayerToCheck.balance < cost) {
                  showToast(`Insufficient funds! Need $${cost}.`, "error");
                  setPropConfirmAction(null);
                  return;
                }

                // Specific Debt Block for Real Estate
                if (
                  (propConfirmAction.type === "BUY" ||
                    propConfirmAction.type === "BUILD") &&
                  activePlayerToCheck.debt > 0
                ) {
                  showToast(
                    "Cannot buy/build while in debt. Repay loan first.",
                    "error",
                  );
                  setPropConfirmAction(null);
                  return;
                }

                dispatch({
                  type: "PROPERTY_ACTION",
                  payload: {
                    actionType: propConfirmAction.type,
                    propertyId: activePropId,
                    playerId: propConfirmAction.playerId,
                    amount: propConfirmAction.amount,
                    targetPlayerId: propConfirmAction.targetId,
                  },
                });
              };

              return (
                <div
                  className={`absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ease-out p-4 ${t.modalOverlay}`}
                >
                  <div
                    className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 ease-out relative ${t.modalBg}`}
                  >
                    {propConfirmAction && (
                      <div
                        className={`absolute inset-0 z-[70] backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in text-center bg-opacity-95 ${t.modalBg}`}
                      >
                        <h3 className={`text-xl font-black mb-2 ${t.textMain}`}>
                          Confirm Action
                        </h3>
                        <p className={`mb-6 text-sm ${t.textMuted}`}>
                          {propConfirmAction.type === "BUY" &&
                            `Buy for $${propConfirmAction.amount}?`}
                          {propConfirmAction.type === "BUILD" &&
                            `Build for $${propConfirmAction.amount}?`}
                          {propConfirmAction.type === "SELL_BUILD" &&
                            `Sell for $${propConfirmAction.amount}?`}
                          {propConfirmAction.type === "MORTGAGE" &&
                            `Mortgage and receive $${propConfirmAction.amount}?`}
                          {propConfirmAction.type === "UNMORTGAGE" &&
                            `Unmortgage for $${propConfirmAction.amount}?`}
                          {propConfirmAction.type === "TRANSFER" &&
                            `Transfer ownership to selected player?`}
                        </p>
                        <div className="flex gap-3 w-full">
                          <button
                            onClick={clickHandler(() => {
                              setPropConfirmAction(null);
                              dispatch({ type: "CLEAR_ERROR" });
                            })}
                            className={`flex-1 py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 ${t.input}`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={clickHandler(handlePropAction)}
                            className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}

                    <div
                      className={`${propDef.color.startsWith("bg-[") ? propDef.color : propDef.color.replace("bg-", "bg-")} ${propDef.text || "text-white"} p-6 relative border-b border-black/10 flex items-center gap-3`}
                    >
                      <button
                        onClick={closeModals}
                        className="absolute top-2 right-2 p-3 z-[60] bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md text-white"
                      >
                        <X size={20} />
                      </button>
                      {propDef.icon &&
                        renderDynamicIcon(
                          propDef.icon,
                          32,
                          "opacity-50 shrink-0",
                        )}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                          Title Deed
                        </p>
                        <h2 className="text-2xl font-black leading-tight">
                          {propDef.name}
                        </h2>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {!isOwned ? (
                        <div className="space-y-4">
                          <div className="text-center relative">
                            <span
                              className={`text-sm font-bold block mb-1 ${t.textMuted}`}
                            >
                              Purchase Price
                            </span>
                            {isEditingBuyPrice ? (
                              <div className="flex items-center justify-center gap-2">
                                <span
                                  className={`text-4xl font-black ${t.textMain}`}
                                >
                                  $
                                </span>
                                <input
                                  type="number"
                                  autoFocus
                                  value={
                                    customBuyPrice === "0" ? "" : customBuyPrice
                                  }
                                  onChange={(e) =>
                                    setCustomBuyPrice(e.target.value || "0")
                                  }
                                  className={`w-28 text-4xl font-black bg-transparent border-b-2 border-emerald-500 focus:outline-none text-center ${t.textMain}`}
                                />
                                <button
                                  onClick={clickHandler(() => {
                                    setIsEditingBuyPrice(false);
                                    showToast(
                                      "Custom price set for this transaction",
                                      "success",
                                    );
                                  })}
                                  className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-400 active:scale-95 transition-all"
                                >
                                  <Check size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span
                                  className={`text-4xl font-black ${t.textMain}`}
                                >
                                  ${customBuyPrice}
                                </span>
                                <button
                                  onClick={clickHandler(() =>
                                    setIsEditingBuyPrice(true),
                                  )}
                                  className={`p-2 rounded-full transition-colors ${isDark ? "text-emerald-400 hover:bg-emerald-400/10" : "text-emerald-600 hover:bg-emerald-600/10"}`}
                                >
                                  <Edit3 size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            <label
                              className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${t.textMuted}`}
                            >
                              Select Buyer
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {state.players
                                .filter((p) => !p.isBankrupt)
                                .map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={clickHandler(() =>
                                      setPropConfirmAction({
                                        type: "BUY",
                                        playerId: p.id,
                                        amount:
                                          parseInt(customBuyPrice, 10) || 0,
                                      }),
                                    )}
                                    className={`py-3 rounded-xl border flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 ${t.input} ${t.borderHover}`}
                                  >
                                    <span
                                      className={`w-2 h-2 rounded-full ${p.color.bg}`}
                                    ></span>
                                    <span
                                      className={`text-xs font-bold truncate w-full text-center px-1 ${t.textMain}`}
                                    >
                                      {p.name}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div
                            className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${t.modalHeader}`}
                          >
                            <span
                              className={`text-xs font-bold ${t.textMuted}`}
                            >
                              Owner
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${owner.color.bg}`}
                              ></span>
                              <span
                                className={`font-bold text-sm ${t.textMain}`}
                              >
                                {owner.name}
                              </span>
                            </div>
                          </div>

                          {pState.mortgaged ? (
                            <div className="text-center space-y-4">
                              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                                <AlertOctagon
                                  size={24}
                                  className="text-rose-500 mx-auto mb-2"
                                />
                                <span className="text-rose-500 font-bold block">
                                  Property Mortgaged
                                </span>
                              </div>
                              <button
                                onClick={clickHandler(() =>
                                  setPropConfirmAction({
                                    type: "UNMORTGAGE",
                                    playerId: owner.id,
                                    amount: unmortgageCost,
                                  }),
                                )}
                                className="w-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
                              >
                                Unmortgage (${unmortgageCost})
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {propDef.type === "street" &&
                                (() => {
                                  const groupProps = state.board.filter(
                                    (b) => b.group === propDef.group,
                                  );
                                  const groupStates = groupProps.map(
                                    (b) =>
                                      state.propertyState[b.id] || {
                                        houses: 0,
                                      },
                                  );
                                  const hasFullGroup = groupProps.every(
                                    (b) =>
                                      state.propertyState[b.id]?.ownerId ===
                                      owner.id,
                                  );
                                  const anyMortgagedInGroup = groupProps.some(
                                    (b) => state.propertyState[b.id]?.mortgaged,
                                  );

                                  const minGroupHouses = Math.min(
                                    ...groupStates.map((s) => s.houses),
                                  );
                                  const maxGroupHouses = Math.max(
                                    ...groupStates.map((s) => s.houses),
                                  );

                                  const isEvenBuild =
                                    pState.houses === minGroupHouses;
                                  const isEvenSell =
                                    pState.houses === maxGroupHouses;

                                  const canBuild =
                                    hasFullGroup && !anyMortgagedInGroup;

                                  return (
                                    <div
                                      className={`p-4 rounded-xl border transition-colors ${t.modalHeader}`}
                                    >
                                      <div className="flex justify-between items-center mb-4">
                                        <span
                                          className={`text-xs font-bold ${t.textMuted}`}
                                        >
                                          Development
                                        </span>
                                        <div className="flex gap-1">
                                          {pState.houses === maxBuildings ? (
                                            <Building
                                              size={18}
                                              className="text-rose-600 drop-shadow-md"
                                              fill="currentColor"
                                            />
                                          ) : (
                                            Array.from({
                                              length: pState.houses,
                                            }).map((_, i) => (
                                              <Home
                                                key={i}
                                                size={14}
                                                className="text-emerald-500 drop-shadow-sm"
                                                fill="currentColor"
                                              />
                                            ))
                                          )}
                                          {pState.houses === 0 && (
                                            <span
                                              className={`text-xs font-bold ${t.textFaint}`}
                                            >
                                              Empty Lot
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-2 flex-col sm:flex-row">
                                        <button
                                          onClick={clickHandler(() =>
                                            setPropConfirmAction({
                                              type: "BUILD",
                                              playerId: owner.id,
                                              amount: nextBuildCost,
                                            }),
                                          )}
                                          disabled={
                                            pState.houses >= maxBuildings ||
                                            !canBuild ||
                                            !isEvenBuild
                                          }
                                          className={`flex-1 disabled:opacity-50 text-emerald-500 text-xs font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 border ${t.input} hover:border-emerald-500/50`}
                                        >
                                          Build ({nextBuildCost})
                                        </button>
                                        <button
                                          onClick={clickHandler(() =>
                                            setPropConfirmAction({
                                              type: "SELL_BUILD",
                                              playerId: owner.id,
                                              amount: currentSellValue,
                                            }),
                                          )}
                                          disabled={
                                            pState.houses === 0 || !isEvenSell
                                          }
                                          className={`flex-1 disabled:opacity-50 text-rose-500 text-xs font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 border ${t.input} hover:border-rose-500/50`}
                                        >
                                          Sell ({currentSellValue})
                                        </button>
                                      </div>
                                      {!hasFullGroup ? (
                                        <p
                                          className={`text-[10px] font-bold text-rose-500 mt-3 text-center`}
                                        >
                                          Requires full {propDef.group} set to
                                          build.
                                        </p>
                                      ) : anyMortgagedInGroup ? (
                                        <p
                                          className={`text-[10px] font-bold text-rose-500 mt-3 text-center`}
                                        >
                                          Cannot build while a {propDef.group}{" "}
                                          property is mortgaged.
                                        </p>
                                      ) : !isEvenBuild &&
                                        pState.houses < maxBuildings ? (
                                        <p
                                          className={`text-[10px] font-bold text-amber-500 mt-3 text-center`}
                                        >
                                          Must build evenly across the{" "}
                                          {propDef.group} group.
                                        </p>
                                      ) : null}
                                    </div>
                                  );
                                })()}
                              <button
                                onClick={clickHandler(() =>
                                  setPropConfirmAction({
                                    type: "MORTGAGE",
                                    playerId: owner.id,
                                    amount: propDef.mort,
                                  }),
                                )}
                                disabled={pState.houses > 0}
                                className={`w-full disabled:opacity-50 text-amber-500 font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 border ${t.input} hover:border-amber-500/50`}
                              >
                                Mortgage to Bank (+${propDef.mort})
                              </button>
                            </div>
                          )}

                          {!pState.mortgaged && (
                            <div className={`pt-4 border-t ${t.border}`}>
                              <button
                                onClick={clickHandler(() => {
                                  setTradeWizard({
                                    step: 1,
                                    p1Id: owner.id,
                                    p1Offer: {
                                      cash: 0,
                                      props: [activePropId],
                                    },
                                    p2Offer: { cash: 0, props: [] },
                                  });
                                  setActivePropId(null);
                                })}
                                className={`w-full py-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${t.input} hover:border-sky-500 text-sky-500`}
                              >
                                <ArrowRightLeft size={16} /> Open Trade Wizard
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* PLAYER TRANSACTION MODAL */}
          {modalConfig &&
            activeP &&
            (() => {
              return (
                <div
                  className={`absolute inset-0 z-[100] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 ease-out ${t.modalOverlay}`}
                >
                  <div
                    className={`w-full sm:w-[420px] rounded-t-3xl sm:rounded-3xl border-t sm:border shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-300 ease-out relative ${t.modalBg}`}
                  >
                    <div
                      className={`px-6 py-4 flex justify-between items-center rounded-t-3xl border-b shrink-0 ${t.modalHeader}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${activeP.color.bg}`}
                        ></div>
                        <div>
                          <h3
                            className={`font-bold leading-tight ${t.textMain}`}
                          >
                            {activeP.name}
                          </h3>
                          <div className="flex gap-2 text-xs font-mono font-medium">
                            <span className="text-emerald-500">
                              Bal: ${activeP.balance.toLocaleString()}
                            </span>
                            {activeP.debt > 0 && (
                              <span className="text-rose-500">
                                Debt: -${activeP.debt.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={closeModals}
                        className={`p-3 z-[60] rounded-full transition-colors ${t.textMuted} hover:bg-black/10 ${t.textMain}`}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div
                      className={`flex p-2 gap-2 border-b overflow-x-auto hide-scrollbar shrink-0 ${t.modalHeader}`}
                    >
                      <button
                        onClick={clickHandler(() => {
                          setTxType("PAY_PLAYER");
                          dispatch({ type: "CLEAR_ERROR" });
                        })}
                        className={`shrink-0 flex-1 whitespace-nowrap min-w-[80px] h-10 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center ${txType === "PAY_PLAYER" ? "bg-sky-500 text-white shadow-md shadow-sky-500/20" : t.actionTabNormal}`}
                      >
                        Pay Player
                      </button>
                      <button
                        onClick={clickHandler(() => {
                          setTxType("PAY_BANK");
                          dispatch({ type: "CLEAR_ERROR" });
                        })}
                        className={`shrink-0 flex-1 whitespace-nowrap min-w-[80px] h-10 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center ${txType === "PAY_BANK" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : t.actionTabNormal}`}
                      >
                        Pay Bank
                      </button>
                      {state.settings.enableTreasureBucket !== false && (
                        <button
                          onClick={clickHandler(() => {
                            setTxType("PAY_BUCKET");
                            dispatch({ type: "CLEAR_ERROR" });
                          })}
                          className={`shrink-0 flex-1 whitespace-nowrap min-w-[80px] h-10 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center ${txType === "PAY_BUCKET" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : t.actionTabNormal}`}
                        >
                          Pay Bucket
                        </button>
                      )}
                      <button
                        onClick={clickHandler(() => {
                          setTxType("DEBT");
                          dispatch({ type: "CLEAR_ERROR" });
                        })}
                        disabled={!state.settings.enableDebt}
                        className={`shrink-0 flex-1 whitespace-nowrap min-w-[80px] h-10 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center ${txType === "DEBT" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : t.actionTabNormal} ${!state.settings.enableDebt ? "opacity-30 cursor-not-allowed hover:bg-transparent" : ""}`}
                      >
                        Take Loan
                      </button>
                      {activeP.debt > 0 && (
                        <button
                          onClick={clickHandler(() => {
                            setTxType("REPAY");
                            dispatch({ type: "CLEAR_ERROR" });
                          })}
                          className={`shrink-0 flex-1 whitespace-nowrap min-w-[80px] h-10 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 flex items-center justify-center ${txType === "REPAY" ? "bg-purple-500 text-white shadow-md shadow-purple-500/20" : t.actionTabNormal}`}
                        >
                          Repay
                        </button>
                      )}
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto hide-scrollbar">
                      {txType === "PAY_PLAYER" && (
                        <div className="mb-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          <label
                            className={`text-[10px] font-bold uppercase tracking-widest mb-2 block ${t.textMuted}`}
                          >
                            Recipient
                          </label>
                          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                            {availableTargets.map((p) => (
                              <button
                                key={p.id}
                                onClick={clickHandler(() => setTargetId(p.id))}
                                className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all duration-200 flex items-center gap-2 ${targetId === p.id ? `border-sky-500 shadow-md ${t.p2pTag} scale-105` : `${t.input} ${t.textFaint} hover:border-sky-500/50`}`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${p.color.bg}`}
                                ></span>
                                <span
                                  className={`font-semibold text-sm ${targetId === p.id ? t.textMain : ""}`}
                                >
                                  {p.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        className={`mb-4 rounded-2xl border py-2 flex flex-col items-center justify-center relative transition-colors ${t.card}`}
                      >
                        <div
                          className={`absolute top-2 left-3 text-[10px] font-black uppercase tracking-widest ${t.textFaint}`}
                        >
                          Amount
                        </div>
                        <div className="flex items-start justify-center gap-1">
                          <span
                            className={`text-xl mt-1.5 font-bold ${t.textMuted}`}
                          >
                            $
                          </span>
                          <span
                            className={`text-5xl font-black tracking-tighter truncate max-w-[250px] transition-colors ${amountStr === "0" ? t.textFaint : txType === "PAY_BANK" ? "text-emerald-500" : txType === "PAY_BUCKET" ? "text-amber-500" : txType === "DEBT" || txType === "REPAY" ? "text-rose-500" : "text-sky-500"}`}
                          >
                            {parseInt(amountStr || 0, 10).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <button
                            key={num}
                            onClick={() => handleNumpad(num.toString())}
                            className={`h-12 rounded-2xl text-2xl font-black transition-all ${t.numpad}`}
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          onClick={() => handleNumpad("00")}
                          className={`h-12 rounded-2xl text-lg font-black transition-all ${t.numpad}`}
                        >
                          00
                        </button>
                        <button
                          onClick={() => handleNumpad("0")}
                          className={`h-12 rounded-2xl text-2xl font-black transition-all ${t.numpad}`}
                        >
                          0
                        </button>
                        <button
                          onClick={() => handleNumpad("DEL")}
                          className={`h-12 rounded-2xl flex items-center justify-center transition-all ${t.numpadDel}`}
                        >
                          <X size={24} strokeWidth={3} />
                        </button>
                      </div>

                      <button
                        onClick={clickHandler(executeTx)}
                        disabled={
                          amountStr === "0" ||
                          (txType === "PAY_PLAYER" && !targetId)
                        }
                        className={`w-full py-3 rounded-2xl text-lg font-black flex items-center justify-center gap-2 transition-all duration-200
                          ${amountStr === "0" || (txType === "PAY_PLAYER" && !targetId) ? `opacity-50 cursor-not-allowed ${t.input}` : txType === "PAY_BANK" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95" : txType === "PAY_BUCKET" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95" : txType === "DEBT" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-95" : txType === "REPAY" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] active:scale-95" : "bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:scale-[1.02] active:scale-95"}`}
                      >
                        <Check size={24} strokeWidth={3} />{" "}
                        {txType === "DEBT"
                          ? "Request Loan"
                          : txType === "REPAY"
                            ? "Repay Debt"
                            : "Confirm"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* AUTO BANKRUPTCY POPUP */}
          {state.pendingBankruptcy &&
            (() => {
              const p = state.players.find(
                (p) => p.id === state.pendingBankruptcy,
              );
              return (
                <div
                  className={`absolute inset-0 z-[150] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
                >
                  <div
                    className={`border border-rose-500/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 ease-out ${t.modalBg}`}
                  >
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4 ring-2 ring-rose-500/20">
                      <AlertOctagon size={32} />
                    </div>
                    <h2 className={`text-xl font-black mb-2 ${t.textMain}`}>
                      Zero Balance Reached
                    </h2>
                    <p className={`text-sm mb-6 ${t.textMuted}`}>
                      <strong className={t.textMain}>{p.name}</strong> has
                      exactly $0. Raise funds or declare bankruptcy.
                    </p>
                    <div className="flex flex-col gap-3 w-full">
                      <button
                        onClick={clickHandler(() =>
                          dispatch({ type: "DISMISS_BANKRUPTCY" }),
                        )}
                        className={`w-full py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 ${t.input}`}
                      >
                        Resolve Debt Manually
                      </button>
                      <button
                        onClick={clickHandler(() => {
                          dispatch({
                            type: "BANKRUPT_PLAYER",
                            payload: p.id,
                          });
                          showToast(`${p.name} is bankrupt`, "error");
                        })}
                        className="w-full py-3 bg-rose-500/10 text-rose-500 font-bold rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-200 active:scale-95"
                      >
                        Declare Bankrupt
                      </button>
                      <button
                        onClick={clickHandler(() => {
                          dispatch({
                            type: "BANKRUPT_PLAYER",
                            payload: p.id,
                          });
                          dispatch({ type: "END_GAME_RANKING" });
                        })}
                        className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        Declare Bankrupt & End Game
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* END GAME CONFIRM MODAL */}
          {resetConfirm && (
            <div
              className={`absolute inset-0 z-[150] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
            >
              <div
                className={`border border-rose-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
              >
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-black mb-2 ${t.textMain}`}>
                    Reset Game?
                  </h2>
                  <p className={`text-sm ${t.textMuted}`}>
                    This will wipe all progress and return to setup.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={clickHandler(() => setResetConfirm(false))}
                    className={`flex-1 py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 ${t.input}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clickHandler(() => {
                      dispatch({ type: "RESET_GAME" });
                      setResetConfirm(false);
                    })}
                    className="flex-1 py-3 bg-rose-600 text-white font-black rounded-xl shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {endGameConfirm && (
            <div
              className={`absolute inset-0 z-[150] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 p-4 ${t.modalOverlay}`}
            >
              <div
                className={`border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ease-out ${t.modalBg}`}
              >
                <div className="text-center mb-6">
                  <h2 className={`text-xl font-black mb-2 ${t.textMain}`}>
                    End Game?
                  </h2>
                  <p className={`text-sm ${t.textMuted}`}>
                    Calculate final net worths and crown a winner.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={clickHandler(() => setEndGameConfirm(false))}
                    className={`flex-1 py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 ${t.input}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clickHandler(() => {
                      dispatch({ type: "END_GAME_RANKING" });
                      setEndGameConfirm(false);
                    })}
                    className="flex-1 py-3 bg-amber-500 text-white font-black rounded-xl shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    End Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST - Fixed to physical screen viewport */}
      <div
        className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] transition-all duration-300 pointer-events-none ease-out w-max max-w-[90vw] ${toast ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"}`}
      >
        {toast && (
          <div
            className={`px-4 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2 text-sm ${toast.type === "error" ? "bg-rose-500 text-white shadow-rose-500/30" : "bg-emerald-500 text-white shadow-emerald-500/30"}`}
          >
            {toast.type === "error" ? (
              <AlertOctagon size={16} className="shrink-0" />
            ) : (
              <Check size={16} className="shrink-0" />
            )}
            <span className="truncate">{toast.msg}</span>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; } 
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } 
            .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
            .perspective-1000 { perspective: 1000px; }
            .preserve-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
          `,
        }}
      />
    </>
  );
}
