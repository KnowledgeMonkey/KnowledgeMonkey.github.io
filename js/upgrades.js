// upgrades.js – Alle Epochen, je 15 Upgrades

const ERA_STONE_AGE = 'Steinzeit';
const ERA_BRONZE    = 'Bronzezeit';
const ERA_MEDIEVAL  = 'Mittelalter';
const ERA_INDUSTRY  = 'Industrialisierung';
const ERA_MODERN    = 'Moderne';
const ERA_FUTURE    = 'Zukunft';
const ERA_SCIFI     = 'Sci-Fi';
const ERA_ALIEN     = 'Alien';

// ========================= UPGRADE-DEFINITIONEN =============================
const UPGRADE_DEFS = {
  // ---------------------- STEINZEIT (15) -----------------------------------
  [ERA_STONE_AGE]: [
    { id: 'stone_pickaxe',   name: 'Steinpickel',          desc: '+1 pro Klick',                 baseCost: 40,      costScale: 1.18, type: 'perClickAdd', amount: 1   },
    { id: 'campfire',        name: 'Lagerfeuer',           desc: '+0.05 pro Sekunde',            baseCost: 60,      costScale: 1.16, type: 'perSecAdd',   amount: 0.05},
    { id: 'gatherer',        name: 'Sammler',              desc: '+0.25 pro Sekunde',            baseCost: 120,     costScale: 1.18, type: 'perSecAdd',   amount: 0.25},
    { id: 'small_quarry',    name: 'Kleiner Steinbruch',   desc: '+1 pro Sekunde',               baseCost: 400,     costScale: 1.20, type: 'perSecAdd',   amount: 1   },
    { id: 'sharpened_tools', name: 'Geschärfte Werkzeuge', desc: 'x1.5 Klick-Multiplikator',     baseCost: 800,     costScale: 1.25, type: 'perClickMult',amount: 1.5 },
    { id: 'tribe_helpers',   name: 'Stammeshelfer',        desc: '+2 pro Sekunde',               baseCost: 1200,    costScale: 1.22, type: 'perSecAdd',   amount: 2   },
    { id: 'bone_tools',      name: 'Knochenwerkzeuge',     desc: '+3 pro Klick',                 baseCost: 2000,    costScale: 1.22, type: 'perClickAdd', amount: 3   },
    { id: 'hut_camp',        name: 'Hüttendorf',           desc: '+4 pro Sekunde',               baseCost: 3500,    costScale: 1.23, type: 'perSecAdd',   amount: 4   },
    { id: 'ritual',          name: 'Schamanenritual',      desc: 'x1.6 Sek.-Multiplikator',      baseCost: 6000,    costScale: 1.25, type: 'perSecMult',  amount: 1.6 },
    { id: 'stone_axe',       name: 'Steinaxt',             desc: '+6 pro Klick',                 baseCost: 9000,    costScale: 1.24, type: 'perClickAdd', amount: 6   },
    { id: 'pit_mine',        name: 'Grubenschacht',        desc: '+12 pro Sekunde',              baseCost: 15000,   costScale: 1.26, type: 'perSecAdd',   amount: 12  },
    { id: 'trade_post',      name: 'Tauschplatz',          desc: 'x1.4 Klick-Multiplikator',     baseCost: 22000,   costScale: 1.28, type: 'perClickMult',amount: 1.4 },
    { id: 'totem',           name: 'Totem der Ahnen',      desc: 'x1.3 Sek.-Multiplikator',      baseCost: 35000,   costScale: 1.28, type: 'perSecMult',  amount: 1.3 },
    { id: 'pack_animals',    name: 'Lasttiere',            desc: '+25 pro Sekunde',              baseCost: 52000,   costScale: 1.30, type: 'perSecAdd',   amount: 25  },
    { id: 'chieftain',       name: 'Häuptlingssegen',      desc: 'x1.25 Klick & Sek.',           baseCost: 80000,   costScale: 1.32, type: 'dualMult',    amount: 1.25},
  ],

  // ---------------------- BRONZEZEIT (15) ----------------------------------
  [ERA_BRONZE]: [
    { id: 'bronze_pick',     name: 'Bronzepickel',         desc: '+10 pro Klick',                baseCost: 120000,  costScale: 1.22, type: 'perClickAdd', amount: 10   },
    { id: 'copper_mine',     name: 'Kupfermine',           desc: '+40 pro Sekunde',              baseCost: 160000,  costScale: 1.22, type: 'perSecAdd',   amount: 40   },
    { id: 'tin_mine',        name: 'Zinnmine',             desc: '+40 pro Sekunde',              baseCost: 160000,  costScale: 1.22, type: 'perSecAdd',   amount: 40   },
    { id: 'bronze_forge',    name: 'Bronzeschmiede',       desc: 'x1.6 Sek.-Multiplikator',      baseCost: 260000,  costScale: 1.24, type: 'perSecMult',  amount: 1.6  },
    { id: 'iron_tools',      name: 'Eisenwerkzeuge',       desc: 'x1.8 Klick-Multiplikator',     baseCost: 300000,  costScale: 1.26, type: 'perClickMult',amount: 1.8  },
    { id: 'caravans',        name: 'Karawanen',            desc: '+150 pro Sekunde',             baseCost: 420000,  costScale: 1.24, type: 'perSecAdd',   amount: 150  },
    { id: 'coinage',         name: 'Münzprägung',          desc: 'x1.35 Klick & Sek.',           baseCost: 650000,  costScale: 1.27, type: 'dualMult',    amount: 1.35 },
    { id: 'stone_quarry_b',  name: 'Steinbruch (Antik)',   desc: '+300 pro Sekunde',             baseCost: 900000,  costScale: 1.26, type: 'perSecAdd',   amount: 300  },
    { id: 'iron_pick',       name: 'Eisenpickel',          desc: '+50 pro Klick',                baseCost: 1200000, costScale: 1.28, type: 'perClickAdd', amount: 50   },
    { id: 'oxen_power',      name: 'Ochsengespanne',       desc: 'x1.4 Sek.-Multiplikator',      baseCost: 1600000, costScale: 1.28, type: 'perSecMult',  amount: 1.4  },
    { id: 'great_forge',     name: 'Großschmiede',         desc: '+1200 pro Sekunde',            baseCost: 2400000, costScale: 1.30, type: 'perSecAdd',   amount: 1200 },
    { id: 'legion_contract', name: 'Legionsauftrag',       desc: '+120 pro Klick',               baseCost: 3200000, costScale: 1.30, type: 'perClickAdd', amount: 120  },
    { id: 'roads',           name: 'Steinstraßen',         desc: 'x1.45 Klick & Sek.',           baseCost: 4200000, costScale: 1.31, type: 'dualMult',    amount: 1.45 },
    { id: 'aqueducts',       name: 'Aquädukte',            desc: 'x1.35 Sek.-Multiplikator',     baseCost: 6000000, costScale: 1.32, type: 'perSecMult',  amount: 1.35 },
    { id: 'empire_tax',      name: 'Imperialer Tribut',    desc: '+4000 pro Sekunde',            baseCost: 8500000, costScale: 1.33, type: 'perSecAdd',   amount: 4000 },
  ],

  // ---------------------- MITTELALTER (15) ---------------------------------
  [ERA_MEDIEVAL]: [
    { id: 'steel_pick',      name: 'Stahlpickel',          desc: '+300 pro Klick',               baseCost: 12e6,    costScale: 1.24, type: 'perClickAdd', amount: 300    },
    { id: 'royal_mines',     name: 'Königliche Minen',     desc: '+8000 pro Sekunde',            baseCost: 18e6,    costScale: 1.26, type: 'perSecAdd',   amount: 8000   },
    { id: 'water_wheels',    name: 'Wasserräder',          desc: 'x1.6 Sek.-Multiplikator',      baseCost: 26e6,    costScale: 1.27, type: 'perSecMult',  amount: 1.6    },
    { id: 'guild_tools',     name: 'Zunftwerkzeuge',       desc: 'x2.0 Klick-Multiplikator',     baseCost: 40e6,    costScale: 1.28, type: 'perClickMult',amount: 2.0    },
    { id: 'alchemist',       name: 'Alchemist',            desc: '+25k pro Sekunde',             baseCost: 56e6,    costScale: 1.29, type: 'perSecAdd',   amount: 25_000 },
    { id: 'trade_league',    name: 'Handelsliga',          desc: 'x1.5 Klick & Sek.',            baseCost: 80e6,    costScale: 1.30, type: 'dualMult',    amount: 1.5    },
    { id: 'deep_shafts',     name: 'Tiefe Schächte',       desc: '+90k pro Sekunde',             baseCost: 120e6,   costScale: 1.31, type: 'perSecAdd',   amount: 90_000 },
    { id: 'coin_mint',       name: 'Münzstätte',           desc: '+1200 pro Klick',              baseCost: 170e6,   costScale: 1.31, type: 'perClickAdd', amount: 1_200  },
    { id: 'cathedral_contract',name:'Kathedralenauftrag',  desc: 'x1.45 Sek.-Multiplikator',     baseCost: 240e6,   costScale: 1.32, type: 'perSecMult',  amount: 1.45   },
    { id: 'mercenaries',     name: 'Söldner',              desc: 'x1.7 Klick-Multiplikator',     baseCost: 340e6,   costScale: 1.33, type: 'perClickMult',amount: 1.7    },
    { id: 'silver_veins',    name: 'Silberadern',          desc: '+300k pro Sekunde',            baseCost: 480e6,   costScale: 1.34, type: 'perSecAdd',   amount: 300_000},
    { id: 'caravanserai',    name: 'Karawanserei',         desc: 'x1.55 Klick & Sek.',           baseCost: 700e6,   costScale: 1.35, type: 'dualMult',    amount: 1.55   },
    { id: 'blast_powder',    name: 'Schießpulver',         desc: '+6000 pro Klick',              baseCost: 1e9,     costScale: 1.36, type: 'perClickAdd', amount: 6_000  },
    { id: 'royal_decree',    name: 'Königlicher Erlass',   desc: 'x1.5 Sek.-Multiplikator',      baseCost: 1.6e9,   costScale: 1.37, type: 'perSecMult',  amount: 1.5    },
    { id: 'grand_guild',     name: 'Große Gilde',          desc: '+1.2M pro Sekunde',            baseCost: 2.4e9,   costScale: 1.38, type: 'perSecAdd',   amount: 1_200_000 },
  ],

  // ---------------------- INDUSTRIALISIERUNG (15) --------------------------
  [ERA_INDUSTRY]: [
    { id: 'steam_drill',     name: 'Dampfbohrer',          desc: '+50k pro Klick',               baseCost: 6e9,     costScale: 1.26, type: 'perClickAdd', amount: 50_000 },
    { id: 'coal_plant',      name: 'Kohlekraftwerk',       desc: '+4M pro Sekunde',              baseCost: 9e9,     costScale: 1.27, type: 'perSecAdd',   amount: 4_000_000 },
    { id: 'rail_logistics',  name: 'Eisenbahnlogistik',    desc: 'x1.7 Sek.-Multiplikator',      baseCost: 14e9,    costScale: 1.28, type: 'perSecMult',  amount: 1.7     },
    { id: 'steel_foundry',   name: 'Stahlwerk',            desc: 'x2.2 Klick-Multiplikator',     baseCost: 22e9,    costScale: 1.30, type: 'perClickMult',amount: 2.2     },
    { id: 'assembly_line',   name: 'Fließbänder',          desc: '+15M pro Sekunde',             baseCost: 34e9,    costScale: 1.30, type: 'perSecAdd',   amount: 15_000_000 },
    { id: 'telegraph',       name: 'Telegrafennetz',       desc: 'x1.6 Klick & Sek.',            baseCost: 52e9,    costScale: 1.31, type: 'dualMult',    amount: 1.6     },
    { id: 'deep_mining',     name: 'Tiefbohrung',          desc: '+60M pro Sekunde',             baseCost: 78e9,    costScale: 1.32, type: 'perSecAdd',   amount: 60_000_000 },
    { id: 'tnt',             name: 'Sprengstoff',          desc: '+1.2M pro Klick',              baseCost: 120e9,   costScale: 1.33, type: 'perClickAdd', amount: 1_200_000 },
    { id: 'refinery',        name: 'Raffinerie',           desc: 'x1.55 Sek.-Multiplikator',     baseCost: 180e9,   costScale: 1.34, type: 'perSecMult',  amount: 1.55    },
    { id: 'share_market',    name: 'Aktienmarkt',          desc: 'x1.9 Klick-Multiplikator',     baseCost: 260e9,   costScale: 1.35, type: 'perClickMult',amount: 1.9     },
    { id: 'electrification', name: 'Elektrifizierung',     desc: '+220M pro Sekunde',            baseCost: 380e9,   costScale: 1.36, type: 'perSecAdd',   amount: 220_000_000 },
    { id: 'global_trade',    name: 'Globaler Handel',      desc: 'x1.65 Klick & Sek.',           baseCost: 560e9,   costScale: 1.37, type: 'dualMult',    amount: 1.65    },
    { id: 'bessemer',        name: 'Bessemer-Verfahren',   desc: '+18M pro Klick',               baseCost: 820e9,   costScale: 1.38, type: 'perClickAdd', amount: 18_000_000 },
    { id: 'diesel_motors',   name: 'Dieselmotoren',        desc: 'x1.6 Sek.-Multiplikator',      baseCost: 1.2e12,  costScale: 1.40, type: 'perSecMult',  amount: 1.6     },
    { id: 'megafactory',     name: 'Megafabrik',           desc: '+1.2B pro Sekunde',            baseCost: 1.8e12,  costScale: 1.42, type: 'perSecAdd',   amount: 1_200_000_000 },
  ],

  // ---------------------- MODERNE (15) -------------------------------------
  [ERA_MODERN]: [
    { id: 'hydraulic_drill', name: 'Hydraulikbohrer',      desc: '+120M pro Klick',              baseCost: 4e12,    costScale: 1.28, type: 'perClickAdd', amount: 120_000_000 },
    { id: 'open_pit',        name: 'Tagebau XXL',          desc: '+6B pro Sekunde',              baseCost: 6e12,    costScale: 1.30, type: 'perSecAdd',   amount: 6_000_000_000 },
    { id: 'automation',      name: 'Automatisierung',      desc: 'x1.8 Sek.-Multiplikator',      baseCost: 9e12,    costScale: 1.31, type: 'perSecMult',  amount: 1.8 },
    { id: 'cnc_tools',       name: 'CNC-Werkzeuge',        desc: 'x2.4 Klick-Multiplikator',     baseCost: 14e12,   costScale: 1.32, type: 'perClickMult',amount: 2.4 },
    { id: 'sat_comms',       name: 'Satellitenkommunikation',desc:'+22B pro Sekunde',            baseCost: 22e12,   costScale: 1.33, type: 'perSecAdd',   amount: 22_000_000_000 },
    { id: 'lean_ops',        name: 'Lean Operations',      desc: 'x1.75 Klick & Sek.',           baseCost: 34e12,   costScale: 1.34, type: 'dualMult',    amount: 1.75 },
    { id: 'rare_earths',     name: 'Seltene Erden',        desc: '+95B pro Sekunde',             baseCost: 52e12,   costScale: 1.35, type: 'perSecAdd',   amount: 95_000_000_000 },
    { id: 'diamond_bits',    name: 'Diamantbohrer',        desc: '+1.8B pro Klick',              baseCost: 78e12,   costScale: 1.36, type: 'perClickAdd', amount: 1_800_000_000 },
    { id: 'smart_grid',      name: 'Smart Grid',           desc: 'x1.65 Sek.-Multiplikator',     baseCost: 120e12,  costScale: 1.37, type: 'perSecMult',  amount: 1.65 },
    { id: 'hedge_fund',      name: 'Rohstoff-Hedgefonds',  desc: 'x2.1 Klick-Multiplikator',     baseCost: 180e12,  costScale: 1.38, type: 'perClickMult',amount: 2.1 },
    { id: 'drone_swarms',    name: 'Drohnen-Schwärme',     desc: '+380B pro Sekunde',            baseCost: 260e12,  costScale: 1.39, type: 'perSecAdd',   amount: 380_000_000_000 },
    { id: 'global_sourcing', name: 'Global Sourcing',      desc: 'x1.8 Klick & Sek.',            baseCost: 380e12,  costScale: 1.40, type: 'dualMult',    amount: 1.8 },
    { id: 'nanocoatings',    name: 'Nanobeschichtungen',   desc: '+28B pro Klick',               baseCost: 560e12,  costScale: 1.41, type: 'perClickAdd', amount: 28_000_000_000 },
    { id: 'fusion_research', name: 'Fusionsforschung',     desc: 'x1.7 Sek.-Multiplikator',      baseCost: 820e12,  costScale: 1.42, type: 'perSecMult',  amount: 1.7 },
    { id: 'super_consort',   name: 'Super-Konsortium',     desc: '+3.2T pro Sekunde',            baseCost: 1.2e15,  costScale: 1.44, type: 'perSecAdd',   amount: 3_200_000_000_000 },
  ],

  // ---------------------- ZUKUNFT (15) -------------------------------------
  [ERA_FUTURE]: [
    { id: 'quantum_pick',    name: 'Quantenpickel',        desc: '+160B pro Klick',              baseCost: 2e15,    costScale: 1.30, type: 'perClickAdd', amount: 160_000_000_000 },
    { id: 'autofab_mines',   name: 'Autofab-Minen',        desc: '+18T pro Sekunde',             baseCost: 3e15,    costScale: 1.32, type: 'perSecAdd',   amount: 18_000_000_000_000 },
    { id: 'ai_optim',        name: 'KI-Optimierung',       desc: 'x2.0 Sek.-Multiplikator',      baseCost: 4.5e15,  costScale: 1.34, type: 'perSecMult',  amount: 2.0 },
    { id: 'quantum_click',   name: 'Quanten-Klicklogik',   desc: 'x2.6 Klick-Multiplikator',     baseCost: 7e15,    costScale: 1.35, type: 'perClickMult',amount: 2.6 },
    { id: 'exo_refinery',    name: 'Exo-Raffinerie',       desc: '+70T pro Sekunde',             baseCost: 10e15,   costScale: 1.36, type: 'perSecAdd',   amount: 70_000_000_000_000 },
    { id: 'self_heal',       name: 'Selbstheilende Systeme',desc:'x1.9 Klick & Sek.',            baseCost: 15e15,   costScale: 1.36, type: 'dualMult',    amount: 1.9 },
    { id: 'orbital_lifts',   name: 'Orbitaufzüge',         desc: '+210T pro Sekunde',            baseCost: 22e15,   costScale: 1.37, type: 'perSecAdd',   amount: 210_000_000_000_000 },
    { id: 'quantum_tap',     name: 'Quanten-Tap',          desc: '+3.2T pro Klick',              baseCost: 34e15,   costScale: 1.38, type: 'perClickAdd', amount: 3_200_000_000_000 },
    { id: 'synch_farms',     name: 'Synchro-Farmen',       desc: 'x1.8 Sek.-Multiplikator',      baseCost: 50e15,   costScale: 1.39, type: 'perSecMult',  amount: 1.8 },
    { id: 'neuro_brokers',   name: 'Neuro-Broker',         desc: 'x2.4 Klick-Multiplikator',     baseCost: 75e15,   costScale: 1.40, type: 'perClickMult',amount: 2.4 },
    { id: 'planetary_nets',  name: 'Planetare Netze',      desc: '+900T pro Sekunde',            baseCost: 110e15,  costScale: 1.41, type: 'perSecAdd',   amount: 900_000_000_000_000 },
    { id: 'supply_swarm',    name: 'Supply-Schwarm',       desc: 'x2.0 Klick & Sek.',            baseCost: 160e15,  costScale: 1.42, type: 'dualMult',    amount: 2.0 },
    { id: 'muon_harvest',    name: 'Myonen-Ernte',         desc: '+85T pro Klick',               baseCost: 220e15,  costScale: 1.43, type: 'perClickAdd', amount: 85_000_000_000_000 },
    { id: 'fusion_grid',     name: 'Fusionsnetz',          desc: 'x1.9 Sek.-Multiplikator',      baseCost: 320e15,  costScale: 1.44, type: 'perSecMult',  amount: 1.9 },
    { id: 'terraform_ops',   name: 'Terraform-Operationen',desc:'+8.5Q pro Sekunde',             baseCost: 480e15,  costScale: 1.46, type: 'perSecAdd',   amount: 8_500_000_000_000_000 },
  ],

  // ---------------------- SCI-FI (15) --------------------------------------
  [ERA_SCIFI]: [
    { id: 'laser_excav',     name: 'Laser-Excavation',     desc: '+1.6T pro Klick',              baseCost: 1.2e18,  costScale: 1.32, type: 'perClickAdd', amount: 1_600_000_000_000 },
    { id: 'asteroid_belt',   name: 'Asteroidengürtel-Mine',desc: '+120Q pro Sekunde',            baseCost: 1.8e18,  costScale: 1.34, type: 'perSecAdd',   amount: 120_000_000_000_000_000 },
    { id: 'grav_conveyors',  name: 'Grav-Förderer',        desc: 'x2.2 Sek.-Multiplikator',      baseCost: 2.6e18,  costScale: 1.35, type: 'perSecMult',  amount: 2.2 },
    { id: 'phase_click',     name: 'Phasen-Klick',         desc: 'x3.0 Klick-Multiplikator',     baseCost: 3.8e18,  costScale: 1.36, type: 'perClickMult',amount: 3.0 },
    { id: 'ring_refineries', name: 'Ring-Raffinerien',     desc: '+480Q pro Sekunde',            baseCost: 5.6e18,  costScale: 1.37, type: 'perSecAdd',   amount: 480_000_000_000_000_000 },
    { id: 'warp_ops',        name: 'Warp-Operationen',     desc: 'x2.1 Klick & Sek.',            baseCost: 8.4e18,  costScale: 1.38, type: 'dualMult',    amount: 2.1 },
    { id: 'ion_drills',      name: 'Ionenbohrer',          desc: '+1.8Q pro Klick',              baseCost: 12e18,   costScale: 1.39, type: 'perClickAdd', amount: 1_800_000_000_000_000 },
    { id: 'orbital_quarries',name: 'Orbitale Steinbrüche', desc: '+1.9Qd pro Sekunde',           baseCost: 18e18,   costScale: 1.40, type: 'perSecAdd',   amount: 1_900_000_000_000_000_000 },
    { id: 'singularity_cache',name:'Singularitäts-Cache',  desc: 'x2.0 Sek.-Multiplikator',      baseCost: 26e18,   costScale: 1.41, type: 'perSecMult',  amount: 2.0 },
    { id: 'quantum_brokers', name: 'Quanten-Broker',       desc: 'x3.2 Klick-Multiplikator',     baseCost: 38e18,   costScale: 1.42, type: 'perClickMult',amount: 3.2 },
    { id: 'dark_matter_rigs',name: 'Dunkelmaterie-Rigs',   desc: '+8Qd pro Sekunde',             baseCost: 56e18,   costScale: 1.43, type: 'perSecAdd',   amount: 8_000_000_000_000_000_000 },
    { id: 'subspace_depots', name: 'Subraum-Depots',       desc: 'x2.2 Klick & Sek.',            baseCost: 84e18,   costScale: 1.44, type: 'dualMult',    amount: 2.2 },
    { id: 'neutrino_pick',   name: 'Neutrino-Pickel',      desc: '+90Q pro Klick',               baseCost: 120e18,  costScale: 1.45, type: 'perClickAdd', amount: 90_000_000_000_000_000 },
    { id: 'fusion_rings',    name: 'Fusionsringe',         desc: 'x2.1 Sek.-Multiplikator',      baseCost: 180e18,  costScale: 1.46, type: 'perSecMult',  amount: 2.1 },
    { id: 'stellar_docks',   name: 'Stellare Dockyards',   desc: '+120Qd pro Sekunde',           baseCost: 260e18,  costScale: 1.48, type: 'perSecAdd',   amount: 120_000_000_000_000_000_000 },
  ],

  // ---------------------- ALIEN (15) ---------------------------------------
  [ERA_ALIEN]: [
    { id: 'xeno_synapse',    name: 'Xeno-Synapse',         desc: '+1Qd pro Klick',               baseCost: 1e21,    costScale: 1.36, type: 'perClickAdd', amount: 1_000_000_000_000_000_000 },
    { id: 'void_farms',      name: 'Leerenfarmen',         desc: '+160Qd pro Sekunde',           baseCost: 1.6e21,  costScale: 1.38, type: 'perSecAdd',   amount: 160_000_000_000_000_000_000 },
    { id: 'psionic_mesh',    name: 'Psionisches Netz',     desc: 'x2.6 Sek.-Multiplikator',      baseCost: 2.4e21,  costScale: 1.40, type: 'perSecMult',  amount: 2.6 },
    { id: 'mind_click',      name: 'Geist-Klick',          desc: 'x3.6 Klick-Multiplikator',     baseCost: 3.6e21,  costScale: 1.42, type: 'perClickMult',amount: 3.6 },
    { id: 'wormhole_quarry', name: 'Wurmloch-Steinbruch',  desc: '+700Qd pro Sekunde',           baseCost: 5.4e21,  costScale: 1.42, type: 'perSecAdd',   amount: 700_000_000_000_000_000_000 },
    { id: 'chronal_vaults',  name: 'Chrono-Kammern',       desc: 'x2.4 Klick & Sek.',            baseCost: 8.1e21,  costScale: 1.43, type: 'dualMult',    amount: 2.4 },
    { id: 'singularity_auger',name:'Singularitätsbohrer',  desc: '+12Qd pro Klick',              baseCost: 12e21,   costScale: 1.44, type: 'perClickAdd', amount: 12_000_000_000_000_000_000 },
    { id: 'void_refineries', name: 'Leeren-Raffinerien',   desc: '+3Sx pro Sekunde',             baseCost: 18e21,   costScale: 1.45, type: 'perSecAdd',   amount: 3_000_000_000_000_000_000_000_000 },
    { id: 'entropy_loops',   name: 'Entropie-Schleifen',   desc: 'x2.3 Sek.-Multiplikator',      baseCost: 26e21,   costScale: 1.46, type: 'perSecMult',  amount: 2.3 },
    { id: 'axiom_click',     name: 'Axiom-Klick',          desc: 'x4.0 Klick-Multiplikator',     baseCost: 39e21,   costScale: 1.47, type: 'perClickMult',amount: 4.0 },
    { id: 'star_siphons',    name: 'Sternensiphons',       desc: '+12Sx pro Sekunde',            baseCost: 58e21,   costScale: 1.48, type: 'perSecAdd',   amount: 12_000_000_000_000_000_000_000_000 },
    { id: 'lattice_of_law',  name: 'Kosmisches Gitter',    desc: 'x2.6 Klick & Sek.',            baseCost: 85e21,   costScale: 1.49, type: 'dualMult',    amount: 2.6 },
    { id: 'vacuum_harvest',  name: 'Vakuumerntung',        desc: '+220Qd pro Klick',             baseCost: 120e21,  costScale: 1.50, type: 'perClickAdd', amount: 220_000_000_000_000_000_000 },
    { id: 'omega_singularity',name:'Omega-Singularität',   desc: 'x2.5 Sek.-Multiplikator',      baseCost: 180e21,  costScale: 1.52, type: 'perSecMult',  amount: 2.5 },
    { id: 'multiverse_trust',name: 'Multiversum-Trust',    desc: '+150Sx pro Sekunde',           baseCost: 260e21,  costScale: 1.54, type: 'perSecAdd',   amount: 150_000_000_000_000_000_000_000_000 },
  ],
};

