'use strict';
const {settings,view}=require('./metrics');
const {render}=require('./render');
function createController(sd,monitor,openApp){
  const actions=new Map();
  const kind=(ev)=>ev.action.manifestId.split('.').at(-1);
  function paint(record){
    const {action,type,config}=record;
    const display=view(type,monitor.sample,config,monitor.error);
    const image='data:image/svg+xml;base64,'+Buffer.from(render(display,config)).toString('base64');
    if(record.lastImage!==image){record.lastImage=image;Promise.resolve(action.setImage(image)).catch(()=>{record.lastImage=null;});}
    if(!record.titleCleared){record.titleCleared=true;Promise.resolve(action.setTitle('')).catch(()=>{record.titleCleared=false;});}
    if(sd.ui.action?.id===action.id) Promise.resolve(sd.ui.sendToPropertyInspector({view:display,sample:monitor.sample,error:monitor.error,settings:config,image})).catch(()=>{});
  }
  function paintAll(){for(const record of actions.values())paint(record);}
  const appear=(ev)=>{
    const type=kind(ev);if(!['memory','cpu','disk','backup'].includes(type))return;
    const record={action:ev.action,type,config:settings(ev.payload?.settings)};
    actions.set(ev.action.id,record);paint(record);monitor.start();
  };
  sd.actions.onWillAppear(appear);
  sd.settings.onDidReceiveSettings(ev=>{if(ev.action&&actions.has(ev.action.id))appear(ev);});
  sd.actions.onWillDisappear(ev=>{actions.delete(ev.action.id);if(!actions.size)monitor.stop();});
  sd.ui.onDidAppear(ev=>{const r=actions.get(ev.action.id);if(r)paint(r);});
  sd.actions.onKeyDown(async ev=>{
    const r=actions.get(ev.action.id);if(!r)return;
    try{await openApp(r.type==='backup'?'com.apple.systempreferences':r.type==='disk'?'com.apple.DiskUtility':'com.apple.ActivityMonitor');}
    catch{await Promise.resolve(ev.action.showAlert()).catch(()=>{});}
  });
  monitor.on('sample',paintAll);monitor.on('problem',paintAll);
  return {paintAll,stop:()=>monitor.stop()};
}
module.exports={createController};
