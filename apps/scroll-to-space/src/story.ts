export type CityId = 'beijing' | 'washington-dc';
export type StageId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export type KnowledgeCard = {
  id: string;
  stage: StageId;
  title: string;
  body: string;
  factType: 'scale' | 'atmosphere' | 'record' | 'orbit' | 'city';
  value: number;
  unit: 'm' | 'km' | '°C' | '%';
  sourceUrl: string;
  sourceTitle: string;
  sourceDate: string;
  assetId: string;
  reviewStatus: 'approved';
  cityId?: CityId;
};

export const cities = {
  beijing: {
    id: 'beijing',
    name: 'Beijing',
    kicker: '39.9042° N · 116.4074° E',
    scene: 'Jade roofs, ring roads, and the western hills dissolve beneath you.',
    assets: ['BJ-HUTONG-001', 'BJ-TOWER-001', 'BJ-RING-001'],
    copyIds: ['BJ-COPY-001', 'BJ-COPY-002', 'BJ-COPY-003'],
  },
  'washington-dc': {
    id: 'washington-dc',
    name: 'Washington, D.C.',
    kicker: '38.9072° N · 77.0369° W',
    scene: 'The Mall, the Potomac, and a strict horizon of low buildings fall away.',
    assets: ['DC-MALL-001', 'DC-MONUMENT-001', 'DC-POTOMAC-001'],
    copyIds: ['DC-COPY-001', 'DC-COPY-002', 'DC-COPY-003'],
  },
} as const;

export const stages = [
  { id: 'S1', name: 'Street level', range: '0–2 km', heightM: 420, atmosphere: 'Troposphere', claimId: 'CLAIM-S1-CITY', prompt: 'The city still has edges.' },
  { id: 'S2', name: 'Flight level', range: '2–12 km', heightM: 10_000, atmosphere: 'Troposphere', claimId: 'CLAIM-S2-FLIGHT', prompt: 'Weather becomes a floor.' },
  { id: 'S3', name: 'Stratosphere', range: '12–50 km', heightM: 39_000, atmosphere: 'Stratosphere', claimId: 'CLAIM-S3-STRATOSPHERE', prompt: 'Blue gives way to ink.' },
  { id: 'S4', name: 'Edge country', range: '50–100 km', heightM: 100_000, atmosphere: 'Mesosphere', claimId: 'CLAIM-S4-KARMAN', prompt: 'There is no natural wall.' },
  { id: 'S5', name: 'Orbital quiet', range: '100–408 km', heightM: 408_000, atmosphere: 'Thermosphere', claimId: 'CLAIM-S5-ORBIT', prompt: 'Earth becomes the view.' },
] as const;

const nasaLayers = 'https://science.nasa.gov/earth/earth-atmosphere/earths-atmosphere-a-multi-layered-cake/';
const nasaAtmosphere = 'https://www.nasa.gov/general/what-is-earths-atmosphere/';
const noaaJet = 'https://www.nesdis.noaa.gov/about/k-12-education/atmosphere/what-the-jet-stream';
const nasaIss = 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/';

