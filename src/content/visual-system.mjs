// Shared palette and presentation-only derivations. No new simulation rules.
export const palette={background:'#101B1E',surface:'#19282D',raised:'#22363C',border:'#3D575B',text:'#F6F5EE',muted:'#B9CBCA',accent:'#D0F3A1',accentInk:'#17291D',gold:'#FFD9A0',danger:'#FFB5AE',blue:'#AFCFEA',plum:'#E0BEDC'};
export const chapterBands=[
 {from:0,to:5,label:'Early childhood',detail:'A world to discover',tone:'#AFCFEA',symbol:'✦'},
 {from:6,to:12,label:'Childhood',detail:'Learning and belonging',tone:'#D0F3A1',symbol:'✧'},
 {from:13,to:17,label:'Teenage years',detail:'Finding your own voice',tone:'#E0BEDC',symbol:'◇'},
 {from:18,to:34,label:'Early adulthood',detail:'Build your own path',tone:'#FFD9A0',symbol:'↗'},
 {from:35,to:59,label:'Midlife',detail:'Choices become legacies',tone:'#AFCFEA',symbol:'◈'},
 {from:60,to:110,label:'Later life',detail:'Reflect, reconnect and pass it on',tone:'#FFD9A0',symbol:'✺'}
];
export function chapterPresentation(age,alive=true){
 const n=Math.min(110,Math.max(0,Number.isFinite(age)?Math.floor(age):0)),index=chapterBands.findIndex(b=>n<=b.to),band=chapterBands[index];
 return {...band,index,age:n,progress:Math.round((n-band.from)/(band.to-band.from)*100),complete:!alive,next:index<chapterBands.length-1?chapterBands[index+1].label:null};
}
export function lifeFeedback(before,after,milestone){
 if(!before||!after||before.lifeId!==after.lifeId||milestone||!after.alive)return null;
 if(after.age>before.age)return 'year';
 if(before.pending!==null&&before.pending!==undefined&&after.pending===null)return 'decision';
 return null;
}
