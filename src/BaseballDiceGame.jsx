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

export default function BaseballDiceGame() {
  const [teamA, setTeamA] = useState({ name: "Team A", players: [], pitchers: [] });
  const [teamB, setTeamB] = useState({ name: "Team B", players: [], pitchers: [] });
  const [currentPitcher, setCurrentPitcher] = useState(null);
  const [pitcherStats, setPitcherStats] = useState({});
  const [outcome, setOutcome] = useState("");

  const rollDice = () => {
    const pitcher = currentPitcher;
    const pitcherFTG = pitcherStats[pitcher.name]?.FTG ?? pitcher.FTG ?? (pitcher.role === 'SP' ? 100 : 50);

    if (pitcherFTG <= 0) {
      setOutcome("Pitcher is too fatigued to continue! Please change pitchers.");
      return;
    }

    const batter = teamB.players[0]; // For demo, replace with actual rotation logic

    let pitchRoll = Math.ceil(Math.random() * 6);
    let hitRoll = Math.ceil(Math.random() * 6);

    // Fatigue penalty
    let fatiguePenalty = 0;
    if (pitcherFTG < 75) fatiguePenalty -= 1;
    if (pitcherFTG < 50) fatiguePenalty -= 1;

    pitchRoll += Math.floor(pitcher.PIT / 3) + fatiguePenalty;
    hitRoll += Math.floor(batter.HIT / 3);

    // Track pitch count and FTG
    setPitcherStats((prev) => ({
      ...prev,
      [pitcher.name]: {
        ...prev[pitcher.name],
        pitches: (prev[pitcher.name]?.pitches || 0) + 1,
        FTG: Math.max((prev[pitcher.name]?.FTG ?? pitcher.FTG ?? (pitcher.role === 'SP' ? 100 : 50)) - 1, 0)
      }
    }));

    if (hitRoll === 6 && pitchRoll !== 6) {
      setOutcome(`💥 Home Run by ${batter.name}!`);
    } else if (hitRoll >= 4) {
      const fieldResult = Math.random() < batter.HIT / 10 ? "safe" : "out";
      setOutcome(`Ball in play by ${batter.name} - ${fieldResult.toUpperCase()}`);
    } else if (hitRoll <= 3) {
      setOutcome(`❌ Swing and miss by ${batter.name}`);
    } else {
      setOutcome(`⚾ Out by ${batter.name}`);
    }
    setOutcome("Rolled dice logic goes here");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Baseball Dice Game</h1>
      <button
        onClick={rollDice}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        🎲 Roll Dice
      </button>
      <p className="mt-2">Outcome: {outcome}</p>
    </div>
  );
}
