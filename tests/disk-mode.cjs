const {test}=require('node:test'),assert=require('node:assert/strict');
const {view,settings}=require('../com.astakhoff.mac-health.sdPlugin/bin/metrics');
const {render}=require('../com.astakhoff.mac-health.sdPlugin/bin/render');
test('disk modes change percent and capacity together while keeping occupancy bar and color fixed',()=>{
 const now=Date.now(),data={timestamp:now,disk:{total:500*1024**3,available:80*1024**3,percent:84,freePercent:16}};
 const used=view('disk',data,{diskMode:'used'},null,now),free=view('disk',data,{diskMode:'remaining'},null,now);
 assert.equal(used.main,'84%');assert.equal(used.detail,'420 GiB');assert.equal(free.main,'16%');assert.equal(free.detail,'80 GiB');
 assert.equal(used.percent,84);assert.equal(free.percent,84);assert.equal(used.level,free.level);
 for(const v of [used,free])assert.doesNotMatch(render(v),/Free space/);
 assert.equal(settings({diskMode:'other'}).diskMode,'used');
});
