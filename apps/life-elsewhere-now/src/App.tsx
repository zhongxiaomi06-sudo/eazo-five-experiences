import{useState}from'react';import{ExperienceShell,ResultCard}from'@eazo/ui';

const people=[
  {region:'Northern China',time:'07:42',theme:'school',line:'A student is balancing a hot breakfast on a bus that keeps stopping.',scale:'The commute is longer than one full sitcom episode.',tone:'#ff6ca8'},
  {region:'Pacific Northwest',time:'15:42',theme:'work',line:'A repair technician is listening for a sound only broken machines make.',scale:'The rain outside has crossed three county lines today.',tone:'#62d9ff'},
  {region:'Southwest China',time:'07:42',theme:'food',line:'A market cook has already folded more dumplings than there are keys on a piano.',scale:'Lunch begins before most alarms have finished arguing.',tone:'#ffb84a'},
  {region:'Northeastern United States',time:'15:42',theme:'care',line:'Someone is teaching a grandparent how to make the text on a phone enormous.',scale:'They have repeated the same gesture seven times. Both are still laughing.',tone:'#ad8cff'}
] as const;

export function App(){const[index,setIndex]=useState<number|null>(null);const person=index===null?null:people[index%people.length]!;return <ExperienceShell eyebrow="Synthetic scene · not a real person" title="Right now, somewhere else feels normal." description="Choose a region, meet a generated everyday moment, then compare it with another. No live tracking. No real identity." accent="#ff6ca8" status="4 approved fixtures">
  {person?<ResultCard title={`${person.time} in ${person.region}`} kicker={person.scale} onAgain={()=>setIndex(value=>(value??0)+1)}><div className="person-card" style={{'--tone':person.tone} as React.CSSProperties}><div className="face" aria-hidden="true"><i/><b/><span/></div><div><p>{person.line}</p><dl><div><dt>Theme</dt><dd>{person.theme}</dd></div><div><dt>Reference</dt><dd>Fixture · 2026</dd></div></dl></div></div><p className="disclosure">This is a synthetic scene assembled from project-authored fixture text. It is not a tracked or identifiable individual.</p></ResultCard>:
  <section className="panel stack"><fieldset><legend>Where should we look?</legend><div className="region-grid">{people.map((item,itemIndex)=><button type="button" key={`${item.region}-${item.theme}`} onClick={()=>setIndex(itemIndex)}><span>{item.time}</span><strong>{item.region}</strong><small>{item.theme}</small></button>)}</div></fieldset><p className="disclosure">Fixture mode deliberately contains no war, wealth, health, identity or real-person claims.</p></section>}
  </ExperienceShell>}
