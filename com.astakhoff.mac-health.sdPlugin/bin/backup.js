'use strict';
const DAY=86400000;
function backupView(data,error=null,now=Date.now()) {
 const unknown=detail=>({title:'Backup',main:'—',detail,level:'unknown',label:detail,percent:null});
 if(!data||error||now-data.timestamp>6500||data.timestamp>now+5000)return unknown(data?'Offline':'Waiting');
 const backup=data.backup;
 if(!backup||now-backup.checkedAt>90000||backup.checkedAt>now+5000)return unknown('Unknown');
 const last=backup.lastCompleted;
 if(!Number.isFinite(last)||last<=0||last>now)return unknown('Unknown');
 const age=now-last,days=Math.floor(age/DAY);
 // Months are approximate 30-day periods, never calendar precision.
 const main=days>=60?Math.floor(days/30)+'mo':days>=1?days+'d':age>=3600000?Math.floor(age/3600000)+'h':'<1h';
 return {title:'Backup',main,detail:'ago',label:'Last known backup',level:days>=30?'critical':days>=7?'warning':'normal',percent:null,lastCompleted:last};
}
module.exports={backupView};
