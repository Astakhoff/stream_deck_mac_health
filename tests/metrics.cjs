const {test}=require('node:test'),assert=require('node:assert/strict');
const {GIB,settings,normalize,createAverage,classify,view}=require('../com.astakhoff.mac-health.sdPlugin/bin/metrics');
const {render}=require('../com.astakhoff.mac-health.sdPlugin/bin/render');
const raw=(time=10000,cpu=20)=>({timestamp:time,cpu,memory:{valid:true,total:16*GIB,used:15*GIB,compressed:4*GIB,pressure:1,swap:20*GIB},disk:{valid:true,total:500*GIB,available:200*GIB}});
test('memory colors follow OS pressure, not high RAM usage or historical swap',()=>{
 const data=normalize(raw());assert.equal(classify('memory',data),'normal');
 for(const [code,result]of [[2,'warning'],[3,'warning'],[4,'critical'],[null,'unknown']]) assert.equal(classify('memory',{...data,memory:{...data.memory,pressure:code}}),result);
});
test('invalid and missing metrics are unavailable, never zero or green',()=>{
 assert.equal(normalize(null),null);assert.equal(normalize({timestamp:'bad'}),null);
 const invalid=normalize({...raw(),cpu:null,memory:{...raw().memory,used:NaN},disk:{valid:true,total:1,available:2}});
 assert.equal(invalid.cpu,null);assert.equal(invalid.memory,null);assert.equal(invalid.disk,null);
 for(const kind of ['memory','disk','cpu'])assert.equal(classify(kind,invalid),'unknown');
 const zero=normalize({...raw(),cpu:0});assert.equal(zero.cpu,0);
});
test('CPU has a bounded 10-second average and resets after sleep or invalid samples',()=>{
 const avg=createAverage();assert.equal(avg(normalize(raw(10000,null))).cpuAverage,null);
 for(let i=1;i<=5;i++)avg(normalize(raw(10000+i*2000,i*10)));
 const sixth=avg(normalize(raw(22000,60)));assert.equal(sixth.cpuAverage,40);assert.equal(sixth.cpuWindowSeconds,10);
 const afterSleep=avg(normalize(raw(50000,12)));assert.equal(afterSleep.cpuAverage,12);assert.equal(afterSleep.cpuWindowSeconds,2);
 assert.equal(avg(normalize(raw(52000,null))).cpuAverage,null);
});
test('CPU threshold boundaries are inclusive and configurable',()=>{
 for(const [usage,level]of [[0,'normal'],[79.9,'normal'],[80,'warning'],[94.9,'warning'],[95,'critical'],[100,'critical']])assert.equal(classify('cpu',{cpuAverage:usage}),level);
 assert.equal(classify('cpu',{cpuAverage:70},{cpuWarning:60,cpuCritical:90}),'warning');
});
test('disk warns on either low available percentage or low absolute GiB',()=>{
 const disk=(free,total)=>({disk:{available:free*GIB,total:total*GIB,freePercent:free/total*100}});
 assert.equal(classify('disk',disk(40,500)),'warning');
 assert.equal(classify('disk',disk(25,500)),'critical');
 assert.equal(classify('disk',disk(10,64)),'critical');
 assert.equal(classify('disk',disk(20,64)),'warning');
 assert.equal(classify('disk',disk(21,64)),'normal');
});
test('stale, helper failure and future timestamps hide old numbers',()=>{
 const data=createAverage()(normalize(raw()));
 for(const [error,now]of [[null,16501],['PROBE_UNAVAILABLE',10000],[null,4000]]){
  for(const kind of ['memory','cpu','disk']){const v=view(kind,data,{},error,now);assert.equal(v.level,'unknown');assert.equal(v.main,'—');assert.equal(v.percent,null);}
 }
});
test('settings reject invalid thresholds and SVG injection; zero bar stays empty',()=>{
 const s=settings({greenColor:'"/><script>',cpuWarning:99,cpuCritical:40,diskWarning:1,diskCritical:2});
 assert.equal(s.greenColor,'#55e58c');assert.equal(s.cpuWarning,80);assert.equal(s.diskWarning,10);
 const svg=render({title:'<CPU>',main:'0%',label:'Normal',detail:'0s',percent:0,level:'normal'});
 assert.match(svg,/&lt;CPU&gt;/);assert.doesNotMatch(svg,/<CPU>/);assert.doesNotMatch(svg,/width="0"/);
});
