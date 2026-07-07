import React, { useRef, useState, useEffect, useCallback } from "react";
import "./App.scss";
import { GoTerminal } from "react-icons/go";
import { FaMoon, FaGithub, FaLinkedin } from "react-icons/fa";
import didYouMean from "didyoumean";
import { v4 as uuidv4 } from "uuid";
import CustomRadio from "./CustomRadio/CustomRadio";
import MatrixRain from "./components/MatrixRain";
import AnimatedLines from "./components/AnimatedLines";
import { motion, AnimatePresence } from "framer-motion";

// ─── Force dark mode ────────────────────────────────────────────────────────
document.documentElement.classList.add("dark");

// ─── Command registry ────────────────────────────────────────────────────────
const COMMANDS = {
  about:          "🧑  Who I am — quick bio.",
  whoami:         "🪪  Identity card.",
  neofetch:       "🖥️   System info (neofetch style).",
  banner:         "🎨  ASCII name banner.",
  skills:         "⚡  Technical skill set.",
  stats:          "📊  Career statistics dashboard.",
  experience:     "💼  Work history & roles.",
  projects:       "🚀  Featured projects.",
  "git log":      "📜  Career milestones as git history.",
  ls:             "📁  List portfolio directory.",
  history:        "🕒  Typed command history (clickable).",
  open:           "🔗  open [resume|github|linkedin|website]",
  ping:           "📡  ping [host] — check reachability.",
  "sudo hire-me": "🤝  Send a hire request.",
  resume:         "📄  View / download résumé (PDF).",
  education:      "🎓  Academic background.",
  contact:        "✉️   Contact & social links.",
  matrix:         "📟  Toggle Matrix digital rain.",
  secret:         "🐱  Find the easter egg.",
  clear:          "🧹  Clear the terminal screen.",
};

const MULTI_WORD = new Set(["git log", "sudo hire-me"]);
const ARG_CMDS   = new Set(["open", "ping"]);
const ALL_KEYS   = Object.keys(COMMANDS);