export const knowledgeCards: KnowledgeCard[] = [
  { id:'CARD-01', stage:'S1', cityId:'beijing', title:'A city, not a location ping', body:'Your launch point is a choice stored on this device. The experience never asks for precise location.', factType:'city', value:0, unit:'m', sourceUrl:'project-authored://privacy-contract', sourceTitle:'Scroll to Space privacy contract', sourceDate:'2026-08-27', assetId:'BJ-HUTONG-001', reviewStatus:'approved' },
  { id:'CARD-02', stage:'S1', cityId:'beijing', title:'The skyline’s last ruler', body:'At 528 metres, Beijing’s CITIC Tower would already sit above this viewpoint.', factType:'city', value:528, unit:'m', sourceUrl:'https://www.skyscrapercenter.com/building/citic-tower/11116', sourceTitle:'The Skyscraper Center — CITIC Tower', sourceDate:'2026-08-27', assetId:'BJ-TOWER-001', reviewStatus:'approved' },
  { id:'CARD-03', stage:'S1', cityId:'washington-dc', title:'One obelisk, half your height', body:'The Washington Monument rises 169 metres. From here, it would reach less than halfway to you.', factType:'city', value:169, unit:'m', sourceUrl:'https://www.nps.gov/wamo/learn/historyculture/index.htm', sourceTitle:'National Park Service — Washington Monument', sourceDate:'2026-08-27', assetId:'DC-MONUMENT-001', reviewStatus:'approved' },
  { id:'CARD-04', stage:'S1', cityId:'washington-dc', title:'A river turns into punctuation', body:'The Potomac remains a bright curve after streets stop reading as streets.', factType:'city', value:420, unit:'m', sourceUrl:'project-authored://dc-scene', sourceTitle:'Original procedural city scene', sourceDate:'2026-08-27', assetId:'DC-POTOMAC-001', reviewStatus:'approved' },
  { id:'CARD-05', stage:'S1', title:'Weather lives with us', body:'Almost all weather happens in the troposphere—the dense lowest layer you are still inside.', factType:'atmosphere', value:12, unit:'km', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-TROPO-001', reviewStatus:'approved' },
  { id:'CARD-06', stage:'S2', title:'The jet stream overhead', body:'Fast jet-stream currents generally run about 8 to 14 kilometres above Earth.', factType:'atmosphere', value:9, unit:'km', sourceUrl:noaaJet, sourceTitle:'NOAA NESDIS — What Is the Jet Stream?', sourceDate:'2026-08-27', assetId:'SCI-JET-001', reviewStatus:'approved' },
  { id:'CARD-07', stage:'S2', title:'The breathable layer is thin', body:'The troposphere averages about 12 kilometres deep, though its height changes with latitude and season.', factType:'atmosphere', value:12, unit:'km', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-TROPO-002', reviewStatus:'approved' },
  { id:'CARD-08', stage:'S2', title:'Clouds are now below', body:'Nearly all weather clouds form in the troposphere. You are approaching its upper boundary.', factType:'atmosphere', value:12, unit:'km', sourceUrl:nasaAtmosphere, sourceTitle:'NASA — What Is Earth’s Atmosphere?', sourceDate:'2024-05-13', assetId:'SCI-CLOUD-001', reviewStatus:'approved' },
  { id:'CARD-09', stage:'S2', title:'Airliners borrow the calm', body:'The lower stratosphere is less turbulent than the troposphere, which is why high-altitude flight favors this region.', factType:'atmosphere', value:12, unit:'km', sourceUrl:nasaAtmosphere, sourceTitle:'NASA — What Is Earth’s Atmosphere?', sourceDate:'2024-05-13', assetId:'SCI-FLIGHT-001', reviewStatus:'approved' },
  { id:'CARD-10', stage:'S3', title:'Ozone turns light into heat', body:'The stratosphere warms with height because ozone absorbs solar ultraviolet radiation.', factType:'atmosphere', value:50, unit:'km', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-OZONE-001', reviewStatus:'approved' },
  { id:'CARD-11', stage:'S3', title:'The sky darkens before space', body:'Above most scattering air, blue thins toward black even though the Kármán convention is still far away.', factType:'scale', value:39, unit:'km', sourceUrl:nasaAtmosphere, sourceTitle:'NASA — What Is Earth’s Atmosphere?', sourceDate:'2024-05-13', assetId:'SCI-SKY-001', reviewStatus:'approved' },
  { id:'CARD-12', stage:'S3', title:'A balloon reached this country', body:'High-altitude balloons work in the stratosphere, above ordinary weather and most aviation.', factType:'record', value:39, unit:'km', sourceUrl:'https://www.nasa.gov/scientificballoons/', sourceTitle:'NASA Scientific Balloons', sourceDate:'2026-08-27', assetId:'SCI-BALLOON-001', reviewStatus:'approved' },
  { id:'CARD-13', stage:'S3', title:'One atmosphere, almost gone', body:'By 50 kilometres, only a tiny fraction of the atmosphere remains above the surface layers.', factType:'scale', value:50, unit:'km', sourceUrl:'https://www.giss.nasa.gov/edu/icp/education/cloudintro/pressure.html', sourceTitle:'NASA GISS — Atmospheric Pressure', sourceDate:'2026-08-27', assetId:'SCI-PRESSURE-001', reviewStatus:'approved' },
  { id:'CARD-14', stage:'S4', title:'The coldest atmospheric region', body:'Near the mesopause, average temperature is about −85 °C—the coldest region in Earth’s atmosphere.', factType:'record', value:-85, unit:'°C', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-COLD-001', reviewStatus:'approved' },
  { id:'CARD-15', stage:'S4', title:'Meteors spend their light here', body:'Most meteors burn up in the mesosphere, roughly 50 to 80 kilometres above Earth.', factType:'atmosphere', value:80, unit:'km', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-METEOR-001', reviewStatus:'approved' },
  { id:'CARD-16', stage:'S4', title:'The highest clouds', body:'Noctilucent clouds form near the top of the mesosphere and can be seen after sunset under the right conditions.', factType:'atmosphere', value:80, unit:'km', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-NLC-001', reviewStatus:'approved' },
  { id:'CARD-17', stage:'S4', title:'100 km is a convention', body:'The Kármán line is a useful 100-kilometre convention. The atmosphere has no hard physical edge there.', factType:'scale', value:100, unit:'km', sourceUrl:nasaLayers, sourceTitle:'NASA — Earth’s Atmosphere: A Multi-layered Cake', sourceDate:'2024-10-22', assetId:'SCI-KARMAN-001', reviewStatus:'approved' },
  { id:'CARD-18', stage:'S5', title:'Aurora lives up here', body:'Auroras appear in the thermosphere when energetic particles excite atmospheric gases.', factType:'atmosphere', value:100, unit:'km', sourceUrl:nasaAtmosphere, sourceTitle:'NASA — What Is Earth’s Atmosphere?', sourceDate:'2024-05-13', assetId:'SCI-AURORA-001', reviewStatus:'approved' },
  { id:'CARD-19', stage:'S5', title:'Orbit is falling sideways', body:'The space station stays aloft by moving forward fast enough that its fall keeps missing Earth.', factType:'orbit', value:408, unit:'km', sourceUrl:nasaIss, sourceTitle:'NASA — Space Station Facts and Figures', sourceDate:'2026-08-27', assetId:'SCI-ORBIT-001', reviewStatus:'approved' },
  { id:'CARD-20', stage:'S5', title:'You crossed 408 kilometres', body:'The International Space Station’s orbit varies, but a typical height is roughly 400 kilometres above Earth.', factType:'orbit', value:408, unit:'km', sourceUrl:nasaIss, sourceTitle:'NASA — Space Station Facts and Figures', sourceDate:'2026-08-27', assetId:'SCI-ISS-001', reviewStatus:'approved' },
];

export const formatHeight = (heightM: number) => heightM >= 1000
  ? `${Math.round(heightM / 100) / 10} km`
  : `${Math.round(heightM)} m`;

export const progressToHeight = (progress: number) => {
  if (progress <= 0) return 0;
  if (progress >= 1) return 408_000;
  const boundaries = [0, 2_000, 12_000, 50_000, 100_000, 408_000];
  const segment = Math.min(4, Math.floor(progress * 5));
  const local = progress * 5 - segment;
  const start = boundaries[segment]!;
  const end = boundaries[segment + 1]!;
  return Math.round(Math.exp(Math.log(start + 1) + (Math.log(end + 1) - Math.log(start + 1)) * local) - 1);
};

export const stageIndexForProgress = (progress: number) => Math.min(4, Math.floor(Math.max(0, progress) * 5));

export const cardsForJourney = (cityId: CityId, seen: string[] = []) => {
  const eligible = knowledgeCards.filter((card) => !card.cityId || card.cityId === cityId);
  const unseen = eligible.filter((card) => !seen.includes(card.id));
  const previouslySeen = eligible.filter((card) => seen.includes(card.id));
  return [...unseen, ...previouslySeen].slice(0, 12);
};
