// Fictional instruments; these are game simulations, not market data.
export const instruments=[
{id:'index',name:'Broad market fund',base:.055,vol:.18,dividend:.018},
{id:'growth',name:'Growth shares',base:.075,vol:.38,dividend:.005},
{id:'bond',name:'Government bond fund',base:.025,vol:.06,dividend:.025},
{id:'property',name:'Property trust',base:.045,vol:.22,dividend:.035},
{id:'digital',name:'Digital asset basket',base:.035,vol:.65,dividend:0}];
export const portfolioWorth=s=>Object.values(s.portfolio||{}).reduce((n,v)=>n+v,0);
export function portfolioTick(s,rng){let returns=0,dividends=0;s.portfolio??={};s.marketReport={};for(const a of instruments){const prior=s.portfolio[a.id]||0;const rate=Math.max(-.85,Math.min(.85,a.base+(rng(s)-.5)*a.vol*2+(s.market-1)*(a.id==='bond'?.04:.18)));const change=Math.round(prior*rate),income=Math.round(prior*a.dividend);s.portfolio[a.id]=Math.max(0,prior+change);returns+=change;dividends+=income;s.marketReport[a.id]={rate:Math.round(rate*1000)/10,change,dividend:income};}return {returns,dividends};}
export const rentalDefaults=()=>({occupied:false,condition:80,tenant:'',rentLevel:100,years:0,lastRent:0});
