'use client';

import { useState } from 'react';
import Link from 'next/link';

type PracticeSession = {
  id: string;
  date: string;
  duration: number;
  exercises: string;
  notes: string;
};

export default function PracticeLog() {
  const [sessions, setSessions] = useState<PracticeSession[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('practiceSessions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [formData, setFormData] = useState({
    duration: '',
    exercises: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: PracticeSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration: Number(formData.duration),
      exercises: formData.exercises,
      notes: formData.notes
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    localStorage.setItem('practiceSessions', JSON.stringify(updatedSessions));

    setFormData({
      duration: '',
      exercises: '',
      notes: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl heading-gradient">Übungs-Protokoll</h1>
          <Link href="/" className="btn-secondary">
            Zurück zur Übersicht
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Practice Session Form */}
          <div className="card">
            <h2 className="text-xl heading-gradient mb-6">Neue Übungseinheit</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Dauer (Minuten)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="input-primary w-full"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Geübte Stücke/Übungen
                </label>
                <input
                  type="text"
                  value={formData.exercises}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  className="input-primary w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Notizen
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-primary w-full h-32 resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                Übungseinheit speichern
              </button>
            </form>
          </div>

          {/* Practice History */}
          <div className="card">
            <h2 className="text-xl heading-gradient mb-6">Übungsverlauf</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-gray-400 text-center">Noch keine Übungseinheiten aufgezeichnet</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-400">{formatDate(session.date)}</span>
                      <span className="text-sm font-medium text-blue-400">{session.duration} Min.</span>
                    </div>
                    <div className="mb-2">
                      <h3 className="text-gray-200 font-medium">Geübt:</h3>
                      <p className="text-gray-300">{session.exercises}</p>
                    </div>
                    {session.notes && (
                      <div>
                        <h3 className="text-gray-200 font-medium">Notizen:</h3>
                        <p className="text-gray-400">{session.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}