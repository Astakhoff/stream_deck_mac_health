'use strict';
const {EventEmitter}=require('node:events');
const {spawn}=require('node:child_process');
const path=require('node:path');
const {normalize,createAverage}=require('./metrics');
class Monitor extends EventEmitter {
  constructor({spawnHelper=()=>spawn(path.join(__dirname,'mac-health'),[],{stdio:['ignore','pipe','ignore']}),delay=setTimeout,cancel=clearTimeout}={}) {
    super();this.spawnHelper=spawnHelper;this.delay=delay;this.cancel=cancel;this.active=false;this.child=null;this.retry=null;this.failures=0;this.sample=null;this.error=null;
  }
  start(){if(this.active)return;this.active=true;this.launch();}
  launch(){
    if(!this.active)return;
    let child;
    try{child=this.spawnHelper();}catch{this.failed();return;}
    this.child=child;let buffer='',finished=false;const average=createAverage();
    const end=()=>{if(finished)return;finished=true;if(this.child!==child)return;this.child=null;if(this.active)this.failed();};
    child.on('error',end);child.on('close',end);
    child.stdout.on('data',bytes=>{
      if(this.child!==child||!this.active)return;
      buffer+=bytes.toString();
      if(buffer.length>65536){child.kill();end();return;}
      let index;
      while((index=buffer.indexOf('\n'))>=0){
        const line=buffer.slice(0,index);buffer=buffer.slice(index+1);
        try {
          const parsed=normalize(JSON.parse(line));
          if(!parsed)throw new Error('Invalid sample');
          this.sample=average(parsed);this.error=null;this.failures=0;this.emit('sample',this.sample);
        }catch{this.error='INVALID_SAMPLE';this.emit('problem');}
      }
    });
  }
  failed(){this.error='PROBE_UNAVAILABLE';this.emit('problem');if(this.active){const ms=Math.min(30000,2000*2**Math.min(this.failures++,4));this.retry=this.delay(()=>{this.retry=null;this.launch();},ms);}}
  stop(){this.active=false;if(this.retry)this.cancel(this.retry);this.retry=null;const child=this.child;this.child=null;child?.kill();this.sample=null;this.error=null;this.failures=0;}
}
module.exports={Monitor};
