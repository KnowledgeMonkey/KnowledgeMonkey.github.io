'use client';

import { useState } from 'react';
import Link from 'next/link';

type ScaleType = {
  name: string;
  pattern: number[];
  intervals: string[];
};

const SCALES: { [key: string]: ScaleType } = {
  major: {
    name: 'Dur',
    pattern: [0, 2, 4, 5, 7, 9, 11],
    intervals: ['1', '2', '3', '4', '5', '6', '7']
  },
  minor: {
    name: 'Moll',
    pattern: [0, 2, 3, 5, 7, 8, 10],
    intervals: ['1', '2', '♭3', '4', '5', '♭6', '♭7']
  },
  pentatonicMajor: {
    name: 'Dur Pentatonik',
    pattern: [0, 2, 4, 7, 9],
    intervals: ['1', '2', '3', '5', '6']
  },
  pentatonicMinor: {
    name: 'Moll Pentatonik',
    pattern: [0, 3, 5, 7, 10],
    intervals: ['1', '♭3', '4', '5', '♭7']
  },
  blues: {
    name: 'Blues',
    pattern: [0, 3, 5, 6, 7, 10],
    intervals: ['1', '♭3', '4', '♭5', '5', '♭7']
  }
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function ScaleExplorer() {
  const [selectedScale, setSelectedScale] = useState('major');
  const [rootNote, setRootNote] = useState('C');
  
  const renderFretboard = () => {
    const strings = ['E', 'B', 'G', 'D', 'A', 'E'];
    const frets = 12;

    return (
      <div className="relative overflow-x-auto -mx-6 sm:mx-0">
        <div className="min-w-[800px] p-4 md:p-6 space-y-4">
          {/* String labels */}
          <div className="flex">
            <div className="w-12"></div>
            {strings.map((string, index) => (
              <div key={index} className="w-12 text-center text-gray-400 font-medium">
                {string}
              </div>
            ))}
          </div>

          {/* Fretboard */}
          {Array.from({ length: frets + 1 }).map((_, fret) => (
            <div key={fret} className="flex items-center">
              {/* Fret number */}
              <div className="w-12 text-right pr-4 text-gray-500 font-medium">
                {fret}
              </div>

              {/* String positions */}
              {strings.map((string, stringIndex) => {
                const stringBaseNote = NOTES.indexOf(string);
                const currentNote = (stringBaseNote + fret) % 12;
                const isInScale = SCALES[selectedScale].pattern.some(
                  interval => (NOTES.indexOf(rootNote) + interval) % 12 === currentNote
                );

                return (
                  <div
                    key={stringIndex}
                    className={`w-12 h-12 border-b border-r border-gray-700 flex items-center justify-center
                      ${fret === 0 ? 'border-l' : ''} ${isInScale ? 'scale-note' : ''}`}
                  >
                    {isInScale && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/80 to-blue-600/80
                        flex items-center justify-center transform transition-all duration-300
                        hover:scale-110 hover:from-blue-400 hover:to-blue-500 cursor-pointer
                        shadow-lg hover:shadow-blue-500/30">
                        <span className="text-white text-sm font-medium">
                          {NOTES[currentNote]}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto card overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl heading-gradient">Tonleiter-Explorer</h1>
          <Link href="/" className="btn-secondary">
            Zurück zur Übersicht
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <label className="block text-gray-300 text-lg font-medium">Tonleiter</label>
            <select
              value={selectedScale}
              onChange={(e) => setSelectedScale(e.target.value)}
              className="input-primary w-full"
            >
              {Object.entries(SCALES).map(([key, scale]) => (
                <option key={key} value={key}>
                  {scale.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-gray-300 text-lg font-medium">Grundton</label>
            <select
              value={rootNote}
              onChange={(e) => setRootNote(e.target.value)}
              className="input-primary w-full"
            >
              {NOTES.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-xl p-6 transform transition-all duration-300 hover:shadow-xl border border-gray-700/20">
          {renderFretboard()}
        </div>

        <div className="mt-8 p-4 md:p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-xl border border-gray-700/30">
          <h3 className="text-lg md:text-xl heading-gradient mb-2">Tonleiter-Intervalle</h3>
          <p className="text-gray-400 text-sm mb-4">Die Abstände zwischen den Noten in der ausgewählten Tonleiter</p>
          <div className="flex flex-wrap gap-4">
            {SCALES[selectedScale].intervals.map((interval, index) => (
              <div key={index} className="px-4 py-2 bg-gradient-to-br from-gray-800/80 to-gray-900/90 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg">
                <span className="text-gray-300">{interval}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}