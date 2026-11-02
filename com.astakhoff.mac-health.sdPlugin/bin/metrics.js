'use strict';
const GIB = 1024 ** 3;
const finite = (n) => typeof n === 'number' && Number.isFinite(n);
const defaults = {greenColor:'#55e58c',yellowColor:'#ffd45c',redColor:'#ff6b70',cpuWarning:80,cpuCritical:95,diskWarning:10,diskCritical:5,diskWarningGiB:20,diskCriticalGiB:10};
function settings(raw={}) {
  const s={...defaults};
  for(const key of ['greenColor','yellowColor','redColor']) if(/^#[0-9a-f]{6}$/i.test(raw[key])) s[key]=raw[key];
  for(const key of ['cpuWarning','cpuCritical','diskWarning','diskCritical','diskWarningGiB','diskCriticalGiB']) if(raw[key]!==undefined && Number.isFinite(Number(raw[key]))) s[key]=Number(raw[key]);
  if(!(s.cpuWarning>=1 && s.cpuWarning<s.cpuCritical && s.cpuCritical<=100)) {s.cpuWarning=80;s.cpuCritical=95;}
  if(!(s.diskCritical>=0 && s.diskCritical<s.diskWarning && s.diskWarning<=100)) {s.diskWarning=10;s.diskCritical=5;}
  if(!(s.diskCriticalGiB>=0 && s.diskCriticalGiB<s.diskWarningGiB && s.diskWarningGiB<=100000)) {s.diskWarningGiB=20;s.diskCriticalGiB=10;}
  return s;
}
function normalize(raw) {
  if(!raw || !finite(raw.timestamp)) return null;
  const memory=raw.memory, disk=raw.disk;
  const memoryValid=memory?.valid===true && finite(memory.total) && memory.total>0 && finite(memory.used) && memory.used>=0 && memory.used<=memory.total;
  const diskValid=disk?.valid===true && finite(disk.total) && disk.total>0 && finite(disk.available) && disk.available>=0 && disk.available<=disk.total;
  return {timestamp:raw.timestamp,cpu:finite(raw.cpu)&&raw.cpu>=0&&raw.cpu<=100?raw.cpu:null,
    memory:memoryValid?{total:memory.total,used:memory.used,percent:100*memory.used/memory.total,pressure:[1,2,3,4].includes(memory.pressure)?memory.pressure:null,compressed:finite(memory.compressed)&&memory.compressed>=0?memory.compressed:null,swap:finite(memory.swap)&&memory.swap>=0?memory.swap:null}:null,
    disk:diskValid?{total:disk.total,available:disk.available,freePercent:100*disk.available/disk.total,percent:100*(1-disk.available/disk.total)}:null};
}
function createAverage() {
  let samples=[], previous=0;
  return (sample) => {
    if(sample.cpu===null || sample.timestamp<=previous || sample.timestamp-previous>6000) samples=[];
    previous=sample.timestamp;
    if(sample.cpu!==null) samples.push({value:sample.cpu,time:sample.timestamp});
    samples=samples.filter(x=>sample.timestamp-x.time<10000).slice(-5);
    return {...sample,cpuAverage:samples.length?samples.reduce((n,x)=>n+x.value,0)/samples.length:null,cpuWindowSeconds:samples.length*2};
  };
}
function classify(kind,data,config={}) {
  const s=settings(config);
  if(kind==='memory') {
    const level=data.memory?.pressure;
    return level===4?'critical':level===2||level===3?'warning':level===1?'normal':'unknown';
  }
  if(kind==='cpu') return !finite(data.cpuAverage)?'unknown':data.cpuAverage>=s.cpuCritical?'critical':data.cpuAverage>=s.cpuWarning?'warning':'normal';
  if(kind==='disk') {
    const disk=data.disk;
    if(!disk) return 'unknown';
    if(disk.freePercent<=s.diskCritical || disk.available<=s.diskCriticalGiB*GIB) return 'critical';
    if(disk.freePercent<=s.diskWarning || disk.available<=s.diskWarningGiB*GIB) return 'warning';
    return 'normal';
  }
  return 'unknown';
}
const gib=(n)=>finite(n)?(n/GIB).toFixed(n/GIB<10?1:0)+' GiB':'Unknown';
function view(kind,data,config={},error=null,now=Date.now()) {
  if(!data || error || now-data.timestamp>6500 || data.timestamp>now+5000) return {title:kind==='cpu'?'CPU':kind==='disk'?'Disk':'Memory',main:'—',label:data?'Offline':'Waiting',detail:'Open settings',percent:null,level:'unknown'};
  const level=classify(kind,data,config), label={normal:'Normal',warning:'Warning',critical:'Critical',unknown:'Unknown'}[level];
  if(kind==='memory') return {title:'Memory',main:data.memory?Math.round(data.memory.percent)+'%':'—',label,detail:data.memory?.swap!==null&&data.memory? 'Swap '+gib(data.memory.swap):'Swap unknown',percent:data.memory?.percent??null,level};
  if(kind==='cpu') return {title:'CPU',main:finite(data.cpuAverage)?Math.round(data.cpuAverage)+'%':'—',label:finite(data.cpuAverage)?label:'Sampling',detail:finite(data.cpuAverage)?data.cpuWindowSeconds+'s avg':'First sample…',percent:data.cpuAverage,level};
  return {title:'Disk',main:data.disk?Math.round(data.disk.percent)+'%':'—',label,detail:data.disk?gib(data.disk.available)+' free':'No disk data',percent:data.disk?.percent??null,level};
}
module.exports={GIB,defaults,settings,normalize,createAverage,classify,view,gib};
