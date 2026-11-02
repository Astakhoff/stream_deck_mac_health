'use strict';
const {WINDOW_MS}=require('./history');
// Fixed time window; missing samples and long gaps are not joined.
function graphGeometry(graph){
  const end=graph?.windowEnd;
  if(!Number.isFinite(end))return {path:'',last:null};
  const points=(graph.points||[]).slice(-151).filter(p=>Number.isFinite(p.timestamp)&&p.timestamp>=end-WINDOW_MS&&p.timestamp<=end);
  const values=points.filter(p=>typeof p.value==='number'&&Number.isFinite(p.value)).map(p=>p.value);
  if(!values.length)return {path:'',last:null};
  let low=graph.min,high=graph.max;
  if(!Number.isFinite(low)||!Number.isFinite(high)){
    low=Math.min(...values);high=Math.max(...values);
    const center=(low+high)/2;
    const span=Math.max(high-low,graph.minSpan||1)*1.15;
    low=center-span/2;high=center+span/2;
  }
  if(!(high>low))return {path:'',last:null};
  let path='',previous=null,last=null;
  for(const p of points){
    if(typeof p.value!=='number'||!Number.isFinite(p.value)){previous=null;continue;}
    const x=14+116*(p.timestamp-(end-WINDOW_MS))/WINDOW_MS;
    const y=133-29*Math.max(0,Math.min(1,(p.value-low)/(high-low)));
    path+=(previous&&p.timestamp>previous.timestamp&&p.timestamp-previous.timestamp<=6500?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)+' ';
    previous=p;last={x,y};
  }
  return {path:path.trim(),last};
}
function renderGraph(graph,color){
  const g=graphGeometry(graph);if(!g.last)return '';
  return `<path d="${g.path}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${g.last.x.toFixed(2)}" cy="${g.last.y.toFixed(2)}" r="2.2" fill="${color}"/>`;
}
module.exports={graphGeometry,renderGraph};
