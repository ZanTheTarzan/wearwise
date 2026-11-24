(()=>{'use strict';
const $=id=>document.getElementById(id), STORE='wearwise-logs-v1', SETTINGS='wearwise-settings-v1';
const WARDROBE_KEY='wearwise-wardrobe-v1';
const CATEGORIES=[{id:'bottom',title:'Pants / bottoms',defaults:['KÜHL pants','Jeans','Black pants','Linen pants','Other']},{id:'base',title:'Base / top layers',defaults:['Thin wool long-sleeve','Wool long-sleeve','T-shirt','Sleeveless undershirt','Silk long-sleeve','Flannel','Other']},{id:'middle',title:'Additional layers',defaults:['Green wool sweater','Tan wool sweater','Wool sweater','Flannel','Other']},{id:'outer',title:'Outer layers',defaults:['PJ jacket with liner','PJ jacket without liner','PJ jacket','Cloak','Tiger-stripe outer layer','Other']}];
function getWardrobe(){let saved;try{saved=JSON.parse(localStorage.getItem(WARDROBE_KEY)||'null')}catch{}let data={};for(const c of CATEGORIES){let values=Array.isArray(saved?.[c.id])?saved[c.id]:c.defaults;data[c.id]=[...new Set(values.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))]}return data}
let wardrobe=getWardrobe();
// Add historically logged labels to untouched v1.3 default lists, without undoing customized wardrobes.
const previousDefaults={base:['Thin wool long-sleeve','T-shirt','Sleeveless undershirt','Silk long-sleeve','Flannel','Other'],middle:['Green wool sweater','Tan wool sweater','Flannel','Other'],outer:['PJ jacket with liner','PJ jacket without liner','Cloak','Tiger-stripe outer layer','Other']};
let migrated=false;
for(const key of Object.keys(previousDefaults)){
  if(JSON.stringify(wardrobe[key])===JSON.stringify(previousDefaults[key])){
    wardrobe[key]=[...CATEGORIES.find(c=>c.id===key).defaults];migrated=true;
  }
}
if(migrated)localStorage.setItem(WARDROBE_KEY,JSON.stringify(wardrobe));
function saveWardrobe(){localStorage.setItem(WARDROBE_KEY,JSON.stringify(wardrobe));refreshWardrobeSelects();renderWardrobeEditor()}
function refreshWardrobeSelects(){for(const c of CATEGORIES){const select=$(c.id),previous=select.value;select.replaceChildren();if(c.id==='middle'||c.id==='outer'){const opt=document.createElement('option');opt.value='';opt.textContent='None';select.add(opt)}for(const item of wardrobe[c.id]){const opt=document.createElement('option');opt.value=item;opt.textContent=item;select.add(opt)}if([...select.options].some(x=>x.value===previous))select.value=previous;else if(select.options.length)select.selectedIndex=0;}}
function wardrobeMessage(msg){$('wardrobe-status').textContent=msg}
function renderWardrobeEditor(){const host=$('wardrobe-editor');host.replaceChildren();for(const c of CATEGORIES){const group=document.createElement('div');group.className='wardrobe-group';const title=document.createElement('h3');title.textContent=c.title;group.append(title);const items=wardrobe[c.id];if(!items.length){const msg=document.createElement('p');msg.className='subtle';msg.textContent='No items yet.';group.append(msg)}for(const item of items){const line=document.createElement('div');line.className='wardrobe-entry';const field=document.createElement('input');field.value=item;field.setAttribute('aria-label','Rename '+item);const rename=document.createElement('button');rename.className='btn secondary';rename.type='button';rename.textContent='Save';const del=document.createElement('button');del.className='btn danger';del.type='button';del.textContent='Delete';rename.addEventListener('click',()=>{const name=field.value.trim();if(!name){wardrobeMessage('Clothing name cannot be empty.');return}if(name!==item&&items.some(x=>x.toLowerCase()===name.toLowerCase())){wardrobeMessage('That item already exists in this category.');return}const idx=items.indexOf(item);if(idx<0)return;items[idx]=name;try{saveWardrobe();wardrobeMessage('Renamed '+item+' to '+name+'. Past logs are unchanged.')}catch(e){items[idx]=item;wardrobeMessage('Could not save: '+e.message)}});del.addEventListener('click',()=>{if(!confirm('Remove "'+item+'" from future clothing choices? Past logs will remain unchanged.'))return;const idx=items.indexOf(item);if(idx<0)return;items.splice(idx,1);try{saveWardrobe();wardrobeMessage('Removed '+item+' from future options.')}catch(e){items.splice(idx,0,item);wardrobeMessage('Could not save: '+e.message)}});line.append(field,rename,del);group.append(line)}const addRow=document.createElement('div');addRow.className='wardrobe-add';const addField=document.createElement('input');addField.placeholder='New '+c.title.toLowerCase().replace(/s$/,'');addField.setAttribute('aria-label','New '+c.title);const addBtn=document.createElement('button');addBtn.type='button';addBtn.className='btn';addBtn.textContent='Add';function addNew(){const name=addField.value.trim();if(!name){wardrobeMessage('Enter a clothing item first.');return}if(items.some(x=>x.toLowerCase()===name.toLowerCase())){wardrobeMessage('That item already exists in this category.');return}items.push(name);try{saveWardrobe();wardrobeMessage('Added '+name+' to '+c.title+'.')}catch(e){items.pop();wardrobeMessage('Could not save: '+e.message)}}addBtn.addEventListener('click',addNew);addField.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addNew()}});addRow.append(addField,addBtn);group.append(addRow);host.append(group)}}
const clone=x=>JSON.parse(JSON.stringify(x));let logs=loadLogs();let currentForecast=null;let chosenLocation={name:'Rome, Lazio, Italy',latitude:41.8933,longitude:12.4829,timezone:'Europe/Rome'};let searchTimer;
function loadLogs(){try{const v=JSON.parse(localStorage.getItem(STORE));if(Array.isArray(v))return v}catch{}return clone(window.STARTER)}
function save(){localStorage.setItem(STORE,JSON.stringify(logs));renderHistory()}
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function addDays(d,n){let x=new Date(`${d}T12:00:00`);x.setDate(x.getDate()+n);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
function dateFmt(x){return new Date(x+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
const avg=a=>a.reduce((t,x)=>t+x,0)/Math.max(a.length,1), max=a=>Math.max(...a),min=a=>Math.min(...a);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function note(msg,warn=false){$('notice').textContent=msg;$('notice').style.color=warn?'#a75b27':''}
function temp(t){if(!Number.isFinite(t))return '—';return $('units').value==='C'?`${Math.round((t-32)*5/9)}°C`:`${Math.round(t)}°F`}
function wmo(c){if(c===0)return ['Clear','☀'];if(c<=3)return ['Cloudy','⛅'];if(c===45||c===48)return ['Fog','🌫'];if(c>=51&&c<=57)return ['Drizzle','🌦'];if(c>=61&&c<=67)return ['Rain','🌧'];if(c>=71&&c<=77)return ['Snow','❄'];if(c>=80&&c<=82)return ['Showers','🌧'];if(c>=95)return ['Thunder','⛈'];return ['Mixed','☁']}
function switchTab(tab){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('hidden',x.id!==tab));document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));if(tab==='history')renderHistory()}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
for(let h=0;h<=23;h++){let text=`${String(h%12||12)} ${h<12?'AM':'PM'}`;for(let id of ['from','to']){const op=document.createElement('option');op.value=String(h);op.textContent=text;$(id).append(op)}}
$('from').value='8';$('to').value='22';$('day').value=today();$('day').min=today();$('day').max=addDays(today(),15);$('logdate').value=today();
try{let saved=JSON.parse(localStorage.getItem(SETTINGS)||'{}');if(saved.units)$('units').value=saved.units;if(saved.location){chosenLocation=saved.location;$('place').value=saved.location.name}}catch{}
$('loglocation').value=chosenLocation.name;
refreshWardrobeSelects();renderWardrobeEditor();
$('units').addEventListener('change',()=>{localStorage.setItem(SETTINGS,JSON.stringify({units:$('units').value,location:chosenLocation}));if(currentForecast)renderForecast(currentForecast)});
async function searchPlaces(q){const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:q,count:7,language:'en',format:'json'}));if(!r.ok)throw new Error('Location search unavailable');return (await r.json()).results||[]}
$('place').addEventListener('input',()=>{clearTimeout(searchTimer);const q=$('place').value.trim();$('suggestions').classList.add('hidden');if(q.length<2)return;searchTimer=setTimeout(async()=>{try{let places=await searchPlaces(q);if($('place').value.trim()!==q)return;const box=$('suggestions');box.innerHTML='';if(!places.length)return;places.forEach(p=>{let btn=document.createElement('button');btn.type='button';btn.textContent=[p.name,p.admin1,p.country].filter(Boolean).join(', ');btn.addEventListener('click',()=>{chosenLocation={name:btn.textContent,latitude:p.latitude,longitude:p.longitude,timezone:p.timezone};$('place').value=chosenLocation.name;box.classList.add('hidden');localStorage.setItem(SETTINGS,JSON.stringify({units:$('units').value,location:chosenLocation}))});box.append(btn)});box.classList.remove('hidden')}catch(e){note(e.message,true)}},300)});
document.addEventListener('click',e=>{if(!e.target.closest('.locationfield'))$('suggestions').classList.add('hidden')});
$('geo').addEventListener('click',()=>{if(!navigator.geolocation){note('Device location unavailable. Search a city instead.',true);return}note('Requesting location permission…');navigator.geolocation.getCurrentPosition(async p=>{chosenLocation={name:'Current location',latitude:p.coords.latitude,longitude:p.coords.longitude,timezone:'auto'};$('place').value=chosenLocation.name;note('Location selected. Load the forecast.');localStorage.setItem(SETTINGS,JSON.stringify({units:$('units').value,location:chosenLocation}))},()=>note('Location permission denied or unavailable. Search a city instead.',true),{timeout:10000,enableHighAccuracy:false})});
function interpret(h){const day=$('day').value;const start=Number($('from').value),end=Number($('to').value);if(start>end)throw Error('Start hour must be at or before end hour.');const idx=h.time.map((x,i)=>x.startsWith(day+'T')&&Number(x.slice(11,13))>=start&&Number(x.slice(11,13))<=end?i:-1).filter(i=>i>=0);if(!idx.length)throw Error('No hourly forecast for this date.');const rows=idx.map(i=>({time:h.time[i],temp:h.temperature_2m[i],feels:h.apparent_temperature[i],humidity:h.relative_humidity_2m[i],wind:h.wind_speed_10m[i],precip:h.precipitation_probability[i],rain:h.precipitation[i],code:h.weather_code[i]}));return {date:day,place:chosenLocation.name,activity:$('activity').value,rows,summary:{high:max(rows.map(x=>x.temp)),low:min(rows.map(x=>x.temp)),feels:avg(rows.map(x=>x.feels)),wind:avg(rows.map(x=>x.wind)),maxWind:max(rows.map(x=>x.wind)),minFeel:min(rows.map(x=>x.feels)),wet:rows.some(x=>x.rain>=.2||x.precip>=50),rainChance:max(rows.map(x=>x.precip)),sunny:rows.filter(x=>x.code<=1).length/rows.length}}}
async function fetchWeather(){const date=$('day').value;if(!date||date<today()||date>addDays(today(),15)){note('Select a date from today through 15 days ahead.',true);return}if(Number($('from').value)>Number($('to').value)){note('Your outside start time must be earlier than the end time.',true);return}let q=$('place').value.trim();if(!q){note('Enter a destination.',true);return}if(q!==chosenLocation.name){try{let matches=await searchPlaces(q);if(!matches.length)throw Error('Destination not found');const p=matches[0];chosenLocation={name:[p.name,p.admin1,p.country].filter(Boolean).join(', '),latitude:p.latitude,longitude:p.longitude,timezone:p.timezone};$('place').value=chosenLocation.name}catch(e){note('Could not resolve destination: '+e.message,true);return}}
const button=$('load');button.disabled=true;button.textContent='Loading forecast…';note('Getting destination-local hourly forecast…');
try{const u=new URL('https://api.open-meteo.com/v1/forecast');Object.entries({latitude:chosenLocation.latitude,longitude:chosenLocation.longitude,hourly:'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,precipitation,weather_code',temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'mm',timezone:'auto',forecast_days:16}).forEach(([k,v])=>u.searchParams.set(k,v));let response=await fetch(u);if(!response.ok)throw Error('Weather service returned '+response.status);const json=await response.json();currentForecast=interpret(json.hourly);renderForecast(currentForecast);$('output').classList.remove('hidden');note('Forecast loaded for '+chosenLocation.name+'.');localStorage.setItem(SETTINGS,JSON.stringify({units:$('units').value,location:chosenLocation}));}catch(e){note('Could not load forecast: '+e.message+'. Check your connection.',true)}finally{button.disabled=false;button.textContent='Get forecast & recommendation'}}
$('load').addEventListener('click',fetchWeather);
// Outfit recommendations are learned from actual logged weather, outfits and comfort feedback.
// No fixed garment warmth ratings or temperature-to-garment thresholds are used.
function recommend(f){return window.WearwisePattern.evaluate(f,logs,wardrobe)}
function renderForecast(f){let r=recommend(f);$('outfit').textContent=r.output;$('why').textContent=r.reason+(r.extras.length?' '+[...new Set(r.extras)].join('. ')+'.':'');$('confidence').textContent=r.confidence;$('forecasttitle').textContent=`${f.place} · ${dateFmt(f.date)}`;$('max').textContent=temp(f.summary.high);$('min').textContent=temp(f.summary.low);$('feels').textContent=temp(f.summary.minFeel);$('wind').textContent=Math.round(f.summary.maxWind)+' mph';$('daynotes').textContent=`${f.summary.rainChance}% maximum hourly rain chance. ${f.summary.wet?'Rain protection advised.':'No strong rain signal during your selected hours.'} Pattern estimates based on ${logs.length} daily records; no garment warmth ratings.`;$('timeline').innerHTML=f.rows.map(x=>`<div class="hour"><div>${esc(x.time.slice(11,16))}</div><div class="emoji">${wmo(x.code)[1]}</div><strong>${temp(x.temp)}</strong><small>Feels ${temp(x.feels)}</small><small>${Math.round(x.wind)} mph</small><small>${Math.round(x.precip)}% rain</small></div>`).join('');$('matches').innerHTML=r.matches.length?r.matches.map(x=>`<div class="historyitem"><div><b>${esc(dateFmt(x.date))} · ${esc(x.comfort)}</b><p>${esc([x.base,x.middle,x.outer].filter(Boolean).join(' + '))}</p><p>${esc(x.notes)}</p></div><div><span class="tag">${temp(x.summary.feels)} feels</span><span class="tag">${Math.round(x.summary.wind)} mph</span></div></div>`).join(''):'<div class="empty">No comparable examples yet.</div>'}
$('recordthis').addEventListener('click',()=>{if(currentForecast){$('logdate').value=currentForecast.date;$('loglocation').value=currentForecast.place}switchTab('log')});
// Retrieve the matching location/date automatically when recording a reflection. A fresh
// API response is a new forecast, not proof of the weather that was actually observed.
async function fetchSnapshot(date, location){
  if(date<addDays(today(),-7)||date>addDays(today(),15))throw Error('Weather is available here for the past 7 days or next 15 days only');
  const q=location.trim();
  let loc;
  if(q===chosenLocation.name&&Number.isFinite(chosenLocation.latitude))loc=chosenLocation;
  else if(q==='Current location'&&Number.isFinite(chosenLocation.latitude))loc=chosenLocation;
  else {
    let matches=await searchPlaces(q);
    if(!matches.length&&q.includes(','))matches=await searchPlaces(q.split(',')[0].trim());
    if(!matches.length)throw Error('Location not found: '+q);
    const m=matches[0];loc={name:[m.name,m.admin1,m.country].filter(Boolean).join(', '),latitude:m.latitude,longitude:m.longitude,timezone:m.timezone};
  }
  const params=new URLSearchParams({latitude:loc.latitude,longitude:loc.longitude,hourly:'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,precipitation,weather_code',temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'mm',timezone:'auto',forecast_days:'16',past_days:'7'});
  const resp=await fetch('https://api.open-meteo.com/v1/forecast?'+params);
  if(!resp.ok)throw Error('Weather service error '+resp.status);
  const json=await resp.json(),h=json.hourly;
  if(!h||!Array.isArray(h.time))throw Error('Weather provider returned no hourly data');
  const idx=h.time.map((t,i)=>t.startsWith(date+'T')?i:-1).filter(i=>i>=0);
  if(!idx.length)throw Error('No hourly data for '+date);
  const rows=idx.map(i=>({time:h.time[i],temp:h.temperature_2m[i],feels:h.apparent_temperature[i],humidity:h.relative_humidity_2m[i],wind:h.wind_speed_10m[i],precip:h.precipitation_probability[i],rain:h.precipitation[i],code:h.weather_code[i]}));
  const valid=rows.filter(r=>Number.isFinite(r.temp)&&Number.isFinite(r.feels)&&Number.isFinite(r.wind));
  if(!valid.length)throw Error('Hourly data missing temperature or wind');
  const summary={high:max(valid.map(x=>x.temp)),low:min(valid.map(x=>x.temp)),feels:avg(valid.map(x=>x.feels)),wind:avg(valid.map(x=>x.wind)),maxWind:max(valid.map(x=>x.wind)),minFeel:min(valid.map(x=>x.feels)),wet:valid.some(x=>x.rain>=.2||x.precip>=50),rainChance:max(valid.map(x=>x.precip??0)),sunny:valid.filter(x=>x.code<=1).length/valid.length};
  return {rows,summary,place:loc.name,kind:date<today()?'backfilled forecast':'forecast',capturedAt:new Date().toISOString()};
}
$('logform').addEventListener('submit',async e=>{
  e.preventDefault();const val=id=>$(id).value;
  const btn=$('logform').querySelector('button[type="submit"]');btn.disabled=true;
  const status=$('logstatus');status.textContent='Retrieving hourly weather and saving…';
  const entry={id:'user-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),date:val('logdate'),location:val('loglocation').trim(),bottom:val('bottom'),base:val('base'),middle:val('middle'),outer:val('outer'),accessories:['hat','scarf','gloves'].filter(id=>$(id).checked).join(', '),comfort:val('comfort'),activity:val('logactivity'),ill:$('sick').checked,notes:val('notes'),source:'user',summary:null,hourly:null};
  try{
    const same=currentForecast?.date===entry.date&&currentForecast?.place===entry.location;
    try{
      let snap=same?{rows:currentForecast.rows,summary:currentForecast.summary,kind:'forecast',capturedAt:new Date().toISOString()}:await fetchSnapshot(entry.date,entry.location);
      entry.summary=clone(snap.summary);entry.hourly=clone(snap.rows);entry.weatherSource=snap.kind;entry.weatherCapturedAt=snap.capturedAt;
    }catch(err){
      // Never silently turn a full training record into an unlabelled weatherless one.
      if(!confirm('Could not attach hourly weather ('+err.message+'). Save clothing and notes WITHOUT weather anyway?')){status.textContent='Not saved; weather could not be retrieved. Your form is unchanged.';return;}
      entry.weatherError=String(err.message);
    }
    logs.unshift(entry);
    try{save()}catch(err){logs.shift();throw err}
    status.textContent=entry.hourly?.length?'Saved with '+entry.hourly.length+' hourly weather readings'+(entry.weatherSource==='backfilled forecast'?' (retrieved afterward).':'.'):'Saved without weather at your request.';
    $('logform').reset();$('logdate').value=today();
  }catch(err){status.textContent='Save failed: '+err.message}
  finally{btn.disabled=false}
});
function weatherDetail(x){
  const summary=x.summary;
  if(!summary)return '<p class="subtle">No forecast was attached to this entry. Earlier missing forecasts cannot be reconstructed from this saved record.</p>';
  const summaryHtml=`<p><strong>Saved weather:</strong> High ${temp(summary.high)} · Low ${temp(summary.low)} · Mean feels-like ${temp(summary.feels)} · Lowest feels-like ${temp(summary.minFeel)} · Mean wind ${Number.isFinite(summary.wind)?Math.round(summary.wind)+' mph':'—'} · Peak wind ${Number.isFinite(summary.maxWind)?Math.round(summary.maxWind)+' mph':'—'} · Max rain probability ${Number.isFinite(summary.rainChance)?Math.round(summary.rainChance)+'%':'—'}</p>`;
  if(!x.hourly?.length)return summaryHtml+'<p class="subtle">Only a weather summary is available for this historical entry.</p>';
  const rows=x.hourly.map(h=>`<tr><td>${esc(h.time?.slice(11,16)||'—')}</td><td>${temp(h.temp)}</td><td>${temp(h.feels)}</td><td>${Number.isFinite(h.humidity)?Math.round(h.humidity)+'%':'—'}</td><td>${Number.isFinite(h.wind)?h.wind.toFixed(1)+' mph':'—'}</td><td>${Number.isFinite(h.precip)?Math.round(h.precip)+'%':'—'}</td><td>${Number.isFinite(h.rain)?h.rain.toFixed(1)+' mm':'—'}</td><td>${esc(wmo(h.code)[0])}</td></tr>`).join('');
  return summaryHtml+`<div style="max-width:100%;overflow-x:auto"><table style="width:100%;font-size:12px;text-align:left;border-spacing:10px 8px;white-space:nowrap"><thead><tr><th>Hour</th><th>Temp</th><th>Feels</th><th>Humidity</th><th>Wind</th><th>Rain chance</th><th>Precip.</th><th>Conditions</th></tr></thead><tbody>${rows}</tbody></table></div><p class="subtle">Saved forecast at logging time, not verified observed weather.</p>`;
}
function renderHistory(){
  const sorted=[...logs].sort((a,b)=>b.date.localeCompare(a.date));
  $('historycount').textContent=`${logs.length} days · ${logs.filter(x=>x.hourly?.length).length} logs with full hourly snapshots · ${logs.filter(x=>x.source==='historical-day-summary').length} starter summaries`;
  $('historylist').innerHTML=sorted.map(x=>`<div class="historyitem"><div style="flex:1;min-width:0"><b>${esc(dateFmt(x.date))} <span class="badge">${esc(x.comfort)}</span></b><p>${esc(x.location||'Location not recorded')}</p><p>${esc([x.bottom,x.base,x.middle,x.outer,x.accessories].filter(Boolean).join(' · '))}</p><p>${esc(x.notes||'No notes')}</p><small class="subtle">${x.hourly?.length?x.hourly.length+' saved hourly points':x.summary?'Weather summary only':'No weather snapshot'}${x.ill?' · Illness flagged':''}${x.weatherSource==='backfilled forecast'?' · Weather fetched after this date':''}</small>${x.source==='user'&&!x.hourly?.length?`<button class="btn" data-attach="${esc(x.id)}" style="margin-top:8px">Attach available weather</button>`:''}<details style="margin-top:9px"><summary style="cursor:pointer;color:#39866e;font-weight:600">View saved weather</summary><div style="padding:12px 0">${weatherDetail(x)}</div></details></div><div>${x.source==='user'?`<button class="btn danger" data-delete="${esc(x.id)}">Delete</button>`:''}</div></div>`).join('');
  document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Delete this clothing log?')){logs=logs.filter(x=>x.id!==b.dataset.delete);save()}}));
  document.querySelectorAll('[data-attach]').forEach(b=>b.addEventListener('click',async()=>{
    const entry=logs.find(x=>x.id===b.dataset.attach);if(!entry)return;
    b.disabled=true;b.textContent='Fetching weather…';
    try{
      const snap=await fetchSnapshot(entry.date,entry.location);
      entry.summary=clone(snap.summary);entry.hourly=clone(snap.rows);entry.weatherSource=snap.kind;entry.weatherCapturedAt=snap.capturedAt;
      save();
      alert('Attached '+entry.hourly.length+' hourly readings. Weather retrieved now may differ from the forecast originally seen.');
    }catch(err){b.disabled=false;b.textContent='Attach available weather';alert('Could not attach weather: '+err.message)}
  }));
}
$('export').addEventListener('click',()=>{let blob=new Blob([JSON.stringify({app:'Wearwise',version:1,exportedAt:new Date().toISOString(),logs,wardrobe},null,2)],{type:'application/json'});let u=URL.createObjectURL(blob);let a=document.createElement('a');a.href=u;a.download=`wearwise-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)});
$('import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{let data=JSON.parse(await file.text());if(!Array.isArray(data.logs)||data.logs.some(x=>!x.id||!x.date||!x.base))throw Error('Not a valid Wearwise backup');if(!confirm(`Replace ${logs.length} local records with ${data.logs.length} imported records?`))return;const newWardrobe=data.wardrobe&&typeof data.wardrobe==='object'?data.wardrobe:null;logs=data.logs;save();if(newWardrobe){const normalized={};for(const c of CATEGORIES){normalized[c.id]=Array.isArray(newWardrobe[c.id])?[...new Set(newWardrobe[c.id].filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))]:wardrobe[c.id]}wardrobe=normalized;saveWardrobe()}alert('Backup imported'+(newWardrobe?' including wardrobe options.':'.'))}catch(err){alert('Import failed: '+err.message)}finally{e.target.value=''}});
$('reset').addEventListener('click',()=>{if(confirm('Replace all current local logs with the original 25-day starter dataset? Export a backup first.')){logs=clone(window.STARTER);save();alert('Starter dataset restored.')}});
renderHistory();if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
