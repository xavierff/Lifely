// Objective, discipline-specific practice rounds. The normal hobby contests are unchanged.
const content={
 chess:[
 {cue:'A rook stands on d4 on an empty board. Which square can it reach in one move?',options:[['f6','Diagonal'],['d7','Same file'],['e5','Diagonal']],ideal:1,lesson:'A rook moves along a rank or file.',visual:['d4','f6','d7','e5']},
 {cue:'A bishop stands on c1 on an empty board. Which destination is legal?',options:[['h6','Same diagonal'],['c6','Same file'],['f3','Not the same diagonal']],ideal:0,lesson:'A bishop travels along diagonals.',visual:['c1','h6','c6','f3']},
 {cue:'A knight stands on e4 on an empty board. Which square is one legal knight move away?',options:[['e6','Straight two'],['g6','Two by two'],['f6','One by two']],ideal:2,lesson:'A knight moves two squares in one direction and one perpendicular.',visual:['e4','e6','g6','f6']}],
 streetball:[
 {cue:'Choose the highest expected points: each shot has the shown probability.',options:[['2-point · 45%','Inside shot'],['3-point · 50%','Open three'],['2-point · 55%','Midrange']],ideal:1,lesson:'Expected points = points × probability; 1.5 beats 1.1 and 0.9.',visual:['0.90','1.50','1.10']},
 {cue:'Your team trails by two with one possession. Which made shot wins outright?',options:[['3-point shot','Three points'],['2-point shot','Two points'],['Free throw','One point']],ideal:0,lesson:'Three points turn a two-point deficit into a one-point lead.',visual:['3','2','1']},
 {cue:'One defender covers the middle; two cover the left. The right lane is unguarded. Where do you drive?',options:[['Left','Two defenders'],['Middle','One defender'],['Right','No defenders']],ideal:2,lesson:'Use the unguarded lane.',visual:['●●','●','○']}],
 openmic:[
 {cue:'Complete the repeating beat pattern: strong, soft, soft, strong, soft, ?',options:[['Strong','Accent'],['Soft','Unaccented'],['Rest','Silence']],ideal:1,lesson:'The three-beat motif repeats: strong, soft, soft.',visual:['●','○','○','●','○','?']},
 {cue:'In four beats, two quarter notes have already played. Which duration fills the bar exactly?',options:[['Half note','Two beats'],['Whole note','Four beats'],['Quarter note','One beat']],ideal:0,lesson:'Two quarter notes plus a half note equal four beats.',visual:['♪','♪','?','?']},
 {cue:'Your phrase starts on beat 1 and lasts three beats. When does the next phrase start?',options:[['Beat 2','Early'],['Beat 3','Overlap'],['Beat 4','After three beats']],ideal:2,lesson:'Beats 1, 2 and 3 occupy the phrase; beat 4 follows.',visual:['1','2','3','?']}],
 cooking:[
 {cue:'Recipe card: wash vegetables, chop vegetables, then mix. What comes immediately after washing?',options:[['Mix','Final step'],['Chop','Prepare the vegetables'],['Serve','After mixing']],ideal:1,lesson:'Follow the recipe order.',visual:['Wash','?','Mix']},
 {cue:'A recipe serves two with 100 g flour. How much flour serves four at the same proportions?',options:[['200 g','Double'],['150 g','One and a half'],['100 g','Unchanged']],ideal:0,lesson:'Doubling servings doubles ingredients.',visual:['2 → 100 g','4 → ?']},
 {cue:'The salad recipe requires three parts oil to one part vinegar. With 2 spoonfuls of vinegar, how much oil?',options:[['2','Equal parts'],['4','Two parts'],['6','Three times']],ideal:2,lesson:'Three times two equals six spoonfuls.',visual:['Oil : vinegar','3 : 1','? : 2']}]
};
export const drillIds=Object.keys(content);
export function drillRound(a){return content[a.hobbyId]?.[(a.pattern+a.stage*2)%3]||null;}
