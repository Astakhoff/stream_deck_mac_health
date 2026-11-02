const {test}=require('node:test'),assert=require('node:assert/strict');
const {backupView}=require('../com.astakhoff.mac-health.sdPlugin/bin/backup');
const {normalize,view}=require('../com.astakhoff.mac-health.sdPlugin/bin/metrics');
const {render}=require('../com.astakhoff.mac-health.sdPlugin/bin/render');
const now=1800000000000,day=86400000;
const sample=(days)=>({timestamp:now,backup:{accessible:true,checkedAt:now,lastCompleted:now-days*day}});
test('backup age units and color follow elapsed completed-backup age',()=>{
 for(const [days,text,level] of [[0,'<1h','normal'],[.5,'12h','normal'],[1,'1d','normal'],[7,'7d','warning'],[25,'25d','warning'],[30,'30d','critical'],[60,'2mo','critical']]){
  const v=backupView(sample(days),null,now);assert.equal(v.main,text);assert.equal(v.level,level);assert.equal(v.detail,'ago');
 }
});
test('unreadable, missing, future and stale backups never appear healthy or as never backed up',()=>{
 const cases=[{timestamp:now},sample(-1),{...sample(1),timestamp:now-7000},{...sample(1),backup:{checkedAt:now,lastCompleted:null}},{...sample(1),backup:{checkedAt:now-91000,lastCompleted:now-day}}];
 for(const data of cases){const v=backupView(data,null,now);assert.equal(v.main,'—');assert.equal(v.level,'unknown');}
 assert.equal(backupView(sample(1),'helper failed',now).main,'—');
});
test('backup survives normalizer and uses its independent face without a resource bar',()=>{
 const data=normalize(sample(25));assert.equal(data.backup.lastCompleted,now-25*day);
 const svg=render(view('backup',data,{},null,now));assert.match(svg,/>25d</);assert.match(svg,/>ago</);assert.doesNotMatch(svg,/width="102"/);
});
