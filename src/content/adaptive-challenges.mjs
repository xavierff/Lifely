export const difficultyNames=['Foundations','Challenger','Expert'];
export function hobbyDifficulty(p){const recent=(p?.history||[]).filter(x=>['won','lost','practiced'].includes(x.status)).slice(-3);const avg=recent.length?recent.reduce((n,x)=>n+x.score,0)/recent.length:0;return (p?.mastery>=25&&avg>=2?1:0)+(p?.mastery>=60&&avg>=2.5?1:0);}
export function examDifficulty(s,e,subject){const rows=(e.examResults||[]).filter(x=>x.subject===subject).slice(-3);const avg=rows.length?rows.reduce((n,x)=>n+x.score,0)/rows.length:0;return s.age>=13&&avg>=2.5&&rows.length>=2?2:s.age>=13||subject==='olympiad'||avg>=2?1:0;}
export function validDifficulty(a){return !a||a.difficulty===undefined||Number.isInteger(a.difficulty)&&a.difficulty>=0&&a.difficulty<=2;}
