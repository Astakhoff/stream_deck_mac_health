'use strict';
const {settings}=require('./metrics');
const escape=(s)=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function render(v,raw={}) {
  const s=settings(raw);
  const color={normal:s.greenColor,warning:s.yellowColor,critical:s.redColor,unknown:'#91a1b9'}[v.level]||'#91a1b9';
  const percent=typeof v.percent==='number'&&Number.isFinite(v.percent)?Math.max(0,Math.min(100,v.percent)):null;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><defs><radialGradient id="bg"><stop stop-color="#1b2335"/><stop offset="1" stop-color="#0c111d"/></radialGradient></defs><rect width="144" height="144" rx="16" fill="url(#bg)"/><g font-family="Arial,Helvetica,sans-serif" text-anchor="middle" font-weight="800"><text x="72" y="27" font-size="21" fill="${color}">${escape(v.title)}</text><text x="72" y="77" font-size="49" letter-spacing="-2" fill="#f3f8ff">${escape(v.main)}</text><rect x="21" y="87" width="102" height="8" rx="4" fill="#303c51"/>${percent>0?`<rect x="21" y="87" width="${102*percent/100}" height="8" rx="4" fill="${color}"/>`:''}<text x="72" y="119" font-size="21" fill="${color}">${escape(v.label)}</text><text x="72" y="139" font-size="13" fill="#c5cfdf">${escape(v.detail)}</text></g></svg>`;
}
module.exports={render};
