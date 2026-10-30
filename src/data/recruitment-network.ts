// Recruitment network shown on the map. Source countries are where talent is recruited from; they are not offices (see offices.ts).
// dx/dy place each map label relative to its marker.
export const sourceCountries=[
  {slug:'india',name:'India',ar:'الهند',flag:'in',dx:16,dy:8,anchor:'start'},
  {slug:'sri-lanka',name:'Sri Lanka',ar:'سريلانكا',flag:'lk',dx:16,dy:8,anchor:'start'},
  {slug:'bangladesh',name:'Bangladesh',ar:'بنغلاديش',flag:'bd',dx:16,dy:8,anchor:'start'},
  {slug:'nepal',name:'Nepal',ar:'نيبال',flag:'np',dx:0,dy:-16,anchor:'middle'},
  {slug:'philippines',name:'Philippines',ar:'الفلبين',flag:'ph',dx:0,dy:-18,anchor:'middle'}
];
export const destinationLabels:Record<string,{dx:number;dy:number;anchor:string}>={
  kuwait:{dx:12,dy:7,anchor:'start'},
  'saudi-arabia':{dx:-68,dy:32,anchor:'start'},
  bahrain:{dx:-8,dy:-13,anchor:'middle'},
  qatar:{dx:22,dy:34,anchor:'middle'},
  uae:{dx:13,dy:-6,anchor:'start'},
  oman:{dx:6,dy:32,anchor:'end'}
};
// Routes end inside the GCC panel. [end x, end y, curve control x, curve control y]; each curve keeps clear of other countries' markers.
export const routes:Record<string,[number,number,number,number]>={
  nepal:[350,176,470,70],
  bangladesh:[356,204,500,120],
  india:[360,232,450,240],
  'sri-lanka':[354,262,450,340],
  philippines:[344,290,640,460]
};
