export type KnowledgeLabel = 'FACT' | 'SIMPLIFIED' | 'FICTIONAL';
export type MaterialState = 'solid' | 'powder' | 'liquid' | 'gas' | 'energy' | 'fictional';

export type Material = {
  id: string;
  name: string;
  category: string;
  state: MaterialState;
  color: string;
  density: number;
  label: KnowledgeLabel;
  note: string;
};

const material = (
  id: string,
  name: string,
  category: string,
  state: MaterialState,
  color: string,
  density: number,
  label: KnowledgeLabel = 'SIMPLIFIED',
  note = 'Behavior is a playable approximation, not a laboratory prediction.',
): Material => ({ id, name, category, state, color, density, label, note });

export const MATERIALS: Material[] = [
  material('sand', 'Sand', 'Powders', 'powder', '#efb95f', 16, 'FACT', 'Granular matter settles under gravity and forms slopes.'),
  material('salt', 'Salt', 'Powders', 'powder', '#e8e5dc', 15, 'FACT', 'Salt crystals can dissolve in water.'),
  material('glass', 'Glass', 'Solids', 'solid', '#89d9e8', 22), material('ceramic', 'Ceramic', 'Solids', 'solid', '#dfd0b8', 24),
  material('graphite', 'Graphite', 'Solids', 'solid', '#59616b', 18, 'FACT', 'Graphite conducts because some electrons can move through its layered structure.'),
  material('fiber', 'Fiber', 'Solids', 'solid', '#d7b17a', 9), material('stone', 'Stone', 'Solids', 'solid', '#7e8791', 28),
  material('clay', 'Clay', 'Powders', 'powder', '#af654a', 17), material('chalk', 'Chalk', 'Powders', 'powder', '#f0eadb', 13),
  material('charcoal', 'Charcoal', 'Powders', 'powder', '#30343b', 8), material('wax', 'Wax', 'Solids', 'solid', '#f5d986', 7),
  material('rubber', 'Rubber', 'Solids', 'solid', '#433e48', 10), material('ice', 'Ice', 'Solids', 'solid', '#a8e6ff', 9, 'FACT', 'Ice is solid water and is less dense than liquid water.'),
  material('crystal', 'Crystal', 'Solids', 'solid', '#cbb8ff', 19),
  material('water', 'Water', 'Liquids', 'liquid', '#43b8f5', 10, 'FACT', 'Liquid water flows and can change phase with temperature.'),
  material('oil', 'Oil', 'Liquids', 'liquid', '#dfb442', 7, 'FACT', 'Many oils are less dense than water and do not mix readily with it.'),
  material('slime', 'Slime', 'Liquids', 'liquid', '#82dd6e', 12, 'FICTIONAL', 'This bright slime is a game material.'),
  material('dye-cyan', 'Cyan Dye', 'Liquids', 'liquid', '#17d7d0', 10), material('dye-pink', 'Pink Dye', 'Liquids', 'liquid', '#ef76bd', 10),
  material('coolant', 'Coolant', 'Liquids', 'liquid', '#72e5ff', 11, 'FICTIONAL'), material('syrup', 'Syrup', 'Liquids', 'liquid', '#bd662f', 14),
  material('milk', 'Milk', 'Liquids', 'liquid', '#fff5da', 10), material('ink', 'Ink', 'Liquids', 'liquid', '#343d8e', 11),
  material('bubble-liquid', 'Bubble Mix', 'Liquids', 'liquid', '#9af6d3', 9), material('lava', 'Game Lava', 'Liquids', 'liquid', '#ff623d', 25, 'FICTIONAL'),
  material('liquid-metal', 'Liquid Metal', 'Liquids', 'liquid', '#aab7c1', 36, 'FICTIONAL'),
  material('air', 'Air', 'Gases', 'gas', '#d9f4ff', 1, 'SIMPLIFIED'), material('steam', 'Steam', 'Gases', 'gas', '#d8f4ff', 1, 'FACT', 'Water vapor is the gaseous phase of water; visible mist is tiny droplets.'),
  material('carbon-dioxide', 'Carbon Dioxide', 'Gases', 'gas', '#c8ced6', 2, 'FACT', 'Carbon dioxide diffuses through air.'),
  material('game-stink', 'Stink Cloud', 'Gases', 'gas', '#a6d85e', 2, 'FICTIONAL', 'A comic gas cloud; never a real recipe.'),
  material('helium', 'Helium', 'Gases', 'gas', '#d6adff', 1, 'FACT', 'Helium is less dense than air at the same conditions.'),
  material('fog', 'Fog', 'Gases', 'gas', '#a9c4d4', 1, 'SIMPLIFIED'), material('smoke', 'Smoke', 'Gases', 'gas', '#65707d', 2, 'SIMPLIFIED'),
  material('music-air', 'Music Air', 'Gases', 'gas', '#f5a7f2', 1, 'FICTIONAL'),
  material('iron', 'Iron', 'Metals', 'solid', '#78818b', 38, 'FACT', 'Iron conducts heat and electricity.'), material('copper', 'Copper', 'Metals', 'solid', '#e27d43', 40, 'FACT', 'Copper is a strong electrical conductor.'),
  material('steel', 'Steel', 'Metals', 'solid', '#9ba4ae', 39), material('silver', 'Silver', 'Metals', 'solid', '#e3edf2', 41),
  material('aluminum', 'Aluminum', 'Metals', 'solid', '#bbc6ce', 25), material('wire', 'Wire', 'Metals', 'solid', '#f19a53', 30),
  material('heater-coil', 'Heater Coil', 'Metals', 'solid', '#ff784f', 32), material('metal-mesh', 'Metal Mesh', 'Metals', 'solid', '#8d9aa5', 24),
  material('magnet', 'Magnet', 'Metals', 'solid', '#e85c73', 32), material('battery', 'Battery', 'Metals', 'energy', '#f4da57', 29, 'SIMPLIFIED'),
  material('hair-fiber', 'Hair Fiber', 'Living-ish', 'solid', '#b27e58', 5, 'SIMPLIFIED', 'A polymer-fiber abstraction, not a model of a human body.'),
  material('wood', 'Wood', 'Living-ish', 'solid', '#9a663e', 8), material('seed', 'Seed', 'Living-ish', 'solid', '#93be5c', 6),
  material('plant', 'Plant', 'Living-ish', 'solid', '#50b85d', 5), material('food-gel', 'Food Gel', 'Living-ish', 'solid', '#e79068', 9),
  material('microbe', 'Friendly Microbe', 'Living-ish', 'solid', '#c17af2', 3, 'FICTIONAL'), material('paper', 'Paper', 'Living-ish', 'solid', '#ede4ce', 4),
  material('cork', 'Cork', 'Living-ish', 'solid', '#bf8d5b', 4),
  material('sponge', 'Sponge', 'Living-ish', 'solid', '#f0cd51', 4), material('compost', 'Compost', 'Living-ish', 'powder', '#5c4934', 9),
  material('heat', 'Heat', 'Energy', 'energy', '#ff5d3b', 0, 'SIMPLIFIED'), material('cold', 'Cold', 'Energy', 'energy', '#70d9ff', 0, 'SIMPLIFIED'),
  material('spark', 'Spark', 'Energy', 'energy', '#ffe15d', 0, 'SIMPLIFIED'), material('acid-abstract', 'Acid Token', 'Energy', 'energy', '#b7ef55', 12, 'SIMPLIFIED', 'Abstract acidity with no concentration or handling instructions.'),
  material('base-abstract', 'Base Token', 'Energy', 'energy', '#6ad5ef', 12, 'SIMPLIFIED'), material('catalyst', 'Catalyst Token', 'Energy', 'energy', '#ef8fff', 10, 'SIMPLIFIED'),
  material('electricity', 'Charge', 'Energy', 'energy', '#ffef75', 0, 'SIMPLIFIED'), material('sound-pulse', 'Sound Pulse', 'Energy', 'energy', '#ff93da', 0, 'SIMPLIFIED'),
  material('pressure-pulse', 'Pressure Pulse', 'Energy', 'energy', '#f5aa64', 0, 'SIMPLIFIED'), material('light', 'Light', 'Energy', 'energy', '#fff7bd', 0, 'SIMPLIFIED'),
  material('rainbow-foam', 'Rainbow Foam', 'Impossible', 'fictional', '#ff7ac8', 6, 'FICTIONAL'), material('music-particle', 'Music Particle', 'Impossible', 'fictional', '#bd82ff', 2, 'FICTIONAL'),
  material('antigravity-gel', 'Up-Gel', 'Impossible', 'fictional', '#55f2c2', 5, 'FICTIONAL'), material('moon-sand', 'Moon Sand', 'Impossible', 'fictional', '#b9c6ff', 10, 'FICTIONAL'),
  material('portal-dust', 'Portal Dust', 'Impossible', 'fictional', '#8c72ff', 2, 'FICTIONAL'), material('giggle-gas', 'Giggle Gas', 'Impossible', 'fictional', '#b8ec6b', 1, 'FICTIONAL'),
  material('time-crystal', 'Time Crystal', 'Impossible', 'fictional', '#ff92a6', 20, 'FICTIONAL'), material('monster-goo', 'Monster Goo', 'Impossible', 'fictional', '#78e35e', 13, 'FICTIONAL'),
];

