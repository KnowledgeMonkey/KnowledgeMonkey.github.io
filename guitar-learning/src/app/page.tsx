import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white">Gitarren-Übungs Tools</h1>
        </div>
      </nav>

      {/* Practice Tools Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Metronome */}
          <div className="card">
            <h3 className="text-2xl heading-gradient mb-4">Metronom</h3>
            <p className="text-gray-400 mb-6">Halte den Takt mit einstellbarem Tempo und Taktarten</p>
            <Link href="/metronom" className="block">
              <button className="w-full btn-primary">
                Metronom öffnen
              </button>
            </Link>
          </div>

          {/* Chord Library */}
          <div className="card">
            <h3 className="text-2xl heading-gradient mb-4">Akkord-Bibliothek</h3>
            <p className="text-gray-400 mb-6">Entdecke und lerne Gitarrenakkorde mit interaktiven Diagrammen</p>
            <Link href="/akkorde" className="block">
              <button className="w-full btn-primary">
                Akkorde ansehen
              </button>
            </Link>
          </div>

          {/* Scale Explorer */}
          <div className="card">
            <h3 className="text-2xl heading-gradient mb-4">Tonleiter-Explorer</h3>
            <p className="text-gray-400 mb-6">Lerne und übe Gitarren-Tonleitern mit visuellem Griffbrett</p>
            <Link href="/tonleiter" className="block">
              <button className="w-full btn-primary">
                Tonleitern erkunden
              </button>
            </Link>
          </div>

          {/* Sheet Music Archive */}
          <div className="card">
            <h3 className="text-2xl heading-gradient mb-4">Noten-Archiv</h3>
            <p className="text-gray-400 mb-6">Verwalte und organisiere deine Noten und Tabulaturen</p>
            <Link href="/noten" className="block">
              <button className="w-full btn-primary">
                Noten öffnen
              </button>
            </Link>
          </div>

          {/* Practice Log */}
          <div className="card">
            <h3 className="text-2xl heading-gradient mb-4">Übungs-Protokoll</h3>
            <p className="text-gray-400 mb-6">Verfolge deine Übungseinheiten und Fortschritte</p>
            <Link href="/uebungsprotokoll" className="block">
              <button className="w-full btn-primary">
                Protokoll ansehen
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

