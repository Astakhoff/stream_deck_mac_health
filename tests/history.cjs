const {test}=require('node:test'),assert=require('node:assert/strict');
const {createHistory,WINDOW_MS}=require('../com.astakhoff.mac-health.sdPlugin/bin/history');
const {graphGeometry,renderGraph}=require('../com.astakhoff.mac-health.sdPlugin/bin/graph');
test('history is bounded to five minutes, not all-time, and handles backward clocks',()=>{
 const history=createHistory();let result;
 for(let i=0;i<=600;i++)result=history({timestamp:i*2000,cpu:i%100,memory:{swap:i*1024}});
 assert.equal(result.history.swap.length,151);assert.equal(result.history.cpu.length,151);
 assert.equal(result.history.swap.at(-1).timestamp-result.history.swap[0].timestamp,WINDOW_MS);
 assert.equal(history({timestamp:100,cpu:10,memory:{swap:0}}).history.cpu.length,1);
});
test('missing readings and sampling gaps are visible breaks, not interpolated history',()=>{
 const graph={windowEnd:40000,min:0,max:100,points:[{timestamp:10000,value:10},{timestamp:12000,value:20},{timestamp:14000,value:null},{timestamp:16000,value:25},{timestamp:40000,value:50}]};
 const geometry=graphGeometry(graph);
 assert.equal((geometry.path.match(/M/g)||[]).length,3);
 assert.equal((geometry.path.match(/L/g)||[]).length,1);
 assert.ok(geometry.last.x<=130);
 const svg=renderGraph(graph,'#55e58c');assert.doesNotMatch(svg,/<text|<line/);
});
test('flat swap produces a stable finite trace and short histories are not stretched to fill the window',()=>{
 const graph={windowEnd:300000,minSpan:256*1024**2,points:[{timestamp:298000,value:28*1024**3},{timestamp:300000,value:28*1024**3}]};
 const g=graphGeometry(graph);assert.doesNotMatch(g.path,/NaN|Infinity/);
 assert.ok(g.last.y>=104&&g.last.y<=133);
 const start=Number(g.path.match(/^M([\d.]+)/)[1]);assert.ok(start>128);
 assert.equal(graphGeometry({...graph,points:[]}).last,null);
});
