import React, { useState, useEffect, useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Shield,
  Compass,
  BookOpen,
  Swords,
  Zap,
  Wand2,
  Users,
  Heart,
  Smile,
  Palette,
  HelpingHand,
  Crown,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Database,
  Info,
  RefreshCw,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

// Initialize Firebase safely
let app, auth, db, appId;
const hasFirebase =
  typeof __firebase_config !== "undefined" && __firebase_config !== null;

if (hasFirebase) {
  try {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
  } catch (e) {
    console.error("Eroare la inițializarea Firebase: ", e);
  }
}

// Romanian localized archetypes and ethos mappings in sentence case
const ETHOS_MAP = {
  thumbprint: { id: "thumbprint", name: "Lăsarea unei amprente asupra lumii" },
  paradise: { id: "paradise", name: "Tânjirea după paradis" },
  connection: { id: "connection", name: "Niciun om nu este o insulă" },
  structure: { id: "structure", name: "Oferirea de structură lumii" },
};

const ARCHETYPES = {
  a: {
    id: "a",
    name: "Inocent",
    ethos: "paradise",
    icon: Shield,
    color: "bg-emerald-100 text-emerald-600",
    image: "https://picsum.photos/id/106/400/400",
    desc: "Optimist, pur, caută simplitatea și fericirea.",
  },
  b: {
    id: "b",
    name: "Explorator",
    ethos: "paradise",
    icon: Compass,
    color: "bg-green-100 text-green-600",
    image: "https://picsum.photos/id/1015/400/400",
    desc: "Independent, ambițios, caută libertatea și auto-descoperirea.",
  },
  c: {
    id: "c",
    name: "Înțelept",
    ethos: "paradise",
    icon: BookOpen,
    color: "bg-teal-100 text-teal-600",
    image: "https://picsum.photos/id/24/400/400",
    desc: "Analitic, ghidat de adevăr, expertiză și cunoaștere profundă.",
  },
  d: {
    id: "d",
    name: "Erou",
    ethos: "thumbprint",
    icon: Swords,
    color: "bg-red-100 text-red-600",
    image: "https://picsum.photos/id/1050/400/400",
    desc: "Curajos, determinat, dorește să își dovedească valoarea prin acțiuni de impact.",
  },
  e: {
    id: "e",
    name: "Rebel",
    ethos: "thumbprint",
    icon: Zap,
    color: "bg-orange-100 text-orange-600",
    image: "https://picsum.photos/id/1073/400/400",
    desc: "Revoluționar, non-conformist, sfidează regulile pentru a schimba sistemul.",
  },
  f: {
    id: "f",
    name: "Magician",
    ethos: "thumbprint",
    icon: Wand2,
    color: "bg-purple-100 text-purple-600",
    image: "https://picsum.photos/id/1044/400/400",
    desc: "Vizionar, carismatic, dorește să înțeleagă legile universului pentru a transforma realitatea.",
  },
  g: {
    id: "g",
    name: "Om obișnuit",
    ethos: "connection",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    image: "https://picsum.photos/id/338/400/400",
    desc: "Empatic, realist, dorește să aparțină și să fie conectat cu ceilalți în mod egal.",
  },
  h: {
    id: "h",
    name: "Iubitor",
    ethos: "connection",
    icon: Heart,
    color: "bg-pink-100 text-pink-600",
    image: "https://picsum.photos/id/1004/400/400",
    desc: "Pasionat, dedicat, caută profunzimea relațiilor, frumusețea și armonia.",
  },
  i: {
    id: "i",
    name: "Bufon",
    ethos: "connection",
    icon: Smile,
    color: "bg-yellow-100 text-yellow-600",
    image: "https://picsum.photos/id/1025/400/400",
    desc: "Jucăuș, plin de umor, trăiește clipa și dorește să aducă bucurie lumii.",
  },
  j: {
    id: "j",
    name: "Creator",
    ethos: "structure",
    icon: Palette,
    color: "bg-indigo-100 text-indigo-600",
    image: "https://picsum.photos/id/20/400/400",
    desc: "Inovator, expresiv, dorește să construiască lucruri cu valoare de durată.",
  },
  k: {
    id: "k",
    name: "Ocrotitor",
    ethos: "structure",
    icon: HelpingHand,
    color: "bg-cyan-100 text-cyan-600",
    image: "https://picsum.photos/id/1066/400/400",
    desc: "Altruist, protector, are grijă de ceilalți și dorește să prevină suferința.",
  },
  l: {
    id: "l",
    name: "Lider",
    ethos: "structure",
    icon: Crown,
    color: "bg-slate-100 text-slate-600",
    image: "https://picsum.photos/id/1033/400/400",
    desc: "Organizator, responsabil, oferă stabilitate, structură și control.",
  },
};

const QUESTIONS = [
  {
    id: "q1",
    wave: 1,
    title:
      "Gândește-te la cum se manifestă brandul în mod real astăzi (nu la cum ți-ai dori să fie). Care dintre imaginile de mai jos consideri că exprimă cel mai bine spiritul lui?",
    subtitle:
      "Alege imaginea sau simbolul care reprezintă cel mai bine energia actuală a companiei.",
    type: "visual",
    options: Object.values(ARCHETYPES),
  },
  {
    id: "q2",
    wave: 1,
    title: "Dacă brandul tău ar fi o lume, cum ar arăta?",
    type: "text",
    options: [
      {
        id: "a",
        text: "Un oraș în plină schimbare, cu șantiere, macarale și oameni care construiesc ceva nou",
        ethos: "structure",
      },
      {
        id: "b",
        text: "Un drum de munte dimineața devreme. Nu știi unde duce, dar te inspiră să vezi ce e mai departe",
        ethos: "paradise",
      },
      {
        id: "c",
        text: "O masă lungă la care oamenii stau de vorbă și mai adaugă câte un scaun când apare cineva nou",
        ethos: "connection",
      },
      {
        id: "d",
        text: "O gară perfect organizată unde toate trenurile pleacă la timp, cu panouri ușor de citit și unde oamenii navighează cu ușurință",
        ethos: "thumbprint",
      },
    ],
  },
  {
    id: "q3",
    wave: 1,
    title:
      "Dacă brandul tău ar fi o persoană din viața clientului, cine ar fi?",
    type: "text",
    options: [
      {
        id: "a",
        text: "Un antrenor care te provoacă să dai mai mult",
        ethos: "thumbprint",
      },
      {
        id: "b",
        text: "Un ghid care te ajută să descoperi ce e potrivit pentru tine",
        ethos: "paradise",
      },
      {
        id: "c",
        text: "Un prieten bun care e mereu acolo",
        ethos: "connection",
      },
      {
        id: "d",
        text: "Un expert de încredere pe care te bazezi când contează",
        ethos: "structure",
      },
    ],
  },
  {
    id: "q4",
    wave: 2,
    title: "Care este funcția principală a categoriei de produs?",
    type: "text",
    options: [
      {
        id: "a",
        text: "Să facă lucrurile să pară simple, ușor de înțeles, curate",
      },
      {
        id: "b",
        text: "Să îi facă pe oameni să se simtă liberi, non-conformiști, pionieri",
      },
      {
        id: "c",
        text: "Să ofere claritate și informații care ajută la decizii bune",
      },
      {
        id: "d",
        text: "Să îi ajute pe oameni să obțină rezultate mai bune și să își depășească limitele",
      },
      {
        id: "e",
        text: "Să ofere o alternativă care rupe tiparele și eliberează de reguli",
      },
      {
        id: "f",
        text: "Să transforme o dorință într-o experiență reală și memorabilă. Să creeze momente magice.",
      },
      {
        id: "g",
        text: "Să fie util în viața de zi cu zi și ușor de integrat în rutina oamenilor",
      },
      {
        id: "h",
        text: "Să transforme momentele obișnuite în experiențe de răsfăț și plăcere",
      },
      {
        id: "i",
        text: "Să aducă bună dispoziție și energie pozitivă în viața oamenilor.",
      },
      {
        id: "j",
        text: "Să le permită oamenilor să își exprime stilul și ideile proprii",
      },
      {
        id: "k",
        text: "Să ofere protecție, grijă și sentimentul că cineva are grijă de tine",
      },
      {
        id: "l",
        text: "Să ofere control, standarde și sentimentul că lucrurile importante sunt gestionate corect",
      },
    ],
  },
  {
    id: "q5",
    wave: 2,
    title:
      "Care dintre variantele de mai jos ar putea apărea cel mai natural într-o reclamă a brandului tău?",
    type: "text",
    options: [
      { id: "a", text: "Bucură-te de viață pur și simplu" },
      { id: "b", text: "Alege-ți propriul drum" },
      { id: "c", text: "Adevărul te face liber" },
      { id: "d", text: "Poți mai mult decât crezi" },
      { id: "e", text: "Nu trebuie să joci după regulile altora" },
      { id: "f", text: "Imposibilul devine posibil" },
      { id: "g", text: "Ești bine așa cum ești" },
      { id: "h", text: "Pentru momente care merită savurate" },
      { id: "i", text: "Viața e mai bună când te bucuri de ea" },
      { id: "j", text: "Express yourself, reinvent yourself" },
      { id: "k", text: "Suntem aici oricând ai avea nevoie" },
      { id: "l", text: "Pentru cei care aleg ce e mai bun" },
    ],
  },
  {
    id: "q6",
    wave: 2,
    title:
      "Care descriere se potrivește cel mai bine atmosferei reale din organizația ta?",
    subtitle:
      "Diagnostic intern (această întrebare reflectă doar cultura echipei, fără a adăuga punctaj brandului)",
    type: "text",
    options: [
      { id: "a", text: "Spirit de cooperare, nu de competiție" },
      {
        id: "b",
        text: "Oamenii sunt încurajați să încerce idei noi și să iasă din tipar",
      },
      {
        id: "c",
        text: "Cultură care pune accent pe argumentele bune, expertiză, analiză și gândirea critică.",
      },
      {
        id: "d",
        text: "Echipă motivată puternic de simțul misiunii, de sentimentul că ceea ce face chiar contează",
      },
      {
        id: "e",
        text: "Echipă care provoacă constant și caută rute neconvenționale",
      },
      {
        id: "f",
        text: "Sunt încurajate viziunile îndrăznețe și ideile care par greu de realizat.",
      },
      {
        id: "g",
        text: "Atmosferă prietenoasă, de echipă unită, fără ierarhii rigide",
      },
      {
        id: "h",
        text: "Un mediu de lucru în care contează mult atmosfera, entuziasmul și cum se simt oamenii unii cu alții",
      },
      {
        id: "i",
        text: "Umorul și buna dispoziție fac parte din viața de zi cu zi la muncă",
      },
      {
        id: "j",
        text: "Un loc unde ideile originale sunt mai valorizate decât regulile fixe",
      },
      {
        id: "k",
        text: "Cultură în care oamenii sunt atenți să nu-i lase pe alții la greu",
      },
      {
        id: "l",
        text: "Există roluri clare, structură și deciziile sunt luate ferm.",
      },
    ],
  },
];

export default function App() {
  const [step, setStep] = useState(0); // 0 = Intro, 1-6 = Questions, 7 = Results
  const [answers, setAnswers] = useState({});
  const [dominantEthos, setDominantEthos] = useState(null);
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [savingStatus, setSavingStatus] = useState("idle"); // idle, saving, saved, error

  // Default synthetic submissions for offline or initialization stage
  const mockSubmissions = useMemo(() => {
    return Array.from({ length: 42 }, () => {
      const result = {};
      Object.keys(ARCHETYPES).forEach((key) => {
        result[key] = Math.floor(Math.random() * 4); // Random score weights
      });
      return result;
    });
  }, []);

  useEffect(() => {
    if (!hasFirebase) return;
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Eroare la autentificarea anonimă: ", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!hasFirebase || !user) return;

    // Strict Path adherence: /artifacts/{appId}/public/data/submissions
    const submissionsCol = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "submissions"
    );

    const unsubscribe = onSnapshot(
      submissionsCol,
      (snapshot) => {
        const fetched = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data.scores) {
            fetched.push(data.scores);
          }
        });
        setSubmissions(fetched);
      },
      (error) => {
        console.warn("Eroare la ascultarea bazei de date: ", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Answer selection handler
  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const determineEthos = () => {
    const q1Ethos = ARCHETYPES[answers.q1]?.ethos;

    // Map answer values to specific ethos
    const mapQ2Q3 = {
      a: "thumbprint",
      b: "paradise",
      c: "connection",
      d: "structure",
    };
    const q2Ethos = mapQ2Q3[answers.q2];
    const q3Ethos = mapQ2Q3[answers.q3];

    const ethosCounts = {
      thumbprint: 0,
      paradise: 0,
      connection: 0,
      structure: 0,
    };
    if (q1Ethos) ethosCounts[q1Ethos]++;
    if (q2Ethos) ethosCounts[q2Ethos]++;
    if (q3Ethos) ethosCounts[q3Ethos]++;

    let maxScore = 0;
    let winner = null;
    let isTie = false;

    Object.entries(ethosCounts).forEach(([ethos, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winner = ethos;
        isTie = false;
      } else if (score === maxScore && score > 0) {
        isTie = true;
      }
    });

    if (isTie || maxScore === 1) {
      setDominantEthos("tie");
    } else {
      setDominantEthos(winner);
    }

    setStep(4); // Advance to Wave 2
  };

  const saveToCloud = async (finalScores) => {
    if (!hasFirebase) {
      // Offline fallback: save locally
      setSubmissions((prev) => [...prev, finalScores]);
      setSavingStatus("saved");
      return;
    }
    setSavingStatus("saving");
    try {
      const submissionsCol = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "submissions"
      );
      await addDoc(submissionsCol, {
        scores: finalScores,
        timestamp: new Date().toISOString(),
      });
      setSavingStatus("saved");
    } catch (e) {
      console.error("Eroare la salvare: ", e);
      setSavingStatus("error");
    }
  };

  const results = useMemo(() => {
    if (step < 7) return null;

    const scores = {};
    Object.keys(ARCHETYPES).forEach((key) => (scores[key] = 0));

    // Q4 gives 2 points to selected archetype
    if (answers.q4) scores[answers.q4] += 2;
    // Q5 gives 1 point to selected archetype
    if (answers.q5) scores[answers.q5] += 1;

    let winnerId = null;
    let maxScore = -1;

    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winnerId = id;
      }
    });

    return { winnerId, maxScore, scores };
  }, [answers, step]);

  // Handle step updates
  const handleNext = () => {
    if (step === 3) {
      determineEthos();
    } else if (step === 6) {
      const finalRes = results; // Triggers calculation on next step
      setStep(7);
      if (finalRes) {
        saveToCloud(finalRes.scores);
      }
    } else {
      setStep(step + 1);
    }
  };

  const isCurrentAnswered = !!answers[QUESTIONS[step - 1]?.id];

  const radarChartData = useMemo(() => {
    if (!results) return [];

    const totalSubmissions =
      submissions.length > 0 ? submissions : mockSubmissions;

    return Object.values(ARCHETYPES).map((arch) => {
      const myScore = results.scores[arch.id] || 0;

      // Calculate real benchmark averages
      let totalValueForArch = 0;
      totalSubmissions.forEach((sub) => {
        totalValueForArch += sub[arch.id] || 0;
      });
      const avgValue =
        parseFloat((totalValueForArch / totalSubmissions.length).toFixed(2)) ||
        0;

      return {
        subject: arch.name,
        "Scorul tău": myScore,
        "Media globală": avgValue,
      };
    });
  }, [results, submissions, mockSubmissions]);

  // Display options filtering for Wave 2
  const currentQ = QUESTIONS[step - 1];
  const progress = (step / 6) * 100;

  let displayOptions = currentQ ? currentQ.options : [];
  if (
    currentQ &&
    currentQ.wave === 2 &&
    dominantEthos &&
    dominantEthos !== "tie"
  ) {
    displayOptions = currentQ.options.filter((opt) => {
      const archetypeForOption = ARCHETYPES[opt.id];
      return archetypeForOption && archetypeForOption.ethos === dominantEthos;
    });
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all">
          <div className="bg-slate-900 p-8 text-white text-center relative">
            <div className="absolute top-4 right-4 bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Mod interactiv direct
            </div>
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-xl">
              <BarChart3 size={40} className="text-white transform -rotate-3" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Descoperă ADN-ul brandului tău
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Chestionar de determinare a profilului arhetipal
            </p>
          </div>
          <div className="p-8 md:p-10">
            <p className="text-slate-600 mb-6 leading-relaxed text-base text-center md:text-left">
              Acest instrument de diagnoză te ajută să identifici energia de
              bază a brandului tău și modalitatea autentică de manifestare în
              piață. Analizăm corelațiile dintre valorile asunse și cultura
              voastră organizațională.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center text-blue-600 font-bold mb-1">
                  <CheckCircle2 className="mr-2" size={18} />
                  <span>Valul 1</span>
                </div>
                <p className="text-slate-500 text-sm">
                  Determinăm ethosul intern și energia nativă a brandului.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center text-blue-600 font-bold mb-1">
                  <CheckCircle2 className="mr-2" size={18} />
                  <span>Valul 2</span>
                </div>
                <p className="text-slate-500 text-sm">
                  Filtrarea automată a stilului optim de manifestare comercială.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center group shadow-md"
            >
              Începe chestionarul
              <ArrowRight
                className="ml-2 group-hover:translate-x-1 transition-transform"
                size={20}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 7) {
    const { winnerId, maxScore } = results;
    const winnerData = ARCHETYPES[winnerId];

    const isUnderDeveloped = maxScore < 3;
    const cultureAligned = answers.q6 === winnerId;
    const totalBenchmarkCount =
      submissions.length > 0 ? submissions.length : mockSubmissions.length;

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden border border-slate-100">
            <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <h2 className="text-slate-500 font-semibold tracking-wide text-sm mb-3">
              Rezultat analiză arhetipală
            </h2>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
              Arhetipul dominant:{" "}
              <span className="text-blue-600 font-black">
                {winnerData.name}
              </span>
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div
                className={`w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-white shadow-2xl flex-shrink-0 relative transform hover:scale-105 transition-transform duration-300 ${winnerData.color}`}
              >
                <img
                  src={winnerData.image}
                  alt={winnerData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Dacă imaginea eșuează, ascundem img și se va vedea fundalul colorat
                    e.target.style.display = "none";
                  }}
                />
                <div
                  className={`absolute bottom-2 right-2 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white ${winnerData.color}`}
                >
                  <winnerData.icon size={22} />
                </div>
              </div>
              <div className="text-left max-w-md">
                <p className="text-lg text-slate-600 leading-relaxed">
                  {winnerData.desc} Energia dominantă a brandului face parte din
                  categoria:
                </p>
                <div className="mt-2.5 inline-block bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm">
                  {ETHOS_MAP[winnerData.ethos]?.name || ETHOS_MAP.paradise.name}
                </div>
              </div>
            </div>
          </div>

          {/* Core Analytics: Radar and Strategic Insights */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Radar Spider Web Chart Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 mb-1">
                  Distribuția arhetipurilor
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Vizualizarea amprentei pe toate cele 12 arhetipuri comparativ
                  cu un benchmark global.
                </p>
              </div>
              <div className="h-80 w-full flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={radarChartData}
                  >
                    <PolarGrid gridType="polygon" stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 3]}
                      tick={{ fill: "#94a3b8", fontSize: 9 }}
                      tickCount={4}
                    />
                    <Radar
                      name="Scorul tău"
                      dataKey="Scorul tău"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Media globală"
                      dataKey="Media globală"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", marginTop: "15px" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database size={14} className="text-slate-400" />
                  Eșantion comparație: {totalBenchmarkCount} evaluări anterioare
                </span>
                {savingStatus === "saving" && (
                  <span className="text-amber-500">Se salvează datele...</span>
                )}
                {savingStatus === "saved" && (
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Înregistrat în benchmark
                  </span>
                )}
              </div>
            </div>

            {/* Strategic Diagnostic Insights Card */}
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 mb-1 flex items-center">
                  <Zap className="mr-2 text-yellow-500 shrink-0" size={22} />
                  Insights strategice
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Evaluarea clarității strategice și a alinierii culturale
                  pentru organizația ta.
                </p>
              </div>

              <div className="space-y-5 flex-1 flex flex-col justify-center">
                {isUnderDeveloped ? (
                  <div className="bg-red-50/70 border-l-4 border-red-500 p-4.5 rounded-r-2xl">
                    <h4 className="font-extrabold text-red-900 mb-1 text-sm">
                      Brand în definire arhetipală
                    </h4>
                    <p className="text-red-700 text-xs leading-relaxed">
                      Comunicarea nu susține energia arhetipală a categoriei
                      principale de produs. Scorul arhetipului principal este
                      scăzut ({maxScore} pct). Este recomandată o definire clară
                      a vectorilor de poziționare.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50/70 border-l-4 border-emerald-500 p-4.5 rounded-r-2xl">
                    <h4 className="font-extrabold text-emerald-900 mb-1 text-sm">
                      Contur arhetipal puternic
                    </h4>
                    <p className="text-emerald-700 text-xs leading-relaxed">
                      Brandul are o direcție bine conturată în piață. Strategia
                      voastră de mesaje este consistentă cu energia nativă a
                      ethosului.
                    </p>
                  </div>
                )}

                {cultureAligned ? (
                  <div className="bg-blue-50/70 border-l-4 border-blue-500 p-4.5 rounded-r-2xl">
                    <h4 className="font-extrabold text-blue-900 mb-1 text-sm">
                      Aliniere internă excelentă
                    </h4>
                    <p className="text-blue-700 text-xs leading-relaxed">
                      Cultura internă a organizației susține spiritul arhetipal
                      al brandului. Echipa rezonează natural cu valorile promise
                      în mod public clienților.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4.5 rounded-r-2xl">
                    <h4 className="font-extrabold text-amber-950 mb-1 text-sm">
                      Tensiune culturală / aliniere
                    </h4>
                    <p className="text-amber-850 text-xs leading-relaxed">
                      Cultura internă ({ARCHETYPES[answers.q6]?.name || "alta"})
                      pare să aibă o energie diferită față de brand (
                      {winnerData.name}). Merită explorat dacă este o tensiune
                      creativă sau o problemă de aliniere.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Datele tale fac acum parte din indexul nostru anonim de
                  branduri. Această analiză are caracter orientativ și
                  reprezintă un punct de plecare excelent pentru audituri
                  strategice detaliate.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
                setDominantEthos(null);
                setSavingStatus("idle");
              }}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm bg-white hover:bg-slate-100 px-6 py-3 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <RefreshCw size={15} />
              Reia chestionarul
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky Header with Progress indicators */}
      <div className="bg-white border-b border-slate-100 pt-6 pb-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-500 tracking-wide">
              {currentQ.wave === 1 ? "Valul 1: Ethos" : "Valul 2: Arhetip"}
            </span>
            <span className="text-sm font-bold text-slate-500">
              Întrebarea {step} / 6
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center py-10 px-4 w-full max-w-4xl mx-auto justify-center">
        <div className="w-full text-center mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-950 max-w-3xl mx-auto leading-snug">
            {currentQ.title}
          </h2>
          {currentQ.subtitle && (
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              {currentQ.subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Options Grid */}
        <div
          className={`w-full ${
            currentQ.type === "visual"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              : "flex flex-col gap-3 max-w-2xl mx-auto"
          }`}
        >
          {displayOptions.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.id;

            if (currentQ.type === "visual") {
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(currentQ.id, opt.id)}
                  className={`
                    flex flex-col items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-300 group relative select-none
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-lg transform scale-[1.03] ring-4 ring-blue-50"
                        : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
                    }
                  `}
                >
                  <div
                    className={`w-full aspect-square rounded-xl overflow-hidden mb-3.5 relative shadow-inner ${opt.color}`}
                  >
                    <img
                      src={opt.image}
                      alt={`Simbol arhetip ${opt.name}`}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isSelected ? "scale-110" : "group-hover:scale-105"
                      }`}
                      loading="lazy"
                      onError={(e) => {
                        // Eliminăm imaginea dacă nu se încarcă, rămâne fundalul colorat din clasa părintelui
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Iconiță de siguranță vizibilă în spate dacă imaginea dispare */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none -z-10">
                      <opt.icon size={40} />
                    </div>

                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white rounded-full p-1.5 shadow-lg border border-blue-100">
                          <CheckCircle2 className="text-blue-600" size={20} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-800 tracking-tight block">
                      {opt.name}
                    </span>
                  </div>
                </button>
              );
            }

            // Standard Text Option
            return (
              <button
                key={opt.id}
                onClick={() => handleAnswer(currentQ.id, opt.id)}
                className={`
                  text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group select-none
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/30 shadow-md ring-4 ring-blue-50/50"
                      : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
                  }
                `}
              >
                <span
                  className={`text-sm md:text-base leading-relaxed ${
                    isSelected
                      ? "text-blue-950 font-bold"
                      : "text-slate-600 group-hover:text-slate-900"
                  }`}
                >
                  {opt.text}
                </span>
                <div
                  className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all
                  ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 shadow-sm"
                      : "border-slate-200 bg-slate-50"
                  }
                `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button Navigation */}
        <div className="w-full mt-10 flex justify-center max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className={`
              w-full md:w-auto inline-flex items-center justify-center px-10 py-4 rounded-2xl font-bold text-base transition-all duration-300
              ${
                isCurrentAnswered
                  ? "bg-slate-950 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl translate-y-0 hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {step === 6 ? "Vezi rezultatele" : "Următoarea întrebare"}
            <ChevronRight className="ml-2" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
