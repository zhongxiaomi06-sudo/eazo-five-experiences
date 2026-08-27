import { useMemo, useState } from 'react';
import { ExperienceShell, ResultCard } from '@eazo/ui';
import { SpaceRenderer } from './SpaceRenderer';

const stages = [
  { id:'S1', label:'Streetlight weather', height:100, fact:'You are still inside the layer that makes weather.' },
  { id:'S2', label:'Passenger-window blue', height:10000, fact:'Airliners cruise below the point where the sky becomes truly black.' },
  { id:'S3', label:'The atmosphere thins', height:50000, fact:'Most atmospheric mass is already below you.' },
  { id:'S4', label:'The Kármán convention', height:100000, fact:'100 km is a useful convention—not a natural wall.' },
  { id:'S5', label:'Orbital quiet', height:408000, fact:'The station circles Earth far above the conventional edge of space.' }
] as const;

export function App(){
  const [city,setCity]=useState<'Beijing'|'Washington, D.C.'>('Beijing'); const[stage,setStage]=useState(0); const[complete,setComplete]=useState(false);
  const item=stages[stage]!; const progress=stage/(stages.length-1); const formatted=useMemo(()=>item.height>=1000?`${item.height/1000} km`:`${item.height} m`,[item]);
  return <ExperienceShell eyebrow={`Launching from ${city}`} title="Roll until the sky runs out." description="A fixed-camera, five-stage rendering POC using exact heights and a non-visual route." accent="#62d9ff" status={`Stage ${stage+1}/5`}>
    {complete?<ResultCard title="You rolled 408 km upward." kicker={`${city} became a point, then an idea.`} onAgain={()=>{setStage(0);setComplete(false)}}><p>Five stages visited. Rendering can disappear and the ordered route still completes.</p></ResultCard>:
    <section className="space-panel panel">
      <SpaceRenderer progress={progress}/><div className="altitude"><span>{item.id}</span><strong>{formatted}</strong><small>{item.label}</small></div>
      <p className="fact" aria-live="polite">{item.fact}</p>
      <div className="space-controls"><label>Launch city<select value={city} onChange={e=>setCity(e.target.value as typeof city)}><option>Beijing</option><option>Washington, D.C.</option></select></label><div className="actions"><button type="button" disabled={stage===0} onClick={()=>setStage(v=>Math.max(0,v-1))}>Previous stage</button><button className="primary" type="button" onClick={()=>stage===4?setComplete(true):setStage(v=>v+1)}>{stage===4?'Reach orbit':'Roll higher'}</button></div></div>
      <ol className="stage-list" aria-label="Non-visual journey">{stages.map((value,index)=><li key={value.id} aria-current={index===stage?'step':undefined}><button type="button" onClick={()=>setStage(index)}>{value.id}: {value.label}</button></li>)}</ol>
    </section>}
  </ExperienceShell>;
}
