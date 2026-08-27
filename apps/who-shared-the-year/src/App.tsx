import { useEffect, useMemo, useRef, useState } from 'react';
import { selectHostAdapter } from '@eazo/platform';
import {
  ageLabelInYear,
  formatYear,
  fromSequenceYear,
  isInRange,
  parseYear,
  selectPair,
  stepYear,
  toSequenceYear,
  type Person,
} from './domain';
import { claims, getPreviewCard, sources } from './content-audit';
import { people } from './people';

const host = selectHostAdapter();
const MIN = -499;
const MAX = 2026;
const labels: Record<string, string> = {
  DIFFERENT_FIELDS: 'different worlds',
  DISTANT_REGIONS: 'distant regions',
  AGE_CONTRAST: 'different generations',
  SAME_YEAR_EVENT: 'exact same-year hinge',
};

export function App() {
  const [year, setYear] = useState(fromSequenceYear(1564));
  const [input, setInput] = useState('1564');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem('eazo-year-saved') ?? '[]'));
  const [toast, setToast] = useState('');
  const recent = useRef<string[]>([]);
  const previewCard = useMemo(() => getPreviewCard(year), [year]);

  const pair = useMemo(() => {
    if (previewCard) {
      const found = previewCard.personIds
        .map((id) => people.find((person) => person.id === id))
        .filter((person): person is Person => Boolean(person));
      if (found.length >= 2) return { people: found, reasonCodes: ['SAME_YEAR_EVENT'], score: 100 };
    }
    return selectPair(people, year, recent.current);
  }, [previewCard, year]);

  const yearLabel = formatYear(year);
  const explanation =
    previewCard?.bigIdea ??
    (pair.people.length > 1
      ? `${pair.people[0]!.name} and ${pair.people[1]!.name} were alive in the same year. This is an exploratory overlap, not yet an evidence-reviewed contrast story.`
      : 'The provisional collection has limited reliable coverage for this year. We will never fill the stage with an unsourced name.');
  const previewSources = useMemo(() => {
    if (!previewCard) return [];
    const sourceIds = new Set(
      claims.filter((claim) => previewCard.claimIds.includes(claim.id)).flatMap((claim) => claim.sourceIds),
    );
    return sources.filter((source) => sourceIds.has(source.id));
  }, [previewCard]);
  const pairKey = `${yearLabel}:${pair.people.map((person) => person.id).join('+')}`;
  const isSaved = saved.includes(pairKey);

  useEffect(() => {
    recent.current = [...recent.current, ...pair.people.map((person) => person.id)].slice(-12);
    void host.track({
      name: 'pair_viewed',
      eventVersion: 1,
      anonymousSessionId: 'local',
      properties: { year: yearLabel, count: pair.people.length, evidenceStatus: previewCard?.evidenceStatus ?? 'exploratory' },
    });
  }, [pair.people, previewCard?.evidenceStatus, yearLabel]);

  useEffect(() => host.requestResize(document.documentElement.scrollHeight), [selected, toast]);

  const commit = (next: ReturnType<typeof parseYear>) => {
    if (!next || !isInRange(next)) {
      setError('Enter a year from 500 BCE through 2026 CE. Historical calendars do not have a year zero.');
      return;
    }
    setError('');
    setYear(next);
    setInput(formatYear(next));
    setSelected(null);
  };

  const toggleSave = () => {
    const next = isSaved ? saved.filter((value) => value !== pairKey) : [pairKey, ...saved].slice(0, 50);
    setSaved(next);
    localStorage.setItem('eazo-year-saved', JSON.stringify(next));
    setToast(isSaved ? 'Removed from your collection.' : 'Saved on this device.');
  };

  const share = async () => {
    const result = await host.share({
      appId: 'who-shared-the-year',
      schemaVersion: 1,
      publicData: {
        year: yearLabel,
        personIds: pair.people.map((person) => person.id),
        relation: previewCard?.relation ?? 'overlapped',
        reason: explanation,
        sources: previewSources.length ? previewSources.map((source) => source.url) : pair.people.map((person) => person.sourceUrl),
      },
    });
    if (result.ok) {
      setToast('Shared with Eazo.');
      return;
    }
    const text = `${yearLabel}: ${pair.people.map((person) => person.name).join(' + ')}\n${explanation}\n${location.href}`;
    const nativeShare = (navigator as Navigator & { share?: Navigator['share'] }).share;
    if (typeof nativeShare === 'function') await nativeShare.call(navigator, { title: 'They Shared This Year', text });
    else await navigator.clipboard.writeText(text);
    setToast(typeof nativeShare === 'function' ? 'Share sheet opened.' : 'Story copied to your clipboard.');
  };

  const nudge = (delta: number) => commit(stepYear(year, delta));

  return (
    <div className="year-app">
      <a className="skip-link" href="#year-stage">Skip to the year</a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Eazo home">eazo<span>·</span>atlas</a>
        <nav aria-label="Page sections">
          <a href="#method">Method</a>
          <span>{people.length} provisional lives · Alpha V3</span>
        </nav>
      </header>
      <main id="top">
        <section className="intro" aria-labelledby="title">
          <div className="hero-art" role="img" aria-label="An editorial collage of a marble sculptor's hand connected by a red thread to an early telescope and the moon">
            <p>Featured collision</p>
            <strong>1564</strong>
            <span>Rome · Pisa</span>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Three days between two chapters</p>
            <h1 id="title">One life ends.<br /><em>A new sky begins.</em></h1>
            <p className="lede">Michelangelo died three days after Galileo was born. Not a metaphor. A dated, sourced collision.</p>
            <a className="hero-jump" href="#year-stage">Open the evidence <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="year-console" aria-label="Choose a year">
          <form onSubmit={(event) => { event.preventDefault(); commit(parseYear(input)); }}>
            <label htmlFor="year-input">Jump to any year</label>
            <div className="input-row">
              <input id="year-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="1564 or 500 BCE" aria-describedby="year-help year-error" />
              <button className="go" type="submit">Go</button>
            </div>
            <p id="year-help">500 BCE — 2026 CE</p>
            {error && <p id="year-error" className="error" role="alert">{error}</p>}
          </form>
          <div className="rail">
            <button type="button" aria-label="Previous year" onClick={() => nudge(-1)}>−</button>
            <input aria-label="Timeline, use arrow keys to change year" type="range" min={MIN} max={MAX} value={toSequenceYear(year)} onChange={(event) => commit(fromSequenceYear(Number(event.target.value)))} />
            <button type="button" aria-label="Next year" onClick={() => nudge(1)}>＋</button>
          </div>
        </section>

        <section id="year-stage" className="stage" aria-labelledby="year-heading">
          <div className="year-heading">
            <div><p>{previewCard ? 'Evidence-reviewed candidate' : 'Exploratory overlap'}</p><h2 id="year-heading">{yearLabel}</h2></div>
            <p className="era-note">{previewCard ? 'User testing pending' : 'Not a gold pairing'}</p>
          </div>
          <div className={`pair pair-${pair.people.length}`} aria-live="polite">
            {pair.people.map((person, index) => (
              <article className="person-card" key={person.id}>
                <button className="portrait-button" type="button" onClick={() => setSelected(person)} aria-label={`Open ${person.name} details`}>
                  <span className={`portrait tone-${index} ${previewCard ? `story-object portrait-${person.id}` : ''}`} aria-hidden="true"><span>{person.mark}</span></span>
                </button>
                <div className="person-copy">
                  <p className="coordinates">{person.region} · {person.field}</p>
                  <h3>{person.name}</h3>
                  <p className="lifespan">{formatYear(person.birth)} — {person.death ? formatYear(person.death) : 'Living'} <b>{ageLabelInYear(person, year)}</b></p>
                  <button className="text-button" type="button" onClick={() => setSelected(person)}>Read their story <span aria-hidden="true">↗</span></button>
                </div>
              </article>
            ))}
          </div>
          <aside className="why">
            <p className="why-label">{previewCard ? 'Why this year matters' : 'What this result can claim'}</p>
            <p>{explanation}</p>
            <div className="reason-list">{pair.reasonCodes.filter((code) => labels[code]).map((code) => <span key={code}>{labels[code]}</span>)}</div>
            {previewSources.length > 0 && (
              <div className="evidence-links" aria-label="Evidence sources">
                {previewSources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} ↗</a>)}
              </div>
            )}
          </aside>
          <div className="actions">
            <button className="save" type="button" onClick={toggleSave}>{isSaved ? 'Saved ✓' : 'Save this pairing'}</button>
            <button className="share" type="button" onClick={() => void share()}>Share the surprise ↗</button>
          </div>
        </section>

        <section className="discover">
          <p className="eyebrow">Evidence lab</p>
          <div>
            {[1564, 1510, 1610, 1790, 1845, 1930].map((value) => (
              <button key={value} type="button" className={toSequenceYear(year) === value ? 'active' : ''} onClick={() => commit(fromSequenceYear(value))}>
                <b>{value}</b>
                <span>{value === 1564 ? 'Reviewed candidate' : 'Exploratory · needs claims'}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="method" className="method">
          <div><p className="eyebrow">Evidence, not trivia</p><h2>What is reviewed—and what is not.</h2></div>
          <div className="method-copy">
            <p>This Alpha contains 33 provisional profiles and one evidence-reviewed contrast candidate. A card only becomes gold after claim review, rights review, and real target-user testing.</p>
            <details>
              <summary>Sources & evidence grades</summary>
              <p>Wikidata and encyclopedias are discovery layers, not automatic A-grade proof. The 1564 candidate links to The Met and Museo Galileo. Generic profiles remain grade B and provisional until claim-level migration is complete.</p>
            </details>
            <details>
              <summary>Relationship language</summary>
              <p>“Same year” and “overlapped” never imply that two people met or influenced one another. Those claims require direct historical evidence.</p>
            </details>
            <details>
              <summary>Portrait & correction policy</summary>
              <p>This build uses original typographic portraits. Corrections are reviewed before content changes; uncertain material is downgraded or withdrawn rather than silently rewritten.</p>
            </details>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand">eazo<span>·</span>atlas</div>
        <p>A small portal into the strange simultaneity of history.</p>
        <a href="#top">Back to the year ↑</a>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}>
          <section className="detail" role="dialog" aria-modal="true" aria-labelledby="detail-title">
            <button className="close" aria-label="Close details" onClick={() => setSelected(null)}>×</button>
            <p className="coordinates">Evidence grade {selected.evidenceGrade} · {selected.reviewStatus}</p>
            <h2 id="detail-title">{selected.name}</h2>
            <p className="detail-dates">{formatYear(selected.birth)} — {selected.death ? formatYear(selected.death) : 'Living'} · {ageLabelInYear(selected, year)} ({yearLabel})</p>
            <p className="detail-summary">{selected.summary}</p>
            <dl>
              <div><dt>Field</dt><dd>{selected.field}</dd></div>
              <div><dt>Region</dt><dd>{selected.region}</dd></div>
              <div><dt>Date precision</dt><dd>{selected.birth.precision}; calendar {selected.birth.calendar}</dd></div>
              <div><dt>Portrait</dt><dd>Original typographic fallback</dd></div>
            </dl>
            <a className="source-link" href={selected.sourceUrl} target="_blank" rel="noreferrer">Open provisional profile source · {selected.sourceLabel} ↗</a>
          </section>
        </div>
      )}
      {toast && <button className="toast" type="button" onClick={() => setToast('')} aria-live="polite">{toast} <span>×</span></button>}
    </div>
  );
}
