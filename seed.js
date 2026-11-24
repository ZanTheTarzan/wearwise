// Transcribed day-level summaries from the 25 user-provided daily logs.
// These are NOT the full 625 hourly observation records; no artificial hourly records are generated.
// Approximate weather descriptors use the log's daytime/early evening period.
window.STARTER = [
['2026-10-29',66,58,68,3,0,'Jeans','T-shirt','Green wool sweater','','','hot','Too hot in afternoon; morning and evening great'],
['2026-10-30',66,58,69,3,0,'Jeans','T-shirt','Green wool sweater','','','good','Good without strenuous activity'],
['2026-10-31',66,57,69,4,0,'Jeans','T-shirt','Green wool sweater','','','mixed','Changed into silk long-sleeve and additional belly layer; barely enough in late evening'],
['2026-11-01',60,51,56,7,0,'Jeans','T-shirt','Green wool sweater','','','cold','Good in sun and out of wind; too cold morning/evening, especially 6:30 PM'],
['2026-11-02',61,57,52,14,0,'Jeans','Wool long-sleeve','PJ jacket','','','good','Great most of day; any warmer would be too much at afternoon peak'],
['2026-11-03',68,58,69,4,0,'Jeans','Wool long-sleeve','Green wool sweater','','Scarf','mixed','Removed sweater during afternoon peak, otherwise just right'],
['2026-11-04',63,53,60,5,0,'Jeans','Wool long-sleeve','Green wool sweater','','Scarf','good','Removed sweater a couple times; overall would not change outfit'],
['2026-11-05',66,58,64,3,0,'Jeans','T-shirt','','Tiger-stripe outer layer','','perfect','Perfect'],
['2026-11-06',63,58,59,6,1,'KÜHL pants','T-shirt','Green wool sweater','','Cloak (morning)','mixed','Generally great, chilly at times; preferred thin sleeve and cloak for rain'],
['2026-11-07',51,45,52,2,0,'KÜHL pants','Thin wool long-sleeve','','PJ jacket','','mixed','Removed jacket on hike; removed jacket liner and was perfect when colder'],
['2026-11-08',64,55,64,2,0,'KÜHL pants','Wool long-sleeve','','PJ jacket without liner','Newsboy hat','good','Coat great morning/evening, removed in afternoon'],
['2026-11-09',60,57,56,6,0,'KÜHL pants','Wool long-sleeve','','','Newsboy hat','cold','A little chilly stationary; fine while moving'],
['2026-11-10',69,64,65,10,0,'Black pants','Sleeveless undershirt','Flannel','','','good','Worked great'],
['2026-11-11',71,65,67,9,0,'Linen pants','T-shirt','','','','mixed','Great until sunset, then a little chilly'],
['2026-11-12',69,67,62,16,1,'KÜHL pants','Sleeveless undershirt','Tan wool sweater','','Cloak considered, not worn','good','Great; cloak not used'],
['2026-11-13',63,54,54,9,1,'KÜHL pants','Sleeveless undershirt','Wool sweater','Cloak','Newsboy hat; scarf/gloves packed','perfect','Perfect; cloak useful for rain and warmth'],
['2026-11-15',54,51,52,4,0,'KÜHL pants','Wool long-sleeve','Tan wool sweater','Cloak','Gloves','perfect','Perfect; removed cloak without rain and during uphill activity'],
['2026-11-16',61,56,56,7,0,'KÜHL pants','Wool long-sleeve','Tan wool sweater','Cloak','','mixed','Cloak too much with sun; removed sweater after returning to Rome'],
['2026-11-17',67,63,62,10,0,'KÜHL pants','T-shirt','Tan wool sweater','','Newsboy hat','mixed','Sweater warm at times, great at night; ill and preferred more warmth'],
['2026-11-18',67,62,63,5,0,'Black pants','Wool long-sleeve','Green wool sweater','','Newsboy hat','hot','Sweater too much except early morning/late evening; hat almost too much'],
['2026-11-19',69,58,60,13,1,'Pants','Wool long-sleeve','Tan wool sweater','','','perfect','Perfect'],
['2026-11-20',49,43,37,11,1,'KÜHL pants','Wool long-sleeve','','PJ jacket with liner','Accessories listed; usage uncertain','unknown','Only confirmed wool shirt and PJ jacket with liner; comfort not reported'],
['2026-11-21',45,38,34,10,0,'KÜHL pants','Thin wool long-sleeve','','PJ jacket','Fur hat, gloves, scarf','good','Great; scarf too much in sun, useful after sunset'],
['2026-11-22',42,34,38,4,0,'KÜHL pants','Wool long-sleeve','','PJ jacket','Gloves, scarf, fur hat','mixed','Very cold morning; removed scarf/hat sometimes afternoon/evening'],
['2026-11-23',64,50,58,6,0,'KÜHL pants','Wool long-sleeve','','','','good','Good']
].map((x,i)=>({id:'seed-'+i,date:x[0],location:'User historical location',summary:{high:x[1],low:x[2],feels:x[3],wind:x[4],wet:!!x[5]},bottom:x[6],base:x[7],middle:x[8],outer:x[9],accessories:x[10],comfort:x[11],notes:x[12],source:'historical-day-summary',hourly:null,activity:'normal',ill:x[0]==='2026-11-17'}));
