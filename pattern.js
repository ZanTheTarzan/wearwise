/* Wearwise v1.4 — empirical outfit selection. No garment warmth ratings or temperature-to-garment rules. */
(function(root){
'use strict';
const number=x=>typeof x==='number'&&Number.isFinite(x);
const n=(v,fallback)=>number(v)?v:fallback;
const allowed=new Set(['perfect','good','mixed','hot','cold']);
const good=new Set(['perfect','good']);
function distance(a,b){
  // All coefficients below weight similarities of WEATHER OBSERVATIONS, not clothing warmth.
  const parts=[['feels',9,1.7],['high',13,.75],['low',13,.65],['wind',9,.55],['minFeel',11,.5],['sunny',.4,.25]];
  let weighted=0, total=0;
  for(const [field,scale,weight] of parts){if(number(a?.[field])&&number(b?.[field])){weighted+=Math.abs(a[field]-b[field])/scale*weight;total+=weight;}}
  if(total===0)return Infinity;
  let dist=weighted/total*3.0;
  if(typeof a.wet==='boolean'&&typeof b.wet==='boolean'&&a.wet!==b.wet)dist+=.9;
  return dist;
}
function normalized(v){return String(v||'').trim().toLocaleLowerCase('en-US').replace(/\s+/g,' ')}
function outfitKey(x){return ['bottom','base','middle','outer'].map(k=>normalized(x[k])).join('|')}
function validWardrobe(x,wardrobe){
  // A garment deleted from Settings must not be offered in a new recommendation.
  for(const k of ['bottom','base','middle','outer']){
    if(!x[k]){if(k==='base'||k==='bottom')return false;continue;}
    if(!Array.isArray(wardrobe?.[k])||!wardrobe[k].some(v=>normalized(v)===normalized(x[k])))return false;
  }
  return true;
}
function comfortValue(c){return {perfect:1,good:.8,mixed:.08,hot:-1,cold:-1}[c]??0}
function activityDistance(a,b){if(!a||!b||a==='mixed'||b==='mixed')return .08;return a===b?0:.38}
function evaluate(f,logs,wardrobe){
  let samples=logs.filter(l=>l&&l.summary&&number(l.summary.feels)&&allowed.has(l.comfort)&&l.base&&l.bottom)
    .map(l=>({ ...l,distance:distance(f.summary,l.summary)+activityDistance(f.activity,l.activity)+(l.ill?.75:0) }))
    .filter(l=>Number.isFinite(l.distance)).sort((a,b)=>a.distance-b.distance);
  const nearest=samples.slice(0,5);
  const available=samples.filter(l=>validWardrobe(l,wardrobe));
  const candidates=new Map();
  for(const l of available){
    const key=outfitKey(l);
    if(!candidates.has(key))candidates.set(key,{outfit:l,records:[]});
    candidates.get(key).records.push(l);
  }
  let ranked=[];
  for(const candidate of candidates.values()){
    const positives=candidate.records.filter(l=>good.has(l.comfort));
    if(!positives.length)continue; // only recommend outfits that have actually worked before
    const evidence=candidate.records.map(l=>({l,w:Math.exp(-l.distance/1.2)*(l.ill?.35:1)}));
    const pos=evidence.filter(x=>good.has(x.l.comfort));
    const goodWeight=pos.reduce((s,x)=>s+x.w*comfortValue(x.l.comfort),0);
    const badWeight=evidence.filter(x=>x.l.comfort==='hot'||x.l.comfort==='cold').reduce((s,x)=>s+x.w,0);
    const mixedWeight=evidence.filter(x=>x.l.comfort==='mixed').reduce((s,x)=>s+x.w,0);
    const bestPositive=positives.reduce((a,b)=>a.distance<=b.distance?a:b);
    // Reject outfits with contradictory feedback under similar conditions.
    // Positive evidence is proximity-weighted; similar negative outcomes penalize the same outfit.
    const score=(goodWeight-1.1*badWeight-.13*mixedWeight)/(0.2+goodWeight+badWeight+mixedWeight)
      +.16*Math.log1p(pos.length)-.12*Math.min(bestPositive.distance,5);
    ranked.push({score,record:bestPositive,positives:positives.length,negatives:candidate.records.filter(l=>l.comfort==='hot'||l.comfort==='cold').length,nearestDistance:bestPositive.distance,goodWeight,badWeight});
  }
  ranked.sort((a,b)=>b.score-a.score || a.nearestDistance-b.nearestDistance);
  let chosen=ranked[0]||null;
  if(!chosen){return {output:'Not enough compatible clothing history yet',extras:[],reason:'No previously comfortable outfit uses only items currently in your wardrobe. Log a successful outfit to teach Wearwise what works; the app will not guess garment insulation.',confidence:'Insufficient evidence',matches:nearest,chosen:null};}
  const r=chosen.record;
  const pieces=[r.base,r.middle,r.outer].filter(Boolean);
  const distant=chosen.nearestDistance>=2.3;
  const close=available.filter(l=>l.distance<=1.3&&!l.ill);
  const closeGood=close.filter(l=>good.has(l.comfort));
  const level=(!distant&&chosen.positives>=3&&closeGood.length>=4&&chosen.badWeight<.25)?'Moderate':(!distant&&closeGood.length>=2&&chosen.badWeight<.4)?'Limited':'Low';
  let reason=`Based on ${r.date}: ${r.comfort} comfort with this combination in similar weather. ${chosen.positives} successful log${chosen.positives===1?'':'s'} for this exact outfit.`;
  if(chosen.negatives)reason+=` ${chosen.negatives} logged hot/cold result${chosen.negatives===1?'':'s'} for the same outfit are included in its score.`;
  if(distant)reason+=' No close successful weather match: this is an extrapolation, not a tested outfit for these conditions.';
  if(r.ill)reason+=' Closest positive example was flagged for illness and given lower weight.';
  reason+=' Clothing items receive no manually assigned warmth values.';
  return {output:`${r.bottom} · ${pieces.join(' + ')}`,extras:r.accessories?[`Previously used: ${r.accessories}`]:[],reason,confidence:`${level} confidence · ${closeGood.length} nearby comfortable day${closeGood.length===1?'':'s'}`,matches:nearest,chosen};
}
const API={evaluate,distance,validWardrobe};
root.WearwisePattern=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
