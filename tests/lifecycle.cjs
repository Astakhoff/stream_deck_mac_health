const {test}=require('node:test'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const {Monitor}=require('../com.astakhoff.mac-health.sdPlugin/bin/monitor');
const {createController}=require('../com.astakhoff.mac-health.sdPlugin/bin/controller');
test('helper handles chunked lines, invalid samples, retry, and cancellation',()=>{
 const children=[],pending=[];
 const m=new Monitor({spawnHelper:()=>{const child=new EventEmitter();child.stdout=new EventEmitter();child.killed=false;child.kill=()=>child.killed=true;children.push(child);return child;},delay:(fn,ms)=>{const timer={fn,ms};pending.push(timer);return timer;},cancel:t=>t.cancelled=true});
 m.start();m.start();assert.equal(children.length,1);
 children[0].stdout.emit('data',Buffer.from('{"timestamp":10000,"cpu":'));
 children[0].stdout.emit('data',Buffer.from('25}\n'));assert.equal(m.sample.cpuAverage,25);
 children[0].stdout.emit('data',Buffer.from('bad\n'));assert.equal(m.error,'INVALID_SAMPLE');
 children[0].emit('close');assert.equal(pending[0].ms,2000);pending[0].fn();assert.equal(children.length,2);
 m.stop();assert.ok(children[1].killed);assert.equal(m.sample,null);
 children[1].emit('close');assert.equal(pending.length,1);
});
test('three separate actions share sampling; per-key thresholds and opening behavior stay independent',async()=>{
 const callbacks={},pictures={},opened=[];
 const sd={actions:{onWillAppear:f=>callbacks.appear=f,onWillDisappear:f=>callbacks.disappear=f,onKeyDown:f=>callbacks.key=f},settings:{onDidReceiveSettings:f=>callbacks.settings=f},ui:{onDidAppear:f=>callbacks.inspector=f,action:null,sendToPropertyInspector:()=>Promise.resolve()}};
 const m=new EventEmitter();m.active=false;m.starts=0;m.stops=0;m.start=()=>{if(!m.active){m.active=true;m.starts++;}};m.stop=()=>{m.active=false;m.stops++;};
 m.sample={timestamp:Date.now(),cpuAverage:85,cpuWindowSeconds:10,memory:{percent:95,pressure:1,swap:0},disk:{percent:92,available:40*1024**3,freePercent:8}};
 const action=(kind)=>({id:kind,manifestId:'com.astakhoff.mac-health.'+kind,setImage:image=>{pictures[kind]=Buffer.from(image.split(',')[1],'base64').toString();return Promise.resolve();},setTitle:()=>Promise.resolve(),showAlert:()=>Promise.resolve()});
 createController(sd,m,async bundle=>opened.push(bundle));
 const keys=['memory','cpu','disk'].map(action);
 for(const key of keys)callbacks.appear({action:key,payload:{settings:{}}});
 assert.equal(m.starts,1);assert.match(pictures.memory,/>Memory</);assert.match(pictures.memory,/#55e58c/);assert.match(pictures.cpu,/#ffd45c/);assert.match(pictures.disk,/#ffd45c/);
 callbacks.settings({action:keys[1],payload:{settings:{cpuWarning:90,cpuCritical:99}}});assert.match(pictures.cpu,/#55e58c/);assert.match(pictures.disk,/#ffd45c/);
 for(const key of keys)await callbacks.key({action:key});assert.deepEqual(opened,['com.apple.ActivityMonitor','com.apple.ActivityMonitor','com.apple.DiskUtility']);
 callbacks.disappear({action:keys[0]});callbacks.disappear({action:keys[1]});assert.equal(m.stops,0);callbacks.disappear({action:keys[2]});assert.equal(m.stops,1);
});
