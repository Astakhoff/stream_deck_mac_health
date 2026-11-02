'use strict';
const WINDOW_MS=300000;
function createHistory(){
  let samples=[],last=0;
  return (sample)=>{
    if(sample.timestamp<=last)samples=[];
    last=sample.timestamp;
    samples.push({timestamp:sample.timestamp,cpu:sample.cpu,swap:sample.memory?.swap??null});
    samples=samples.filter(x=>x.timestamp>=last-WINDOW_MS).slice(-151);
    return {...sample,history:{
      cpu:samples.map(x=>({timestamp:x.timestamp,value:x.cpu})),
      swap:samples.map(x=>({timestamp:x.timestamp,value:x.swap})),
    }};
  };
}
module.exports={WINDOW_MS,createHistory};
