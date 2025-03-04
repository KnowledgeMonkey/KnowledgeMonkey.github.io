'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const playClick = useCallback((isFirstBeat: boolean = false) => {
    const audio = new Audio(isFirstBeat ? '/click-accent.mp3' : '/click.mp3');
    audio.play();
  }, []);

  const startStop = () => {
    if (isPlaying) {
      if (intervalId) clearInterval(intervalId);
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      const interval = setInterval(() => {
        setCurrentBeat((prev) => {
          const newBeat = (prev + 1) % beatsPerMeasure;
          playClick(newBeat === 0);
          return newBeat;
        });
      }, (60 / bpm) * 1000);
      setIntervalId(interval);
      setIsPlaying(true);
      playClick(true);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    if (isPlaying) {
      if (intervalId) clearInterval(intervalId);
      const interval = setInterval(() => {
        setCurrentBeat((prev) => {
          const newBeat = (prev + 1) % beatsPerMeasure;
          playClick(newBeat === 0);
          return newBeat;
        });
      }, (60 / newBpm) * 1000);
      setIntervalId(interval);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-gray-800/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/30 transform transition-all duration-300 hover:scale-[1.02]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white">Metronom</h1>
            <Link href="/" className="btn-secondary">
              Zurück zur Übersicht
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white mb-8 text-center">Metronom</h1>
          
          <div className="mb-10 space-y-3">
            <label className="block text-gray-300 text-lg font-medium">Tempo (BPM)</label>
            <div className="flex items-center justify-between gap-6">
              <button 
                className="btn-secondary w-14 text-xl"
                onClick={() => handleBpmChange(Math.max(40, bpm - 5))}
              >
                -
              </button>
              <input
                type="number"
                value={bpm}
                onChange={(e) => handleBpmChange(Math.min(220, Math.max(40, parseInt(e.target.value) || 40)))}
                className="input-primary text-center w-28 text-2xl font-bold"
                min="40"
                max="220"
              />
              <button
                className="btn-secondary w-14 text-xl"
                onClick={() => handleBpmChange(Math.min(220, bpm + 5))}
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-10 space-y-3">
            <label className="block text-gray-300 text-lg font-medium">Taktart</label>
            <select
              value={beatsPerMeasure}
              onChange={(e) => setBeatsPerMeasure(parseInt(e.target.value))}
              className="input-primary w-full"
            >
              <option value="2">2/4</option>
              <option value="3">3/4</option>
              <option value="4">4/4</option>
              <option value="6">6/8</option>
            </select>
          </div>

          <div className="flex justify-center mb-10">
            <div className="flex gap-3">
              {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full transform transition-all duration-300 ${currentBeat === i ? 'scale-110' : ''} 
                    ${currentBeat === i && isPlaying ? 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg' : 'bg-gray-800/80'} 
                    ${i === 0 ? 'ring-2 ring-gray-400 ring-opacity-50' : ''}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={startStop}
            className={`w-full py-4 text-lg font-bold ${isPlaying ? 'btn-danger' : 'btn-secondary'}`}
          >
            {isPlaying ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
}