// Commands excluded from the help badge row
const BADGE_EXCLUDE = new Set(["clear", "matrix", "secret", "open", "ping", "history"]);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [input,        setInput]        = useState("");
  const [lines,        setLines]        = useState([
    { id: "w1", searchQuery: "", type: "text",   value: "Welcome to Snehasis Debbarman's Interactive Terminal Portfolio  v2.0" },
    { id: "w2", searchQuery: "", type: "text",   value: "Type 'help' to explore, or click a badge. Tab to autocomplete. ↑↓ for history." },
    { id: "w3", searchQuery: "help", type: "help", value: "" },
  ]);
  const [cmdHistory,   setCmdHistory]   = useState([]);
  const [historyIdx,   setHistoryIdx]   = useState(-1);
  const [showMatrix,   setShowMatrix]   = useState(false);

  const inputRef     = useRef(null);
  const bottomRef    = useRef(null);
  const containerRef = useRef(null);
  const selectRef    = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  const pushLine   = useCallback((line) => setLines((p) => [...p, line]), []);

  // ── Tab / Arrow key handler ──────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const val = input.trim().toLowerCase();
      if (!val) return;
      const matches = ALL_KEYS.filter((k) => k.startsWith(val));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        pushLine({ id: `tab-${Date.now()}`, searchQuery: input, type: "text",
          value: `Suggestions: ${matches.join("  ·  ")}` });
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!cmdHistory.length) return;
      const idx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx); setInput(cmdHistory[idx]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const idx = historyIdx + 1;
      if (idx >= cmdHistory.length) { setHistoryIdx(-1); setInput(""); }
      else { setHistoryIdx(idx); setInput(cmdHistory[idx]); }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") { e.preventDefault(); runCommand(input); }
  };

  // ── Command engine ───────────────────────────────────────────────────────
  const runCommand = useCallback((raw) => {
    const trimmed = raw.trim();
    const lower   = trimmed.toLowerCase();
    const [main, ...rest] = lower.split(/\s+/);
    const arg = rest.join(" ");

    if (trimmed) setCmdHistory((h) => [...h, trimmed]);
    setHistoryIdx(-1);
    setInput("");

    // ── special side-effect commands ──
    if (lower === "clear")  { setLines([]); return; }
    if (lower === "matrix") { setShowMatrix(true); return; }

    // ── open (opens URL + shows confirmation) ──
    if (main === "open") {
      const targets = {
        resume:   "https://www.snehasis.in/resume.pdf",
        github:   "https://github.com/SnehasisDebbarman",
        linkedin: "https://linkedin.com/in/snehasis-debbarman",
        website:  "https://snehasis.in",
      };
      if (targets[arg]) {
        window.open(targets[arg], "_blank");
        pushLine({ id: uuidv4(), searchQuery: trimmed, type: "open-ok", value: arg, url: targets[arg] });
      } else {
        pushLine({ id: uuidv4(), searchQuery: trimmed, type: "text",
          value: `Usage: open [resume|github|linkedin|website]  (got: "${arg}")` });
      }
      return;
    }

    // ── argument-based commands stored with value ──
    if (main === "ping") {
      pushLine({ id: uuidv4(), searchQuery: trimmed, type: "ping", value: arg || "snehasis.in" });
      return;
    }

    // ── history needs a snapshot ──
    if (lower === "history") {
      pushLine({ id: uuidv4(), searchQuery: trimmed, type: "history",
        snapshot: trimmed ? [...cmdHistory, trimmed] : [...cmdHistory] });
      return;
    }

    // ── known static commands ──
    if (COMMANDS[lower]) {
      pushLine({ id: uuidv4(), searchQuery: trimmed, type: lower, value: "" });
      return;
    }

    // ── unknown ──
    if (trimmed) {
      const dym = didYouMean(lower, ALL_KEYS);
      pushLine({ id: uuidv4(), searchQuery: trimmed, type: "text",
        value: dym
          ? `bash: ${trimmed}: command not found. Did you mean "${dym}"?`
          : `bash: ${trimmed}: command not found. Type 'help' for all commands.` });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmdHistory, pushLine]);

  // ── Render helpers ───────────────────────────────────────────────────────
  const ST  = "text-[#F2B137] font-bold mb-2 text-[10px] uppercase tracking-widest"; // section title
  const CARD = "bg-[#1a2d36] border border-[#253545] rounded-lg p-3 hover:border-[#31C3BD]/50 transition-colors flex flex-col justify-between";

  const renderOutput = (item) => {
    if (item.type === "text") {
      if (!item.value) return null;
      const isErr = item.value.startsWith("bash:");
      return <p className={`text-xs ${isErr ? "text-red-400" : "text-[#a8b8c4]"}`}>{item.value}</p>;
    }

    switch (item.type) {

      // ── help ──────────────────────────────────────────────────────────────
      case "help":
        return (
          <div className="my-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-3 text-xs">
              {ALL_KEYS.filter(k => !BADGE_EXCLUDE.has(k)).map((cmd) => (
                <div key={cmd} className="flex gap-2 items-baseline">
                  <button onClick={() => runCommand(cmd)}
                    className="text-[#31C3BD] hover:underline font-mono shrink-0 text-left">{cmd}</button>
                  <span className="text-[#253545]">─</span>
                  <span className="text-[#637A85] truncate">{COMMANDS[cmd]}</span>
                </div>
              ))}
            </div>
            <p className="text-[#253545] text-[10px]">↑↓ history  ·  Tab autocomplete  ·  multi-word: "git log", "sudo hire-me"</p>
          </div>
        );

      // ── about ─────────────────────────────────────────────────────────────
      case "about":
        return (
          <div className="my-1 max-w-2xl">
            <p className={ST}>🧑 About</p>
            <p className="text-[#a8b8c4] text-sm">
              Hi, I'm <span className="text-white font-bold">Snehasis Debbarman</span> —
              a <span className="text-[#31C3BD] font-semibold">Senior Frontend Engineer</span> based in Kolkata, India.
            </p>
            <p className="mt-2 text-xs text-[#637A85] leading-relaxed">
              I build scalable microfrontend platforms, real-time messaging systems, and IoT data dashboards.
              Currently at <span className="text-[#F2B137]">Publicis Sapient</span>, architecting Next.js microfrontends
              integrated with Adobe Experience Manager for enterprise clients.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              {["Next.js", "React Native", "TypeScript", "WebSocket", "Storybook", "Tailwind CSS", "Node.js"].map((t) => (
                <span key={t} className="px-2 py-0.5 bg-[#31C3BD]/10 text-[#31C3BD] rounded border border-[#31C3BD]/20">{t}</span>
              ))}
            </div>
          </div>
        );

      // ── whoami ────────────────────────────────────────────────────────────
      case "whoami":
        return (
          <div className="my-1 font-mono text-xs">
            <p className={ST}>🪪 Identity</p>
            <pre className="text-[#a8b8c4] leading-relaxed border border-[#253545] rounded-lg p-3 bg-[#0e1e24]">{`
  ╔══════════════════════════════════════════════╗
  ║  Name     : Snehasis Debbarman               ║
  ║  Role     : Senior Frontend Engineer         ║
  ║  Company  : Publicis Sapient                 ║
  ║  Location : Kolkata, India                   ║
  ║  Exp      : 4+ years  (Jan 2021 – Present)   ║
  ║  CGPA     : 8.53 / 10  (B.Tech CS)           ║
  ║  Email    : snehasisdebbarman2016@gmail.com  ║
  ║  Web      : snehasis.in                      ║
  ╚══════════════════════════════════════════════╝`}</pre>
          </div>
        );

      // ── neofetch ──────────────────────────────────────────────────────────
      case "neofetch":
        const nfRows = [
          ["OS",       "Human Brain  v26.0"],
          ["Host",     "Kolkata, India"],
          ["Shell",    "portfolio-terminal  v2.0"],
          ["Role",     "Senior Frontend Engineer"],
          ["Company",  "Publicis Sapient  (Apr 2025–now)"],
          ["Exp",      "4+ years  ·  4 companies"],
          ["Skills",   "React, Next.js, TypeScript + 15 more"],
          ["Projects", "10+ delivered  (10K+ users impacted)"],
          ["Open To",  "Full-time & freelance opportunities"],
          ["Resume",   "snehasis.in/resume.pdf"],
        ];
        return (
          <div className="my-1 text-xs font-mono flex flex-col sm:flex-row gap-4 items-start">
            <pre className="text-[#31C3BD] leading-snug shrink-0">{`
     .---.
    |o_o |
    |:_/ |
   //   \\ \\
  (|     | )
 /'\\_   _/'\`\\
 \\___)=(___/`}</pre>
            <div className="flex-1 space-y-0.5">
              <p className="text-white font-bold mb-1">snehasis@portfolio</p>
              <p className="text-[#253545] mb-1">{"─".repeat(28)}</p>
              {nfRows.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-[#31C3BD] font-bold w-20 shrink-0">{k}</span>
                  <span className="text-[#637A85]">:</span>
                  <span className="text-[#a8b8c4]">{v}</span>
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                {["#0e1e24","#31C3BD","#F2B137","#a8b8c4","#637A85","#253545"].map(c => (
                  <span key={c} style={{ background: c }} className="w-4 h-4 rounded-sm inline-block" />
                ))}
              </div>
            </div>
          </div>
        );

      // ── banner ────────────────────────────────────────────────────────────
      case "banner":
        return (
          <div className="my-1 font-mono text-xs">
            <pre className="text-[#31C3BD] leading-snug">{`
 ____  _  _  ____  _  _    __   ____  __  ____ 
/ ___)( \\( )(  __)( \\/ )  /__\\ / ___)(__)(  __)
\\___ \\ )  (  ) _)  )  /  /(__)\\\\__ \\ )( ) _) 
(____/(_)\\_)(____)(__/  (__)(__)(____/(__)(____)
`}</pre>
            <pre className="text-[#637A85] leading-snug">{`
 ____  ____  ____  ____  __   ____  _  _   __   __ _ 
(  _ \\( ___)(  _ \\(  _ \\/ _\\ (  _ \\( \\/ ) / _\\ (  ( \\
 )(_) )) _)  ) _ < ) _ (  )    )   / )  ( /    \\/    /
(____/(____)(____/(____/\\_/\\_/(____\\/\\_/ \\_/\\_/\\_)__)
`}</pre>
            <p className="text-[#F2B137] font-bold mt-1 tracking-widest uppercase text-[10px]">
              Senior Frontend Engineer  ·  Publicis Sapient  ·  Kolkata, India
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["React","Next.js","TypeScript","React Native","Node.js","WebSocket","Storybook"].map(t=>(
                <span key={t} className="text-[10px] px-2 py-0.5 bg-[#31C3BD]/10 text-[#31C3BD] rounded border border-[#31C3BD]/20">{t}</span>
              ))}
            </div>
          </div>
        );

      // ── skills ────────────────────────────────────────────────────────────
      case "skills":
        return (
          <div className="my-1">
            <p className={ST}>⚡ Technical Skills</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { label: "Frontend",     color:"text-[#31C3BD]", items:["React.js (Hooks, Context, Router)","Next.js (App Router, SSR, ISR)","React Native & Expo","Redux Toolkit","Tailwind CSS & SCSS","Material UI  ·  Storybook"] },
                { label: "Backend",      color:"text-[#F2B137]",  items:["Node.js & Express","REST APIs","WebSocket (real-time messaging)","Firebase & Firestore"] },
                { label: "Languages",   color:"text-purple-400", items:["JavaScript (ES2022+)","TypeScript","HTML5 & CSS3","Shell scripting (basic)"] },
                { label: "Tools & DevOps",color:"text-green-400", items:["Git & GitHub Actions","Webpack  ·  Vite","Adobe Experience Manager","Electron  ·  VS Code","Figma → Code workflows"] },
              ].map(({ label, color, items }) => (
                <div key={label} className="bg-[#1a2d36] border border-[#253545] p-3 rounded-lg">
                  <span className={`${color} font-bold block mb-2`}>{label}</span>
                  <ul className="text-[#637A85] space-y-1">
                    {items.map((i) => <li key={i} className="flex gap-1.5"><span className="text-[#31C3BD] shrink-0">›</span>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      // ── stats ─────────────────────────────────────────────────────────────
      case "stats":
        const statsRows = [
          ["Experience",      "4+ years",    "Jan 2021 – Present"],
          ["Companies",       "4",           "ITC Infotech → Fyllo → Unovators → Publicis Sapient"],
          ["Projects",        "10+",         "CRM, IoT, Banking, Enterprise, Portfolio"],
          ["Users Impacted",  "15,000+",     "10K farmers (Fyllo) + 5K daily CRM ops (Unovators)"],
          ["Page Load Drop",  "−30%",        "Lazy loading & code splitting at Publicis Sapient"],
          ["Engagement Gain", "+25%",        "WebSocket real-time architecture at Unovators"],
          ["Conversion Lift", "+20%",        "Landing page perf improvement at Fyllo"],
          ["GitHub Repos",    "20+",         "github.com/SnehasisDebbarman"],
          ["Open Source",     "Active",      "Contributions & personal projects"],
        ];
        return (
          <div className="my-1 font-mono text-xs">
            <p className={ST}>📊 Career Statistics</p>
            <div className="border border-[#253545] rounded-lg overflow-hidden">
              <div className="bg-[#0e1e24] px-3 py-1.5 border-b border-[#253545] text-[#637A85] text-[10px] uppercase tracking-widest">
                snehasis@portfolio  ─  career.stats
              </div>
              <div className="divide-y divide-[#1a2d36]">
                {statsRows.map(([label, val, note]) => (
                  <div key={label} className="flex gap-3 px-3 py-2 hover:bg-[#1a2d36]/40 transition-colors">
                    <span className="text-[#637A85] w-32 shrink-0">{label}</span>
                    <span className="text-[#31C3BD] font-bold w-20 shrink-0">{val}</span>
                    <span className="text-[#253545] truncate">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // ── experience ────────────────────────────────────────────────────────
      case "experience":
        return (
          <div className="my-1">
            <p className={ST}>💼 Work Experience</p>
            <div className="border-l border-[#253545] ml-2 pl-4 space-y-5">
              {[
                { dot:"bg-[#31C3BD]", active:true,  title:"Senior Experience Engineer", company:"Publicis Sapient",       location:"Kolkata",   period:"Apr 2025 – Present",
                  bullets:["Scalable microfrontend apps with Next.js and Tailwind CSS for enterprise platforms.","Reusable Storybook component libraries — improved team UI dev speed.","Adobe Experience Manager + Next.js integration for CMS-driven sites.","Reduced page load time 30% via lazy loading and code splitting."] },
                { dot:"bg-[#637A85]", active:false, title:"Associate Software Developer",company:"Unovators Tech Pvt Ltd", location:"Kolkata",   period:"Apr 2023 – Apr 2025",
                  bullets:["Real-time WebSocket messaging in React Native — +25% engagement.","Philippines Central Bank Excel-to-XML converter (React, Electron, TypeScript).","Led frontend for CRM mobile app supporting 5,000+ daily operations.","Mentored junior developers and enforced code quality standards."] },
                { dot:"bg-[#637A85]", active:false, title:"UI Developer",               company:"Fyllo (Agrihawk Tech)",  location:"Bengaluru", period:"May 2022 – Apr 2023",
                  bullets:["React Native dashboards visualising agricultural IoT sensor data.","Landing page perf improvement → +20% conversion rate.","Support portal with Next.js and Ionic improving support efficiency."] },
                { dot:"bg-[#637A85]", active:false, title:"Associate IT Consultant",    company:"ITC Infotech",           location:"Bengaluru", period:"Jan 2021 – May 2022",
                  bullets:["Enterprise React dashboards for Honeywell logistics systems.","Redesigned banking dashboards for ION Bank — +30% engagement."] },
              ].map(({ dot, active, title, company, location, period, bullets }) => (
                <div key={title} className="relative">
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${dot} border-2 border-[#121212]`} />
                  <div className="flex justify-between items-start flex-wrap gap-1 mb-0.5">
                    <h4 className="font-bold text-white text-sm">{title}</h4>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${active?"text-[#31C3BD] bg-[#31C3BD]/10":"text-[#637A85] bg-[#253545]"}`}>{period}</span>
                  </div>
                  <p className="text-xs text-[#637A85] mb-1.5">{company} · {location}</p>
                  <ul className="space-y-1">
                    {bullets.map((b) => <li key={b} className="flex gap-1.5 items-start text-xs text-[#a8b8c4]"><span className="text-[#31C3BD] shrink-0 mt-px">›</span>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      // ── projects ──────────────────────────────────────────────────────────
      case "projects":
        return (
          <div className="my-1">
            <p className={ST}>🚀 Projects</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon:"🏦", name:"UNO CRM App",                stack:["React","Redux","WebSocket"],         sc:["bg-[#31C3BD]/15 text-[#31C3BD]","bg-purple-500/15 text-purple-400","bg-[#F2B137]/15 text-[#F2B137]"], desc:"CRM mobile platform for corporate onboarding & banking ops. Real-time chat, delivery tracking, 5,000+ daily transactions.", link:"https://github.com/SnehasisDebbarman" },
                { icon:"🌱", name:"Fyllo Consumer App",          stack:["React Native","Expo"],               sc:["bg-green-500/15 text-green-400","bg-[#F2B137]/15 text-[#F2B137]"],                                    desc:"Used by 10,000+ farmers integrating IoT sensors. Predictive crop yield & irrigation insights via ML pipeline.", badge:"10K+ Users" },
                { icon:"🏛️", name:"PH Central Bank Converter",  stack:["React","Electron","TypeScript"],     sc:["bg-[#31C3BD]/15 text-[#31C3BD]","bg-purple-500/15 text-purple-400","bg-blue-400/15 text-blue-400"],   desc:"Excel-to-XML compliance converter for Philippines Central Bank. Cross-platform desktop app via Electron.", badge:"Enterprise" },
                { icon:"📁", name:"Portfolio Terminal",           stack:["Next.js","Tailwind","Framer Motion"],sc:["bg-[#31C3BD]/15 text-[#31C3BD]","bg-[#F2B137]/15 text-[#F2B137]","bg-purple-500/15 text-purple-400"], desc:"This interactive CLI-themed portfolio. 20 commands, tab autocomplete, command history, Matrix canvas rain.", link:"https://github.com/SnehasisDebbarman/portfolio2" },
              ].map(({ icon, name, stack, sc, desc, link, badge }) => (
                <div key={name} className={CARD}>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{icon} {name}</h4>
                    <p className="text-xs text-[#637A85] leading-relaxed">{desc}</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center flex-wrap gap-1">
                    <div className="flex gap-1 flex-wrap">
                      {stack.map((t, i) => <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${sc[i]||"bg-gray-700/30 text-gray-400"}`}>{t}</span>)}
                    </div>
                    {link  ? <a href={link}  target="_blank" rel="noopener noreferrer" className="text-xs text-[#31C3BD] hover:underline font-bold">GitHub →</a> : null}
                    {badge ? <span className="text-xs text-[#637A85] font-semibold">{badge}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ── git log ───────────────────────────────────────────────────────────
      case "git log": {
        const commits = [
          { hash:"a3f9b2c", ref:"HEAD → main", date:"Apr 2025", subject:"feat: joined Publicis Sapient as Senior Experience Engineer",
            body:["Microfrontend architecture with Next.js + Tailwind","Adobe Experience Manager integration","Storybook design-system component library"] },
          { hash:"7d4e1a8", ref:null, date:"Apr 2023", subject:"feat: Associate Software Developer at Unovators Tech",
            body:["WebSocket real-time messaging (+25% engagement)","Philippines Central Bank Excel-to-XML (Electron)","Led CRM mobile app — 5K daily ops"] },
          { hash:"2f8c3b1", ref:null, date:"May 2022", subject:"feat: UI Developer at Fyllo (Agrihawk Technologies)",
            body:["React Native IoT sensor dashboards","Landing page perf → +20% conversions","Support portal with Next.js + Ionic"] },
          { hash:"b1a4d6e", ref:null, date:"Jan 2021", subject:"feat: first industry role — Associate IT Consultant, ITC Infotech",
            body:["React dashboards for Honeywell logistics","ION Bank redesign → +30% engagement"] },
          { hash:"9e7f2c4", ref:null, date:"2020",     subject:"docs: graduated B.Tech Computer Science, BIT Kolkata",
            body:["CGPA: 8.53 / 10","Strong algorithms & data-structures foundation"] },
        ];
        return (
          <div className="my-1 font-mono text-xs space-y-3">
            <p className={ST}>📜 git log --oneline --all</p>
            {commits.map((c) => (
              <div key={c.hash}>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-yellow-400 font-bold">commit {c.hash}</span>
                  {c.ref && <span className="text-[#31C3BD] bg-[#31C3BD]/10 px-1.5 py-0.5 rounded text-[10px]">({c.ref})</span>}
                </div>
                <p className="text-[#637A85]">Author: Snehasis Debbarman &lt;snehasisdebbarman2016@gmail.com&gt;</p>
                <p className="text-[#637A85]">Date:   {c.date}</p>
                <p className="text-white mt-0.5 ml-4">{c.subject}</p>
                {c.body.map((b) => <p key={b} className="text-[#637A85] ml-8">· {b}</p>)}
              </div>
            ))}
          </div>
        );
      }

      // ── ls ────────────────────────────────────────────────────────────────
      case "ls": {
        const entries = [
          { type:"d", perms:"rwxr-xr-x", name:"about/",      note:"Who I am" },
          { type:"d", perms:"rwxr-xr-x", name:"experience/", note:"4 companies · 4+ years" },
          { type:"d", perms:"rwxr-xr-x", name:"projects/",   note:"4 featured projects" },
          { type:"d", perms:"rwxr-xr-x", name:"skills/",     note:"20+ technologies" },
          { type:"d", perms:"rwxr-xr-x", name:"education/",  note:"Bengal Institute of Technology · CGPA 8.53" },
          { type:"d", perms:"rwxr-xr-x", name:"contact/",    note:"Email · GitHub · LinkedIn" },
          { type:"-", perms:"rw-r--r--", name:"resume.pdf",   note:"snehasis.in/resume.pdf" },
          { type:"-", perms:"rw-r--r--", name:"README.md",    note:"Type 'about' to read" },
        ];
        return (
          <div className="my-1 font-mono text-xs">
            <p className={ST}>📁 ls -la  ~/portfolio</p>
            <p className="text-[#637A85] mb-1">total {entries.length}</p>
            <div className="space-y-0.5">
              {entries.map((e) => (
                <div key={e.name} className="flex gap-3 items-center">
                  <span className={`${e.type==="d"?"text-[#31C3BD]":"text-[#637A85]"}`}>{e.type}{e.perms}</span>
                  <button
                    onClick={() => runCommand(e.name.replace("/","").replace(".pdf","").replace(".md",""))}
                    className={`font-bold hover:underline ${e.type==="d"?"text-[#31C3BD]":"text-white"}`}
                  >{e.name}</button>
                  <span className="text-[#253545]">{e.note}</span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[#253545] text-[10px]">Tip: click a filename to execute the command.</p>
          </div>
        );
      }

      // ── ping ──────────────────────────────────────────────────────────────
      case "ping": {
        const host = item.value || "snehasis.in";
        const ip   = host === "snehasis.in" ? "157.90.214.22" : "0.0.0.0";
        const seed = Array.from(host).reduce((a,c)=>a+c.charCodeAt(0),0);
        const rng  = (base) => base + ((seed * 7) % 9);
        const pingLines = [
          { text: `PING ${host} (${ip}): 56 data bytes`, className:"text-[#a8b8c4]" },
          { text: `64 bytes from ${host}: icmp_seq=0 ttl=64 time=${rng(6)}.2 ms`, className:"text-[#31C3BD]" },
          { text: `64 bytes from ${host}: icmp_seq=1 ttl=64 time=${rng(5)}.8 ms`, className:"text-[#31C3BD]" },
          { text: `64 bytes from ${host}: icmp_seq=2 ttl=64 time=${rng(7)}.1 ms`, className:"text-[#31C3BD]" },
          { text: `64 bytes from ${host}: icmp_seq=3 ttl=64 time=${rng(4)}.5 ms`, className:"text-[#31C3BD]" },
          { text: `--- ${host} ping statistics ---`,                              className:"text-[#637A85]" },
          { text: `4 packets transmitted, 4 received, 0.0% packet loss`,          className:"text-[#637A85]" },
          { text: `round-trip min/avg/max = ${rng(4)}/${rng(6)}/${rng(8)} ms`,    className:"text-green-400 font-bold" },
        ];
        return (
          <div className="my-1">
            <p className={ST}>📡 ping {host}</p>
            <AnimatedLines lines={pingLines} stepMs={500} />
          </div>
        );
      }

      // ── sudo hire-me ──────────────────────────────────────────────────────
      case "sudo hire-me": {
        const hireLines = [
          { text: "[sudo] password for visitor: ••••••••••",  className:"text-[#637A85]" },
          { text: "Verifying credentials...",                   className:"text-[#637A85]" },
          { text: "✓  React / Next.js expertise     VERIFIED", className:"text-green-400" },
          { text: "✓  TypeScript proficiency        VERIFIED", className:"text-green-400" },
          { text: "✓  Performance optimizer         VERIFIED", className:"text-green-400" },
          { text: "✓  Team player & mentor          VERIFIED", className:"text-green-400" },
          { text: "✓  Shipped 10+ production apps   VERIFIED", className:"text-green-400" },
          { text: "",                                           className:"" },
          { text: "╔══════════════════════════════════════╗",  className:"text-[#31C3BD]" },
          { text: "║   Permission GRANTED  🎉             ║",  className:"text-[#31C3BD] font-bold" },
          { text: "║   Snehasis is ready to join your team ║",  className:"text-[#31C3BD]" },
          { text: "╚══════════════════════════════════════╝",  className:"text-[#31C3BD]" },
          { text: "",                                           className:"" },
          { text: "→  Email  : snehasisdebbarman2016@gmail.com", className:"text-white" },
          { text: "→  Phone  : +91 9647149128",                  className:"text-white" },
          { text: "→  Resume : snehasis.in/resume.pdf",          className:"text-[#31C3BD]" },
        ];
        return (
          <div className="my-1 font-mono">
            <p className={ST}>🤝 sudo hire-me</p>
            <AnimatedLines lines={hireLines} stepMs={300} />
          </div>
        );
      }

      // ── history ───────────────────────────────────────────────────────────
      case "history": {
        const h = item.snapshot || [];
        return (
          <div className="my-1 font-mono text-xs">
            <p className={ST}>🕒 Command History</p>
            {h.length === 0 ? (
              <p className="text-[#637A85]">No commands in history yet.</p>
            ) : (
              <div className="space-y-0.5">
                {h.map((cmd, i) => (
                  <div key={i} className="flex gap-3 items-center hover:bg-[#1a2d36]/40 rounded px-1 -mx-1 transition-colors">
                    <span className="text-[#253545] w-5 text-right shrink-0">{i + 1}</span>
                    <button
                      onClick={() => { setInput(cmd); focusInput(); }}
                      className="text-[#a8b8c4] hover:text-[#31C3BD] text-left transition-colors font-mono"
                    >{cmd}</button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-[#253545] text-[10px]">Click any command to put it back in the input.</p>
          </div>
        );
      }

      // ── open (confirmation) ───────────────────────────────────────────────
      case "open-ok":
        return (
          <p className="text-xs text-green-400 font-mono">
            Opening <span className="text-white font-bold">{item.value}</span> in a new tab…{" "}
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="text-[#31C3BD] hover:underline">{item.url}</a>
          </p>
        );

      // ── resume ────────────────────────────────────────────────────────────
      case "resume":
        return (
          <div className="my-1">
            <p className={ST}>📄 Resume</p>
            <p className="text-[#a8b8c4] text-sm mb-3">Download or view my latest résumé (PDF):</p>
            <a href="https://www.snehasis.in/resume.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#31C3BD] hover:bg-[#28adab] text-[#0e1e24] font-bold rounded text-sm transition-all hover:shadow-[0_0_24px_rgba(49,195,189,0.35)]">
              📄 Open Resume (PDF) ↗
            </a>
            <p className="mt-2 text-xs text-[#637A85]">Tip: type <span className="text-[#31C3BD]">open resume</span> to open it directly.</p>
          </div>
        );

      // ── education ─────────────────────────────────────────────────────────
      case "education":
        return (
          <div className="my-1">
            <p className={ST}>🎓 Education</p>
            <div className="border-l border-[#253545] ml-2 pl-4">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F2B137] border-2 border-[#121212]" />
                <div className="flex justify-between items-start flex-wrap gap-1 mb-0.5">
                  <h4 className="font-bold text-white text-sm">B.Tech — Computer Science</h4>
                  <span className="text-xs text-[#637A85] bg-[#253545] px-1.5 py-0.5 rounded font-mono">2016 – 2020</span>
                </div>
                <p className="text-xs text-[#31C3BD]">Bengal Institute of Technology · Kolkata, India</p>
                <p className="text-xs text-[#637A85] mt-0.5">CGPA: <span className="text-[#F2B137] font-bold">8.53 / 10</span></p>
              </div>
            </div>
          </div>
        );

      // ── contact ───────────────────────────────────────────────────────────
      case "contact":
        return (
          <div className="my-1">
            <p className={ST}>✉️ Contact & Socials</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg text-xs">
              {[
                { label:"Phone",    value:"+91 9647149128",                  href:"tel:+919647149128" },
                { label:"Email",    value:"snehasisdebbarman2016@gmail.com", href:"mailto:snehasisdebbarman2016@gmail.com" },
                { label:"LinkedIn", value:"snehasis-debbarman",              href:"https://linkedin.com/in/snehasis-debbarman" },
                { label:"GitHub",   value:"SnehasisDebbarman",               href:"https://github.com/SnehasisDebbarman" },
                { label:"Website",  value:"snehasis.in",                     href:"https://snehasis.in" },
                { label:"Resume",   value:"snehasis.in/resume.pdf",          href:"https://www.snehasis.in/resume.pdf" },
                { label:"Location", value:"Kolkata, India",                   href:null },
              ].map(({ label, value, href }) => (
                <div key={label} className="bg-[#1a2d36] border border-[#253545] p-2 rounded flex justify-between items-center gap-2">
                  <span className="text-[#637A85] shrink-0">{label}:</span>
                  {href
                    ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#31C3BD] hover:underline font-semibold truncate">{value}</a>
                    : <span className="text-[#a8b8c4] font-semibold">{value}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      // ── secret ────────────────────────────────────────────────────────────
      case "secret":
        return (
          <div className="my-1 text-purple-400 text-xs font-mono">
            <pre className="leading-snug">{`
          /\\_/\\
         ( o.o )
          > ^ <
  *====================*
  |  SECRET CAT MODE  |
  |  MEOW INTERACTIVE |
  *====================*
`}</pre>
            <p className="mt-2 text-[#a8b8c4]">
              You found the easter egg! Try <span className="text-[#31C3BD] font-bold cursor-pointer hover:underline" onClick={() => runCommand("matrix")}>matrix</span> or <span className="text-[#31C3BD] font-bold cursor-pointer hover:underline" onClick={() => runCommand("sudo hire-me")}>sudo hire-me</span>.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // ── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0e1e24] flex flex-col font-mono select-none overflow-x-hidden">

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0e1e24]/90 backdrop-blur-md border-b border-[#1a2d36]">
        <nav className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#31C3BD]/10 text-[#31C3BD] rounded border border-[#31C3BD]/25">
              <GoTerminal size={20} />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">Snehasis Debbarman</p>
              <p className="text-[10px] text-[#637A85] tracking-widest uppercase mt-0.5">Senior Frontend Engineer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/SnehasisDebbarman" target="_blank" rel="noopener noreferrer"
              className="text-[#637A85] hover:text-white transition-colors"><FaGithub size={16} /></a>
            <a href="https://linkedin.com/in/snehasis-debbarman" target="_blank" rel="noopener noreferrer"
              className="text-[#637A85] hover:text-[#31C3BD] transition-colors"><FaLinkedin size={16} /></a>
            <a href="https://www.snehasis.in/resume.pdf" target="_blank" rel="noopener noreferrer"
              className="ml-1 px-3 py-1.5 border border-[#31C3BD]/40 text-[#31C3BD] hover:bg-[#31C3BD]/10 rounded text-[10px] font-bold tracking-wider uppercase transition-colors">
              Resume ↗
            </a>
          </div>
        </nav>
      </header>

      {/* Terminal */}
      <main className="flex-1 flex items-start justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-5xl bg-[#131f26] border border-[#1a2d36] rounded-xl shadow-2xl overflow-hidden flex flex-col relative">

          {/* Matrix overlay */}
          <AnimatePresence>
            {showMatrix && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="absolute inset-0 z-50">
                <MatrixRain onClose={() => { setShowMatrix(false); setTimeout(focusInput, 100); }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1e24] border-b border-[#1a2d36] shrink-0">
            <div className="flex items-center gap-1.5">
              <button title="Clear terminal" onClick={() => runCommand("clear")}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-[#F2B137]/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-[11px] text-[#637A85] font-mono flex items-center gap-1.5">
              <span className="text-[#31C3BD] text-[8px]">●</span>
              snehasis@portfolio  ~
            </div>
            <div className="w-16" />
          </div>

          {/* Body */}
          <div ref={containerRef} onClick={focusInput}
            className="p-5 h-[72vh] overflow-y-auto flex flex-col gap-3.5 bg-[#131f26] cursor-text leading-relaxed text-sm"
            style={{ scrollbarWidth:"thin", scrollbarColor:"#1a2d36 transparent" }}>
            <AnimatePresence initial={false}>
              {lines.map((item) => (
                <motion.div key={item.id}
                  initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.15}}
                  className="flex flex-col gap-1">
                  {item.searchQuery && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#31C3BD] font-bold shrink-0">snehasis ~ $</span>
                      <span className="text-white">{item.searchQuery}</span>
                    </div>
                  )}
                  <div>{renderOutput(item)}</div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Input */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#31C3BD] font-bold shrink-0">snehasis ~ $</span>
              <input ref={inputRef} type="text"
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                placeholder="type a command…"
                className="flex-1 bg-transparent outline-none border-none text-white placeholder-[#253545] caret-[#31C3BD]"
              />
            </div>
            <div ref={bottomRef} />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-[#0e1e24] border-t border-[#1a2d36] text-[10px] text-[#637A85] shrink-0">
            <span>↑↓ history  ·  Tab autocomplete  ·  "git log"  "sudo hire-me"  "open resume"  "ping snehasis.in"</span>
            <span className="text-[#31C3BD]/60 shrink-0">{lines.length} lines</span>
          </div>
        </div>
      </main>

      <footer className="py-3 border-t border-[#1a2d36] text-center text-[10px] text-[#253545]">
        Snehasis Debbarman · Senior Frontend Engineer · snehasis.in
      </footer>
    </div>
  );
}
