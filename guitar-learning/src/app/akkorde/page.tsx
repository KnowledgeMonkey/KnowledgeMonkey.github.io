'use client';

import { useState } from 'react';
import Link from 'next/link';

type ChordType = {
  name: string;
  positions: (number | null)[][];
  fingering: (number | null)[];
  startFret?: number;
};

const CHORDS: { [key: string]: ChordType } = {
  'A': {
    name: 'A',
    positions: [[0,0,2,2,2,0]],
    fingering: [null,null,1,2,3,null]
  },
  'Am': {
    name: 'Am',
    positions: [[0,0,2,2,1,0]],
    fingering: [null,null,2,3,1,null]
  },
  'D': {
    name: 'D',
    positions: [[null,null,0,2,3,2]],
    fingering: [null,null,null,1,3,2]
  },
  'Dm': {
    name: 'Dm',
    positions: [[null,null,0,2,3,1]],
    fingering: [null,null,null,2,3,1]
  },
  'E': {
    name: 'E',
    positions: [[0,2,2,1,0,0]],
    fingering: [null,2,3,1,null,null]
  },
  'Em': {
    name: 'Em',
    positions: [[0,2,2,0,0,0]],
    fingering: [null,2,3,null,null,null]
  },
  'G': {
    name: 'G',
    positions: [[3,2,0,0,0,3]],
    fingering: [2,1,null,null,null,3]
  }
};

export default function ChordLibrary() {
  const [selectedChord, setSelectedChord] = useState<string>('A');

  const renderChordDiagram = (chord: ChordType) => {
    const frets = 5;
    const strings = 6;

    return (
      <div className="relative w-64 h-80 mx-auto bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-xl p-6 shadow-xl border border-gray-600/50 hover:shadow-2xl hover:border-gray-500/50 transition-all duration-300">
        {/* Fret numbers */}
        <div className="absolute -left-6 h-full flex flex-col justify-between pt-8 pb-2">
          {Array.from({ length: frets }).map((_, i) => (
            <div key={i} className="text-gray-400 text-sm">{i}</div>
          ))}
        </div>

        {/* Strings */}
        <div className="relative h-full w-full">
          {Array.from({ length: strings }).map((_, stringIndex) => (
            <div
              key={stringIndex}
              className="absolute w-full h-0.5 bg-gradient-to-r from-gray-400/70 to-gray-500/70"
              style={{ top: `${(stringIndex * 20) + 10}%` }}
            />
          ))}

          {/* Frets */}
          {Array.from({ length: frets + 1 }).map((_, fretIndex) => (
            <div
              key={fretIndex}
              className="absolute h-full w-0.5 bg-gradient-to-b from-gray-300/70 to-gray-400/70"
              style={{ left: `${(fretIndex * 20)}%` }}
            />
          ))}

          {/* Finger positions */}
          {chord.positions[0].map((position, stringIndex) => {
            if (position === null) {
              return (
                <div
                  key={stringIndex}
                  className="absolute text-red-500/80 text-2xl font-bold transform transition-all duration-300"
                  style={{ 
                    left: `-10px`, 
                    top: `${(stringIndex * 20) + 7}%`
                  }}
                >
                  ×
                </div>
              );
            }

            if (position === 0) {
              return (
                <div
                  key={stringIndex}
                  className="absolute text-gray-300/80 text-xl font-bold transform transition-all duration-300"
                  style={{ 
                    left: `-10px`, 
                    top: `${(stringIndex * 20) + 7}%`
                  }}
                >
                  ○
                </div>
              );
            }

            return (
              <div
                key={stringIndex}
                className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/90 to-blue-700/90 transform transition-all duration-300 hover:scale-110 hover:shadow-lg hover:from-blue-400 hover:to-blue-600 hover:shadow-blue-500/30 flex items-center justify-center shadow-md border border-blue-400/50"
                style={{ 
                  left: `${((position - 0.5) * 20)}%`, 
                  top: `${(stringIndex * 20) + 7}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="text-gray-200 text-sm font-medium">{chord.fingering[stringIndex]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-2xl border border-gray-700/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-500">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl heading-gradient">Akkord-Bibliothek</h1>
          <Link href="/" className="btn-secondary">
            Zurück zur Übersicht
          </Link>
        </div>

        <div className="mb-8">
          <label className="block text-gray-300 mb-3 text-lg font-medium">Akkord auswählen</label>
          <select
            value={selectedChord}
            onChange={(e) => setSelectedChord(e.target.value)}
            className="input-primary w-full"
          >
            {Object.keys(CHORDS).map((chordName) => (
              <option key={chordName} value={chordName}>
                {CHORDS[chordName].name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl p-8 transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-600/50">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white mb-4 text-center">{CHORDS[selectedChord].name}</h2>
          {renderChordDiagram(CHORDS[selectedChord])}
        </div>
      </div>
    </div>
  );
}