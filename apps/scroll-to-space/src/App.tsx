import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { device, share } from '@eazo/sdk';
import { selectHostAdapter } from '@eazo/platform';
import { mergeInput } from './journey';
import { SpaceRenderer } from './SpaceRenderer';
import { cardsForJourney, cities, formatHeight, knowledgeCards, progressToHeight, stageIndexForProgress, stages, type CityId, type KnowledgeCard } from './story';

type RouteMode = 'cinematic' | 'static';
type SensoryState = 'ready' | 'playing' | 'muted' | 'blocked';
const STORAGE_KEY = 'eazo.scroll-to-space.v2';
type StoredState = { cityId?: CityId; seen?: string[]; sound?: boolean; vibration?: boolean; progress?: number };

const readState = (): StoredState => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as StoredState; }
  catch { return {}; }
};

function CityMark({ cityId }: { cityId: CityId }) {
  return <div className={`city-mark city-mark--${cityId}`} aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>;
}

function SourceLink({ card }: { card: KnowledgeCard }) {
  return card.sourceUrl.startsWith('https://')
    ? <a href={card.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
    : <span>Project source</span>;
}

export function App() {
  const initial = useMemo(readState, []);
  const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const [cityId, setCityId] = useState<CityId>(initial.cityId ?? 'beijing');
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(initial.progress ?? 0);
  const [routeMode, setRouteMode] = useState<RouteMode>(prefersReducedMotion ? 'static' : 'cinematic');
  const [sound, setSound] = useState(initial.sound ?? true);
  const [vibration, setVibration] = useState(initial.vibration ?? true);
  const [audioState, setAudioState] = useState<SensoryState>('ready');
  const [journeyCards, setJourneyCards] = useState<KnowledgeCard[]>([]);
  const [activeCard, setActiveCard] = useState(0);
  const [scaleOpen, setScaleOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [shareState, setShareState] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [quality, setQuality] = useState<'full3d' | 'degraded3d' | 'static'>(prefersReducedMotion ? 'static' : 'full3d');
  const [hostState, setHostState] = useState<'Eazo Mobile' | 'Web preview'>(device.platform === 'mobile' ? 'Eazo Mobile' : 'Web preview');
  const audioRef = useRef<AudioContext | null>(null);
  const lastStageRef = useRef(stageIndexForProgress(progress));
  const host = useMemo(selectHostAdapter, []);

  const stageIndex = stageIndexForProgress(progress);
  const stage = stages[stageIndex]!;
  const heightM = progressToHeight(progress);
  const city = cities[cityId];
  const currentStageCards = journeyCards.filter((card) => card.stage === stage.id);
  const currentCard = currentStageCards[activeCard % Math.max(1, currentStageCards.length)];

  useEffect(() => {
    setHostState(device.platform === 'mobile' ? 'Eazo Mobile' : 'Web preview');
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    addEventListener('online', onOnline); addEventListener('offline', onOffline);
    return () => { removeEventListener('online', onOnline); removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initial, cityId, sound, vibration, progress }));
  }, [cityId, initial, progress, sound, vibration]);

  useEffect(() => {
    if (!started) return;
    const nextStage = stageIndexForProgress(progress);
    if (nextStage !== lastStageRef.current) {
      const direction = nextStage > lastStageRef.current ? 'up' : 'down';
      lastStageRef.current = nextStage; setActiveCard(0);
      if (vibration) navigator.vibrate?.(18);
      void host.track({ name: 'stage_entered', eventVersion: 1, anonymousSessionId: 'local-session', properties: { stageId: stages[nextStage]!.id, direction } });
    }
    if (progress >= .995 && !complete) {
      setComplete(true);
      const seen = Array.from(new Set([...(initial.seen ?? []), ...journeyCards.map((card) => card.id)]));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...initial, cityId, seen, sound, vibration, progress: 1 }));
      void host.track({ name: 'experience_complete', eventVersion: 1, anonymousSessionId: 'local-session', properties: { cityId, cardsSeen: journeyCards.length } });
    }
  }, [cityId, complete, host, initial, journeyCards, progress, sound, started, vibration]);

  useEffect(() => {
    if (!started || routeMode !== 'cinematic') return;
    let wheelTotal = 0; let timer = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault(); wheelTotal += event.deltaY; window.clearTimeout(timer);
      timer = window.setTimeout(() => { setProgress((value) => mergeInput(value, wheelTotal)); wheelTotal = 0; }, 80);
    };
    addEventListener('wheel', onWheel, { passive: false });
    return () => { removeEventListener('wheel', onWheel); window.clearTimeout(timer); };
  }, [routeMode, started]);

  const beginAudio = async () => {
    if (!sound) { setAudioState('muted'); return; }
    try {
      const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = 55; gain.gain.value = .018;
      oscillator.connect(gain).connect(context.destination); oscillator.start(); await context.resume();
      audioRef.current = context; setAudioState('playing');
    } catch { setSound(false); setAudioState('blocked'); }
  };

  const startJourney = async () => {
    setJourneyCards(cardsForJourney(cityId, initial.seen ?? [])); setStarted(true); setComplete(false); setProgress(0.004);
    await beginAudio();
    void host.track({ name: 'city_selected', eventVersion: 1, anonymousSessionId: 'local-session', properties: { cityId } });
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.journey')?.focus());
  };

  const setStage = useCallback((index: number) => setProgress(index === 4 ? 1 : index / 5 + .02), []);
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (['ArrowUp', 'ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); setProgress((value) => mergeInput(value, 1200)); }
    if (['ArrowDown', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); setProgress((value) => mergeInput(value, -1200)); }
    if (event.key === 'Home') setProgress(0); if (event.key === 'End') setProgress(.995);
  };

  const toggleSound = async () => {
    const next = !sound; setSound(next);
    if (!next) { await audioRef.current?.suspend(); setAudioState('muted'); }
    else if (audioRef.current) { await audioRef.current.resume(); setAudioState('playing'); }
    else await beginAudio();
  };

  const shareResult = async () => {
    setShareState('Opening Eazo…');
    try {
      const result = await share.compose({ text: `I rolled from ${city.name} to orbital height—408 km through five layers of sky.`, sourceAppId: 'scroll-to-space', targetPath: `/?city=${cityId}` });
      if (result.accepted) setShareState('Ready in Eazo compose.');
      else { await navigator.clipboard?.writeText(`Scroll to Space · ${city.name} → 408 km`); setShareState('Journey summary copied. Open Eazo to publish.'); }
    } catch { setShareState('Share stayed local. Your journey is safe.'); }
  };

  const restart = (nextCity = cityId) => {
    setCityId(nextCity); setJourneyCards(cardsForJourney(nextCity, readState().seen ?? [])); setProgress(.004);
    setComplete(false); setActiveCard(0); setShareState('');
  };

  if (!started) return <div className="launch-shell">
    <a className="skip-link" href="#launch-main">Skip to launch controls</a>
    <header className="launch-nav"><a className="wordmark" href="/" aria-label="Scroll to Space home"><span>01</span> ALTITUDE / EARTH</a><div className="host-badge"><i/> {hostState}</div></header>
    <main id="launch-main" className="launch-main" tabIndex={-1}>
      <section className="launch-copy"><p className="chapter">A two-minute scale story</p><h1>Roll until<br/><em>Earth curves.</em></h1><p className="launch-lede">Leave a familiar street. Cross weather, ozone, meteors, and the useful fiction we call the edge of space.</p><div className="launch-meta"><span>5 atmospheric chapters</span><span>20 sourced discoveries</span><span>No location access</span></div></section>
      <section className="city-picker" aria-labelledby="city-title">
        <div className="picker-head"><span id="city-title">Choose ground zero</span><span>01 / 02</span></div>
        <div className="city-grid">{(Object.keys(cities) as CityId[]).map((id) => { const item = cities[id]; const selected = cityId === id; return <button className="city-card" data-selected={selected} key={id} onClick={() => setCityId(id)} aria-pressed={selected}><CityMark cityId={id}/><span className="city-index">{id === 'beijing' ? 'A' : 'B'}</span><strong>{item.name}</strong><small>{item.kicker}</small><span className="selection-mark">{selected ? 'Selected' : 'Choose'} ↗</span></button>; })}</div>
        {prefersReducedMotion && <p className="route-note" role="status">Reduced motion is on. Your journey will use still chapters.</p>}
        <button className="launch-button" onClick={() => void startJourney()}><span>Begin ascent</span><b aria-hidden="true">↑</b></button>
        <p className="microcopy">Sound and haptics start only after this tap. Both can be switched off at any time.</p>
      </section>
    </main><div className="earth-limb" aria-hidden="true"><span/></div>
  </div>;

  return <div className={`journey quality-${quality}`} data-progress={progress} data-audio-state={audioState} tabIndex={0} onKeyDown={onKeyDown}>
    <a className="skip-link" href="#nonvisual-route">Skip the visual journey</a><SpaceRenderer progress={progress} cityId={cityId} quality={quality}/><div className="grain" aria-hidden="true"/>
    <header className="journey-nav"><button className="wordmark button-reset" onClick={() => setStarted(false)}><span>01</span> ALTITUDE / EARTH</button><div className="nav-tools"><span className="network-state" data-online={online}>{online ? 'Cached route ready' : 'Offline · route ready'}</span><button className="tool-button" onClick={() => void toggleSound()} aria-pressed={sound}>{sound ? 'Sound on' : 'Sound off'}</button><button className="tool-button" onClick={() => setVibration((value) => !value)} aria-pressed={vibration}>{vibration ? 'Haptics on' : 'Haptics off'}</button></div></header>
    <main className="journey-overlay">
      <section className="altimeter" aria-live="polite" aria-atomic="true"><p>{city.name} · {stage.atmosphere}</p><strong>{formatHeight(heightM)}</strong><span>TRUE ALTITUDE · VISUAL SCALE IS LOGARITHMIC</span></section>
      <section className="chapter-card"><div className="chapter-label"><span>{stage.id}</span><span>{stage.range}</span></div><h1>{stage.prompt}</h1><p>{stageIndex < 2 ? city.scene : currentCard?.body ?? 'Keep moving through the atmosphere.'}</p>{currentCard && <div className="fact-source"><span>{currentCard.title}</span><SourceLink card={currentCard}/></div>}{currentStageCards.length > 1 && <button className="next-discovery" onClick={() => setActiveCard((value) => value + 1)}>Next discovery <span>{(activeCard % currentStageCards.length) + 1}/{currentStageCards.length}</span></button>}</section>
      <div className="journey-controls"><button onClick={() => setProgress((value) => mergeInput(value, -1200))} disabled={progress <= 0} aria-label="Descend one step">↓</button><button className="ascend" onClick={() => setProgress((value) => mergeInput(value, 1200))} disabled={complete} aria-label="Ascend one step">↑</button><span>{routeMode === 'cinematic' ? 'Scroll or use arrow keys' : 'Use chapter buttons'}</span></div>
      <nav className="stage-rail" aria-label="Journey chapters">{stages.map((item, index) => <button key={item.id} aria-label={`Go to ${item.id}: ${item.name}`} aria-current={index === stageIndex ? 'step' : undefined} onClick={() => setStage(index)}><span>{item.id}</span><i/><small>{item.name}</small></button>)}</nav>
      <button className="scale-button" onClick={() => setScaleOpen(true)}>Scale notes ↗</button><div className="progress-track" aria-label={`${Math.round(progress * 100)} percent complete`}><i style={{ height: `${progress * 100}%` }}/></div>
    </main>
    <section id="nonvisual-route" className="sr-route" aria-label="Non-visual journey"><h2>Journey chapters</h2><ol>{stages.map((item, index) => <li key={item.id}><button onClick={() => setStage(index)}>{item.id}: {item.name}, {item.range}. {item.prompt}</button></li>)}</ol></section>
    {audioState === 'blocked' && <div className="toast" role="status">Browser did not allow sound. The journey continues silently.</div>}
    {scaleOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setScaleOpen(false)}><section className="scale-modal" role="dialog" aria-modal="true" aria-labelledby="scale-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setScaleOpen(false)} aria-label="Close scale notes">×</button><p className="chapter">How this view works</p><h2 id="scale-title">Real height.<br/>Compressed distance.</h2><dl><div><dt>heightM</dt><dd>{heightM}</dd></div><div><dt>Display</dt><dd>{formatHeight(heightM)}</dd></div><div><dt>Mapping</dt><dd>logarithmic</dd></div><div><dt>Layer</dt><dd>{stage.atmosphere}</dd></div></dl><p>Objects are illustrative, not rendered to one shared physical scale. The altitude number is the narrative measurement.</p><a href={currentCard?.sourceUrl.startsWith('https') ? currentCard.sourceUrl : knowledgeCards[16]!.sourceUrl} target="_blank" rel="noreferrer">{currentCard?.sourceTitle ?? knowledgeCards[16]!.sourceTitle} · {currentCard?.sourceDate ?? knowledgeCards[16]!.sourceDate} ↗</a></section></div>}
    {complete && <div className="completion-backdrop"><section className="completion" role="dialog" aria-modal="true" aria-labelledby="completion-title"><p className="chapter">Journey complete · {city.name}</p><h2 id="completion-title">408 km.<br/><em>One thin home.</em></h2><p>You crossed five atmospheric chapters and uncovered {journeyCards.length} of 20 sourced discoveries.</p><div className="completion-stats"><div><strong>5/5</strong><span>chapters</span></div><div><strong>{journeyCards.length}</strong><span>discoveries</span></div><div><strong>0</strong><span>location requests</span></div></div><div className="completion-actions"><button className="primary-action" onClick={() => void shareResult()}>Share through Eazo ↗</button><button onClick={() => restart()}>Roll again</button><button onClick={() => restart(cityId === 'beijing' ? 'washington-dc' : 'beijing')}>Switch city</button></div>{shareState && <p className="share-state" role="status">{shareState}</p>}</section></div>}
    <div className="route-switch"><button onClick={() => { const next = routeMode === 'cinematic' ? 'static' : 'cinematic'; setRouteMode(next); setQuality(next === 'static' ? 'static' : 'degraded3d'); }}>{routeMode === 'cinematic' ? 'Use still chapters' : 'Use cinematic route'}</button></div>
  </div>;
}
