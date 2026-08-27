type Command={type:'add';material:1|2;x:number};type State={tick:number,cells:number[],gas:number};
let state:State={tick:0,cells:Array.from({length:36},()=>0),gas:0};
const checksum=(values:number[])=>values.reduce((hash,value,index)=>((hash*31+value+index)>>>0),2166136261).toString(16).padStart(8,'0');
self.onmessage=(event:MessageEvent<{type:'reset'|'step';commands?:Command[]}>)=>{
  if(event.data.type==='reset')state={tick:0,cells:Array.from({length:36},()=>0),gas:0};
  for(const command of event.data.commands??[]){if(command.type==='add')state.cells[Math.max(0,Math.min(35,command.x))]=command.material;}
  if(event.data.type==='step'){
    const next=[...state.cells];for(let i=34;i>=0;i--){if(state.cells[i]===1&&state.cells[i+1]===0){next[i]=0;next[i+1]=1;}if(state.cells[i]===2&&state.cells[i+1]===1){next[i]=0;next[i+1]=0;state.gas++;}}
    state={...state,tick:state.tick+1,cells:next};
  }
  self.postMessage({tick:state.tick,cells:state.cells,gas:state.gas,worldChecksum:checksum([...state.cells,state.gas])});
};