export const TOOLS = ['brush', 'erase', 'pick', 'heat', 'cool', 'mix', 'impact', 'charge', 'vacuum', 'copy', 'measure', 'portal'] as const;

export type Challenge = {
  id: string; number: number; title: string; prompt: string; category: string;
  allowed: string[]; hints: [string, string, string]; goal: { materialId: string; count: number };
  learningPoint: string; modelLimitations: string; fictionBoundary: string; sourceId: string;
};

const challengeSeed: Array<Omit<Challenge, 'id' | 'number' | 'hints' | 'sourceId'>> = [
  {title:'Your first sandpile',prompt:'Draw sand and watch it find a slope.',category:'Start here',allowed:['sand'],goal:{materialId:'sand',count:24},learningPoint:'Grains settle and form a stable angle.',modelLimitations:'Cells stand in for many real grains.',fictionBoundary:'No invented reaction is used.'},
  {title:'A pocket of rain',prompt:'Pour water over a little ridge.',category:'Start here',allowed:['water','sand'],goal:{materialId:'water',count:18},learningPoint:'Liquids flow toward available lower spaces.',modelLimitations:'Viscosity and pressure are simplified.',fictionBoundary:'The grid is a game-sized world.'},
  {title:'Freeze the drip',prompt:'Cool water until ice appears.',category:'Start here',allowed:['water','cold'],goal:{materialId:'ice',count:6},learningPoint:'Water changes phase when thermal energy changes.',modelLimitations:'Temperature is represented by a tool event.',fictionBoundary:'The cold token is not a real substance.'},
  {title:'Steam signal',prompt:'Warm water and catch a rising cloud.',category:'Start here',allowed:['water','heat'],goal:{materialId:'steam',count:6},learningPoint:'Water can change from liquid to gas.',modelLimitations:'Boiling pressure and temperature are omitted.',fictionBoundary:'The heat brush is an abstract control.'},
  {title:'Pause a waterfall',prompt:'Pause, place water, then advance one tick.',category:'Start here',allowed:['water','stone'],goal:{materialId:'water',count:10},learningPoint:'A fixed step lets us inspect change one moment at a time.',modelLimitations:'The simulation advances in discrete ticks.',fictionBoundary:'Ticks are a model, not time itself.'},
  {title:'Undo the spill',prompt:'Make a spill, then undo and rebuild it.',category:'Start here',allowed:['water','oil'],goal:{materialId:'oil',count:8},learningPoint:'A command log can reproduce and reverse user actions.',modelLimitations:'Undo tracks commands, not every internal event.',fictionBoundary:'No chemistry claim is made.'},
  {title:'Make a polite fart',prompt:'Combine food gel and a friendly microbe.',category:'Absurd builds',allowed:['food-gel','microbe'],goal:{materialId:'game-stink',count:6},learningPoint:'Gases spread into available space.',modelLimitations:'Biology and reaction kinetics are omitted.',fictionBoundary:'This is deliberately not a real recipe.'},
  {title:'Grow impossible hair',prompt:'Feed a seed until fibers climb upward.',category:'Absurd builds',allowed:['seed','water','hair-fiber'],goal:{materialId:'hair-fiber',count:12},learningPoint:'Fibers are long structures made from repeating units.',modelLimitations:'Growth is a visual polymer analogy.',fictionBoundary:'It does not simulate a body.'},
  {title:'Build a tiny toilet',prompt:'Shape a bowl and guide water through it.',category:'Absurd builds',allowed:['ceramic','water'],goal:{materialId:'ceramic',count:18},learningPoint:'A siphon can move liquid through a bent path.',modelLimitations:'Air pressure and pipe geometry are compressed.',fictionBoundary:'The completion detector is a game rule.'},
  {title:'Matter makes music',prompt:'Send a pulse through a metal string.',category:'Absurd builds',allowed:['wire','sound-pulse'],goal:{materialId:'music-particle',count:4},learningPoint:'Sound begins with vibration and travels through matter.',modelLimitations:'Frequency is quantized into colored pulses.',fictionBoundary:'Materials do not create melody from nothing.'},
  {title:'Rainbow laundry',prompt:'Mix two dyes into a foam cloud.',category:'Absurd builds',allowed:['dye-cyan','dye-pink','bubble-liquid'],goal:{materialId:'rainbow-foam',count:8},learningPoint:'Mixtures can combine optical effects.',modelLimitations:'Color mixing is screen-based.',fictionBoundary:'Rainbow foam is fictional.'},
  {title:'Moon-sand castle',prompt:'Stack sand that refuses to fall.',category:'Absurd builds',allowed:['moon-sand','stone'],goal:{materialId:'moon-sand',count:20},learningPoint:'Material behavior depends on interactions between particles.',modelLimitations:'Cohesion is a binary rule.',fictionBoundary:'Moon Sand here is invented.'},
  {title:'The upside-down drip',prompt:'Use Up-Gel to make matter rise.',category:'Absurd builds',allowed:['water','antigravity-gel'],goal:{materialId:'antigravity-gel',count:10},learningPoint:'Density and forces influence motion.',modelLimitations:'Only vertical cell movement is modeled.',fictionBoundary:'Anti-gravity gel is fictional.'},
  {title:'Portal plumbing',prompt:'Move water across the lab without a pipe.',category:'Absurd builds',allowed:['water','portal-dust'],goal:{materialId:'portal-dust',count:4},learningPoint:'System boundaries decide where matter may move.',modelLimitations:'Transport is an instantaneous mapping.',fictionBoundary:'Portals are fictional.'},
  {title:'Feed the monster',prompt:'Layer goo, gel, and fizz into a face.',category:'Absurd builds',allowed:['monster-goo','food-gel','giggle-gas'],goal:{materialId:'monster-goo',count:16},learningPoint:'Complex patterns can emerge from simple placement rules.',modelLimitations:'No biology is simulated.',fictionBoundary:'The monster is entirely fictional.'},
  {title:'Density stack',prompt:'Layer syrup, water, and oil.',category:'Matter school',allowed:['syrup','water','oil'],goal:{materialId:'syrup',count:12},learningPoint:'Liquids of different densities can form layers.',modelLimitations:'Mixing and surface tension are simplified.',fictionBoundary:'Stable layers are accelerated for play.'},
  {title:'Graphite path',prompt:'Bridge a battery with graphite.',category:'Matter school',allowed:['battery','graphite','electricity'],goal:{materialId:'electricity',count:4},learningPoint:'Graphite can conduct electricity.',modelLimitations:'Resistance and voltage are not numerically modeled.',fictionBoundary:'Charge is shown as a visible token.'},
  {title:'Copper circuit',prompt:'Complete a bright copper loop.',category:'Matter school',allowed:['battery','copper','light'],goal:{materialId:'light',count:4},learningPoint:'A closed conductive path allows current.',modelLimitations:'The circuit is topological, not quantitative.',fictionBoundary:'Light tokens mark success.'},
  {title:'Salt disappears',prompt:'Dissolve salt into moving water.',category:'Matter school',allowed:['salt','water'],goal:{materialId:'water',count:24},learningPoint:'Dissolving disperses ions through a solvent.',modelLimitations:'Ions are not individually represented.',fictionBoundary:'The visual disappearance is accelerated.'},
  {title:'Oil keeps its distance',prompt:'Pour oil and water into one vessel.',category:'Matter school',allowed:['oil','water','glass'],goal:{materialId:'oil',count:12},learningPoint:'Oil and water tend not to mix and can separate by density.',modelLimitations:'Emulsions are omitted.',fictionBoundary:'Separation is exaggerated.'},
  {title:'Ice afloat',prompt:'Make ice and watch where it settles.',category:'Matter school',allowed:['water','ice'],goal:{materialId:'ice',count:8},learningPoint:'Ordinary ice is less dense than liquid water.',modelLimitations:'Buoyancy is cell-based.',fictionBoundary:'Phase change timing is a game rule.'},
  {title:'Diffusion cloud',prompt:'Release dye into still water.',category:'Matter school',allowed:['water','dye-pink'],goal:{materialId:'dye-pink',count:10},learningPoint:'Particles spread from concentrated regions over time.',modelLimitations:'Diffusion is much faster than in reality.',fictionBoundary:'Colored cells are a visualization.'},
  {title:'Same carbon, new structure',prompt:'Compare graphite with a crystal lattice.',category:'Matter school',allowed:['graphite','crystal'],goal:{materialId:'crystal',count:10},learningPoint:'Structure can strongly affect properties even when elements overlap.',modelLimitations:'The crystal is a generic teaching stand-in.',fictionBoundary:'No claim that this tool manufactures diamond.'},
  {title:'Heat bridge',prompt:'Carry heat along a metal path.',category:'Matter school',allowed:['iron','heat','wax'],goal:{materialId:'heat',count:6},learningPoint:'Metals often conduct heat more readily than insulating materials.',modelLimitations:'Heat capacity is qualitative.',fictionBoundary:'Heat tokens are visible game markers.'},
  {title:'Drum skin',prompt:'Strike a stretched rubber surface.',category:'Sound & machines',allowed:['rubber','impact','sound-pulse'],goal:{materialId:'sound-pulse',count:6},learningPoint:'A struck surface vibrates and launches sound waves.',modelLimitations:'The waveform has no calibrated amplitude.',fictionBoundary:'Pulse colors are artistic.'},
  {title:'High note, low note',prompt:'Compare short and long vibrating wires.',category:'Sound & machines',allowed:['wire','sound-pulse'],goal:{materialId:'sound-pulse',count:8},learningPoint:'Vibrating length influences frequency.',modelLimitations:'Pitch uses three discrete bands.',fictionBoundary:'The score is a game melody.'},
  {title:'Switch chain',prompt:'Carry charge through a controllable path.',category:'Sound & machines',allowed:['battery','wire','metal-mesh','electricity'],goal:{materialId:'electricity',count:8},learningPoint:'Switches control whether a circuit path is complete.',modelLimitations:'No dangerous electrical values are modeled.',fictionBoundary:'Charge particles are fictional visuals.'},
  {title:'Conveyor pulse',prompt:'Move a signal from one portal to another.',category:'Sound & machines',allowed:['portal-dust','sound-pulse'],goal:{materialId:'music-particle',count:6},learningPoint:'Signals can be transformed while information persists.',modelLimitations:'Transport delay is one tick.',fictionBoundary:'Portals and music particles are fictional.'},
  {title:'Bathroom symphony',prompt:'Build a siphon that triggers a note.',category:'Final mixes',allowed:['ceramic','water','wire','sound-pulse'],goal:{materialId:'music-particle',count:8},learningPoint:'Structures can couple fluid motion to vibration.',modelLimitations:'Coupling is event-based.',fictionBoundary:'The bathroom orchestra is playful fiction.'},
  {title:'Tiny weather machine',prompt:'Cycle water, steam, fog, and rain.',category:'Final mixes',allowed:['water','heat','cold','steam','fog'],goal:{materialId:'water',count:28},learningPoint:'Water moves among phases in a cycle.',modelLimitations:'Cloud formation and pressure are omitted.',fictionBoundary:'The lab compresses a weather system into seconds.'},
];

export const CHALLENGES: Challenge[] = challengeSeed.map((item, index) => ({
  ...item, id: `challenge-${String(index + 1).padStart(2, '0')}`, number: index + 1,
  hints: [`Watch how ${item.allowed[0]?.replaceAll('-', ' ')} moves.`, `Try ${item.allowed.slice(0, 2).map((id) => id.replaceAll('-', ' ')).join(' with ')}.`, `Build until you have ${item.goal.count} ${item.goal.materialId.replaceAll('-', ' ')} cells.`],
  sourceId: `SRC-LAB-${String(index + 1).padStart(3, '0')}`,
}));

export const SCENES = ['Kitchen counter','Bathroom loop','Basement bench','Pocket garden','Tiny factory','Sound stage','Sewer sketch','Ice field','Pocket volcano','Space galley','Monster belly','Blank laboratory'].map((name, index) => ({ id: `scene-${String(index + 1).padStart(2, '0')}`, name }));

export const getMaterial = (id: string) => MATERIALS.find((item) => item.id === id) ?? MATERIALS[0]!;
