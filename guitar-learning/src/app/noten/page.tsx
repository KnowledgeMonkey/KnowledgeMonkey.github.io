'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type SheetMusic = {
  id: string;
  title: string;
  composer: string;
  uploadDate: string;
  fileUrl: string;
};

export default function SheetMusicArchive() {
  const [sheetMusic, setSheetMusic] = useState<SheetMusic[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sheetMusic');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newSheet: SheetMusic = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        composer: 'Unbekannt',
        uploadDate: new Date().toISOString(),
        fileUrl: event.target?.result as string
      };

      const updatedSheets = [newSheet, ...sheetMusic];
      setSheetMusic(updatedSheets);
      localStorage.setItem('sheetMusic', JSON.stringify(updatedSheets));
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl heading-gradient">Noten-Archiv</h1>
          <Link href="/" className="btn-secondary">
            Zurück zur Übersicht
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-xl heading-gradient mb-6">Neue Noten hinzufügen</h2>
            <div className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-600 hover:border-gray-500 transition-all duration-300">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-8 text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M24 8l12 12H28v12h-8V20H12L24 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-gray-300 mb-2">Drag & Drop oder klicken zum Hochladen</p>
                <p className="text-gray-500 text-sm">PDF, JPG, JPEG, PNG</p>
              </div>
            </div>
          </div>

          {/* Sheet Music List */}
          <div className="card overflow-hidden">
            <h2 className="text-xl heading-gradient mb-6">Meine Noten</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
              {sheetMusic.length === 0 ? (
                <p className="text-gray-400 text-center">Noch keine Noten hochgeladen</p>
              ) : (
                sheetMusic.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="group p-4 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-gray-200 font-medium group-hover:text-white transition-colors duration-300">
                            {sheet.title}
                          </h3>
                          <p className="text-gray-400 text-sm">{formatDate(sheet.uploadDate)}</p>
                        </div>
                        <a
                          href={sheet.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary py-2 px-4 text-sm"
                        >
                          Öffnen
                        </a>
                      </div>
                      {sheet.fileUrl.startsWith('data:image') && (
                        <div className="w-full overflow-hidden rounded-lg border border-gray-700/30">
                          <Image
                            src={sheet.fileUrl}
                            alt={sheet.title}
                            width={400}
                            height={300}
                            className="w-full h-auto object-contain max-h-48"
                          />
                        </div>
                      )}
                    </div>
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