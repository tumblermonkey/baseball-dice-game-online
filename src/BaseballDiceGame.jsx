// BaseballDiceGame.jsx

import React, { useState } from "react";

const createEmptyPlayer = () => ({ name: "", HIT: 0, PIT: 0, FLD: 0 });

const getSavedTeams = () => {
  try {
    const saved = localStorage.getItem("baseballDiceTeamPresets");
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

const saveTeamPreset = (teamKey, teamData, presetName) => {
  const existing = getSavedTeams();
  const updated = {
    ...existing,
    [presetName]: {
      ...(existing[presetName] || {}),
      [teamKey]: teamData
    }
  };
  localStorage.setItem("baseballDiceTeamPresets", JSON.stringify(updated));
};

const loadTeamPreset = (presetName, teamKey) => {
  const saved = getSavedTeams();
  return saved[presetName]?.[teamKey] || null;
};

const listTeamPresets = () => {
  return Object.keys(getSavedTeams());
};

const generateGenericTeam = (name, logo, color) => {
  const players = Array.from({ length: 26 }, (_, i) => ({
    name: `${name} Player ${i + 1}`,
    HIT: Math.floor(Math.random() * 6),
    PIT: Math.floor(Math.random() * 6),
    FLD: Math.floor(Math.random() * 6)
  }));
  const startingPitchers = players.slice(0, 5).map(p => ({ ...p, FTG: 100, role: "SP" }));
  const reliefPitchers = players.slice(5, 13).map(p => ({ ...p, FTG: 50, role: "RP" }));
  const pitchers = [...startingPitchers, ...reliefPitchers];
    name,
    logo,
    color,
    players,
    pitchers
  };
};

const genericTeams = {
  Thunder: generateGenericTeam("Thunder", "🌩️", "#6366F1"),
  Hawks: generateGenericTeam("Hawks", "🦅", "#10B981"),
  Titans: generateGenericTeam("Titans", "🛡️", "#F59E0B"),
  Vipers: generateGenericTeam("Vipers", "🐍", "#EF4444")
};

Object.entries(genericTeams).forEach(([name, team]) => {
  saveTeamPreset("A", team, name);
  saveTeamPreset("B", team, name);
});

const defaultTeamA = {
  name: "Team A",
  color: "#1E3A8A",
  logo: "⚾",
  players: [
    { name: "Kolten", HIT: 3, PIT: 1, FLD: 4 },
    { name: "Liam", HIT: 4, PIT: 2, FLD: 3 },
    { name: "Ella", HIT: 2, PIT: 1, FLD: 5 }
  ],
  pitchers: [
    { name: "Pitcher A1", HIT: 1, PIT: 4, FLD: 3 },
    { name: "Pitcher A2", HIT: 2, PIT: 3, FLD: 3 },
    { name: "Pitcher A3", HIT: 1, PIT: 5, FLD: 2 },
    { name: "Pitcher A4", HIT: 1, PIT: 4, FLD: 4 },
    { name: "Pitcher A5", HIT: 2, PIT: 2, FLD: 5 }
  ]
};

const defaultTeamB = {
  name: "Team B",
  color: "#DC2626",
  logo: "🥎",
  players: [
    { name: "James", HIT: 1, PIT: 4, FLD: 3 },
    { name: "Ava", HIT: 3, PIT: 3, FLD: 2 },
    { name: "Noah", HIT: 2, PIT: 5, FLD: 4 }
  ],
  pitchers: [
    { name: "Pitcher B1", HIT: 1, PIT: 4, FLD: 3 },
    { name: "Pitcher B2", HIT: 2, PIT: 3, FLD: 4 },
    { name: "Pitcher B3", HIT: 1, PIT: 5, FLD: 2 },
    { name: "Pitcher B4", HIT: 1, PIT: 4, FLD: 4 },
    { name: "Pitcher B5", HIT: 2, PIT: 2, FLD: 5 }
  ]
};

const savedTeams = getSavedTeams();

const rollD20 = () => Math.floor(Math.random() * 20) + 1;
const rollD6 = () => Math.floor(Math.random() * 6) + 1;

export default function BaseballDiceGame() {
  const [showSetup, setShowSetup] = useState(true);
  const [teamAData, setTeamAData] = useState(savedTeams.lastUsed?.A || defaultTeamA);
  const [teamBData, setTeamBData] = useState(savedTeams.lastUsed?.B || defaultTeamB);
  const [presetName, setPresetName] = useState("");
  const [homeTeam, setHomeTeam] = useState("A");
  const [awayTeam, setAwayTeam] = useState("B");
  const [inning, setInning] = useState(1);
  const [isTop, setIsTop] = useState(true);
  const [scoreTop, setScoreTop] = useState(0);
  const [scoreBottom, setScoreBottom] = useState(0);
  const [outs, setOuts] = useState(0);
  const [bases, setBases] = useState([null, null, null]);
  const [pitchRoll, setPitchRoll] = useState(null);
  const [hitRoll, setHitRoll] = useState(null);
  const [outcome, setOutcome] = useState("");
  const [hitType, setHitType] = useState("");
  const [lineupA, setLineupA] = useState(0);
  const [lineupB, setLineupB] = useState(0);
  const [pitcherAIndex, setPitcherAIndex] = useState(0);
  const [pitcherBIndex, setPitcherBIndex] = useState(0);
  const [pitchCounts, setPitchCounts] = useState({ A: Array(5).fill(0), B: Array(5).fill(0) });
  const [usedPitchers, setUsedPitchers] = useState({ A: [], B: [] });
  const teams = { A: teamAData, B: teamBData };

  const [playerStats, setPlayerStats] = useState({});
  const [pitcherStats, setPitcherStats] = useState({});
  

  const handleSetupSubmit = () => {
    if (homeTeam === awayTeam) return alert("Home and away teams must be different.");
    const saveName = presetName || "lastUsed";
    saveTeamPreset("A", teamAData, saveName);
    saveTeamPreset("B", teamBData, saveName);
    setShowSetup(false);
  };

  const handlePresetLoad = (name) => {
    const loadedA = loadTeamPreset(name, "A");
    const loadedB = loadTeamPreset(name, "B");
    if (loadedA) setTeamAData(loadedA);
    if (loadedB) setTeamBData(loadedB);
    setPresetName(name);
  };

  const presetOptions = listTeamPresets();

  if (showSetup) {
    return (
      <div className="p-4 max-w-xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Start Game Setup</h1>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Away Team:</label>
          <select
            value={awayTeam}
            onChange={(e) => setAwayTeam(e.target.value)}
            className="border p-1 rounded w-full"
          >
            <option value="A">Team A</option>
            <option value="B">Team B</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Home Team:</label>
          <select
            value={homeTeam}
            onChange={(e) => setHomeTeam(e.target.value)}
            className="border p-1 rounded w-full"
          >
            <option value="A">Team A</option>
            <option value="B">Team B</option>
          </select>
        </div>

        <button
          onClick={handleSetupSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          ✅ Start Game
        </button>
      </div>
    );
  }

  const currentBattingTeam = isTop ? awayTeam : homeTeam;
  const currentPitchingTeam = isTop ? homeTeam : awayTeam;

  const rollDice = () => {
    const pitcherIndex = isTop ? pitcherAIndex : pitcherBIndex;
    const pitcher = teams[currentPitchingTeam].pitchers[pitcherIndex];
    const pitcherFTG = pitcherStats[pitcher.name]?.FTG ?? pitcher.FTG ?? (pitcher.role === 'SP' ? 100 : 50);
    if (pitcherFTG <= 0) {
      setOutcome("Pitcher is too fatigued to continue! Please change pitchers.");
      return;
    }
    const battingLineup = isTop ? lineupB : lineupA;
    const pitcherIndex = isTop ? pitcherAIndex : pitcherBIndex;
    const batter = teams[currentBattingTeam].players[battingLineup % teams[currentBattingTeam].players.length];
    const pitcher = teams[currentPitchingTeam].pitchers[pitcherIndex];

    let pitchRoll = rollD6();
    let hitRoll = rollD6();

    // Apply pitcher and batter stat bonuses (max 1 point adjustment)
    let fatiguePenalty = 0;
    const currentFTG = pitcherStats[pitcher.name]?.FTG ?? pitcher.FTG ?? (pitcher.role === 'SP' ? 100 : 50);
    if (currentFTG < 75) fatiguePenalty -= 1;
    if (currentFTG < 50) fatiguePenalty -= 1;

    pitchRoll += Math.floor(pitcher.PIT / 3) + fatiguePenalty; // 0 to 1 bonus
    hitRoll += Math.floor(batter.HIT / 3);    // 0 to 1 bonus

    // Cap at 6 (D6)
    pitchRoll = Math.min(pitchRoll, 6);
    hitRoll = Math.min(hitRoll, 6);

    setPitchRoll(pitchRoll);

    // Track pitch count
    const pitcherKey = pitcher.name;
    setPitcherStats((prev) => ({
      ...prev,
      [pitcherKey]: {
        ...prev[pitcherKey],
        pitches: (prev[pitcherKey]?.pitches || 0) + 1,
        FTG: (prev[pitcherKey]?.FTG !== undefined ? Math.max((prev[pitcherKey]?.FTG || (pitcher.role === "SP" ? 100 : 50)) - 1, 0) : (pitcher.FTG || (pitcher.role === "SP" ? 100 : 50)) - 1)
      }
    }));
      }
    }));
    setHitRoll(hitRoll);

    if (hit === 1) {
      setOutcome("Automatic out");
      setHitType("Out");
      setOuts((o) => o + 1);

      // Track out for batter
      const batterKey = batter.name;
      setPlayerStats((prev) => ({
        ...prev,
        [batterKey]: {
          ...prev[batterKey],
          outs: (prev[batterKey]?.outs || 0) + 1
        }
      }));

      // Track out for pitcher
      const pitcherKey = pitcher.name;
      setPitcherStats((prev) => ({
        ...prev,
        [pitcherKey]: {
          ...prev[pitcherKey],
          strikeouts: (prev[pitcherKey]?.strikeouts || 0) + 1
        }
      }));

        // Track out for batter
        const batterKey = batter.name;
        setPlayerStats((prev) => ({
          ...prev,
          [batterKey]: {
            ...prev[batterKey],
            outs: (prev[batterKey]?.outs || 0) + 1
          }
        }));
    } else if (hit === 2 || hit === 3) {
      setOutcome("Swing and miss — strike");
      setHitType("Strike");
    } else if (hit === 4 || hit === 5) {
      const result = rollD6();
      const types = ["Single", "Double", "Triple", "Home Run", "Out", "Error"];
      const hitResult = types[result - 1];

      // Compare with fielding stat to determine if it's successful
      const fielder = teams[currentPitchingTeam].players[result % teams[currentPitchingTeam].players.length];
      const defenseRoll = rollD6() + Math.floor(fielder.FLD / 2); // Fielding bonus up to +2
      const offenseRoll = rollD6();

      if (defenseRoll > offenseRoll && hitResult !== "Home Run") {
        setOutcome(`Ball in play — ${hitResult}, but fielded by ${fielder.name}`);
        setHitType("Fielded Out");
        setOuts((o) => o + 1);
      } else {
        setOutcome(`Ball in play — ${hitResult}`);
        setHitType(hitResult);

        // Update batter hit count
        const batterKey = batter.name;
        setPlayerStats((prev) => ({
          ...prev,
          [batterKey]: {
            ...prev[batterKey],
            hits: (prev[batterKey]?.hits || 0) + 1
          }
        }));
        if (hitResult === "Home Run") {
          if (isTop) {
            setScoreTop((s) => s + 1);
            // Earned run for pitcher
            const pitcherKey = pitcher.name;
            setPitcherStats((prev) => ({
              ...prev,
              [pitcherKey]: {
                ...prev[pitcherKey],
                earnedRuns: (prev[pitcherKey]?.earnedRuns || 0) + 1
              }
            }));
          } else {
            setScoreBottom((s) => s + 1);
          }
        }
      }
      setHitType(hitResult);
    } else if (hit === 6) {
      if (pitch === 6) {
        setOutcome("Pitcher counters home run with a perfect pitch — strikeout!");
        setHitType("Countered HR");
        setOuts((o) => o + 1);
      } else {
        setOutcome("Home run!");
        setHitType("HR");
        if (isTop) {
          setScoreTop((s) => s + 1);
        } else {
          setScoreBottom((s) => s + 1);
        }
      }
    }
  };

  return (
    <div className="p-4">
      <div className="relative w-64 h-64 mx-auto mb-6 border border-gray-300 rounded-full">
        {[
          { pos: "CF", x: "1/2", y: "0", fielder: 0 },
          { pos: "LF", x: "0", y: "1/2", fielder: 1 },
          { pos: "RF", x: "full", y: "1/2", fielder: 2 },
          { pos: "C", x: "1/2", y: "full", fielder: 3 },
          { pos: "3B", x: "[10%]", y: "[70%]", fielder: 4 },
          { pos: "SS", x: "[30%]", y: "[55%]", fielder: 5 },
          { pos: "2B", x: "[70%]", y: "[55%]", fielder: 6 },
          { pos: "1B", x: "[85%]", y: "[70%]", fielder: 7 },
          { pos: "P", x: "1/2", y: "[60%]", fielder: 8 }
        ].map((f, i) => {
          const player = teams[currentPitchingTeam].players[f.fielder];
          const isHighlight = outcome.includes(player?.name);
          return (
            <div
              key={i}
              className={`absolute left-${f.x} top-${f.y} transform -translate-x-1/2 -translate-y-1/2 text-xs text-center ${isHighlight ? "bg-yellow-200 p-1 rounded animate-pulse" : ""}`}
            >
              <div className="font-bold">{f.pos}</div>
              <div title={`HIT: ${player?.HIT}, PIT: ${player?.PIT}, FLD: ${player?.FLD}`}>{player?.name || "-"}</div>
            </div>
          );
        })}
      </div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">LF</div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">RF</div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2">C</div>
        <div className="absolute left-[10%] top-[70%]">3B</div>
        <div className="absolute left-[30%] top-[55%]">SS</div>
        <div className="absolute left-[70%] top-[55%]">2B</div>
        <div className="absolute left-[85%] top-[70%]">1B</div>
        <div className="absolute left-1/2 top-[60%] transform -translate-x-1/2">P</div>
      </div>
      <h2 className="text-xl font-bold mb-4">
        Inning {inning} {isTop ? "Top" : "Bottom"} — {teams[currentBattingTeam].name} batting
      </h2>
      <div className="flex justify-between mb-4">
        <div className="p-2 border rounded bg-gray-100">
          <strong>{teams[awayTeam].logo} {teams[awayTeam].name}</strong>
          <p>Score: {scoreTop}</p>
        </div>
        <div className="p-2 border rounded bg-gray-100">
          <strong>{teams[homeTeam].logo} {teams[homeTeam].name}</strong>
          <p>Score: {scoreBottom}</p>
        </div>
      </div>
      <p><strong>Outs:</strong> {outs}</p>
      <p><strong>Bases:</strong> {bases.map((runner, i) => runner ? `Runner on ${i + 1}` : null).filter(Boolean).join(", ") || "Empty"}</p>
      <p><strong>Pitch Roll:</strong> {pitchRoll}</p>
      <p><strong>Hit Roll:</strong> {hitRoll}</p>
      <p><strong>Outcome:</strong> {outcome}</p>
      <p><strong>Hit Type:</strong> {hitType}</p>

      {/* Batter and Pitcher Info */}
      <div className="mt-4 p-4 border rounded bg-white shadow">
        <h3 className="font-bold mb-2">Current Matchup</h3>
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">Batter:</p>
            <p>{teams[currentBattingTeam].players[(isTop ? lineupB : lineupA) % teams[currentBattingTeam].players.length].name}</p>
            <p className="text-sm text-gray-600">HIT: {teams[currentBattingTeam].players[(isTop ? lineupB : lineupA) % teams[currentBattingTeam].players.length].HIT}</p>
          </div>
          <div>
            <p className="font-semibold">Pitcher:</p>
            <p>{teams[currentPitchingTeam].pitchers[(isTop ? pitcherAIndex : pitcherBIndex)].name}</p>
            <p className="text-sm text-gray-600">PIT: {teams[currentPitchingTeam].pitchers[(isTop ? pitcherAIndex : pitcherBIndex)].PIT}</p>
          </div>
        </div>
      </div>

      {/* Individual Player Stats */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Performance</h3>
        <ul className="text-sm space-y-1">
          {Object.entries(playerStats).map(([name, stats]) => (
            <li key={name}>
              <strong>{name}</strong>: Hits: {stats.hits || 0}, Outs: {stats.outs || 0}
            </li>
          ))}
        </ul>

        <h4 className="font-semibold mt-4 mb-2">Pitching Stats</h4>
        <ul className="text-sm space-y-1">
          {Object.entries(pitcherStats).map(([name, stats]) => (
            <li key={name}>
              $1 {stats.FTG !== undefined && stats.FTG < 50 ? '⚠️ Fatigued' : stats.FTG < 75 ? '⚠️ Warming Down' : ''}
            </li>
          ))}
        </ul>
      </div>

      {outcome.includes("fielded by") && (
        <p className="text-sm italic text-gray-600">🧤 Play made by: {outcome.split("fielded by ")[1]}</p>
      )}
      )}
      <button
        onClick={rollDice}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        🎲 Roll Dice
      </button>
    </div>
  );
}