// ===================== HILFSFUNKTIONEN & EXPORTED API =======================
function getOwned(state, id){ return state.upgrades.owned[id] ?? 0; }

function nextCost(def, owned){
  const cost = def.baseCost * Math.pow(def.costScale, owned);
  return Math.round(cost * 100) / 100;
}

function getEraUpgrades(state){ return UPGRADE_DEFS[state.era] ?? []; }

export function initUpgradesState(state){
  if (!state.upgrades) state.upgrades = { owned: {} };
}

export function listVisibleUpgrades(state){
  return getEraUpgrades(state);
}

export function canAfford(state, cost){
  return (state.resources.stone || 0) >= cost;
}

export function tryBuyUpgrade(state, upgradeId){
  const defs = getEraUpgrades(state);
  const def = defs.find(u => u.id === upgradeId);
  if (!def) return { ok: false, reason: 'not_found' };

  const owned = getOwned(state, upgradeId);
  const cost = nextCost(def, owned);
  if (!canAfford(state, cost)) return { ok: false, reason: 'money' };

  state.resources.stone -= cost;
  state.upgrades.owned[upgradeId] = owned + 1;

  computeDerivedStats(state);
  return { ok: true, newOwned: state.upgrades.owned[upgradeId], costPaid: cost };
}

export function nextCostFor(state, upgradeId){
  const defs = getEraUpgrades(state);
  const def = defs.find(u => u.id === upgradeId);
  if (!def) return Infinity;
  return nextCost(def, getOwned(state, upgradeId));
}

// Stats aus Upgrades berechnen (perClick, perSec)
export function computeDerivedStats(state){
  let perClick = 1;
  let perSec = 0;

  let clickMult = 1;
  let secMult = 1;
  let dualMult = 1;

  const defs = getEraUpgrades(state);
  for (const def of defs){
    const owned = getOwned(state, def.id);
    if (!owned) continue;
    switch(def.type){
      case 'perClickAdd': perClick += def.amount * owned; break;
      case 'perSecAdd':   perSec   += def.amount * owned; break;
      case 'perClickMult': clickMult *= Math.pow(def.amount, owned); break;
      case 'perSecMult':   secMult   *= Math.pow(def.amount, owned); break;
      case 'dualMult':     dualMult  *= Math.pow(def.amount, owned); break;
    }
  }

  perClick *= clickMult * dualMult;
  perSec   *= secMult   * dualMult;

  // globaler permanenter Boost (aus Evolution)
  const g = state.bonus?.globalMult || 1;
  perClick *= g;
  perSec   *= g;

  state.perClick = Math.max(0, Math.round(perClick * 1000) / 1000);
  state.perSec   = Math.max(0, Math.round(perSec   * 1000) / 1000);
}
