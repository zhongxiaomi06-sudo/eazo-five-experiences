import{useMemo,useState}from'react';import{ExperienceShell,ResultCard}from'@eazo/ui';
type Person={id:string;name:string;birth:number;death:number;field:string;region:string;mark:string};
const people:Person[]=[
  {id:'fixture-lovelace',name:'Ada Lovelace',birth:1815,death:1852,field:'Mathematics',region:'United Kingdom',mark:'AL'},
  {id:'fixture-douglass',name:'Frederick Douglass',birth:1818,death:1895,field:'Abolition and writing',region:'United States',mark:'FD'},
  {id:'fixture-darwin',name:'Charles Darwin',birth:1809,death:1882,field:'Natural history',region:'United Kingdom',mark:'CD'},
  {id:'fixture-tubman',name:'Harriet Tubman',birth:1822,death:1913,field:'Abolition and civic action',region:'United States',mark:'HT'}
];
const alive=(person:Person,year:number)=>year>=person.birth&&year<=person.death;
export function App(){const[year,setYear]=useState(1845);const[shown,setShown]=useState(false);const pair=useMemo(()=>people.filter(p=>alive(p,year)).slice(0,2),[year]);return <ExperienceShell eyebrow="History fixture · evidence grade demo" title="They were alive at the same time." description="Move one year and watch distant lives snap into the same present tense." accent="#ffb84a" status="4 fixture records">
  {!shown?<form className="panel year-form" onSubmit={e=>{e.preventDefault();setShown(true)}}><label>Choose a year<input type="number" min="1818" max="1852" value={year} onChange={e=>setYear(Number(e.target.value))}/></label><input aria-label="Year slider" type="range" min="1818" max="1852" value={year} onChange={e=>setYear(Number(e.target.value))}/><button className="primary" type="submit">Find the overlap</button></form>:
  <ResultCard title={`${year}: one shared present`} kicker={pair.length===2?`${pair[0]!.name} and ${pair[1]!.name} could both call this year “now.”`:'The approved fixture has fewer than two reliable records for this year.'} onAgain={()=>setShown(false)}><div className="pair">{pair.map(person=><article key={person.id}><div className="portrait" aria-hidden="true">{person.mark}</div><h3>{person.name}</h3><p>{person.field}</p><dl><div><dt>Age in {year}</dt><dd>{year-person.birth}</dd></div><div><dt>Region</dt><dd>{person.region}</dd></div></dl></article>)}</div><p className="method">Fixture records are included only to test BCE/CE-free interval logic and the fallback portrait. Production biographies, pairings and portrait rights are not approved.</p></ResultCard>}
  </ExperienceShell>}
