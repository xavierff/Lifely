/* Lifely original deterministic simulation. */
function makeEngine(){
  const clamp=(v)=>Math.max(0,Math.min(100,Math.round(v)));
  const copy=x=>JSON.parse(JSON.stringify(x));
  const countries=[{name:"United States",currency:"USD",salary:1,cost:1,tax:.22},{name:"Indonesia",currency:"USD",salary:.38,cost:.42,tax:.12},{name:"Japan",currency:"USD",salary:.85,cost:.85,tax:.20},{name:"Canada",currency:"USD",salary:.94,cost:.95,tax:.25},{name:"United Kingdom",currency:"USD",salary:.9,cost:.91,tax:.24},{name:"Australia",currency:"USD",salary:1.05,cost:1.03,tax:.24}];
  const careers=[
    ["Retail associate",25000,0,0],["Barista",24000,0,0],["Delivery driver",30000,0,0],["Apprentice electrician",36000,0,25],["Chef",40000,0,35],["Sales representative",42000,0,40],["Mechanic",45000,1,40],["Electrician",54000,1,45],["Designer",49000,1,50],["Accountant",65000,2,55],["Software developer",85000,2,65],["Engineer",88000,2,70],["Teacher",52000,2,55],["Nurse",67000,2,60],["Research scientist",96000,3,80],["Doctor",125000,3,80],["Lawyer",110000,3,75],["Financial analyst",78000,2,65],["Architect",78000,2,70],["Writer",38000,0,45],["Photographer",35000,0,35],["Journalist",49000,2,55],["Pilot",95000,3,70],["Project manager",79000,2,60],["Civil servant",48000,1,45],["Data analyst",72000,2,60],["Marketing specialist",56000,1,50],["Music teacher",38000,1,45],["Dental specialist",118000,3,80],["Fitness trainer",36000,0,30]
  ].map(([title,salary,education,knowledge],id)=>({id,title,salary,education,knowledge}));
  const degrees=["School","Vocational certificate","University degree","Graduate qualification"];
  const names=["Alex","Riley","Jordan","Maya","Sam","Kai","Sofia","Noah","Aria","Robin","Jamie","Morgan","Taylor","Lee","Avery","Luca","Eli","Dara","Nina","Ren"];
  // Original event records: title, ages, prompt, two choices, signed effects and optional requirement.
  const raw=[
    ["First steps",1,3,"You wobble toward a toy while your family watches.","Keep trying",{health:2,confidence:4},"Ask for help",{happiness:3,bond:3}],
    ["A new sibling",1,10,"A younger cousin is staying with your family and wants your attention.","Share your toys",{bond:6,happiness:2},"Keep your space",{confidence:2,bond:-3}],
    ["The playground",3,9,"A lonely child sits apart from the group.","Invite them to play",{kindness:5,social:4},"Play your own game",{happiness:2}],
    ["A broken vase",3,11,"You accidentally knock over something precious.","Tell the truth",{kindness:5,bond:3},"Hide the pieces",{kindness:-4,stress:4}],
    ["Bedtime stories",2,8,"Your family offers to read another story.","Listen carefully",{knowledge:4,bond:3},"Ask to go outside tomorrow",{health:3,happiness:3}],
    ["The school show",5,12,"Your teacher invites you to perform in front of the class.","Take the stage",{confidence:7,stress:3},"Help backstage",{knowledge:3,kindness:3}],
    ["Lost lunch",5,14,"A classmate forgot their lunch.","Share yours",{kindness:6,social:3},"Find a teacher",{knowledge:2,kindness:3}],
    ["A library card",5,16,"The local library offers you a free card.","Borrow a book",{knowledge:6,stress:-2},"Join the activity club",{social:5,happiness:3}],
    ["The team captain",7,17,"Your coach asks you to lead the team.","Accept",{confidence:6,health:3,stress:4},"Support someone else",{kindness:4,social:4}],
    ["Exam pressure",9,18,"A difficult exam is approaching.","Make a study plan",{knowledge:7,stress:4},"Get a good night's sleep",{health:4,stress:-5}],
    ["A friend's secret",8,18,"A friend trusts you with something embarrassing.","Keep it private",{kindness:5,social:4},"Tell the group",{kindness:-5,social:-4}],
    ["A science fair",8,18,"You can enter a school invention contest.","Build a prototype",{knowledge:7,confidence:3},"Volunteer to organize",{social:6,kindness:3}],
    ["Moving schools",6,17,"Your family is considering a move.","Embrace the change",{confidence:5,social:3},"Talk about your worries",{bond:5,stress:-3}],
    ["A school band",8,18,"A friend asks you to join their music group.","Learn an instrument",{creativity:7,happiness:4},"Help with posters",{creativity:4,social:3}],
    ["The rumor",12,19,"A rumor about you spreads through school.","Speak calmly",{confidence:5,stress:-2},"Walk away",{stress:-3,social:-2}],
    ["Weekend work",15,23,"A neighbor offers you a small paid job.","Take the job",{cash:350,stress:3,knowledge:2},"Spend time with family",{bond:5,happiness:3}],
    ["A difficult teacher",12,20,"Your teacher gives you tough feedback.","Ask how to improve",{knowledge:6,confidence:2},"Ignore the feedback",{happiness:2,knowledge:-3}],
    ["A scholarship contest",16,25,"A local foundation offers a small education prize.","Submit an essay",{knowledge:5,cash:800,stress:4},"Help a friend apply",{kindness:5,social:4}],
    ["A first crush",14,21,"You want to get to know someone better.","Start a conversation",{confidence:4,social:5},"Give yourself time",{stress:-3,knowledge:2}],
    ["The road not taken",17,30,"A friend suggests a career you never considered.","Research the field",{knowledge:5,confidence:4},"Stick with your plans",{confidence:3,stress:-2}],
    ["A mentor",18,65,"An experienced person offers to mentor you.","Make time to learn",{knowledge:5,performance:5,stress:2},"Thank them and decline",{happiness:2}],
    ["Unexpected bill",18,99,"An essential repair costs more than expected.","Pay the bill",{cash:-600,stress:3},"Arrange installments",{debt:700,stress:6}],
    ["The side project",18,70,"You have an idea for a small creative project.","Build it on weekends",{creativity:7,cash:-200,stress:3},"Write down the idea",{creativity:3,stress:-2}],
    ["A job referral",18,65,"A friend offers to introduce you to an employer.","Attend the meeting",{confidence:5,social:4},"Focus on your current path",{stress:-3,performance:3}],
    ["Workplace credit",18,70,"A colleague receives praise for your contribution.","Raise it privately",{confidence:5,reputation:4},"Let it go",{stress:-2,happiness:-3},"job"],
    ["The annual review",18,70,"Your supervisor asks about your goals.","Set an ambitious goal",{performance:9,stress:5},"Set a balanced goal",{performance:4,health:2},"job"],
    ["Overtime request",18,70,"Your team needs help on a weekend.","Take the extra shift",{cash:450,performance:5,stress:6},"Protect your rest",{health:5,stress:-5},"job"],
    ["A new coworker",18,70,"A new hire is struggling with their duties.","Offer guidance",{kindness:5,reputation:5,stress:2},"Focus on your own tasks",{performance:3},"job"],
    ["A distant offer",22,64,"A recruiter offers a role far from home.","Explore the offer",{knowledge:4,confidence:6,stress:3},"Prioritize stability",{bond:3,stress:-4},"job"],
    ["The presentation",18,70,"Your team needs someone to present an idea.","Volunteer",{confidence:7,performance:5,stress:5},"Help prepare the slides",{knowledge:4,performance:3},"job"],
    ["A bad commute",18,80,"Your commute is taking a toll.","Try a different routine",{health:3,stress:-4},"Keep your habits",{stress:5}],
    ["A market scare",18,99,"Financial headlines make everyone nervous.","Review your budget",{knowledge:4,stress:-3},"Stop reading the news",{happiness:2,stress:-2}],
    ["The community garden",16,95,"Neighbors are starting a shared garden.","Join the project",{health:4,social:5,kindness:4},"Donate supplies",{cash:-100,kindness:5}],
    ["An old friend",18,100,"A childhood friend sends you a message.","Reconnect",{social:6,happiness:5},"Send a brief greeting",{kindness:2}],
    ["The anniversary",18,100,"Your partner wants to celebrate a milestone.","Plan something meaningful",{cash:-150,bond:8,happiness:4},"Keep it simple",{bond:4,stress:-3},"partner"],
    ["A disagreement",18,100,"You and your partner disagree about priorities.","Listen and compromise",{bond:8,kindness:4,stress:-3},"Insist on your view",{bond:-8,confidence:3},"partner"],
    ["Shared savings",20,100,"Your partner suggests discussing household spending.","Make a plan together",{bond:6,knowledge:4},"Avoid the discussion",{bond:-5,stress:4},"partner"],
    ["Family reunion",18,100,"Relatives invite you to a gathering.","Attend",{cash:-100,bond:6,happiness:5},"Call instead",{bond:3,stress:-2}],
    ["A child's question",18,100,"Your child asks a difficult question about life.","Talk patiently",{bond:7,kindness:5},"Suggest exploring together",{bond:5,knowledge:3},"child"],
    ["Parent-teacher meeting",22,100,"Your child is struggling with schoolwork.","Make time to help",{bond:8,stress:4},"Find a support group",{cash:-180,bond:5},"child"],
    ["A child's talent",22,100,"Your child discovers a new hobby.","Encourage practice",{cash:-150,bond:8},"Celebrate without pressure",{bond:5,happiness:3},"child"],
    ["A family tradition",24,100,"Your family wants to start a new annual tradition.","Host a gathering",{cash:-200,bond:7,happiness:4},"Start a simple ritual",{bond:5,creativity:3}],
    ["Burnout",25,70,"You feel exhausted after a demanding period.","Reduce commitments",{stress:-12,health:5,performance:-3},"Push through",{performance:5,stress:10,health:-5}],
    ["Health screening",25,100,"A clinic offers a preventive health appointment.","Book the visit",{cash:-180,health:7,stress:-3},"Schedule it later",{stress:2}],
    ["A hiking invitation",18,85,"Friends invite you on a scenic hike.","Join them",{health:5,social:5},"Enjoy a quiet day",{stress:-5,happiness:3}],
    ["The family recipe",20,100,"A relative offers to teach you a beloved recipe.","Learn it together",{creativity:5,bond:7},"Ask for a written copy",{knowledge:2,bond:3}],
    ["Learning again",30,90,"A community center offers a course in a new subject.","Enroll",{cash:-120,knowledge:7,creativity:3},"Read about it at home",{knowledge:3,stress:-2}],
    ["A charity appeal",18,100,"A local community organization needs help.","Donate",{cash:-100,kindness:7},"Volunteer time",{kindness:5,social:4,stress:2}],
    ["The housing decision",25,90,"A friend tells you about a less expensive neighborhood.","Research the options",{knowledge:4,stress:-3},"Stay where you are",{happiness:3}],
    ["A neighbor in need",18,100,"Your neighbor needs help carrying groceries.","Offer assistance",{kindness:5,social:4},"Wish them well",{stress:-1}],
    ["An artistic challenge",18,90,"A local exhibition invites amateur artwork.","Submit a piece",{creativity:8,confidence:4,stress:3},"Visit the exhibition",{creativity:3,happiness:4}],
    ["A quiet birthday",35,100,"You reflect on the person you have become.","Write a journal entry",{happiness:5,stress:-5},"Make a new goal",{confidence:6,knowledge:2}],
    ["Caring responsibilities",40,90,"An older relative needs more support.","Offer regular visits",{bond:8,stress:5,kindness:5},"Arrange community help",{cash:-250,bond:5}],
    ["Changing seasons",45,100,"You realize some friendships have faded.","Reach out to someone",{social:7,happiness:4},"Enjoy solitude",{stress:-5,happiness:2}],
    ["The next chapter",55,100,"You consider how to spend your later years.","Plan new experiences",{confidence:5,knowledge:4},"Focus on loved ones",{bond:7,happiness:5}],
    ["A reunion invitation",55,100,"Former classmates are organizing a reunion.","Go and reconnect",{cash:-150,social:8,happiness:5},"Send a thoughtful note",{social:3,kindness:4}],
    ["The walking group",55,100,"Neighbors invite you to walk with them regularly.","Join the group",{health:6,social:5},"Walk at your own pace",{health:4,stress:-3}],
    ["Passing on wisdom",60,110,"A younger person asks what you learned in life.","Share your mistakes",{kindness:6,reputation:4},"Share your successes",{confidence:4,reputation:3}],
    ["Old photographs",60,110,"You discover a box of family photographs.","Organize a family album",{bond:7,happiness:5},"Write memories for yourself",{creativity:5,stress:-4}],
    ["The garden bench",65,110,"You have a free afternoon in a beautiful park.","Talk with a stranger",{social:5,happiness:4},"Enjoy the quiet",{stress:-6,health:2}],
    ["A volunteer role",60,110,"A local library needs a volunteer.","Help once a week",{kindness:7,social:5,stress:2},"Donate books",{cash:-80,kindness:5}],
    ["A celebration of life",70,110,"Your family wants to celebrate your story.","Tell them your memories",{bond:8,happiness:6},"Write them a letter",{creativity:5,bond:5}],
    ["A long phone call",5,110,"Someone you care about wants to catch up.","Make time",{bond:5,happiness:3},"Arrange another day",{stress:-2}],
    ["A rainy afternoon",1,110,"Unexpected rain changes your plans.","Find an indoor activity",{creativity:3,happiness:3},"Rest and listen to the rain",{stress:-4,health:2}],
    ["A small kindness",4,110,"You notice someone struggling with an everyday task.","Help out",{kindness:5,social:3},"Give them space",{stress:-1}],
    ["A surprising compliment",4,110,"Someone notices a quality you did not recognize in yourself.","Accept it gratefully",{confidence:5,happiness:3},"Compliment them too",{kindness:4,social:3}],
    ["A forgotten promise",5,110,"You forgot to do something you promised.","Apologize and make it right",{bond:5,kindness:3},"Avoid the topic",{bond:-4,stress:3}],
    ["A new hobby",5,110,"You see someone enjoying a hobby you have never tried.","Give it a try",{creativity:5,confidence:3},"Watch and learn",{knowledge:3,happiness:2}],
    ["A difficult day",3,110,"Nothing seems to go quite as planned.","Ask for support",{bond:4,stress:-5},"Take a break",{health:3,stress:-4}],
    ["A lucky discovery",5,110,"You discover a free community event.","Attend",{social:4,happiness:4},"Use the time for yourself",{stress:-4,creativity:2}]
  ];
  const events=raw.map(([title,min,max,prompt,a,ae,b,be,requires],id)=>({id,title,min,max,prompt,choices:[{text:a,effects:ae},{text:b,effects:be}],requires}));
  const statNames=["health","happiness","knowledge","confidence","stress","kindness","social","creativity","reputation","performance"];
  const assets=[{id:"car",name:"Used car",cost:9000,upkeep:900,rate:-.10},{id:"apartment",name:"Apartment",cost:80000,upkeep:1600,rate:.025},{id:"house",name:"Family house",cost:180000,upkeep:3000,rate:.03},{id:"rental",name:"Rental property",cost:120000,upkeep:2400,rate:.025,rent:7200}];
  const rng=s=>{let x=s.rng>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=(x>>>0)||12345;return s.rng/4294967296;};
  const pick=(s,a)=>a[Math.floor(rng(s)*a.length)];
  const money=n=>Math.round(n);
  const country=s=>countries[s.country];
  const add=(s,t,kind="story")=>{s.history.push({age:s.age,text:t,kind});if(s.history.length>1000)s.history.shift();};
  const change=(s,k,v)=>{if(statNames.includes(k))s.stats[k]=clamp(s.stats[k]+v);};
  const spend=(s,n)=>{if(s.cash<n)throw Error("Not enough cash.");s.cash-=n;};
  const bill=(s,n)=>{let paid=Math.min(s.cash,n);s.cash-=paid;s.debt+=n-paid;};
  const relation=(s,role)=>s.people.find(p=>p.role===role&&p.alive);
  const person=(s,role,age,name)=>({id:s.nextId++,name:name||pick(s,names),role,age,bond:65,alive:true,memories:[]});
  const bond=(s,p,v,why)=>{p.bond=clamp(p.bond+v);p.memories.push({age:s.age,text:why});if(p.memories.length>15)p.memories.shift();};
  const worth=s=>money(s.cash+s.investments+s.properties.reduce((a,p)=>a+p.value,0)+(s.business?s.business.capital:0)-s.debt);
  function createLife(options={}){
    let s={version:2,rng:(Number(options.seed??Date.now())>>>0)||12345,name:String(options.name||"").trim().slice(0,32)||"Alex",country:Math.max(0,Math.min(countries.length-1,Number.isInteger(options.country)?options.country:0)),background:["modest","ordinary","comfortable"].includes(options.background)?options.background:"ordinary",age:0,alive:true,death:null,generation:1,legacy:[],stats:{health:85,happiness:78,knowledge:48,confidence:48,stress:8,kindness:55,social:45,creativity:45,reputation:45,performance:45},cash:0,debt:0,investments:0,properties:[],business:null,job:null,education:0,study:null,retired:false,people:[],nextId:1,history:[],pending:null,recent:[],actions:3,achievements:[],goal:options.goal==="family"?"family":options.goal==="wealth"?"wealth":"balance",annual:null,yearsWorked:0,pension:0};
    s.cash={modest:0,ordinary:300,comfortable:3000}[s.background];for(let k of ["health","knowledge","confidence","creativity"])change(s,k,Math.floor(rng(s)*17)-8);
    s.people=[person(s,"parent",25),person(s,"parent",28)];add(s,"Born into a "+s.background+" family in "+country(s).name+".","milestone");return s;
  }
  const eligible=(s,e)=>s.age>=e.min&&s.age<=e.max&&(!e.requires||(e.requires==="job"?s.job:relation(s,e.requires)));
  const pending=s=>s.pending===null?null:events[s.pending];
  const finish=(s)=>{let achievements=[["first job",!!s.job],["graduate",s.education>=2],["homeowner",s.properties.some(p=>p.id==="house"||p.id==="apartment")],["parent",!!relation(s,"child")],["six figures",worth(s)>=100000],["millionaire",worth(s)>=1000000],["entrepreneur",!!s.business],["centenarian",s.age>=100],["debt free",s.age>=30&&s.debt===0&&s.cash>=10000],["family first",s.people.filter(p=>p.alive&&p.bond>=85).length>=3],["community pillar",s.stats.kindness>=95&&s.stats.reputation>=80],["healthy life",s.age>=65&&s.stats.health>=75],["second generation",s.generation>=2]];for(let [a,ok] of achievements)if(ok&&!s.achievements.includes(a)){s.achievements.push(a);add(s,"Achievement: "+a,"achievement");}return s;};
  const ensure=s=>{if(!s.alive)throw Error("This life has ended.");if(s.pending!==null)throw Error("Resolve your current decision first.");};
  function resolve(s,i){
    if(!s.alive||!pending(s)||!Number.isInteger(i)||!pending(s).choices[i])throw Error("Invalid choice.");
    s=copy(s);const e=pending(s),c=e.choices[i];for(let [k,v] of Object.entries(c.effects)){
      if(k==="cash"){if(v<0)bill(s,-v);else s.cash+=v;}
      else if(k==="debt")s.debt+=v;
      else if(k==="bond"){let p=relation(s,e.requires)||relation(s,"partner")||relation(s,"parent")||s.people.find(p=>p.alive);if(p)bond(s,p,v,e.title);}
      else change(s,k,v);
    }s.pending=null;add(s,e.title+": "+c.text+".","decision");return finish(s);
  }
  function ageUp(s){
    ensure(s);s=copy(s);s.age++;s.actions=3;const c=country(s);
    for(let p of s.people)if(p.alive){p.age++;if(p.age>70&&rng(s)<Math.min(.40,(p.age-70)*.008)){p.alive=false;add(s,p.name+" passed away.","milestone");change(s,"happiness",-8);}else if(p.role!=="child"||p.age>=5)p.bond=clamp(p.bond-(rng(s)<.55?1:0));}
    if(s.age===6)add(s,"You started primary school.","milestone");if(s.age===18)add(s,"Adulthood begins. Your finances and career are yours to manage.","milestone");
    if(s.study){s.study.remaining--;change(s,"knowledge",3);change(s,"stress",3);if(!s.study.remaining){s.education=s.study.level;s.study=null;add(s,"Completed "+degrees[s.education]+".","milestone");}}
    const salary=s.job?money(careers[s.job.id].salary*c.salary*(1+s.job.level*.18)):0;
    if(s.job){s.yearsWorked++;change(s,"stress",3);if(s.stats.performance>=70&&s.job.level<5){s.job.level++;change(s,"performance",-17);add(s,"Promoted to level "+s.job.level+" at work.","milestone");}if(s.stats.performance<20){add(s,"Lost your job following performance concerns.","milestone");s.job=null;change(s,"happiness",-8);}}
    let business=0;if(s.business){const b=s.business;business=money(b.capital*(.04+rng(s)*.20)*(b.quality/75)-b.capital*.06);b.quality=clamp(b.quality-2);change(s,"stress",3);}
    let rent=0,upkeep=0;for(let p of s.properties){const a=assets.find(a=>a.id===p.id);p.value=Math.max(0,money(p.value*(1+a.rate+(rng(s)-.5)*.04)));rent+=money((a.rent||0)*c.cost);upkeep+=money(a.upkeep*c.cost);}
    let returns=money(s.investments*(rng(s)*.26-.10));s.investments=Math.max(0,s.investments+returns);
    let pension=s.retired?s.pension:0, income=salary+pension+rent+business;let tax=money(Math.max(0,income)*c.tax);
    let children=s.people.filter(p=>p.role==="child"&&p.alive&&p.age<18).length;
    let expenses=s.age>=18?money((s.properties.some(p=>["house","apartment"].includes(p.id))?10500:15000)*c.cost+children*3800*c.cost+upkeep):0;
    let interest=money(s.debt*.06);s.debt+=interest;let balance=income-tax-expenses;if(balance>=0)s.cash+=balance;else bill(s,-balance);
    s.annual={salary,pension,rent,business,tax,expenses,interest,returns,balance};
    if(s.age>=18)add(s,"Annual cash flow: "+(balance>=0?"+":"−")+"$"+Math.abs(balance).toLocaleString("en-US")+".","finance");
    if(s.age>=45)change(s,"health",-1);if(s.age>=70)change(s,"health",-2);if(s.stats.stress>70)change(s,"health",-4);if(s.debt>Math.max(20000,salary*2))change(s,"stress",5);
    change(s,"stress",-2);if(s.people.some(p=>p.alive&&p.bond>=80))change(s,"happiness",1);if(s.stats.health<30)change(s,"happiness",-3);
    if(s.stats.health===0||s.age>=110||(s.age>=72&&rng(s)<(.008+(s.age-72)*.002+(100-s.stats.health)*.0004))){
      s.alive=false;s.death=s.stats.health===0?"Health complications":"Natural causes";add(s,"Your life ended at "+s.age+".","milestone");return finish(s);
    }
    let pool=events.filter(e=>eligible(s,e)&&!s.recent.includes(e.id));if(!pool.length)pool=events.filter(e=>eligible(s,e));if(pool.length){let e=pick(s,pool);s.pending=e.id;s.recent=[...s.recent,e.id].slice(-12);}return finish(s);
  }
  function commands(s){
    if(!s.alive||s.pending!==null)return [];
    const out=[];const put=(id,label,detail,ok=true)=>out.push({id,label,detail,enabled:!!ok});const a=s.actions>0,adult=s.age>=18,c=country(s);
    put("rest","Rest & recharge","−8 stress · +3 health",a);put("exercise","Exercise","+5 health · −3 stress",a&&s.age>=4);put("learn","Read & learn","+5 knowledge",a&&s.age>=5);put("create","Creative hobby","+6 creativity",a&&s.age>=5);put("volunteer","Volunteer","+5 kindness · +3 reputation",a&&s.age>=12);put("side","Side job","Earn extra cash",a&&s.age>=16);
    if(adult){if(!s.study&&s.education<3){let cost=money([0,3000,18000,28000][s.education+1]*c.cost);put("study","Enroll: "+degrees[s.education+1],"$"+cost.toLocaleString("en-US")+" tuition",a&&s.cash>=cost&&s.stats.knowledge>=35+s.education*12);}
    for(let j of careers)if(s.job?.id!==j.id)put("job:"+j.id,j.title,"$"+money(j.salary*c.salary).toLocaleString("en-US")+"/year · "+degrees[j.education],a&&!s.retired&&!s.business&&s.education>=j.education&&s.stats.knowledge>=j.knowledge);
    if(s.job){put("work","Work on performance","+12 performance · +5 stress",a);put("quit","Resign","Leave your current job",a);}
    if(s.age>=60&&!s.retired)put("retire","Retire","Receive pension based on work history",a&&!s.business);
    if(!s.business&&!s.job&&!s.retired)put("business","Start a business","Invest $15,000 in a small company",a&&s.cash>=15000);
    if(s.business){put("business:improve","Improve business","$1,000 · +12 quality",a&&s.cash>=1000);put("business:sell","Sell business","Recover 80% of its capital",a);}
    for(let n of [1000,10000]){put("invest:"+n,"Invest $"+n.toLocaleString("en-US"),"Variable annual market returns",a&&s.cash>=n);put("withdraw:"+n,"Sell $"+n.toLocaleString("en-US")+" of investments","Convert investments to cash",a&&s.investments>=n);put("repay:"+n,"Repay up to $"+n.toLocaleString("en-US"),"Reduce interest next year",a&&s.cash>0&&s.debt>0);}
    for(let p of assets){let cost=money(p.cost*c.cost);put("buy:"+p.id,"Buy "+p.name,"$"+cost.toLocaleString("en-US")+" + annual upkeep",a&&s.cash>=cost&&!s.properties.some(x=>x.id===p.id));}for(let p of s.properties)put("sell:"+p.id,"Sell "+assets.find(x=>x.id===p.id).name,"Net 95% of market value",a);
    if(!relation(s,"partner"))put("date","Meet a partner","Start a relationship",a);else{let p=relation(s,"partner");put("marry","Get married","Commit to your partner",a&&p.bond>=75&&!p.married);put("breakup","End relationship","Separate from your partner",a);put("child","Welcome a child","Grow your family",a&&p.bond>=65&&s.age<=60&&s.people.filter(p=>p.role==="child"&&p.alive).length<5);}
    }
    if(s.age>=4)put("friend","Make a friend","Meet someone new",a&&s.people.filter(p=>p.role==="friend"&&p.alive).length<8);
    for(let p of s.people.filter(p=>p.alive)){put("visit:"+p.id,"Spend time with "+p.name,"+9 bond · +3 happiness",a);if(s.age>=18)put("gift:"+p.id,"Give "+p.name+" a gift","$100 · +12 bond",a&&s.cash>=100);}
    return out;
  }
  function act(s,id){
    ensure(s);if(!commands(s).some(c=>c.id===id&&c.enabled))throw Error("This action is not available.");s=copy(s);s.actions--;let [cmd,arg]=id.split(":");let n=Number(arg),c=country(s),message=commands;
    if(cmd==="rest"){change(s,"stress",-8);change(s,"health",3);change(s,"happiness",3);}
    if(cmd==="exercise"){change(s,"health",5);change(s,"stress",-3);}
    if(cmd==="learn")change(s,"knowledge",5);
    if(cmd==="create"){change(s,"creativity",6);change(s,"happiness",3);}
    if(cmd==="volunteer"){change(s,"kindness",5);change(s,"reputation",3);}
    if(cmd==="side"){s.cash+=money((250+s.stats.knowledge*5)*c.salary);change(s,"stress",4);}
    if(cmd==="study"){let level=s.education+1;spend(s,money([0,3000,18000,28000][level]*c.cost));s.study={level,remaining:[0,2,4,3][level]};}
    if(cmd==="job"){s.job={id:n,level:0};s.stats.performance=55;add(s,"Started work as "+careers[n].title+".","milestone");}
    if(cmd==="work"){change(s,"performance",12);change(s,"stress",5);}
    if(cmd==="quit")s.job=null;
    if(cmd==="retire"){s.retired=true;s.job=null;s.pension=money(Math.min(28000,s.yearsWorked*700)*c.salary);}
    if(cmd==="business"){if(arg==="improve"){spend(s,1000);s.business.quality=clamp(s.business.quality+12);}else if(arg==="sell"){s.cash+=money(s.business.capital*.8);s.business=null;}else{spend(s,15000);s.business={capital:15000,quality:60};}}
    if(cmd==="invest"){spend(s,n);s.investments+=n;}if(cmd==="withdraw"){s.investments-=n;s.cash+=n;}
    if(cmd==="repay"){let pay=Math.min(n,s.debt,s.cash);s.debt-=pay;s.cash-=pay;}
    if(cmd==="buy"){let p=assets.find(a=>a.id===arg),cost=money(p.cost*c.cost);spend(s,cost);s.properties.push({id:arg,value:cost});}
    if(cmd==="sell"){let p=s.properties.find(p=>p.id===arg);s.cash+=money(p.value*.95);s.properties=s.properties.filter(x=>x.id!==arg);}
    if(cmd==="date"){let p=person(s,"partner",Math.max(18,s.age+Math.floor(rng(s)*7)-3));s.people.push(p);change(s,"happiness",5);}
    if(cmd==="marry"){let p=relation(s,"partner");p.married=true;bond(s,p,8,"Marriage");}
    if(cmd==="breakup"){let p=relation(s,"partner");p.role="ex";p.married=false;bond(s,p,-15,"Separation");change(s,"happiness",-5);}
    if(cmd==="child"){s.people.push(person(s,"child",0));change(s,"happiness",5);}
    if(cmd==="friend")s.people.push(person(s,"friend",Math.max(4,s.age+Math.floor(rng(s)*5)-2)));
    if(cmd==="visit"||cmd==="gift"){let p=s.people.find(p=>p.id===n);if(cmd==="gift")spend(s,100);bond(s,p,cmd==="gift"?12:9,cmd==="gift"?"Received a gift":"Spent time together");change(s,"happiness",3);}
    add(s,({rest:"Rested and recharged",exercise:"Exercised",learn:"Studied independently",create:"Enjoyed a creative hobby",volunteer:"Volunteered",side:"Worked a side job",study:"Enrolled in "+(s.study?degrees[s.study.level]:"education"),job:"Accepted a job",work:"Improved work performance",quit:"Resigned",retire:"Retired",business:"Managed a business",invest:"Invested savings",withdraw:"Sold investments",repay:"Repaid debt",buy:"Purchased an asset",sell:"Sold an asset",date:"Started a relationship",marry:"Got married",breakup:"Ended a relationship",child:"Welcomed a child",friend:"Made a new friend",visit:"Spent time with someone",gift:"Gave a gift"})[cmd]+".","activity");return finish(s);
  }
  function legacy(s,id){
    if(s.alive)throw Error("Finish this life before continuing.");
    let child=s.people.find(p=>p.id===id&&p.role==="child"&&p.alive);if(!child)throw Error("Select a living child.");
    let n=createLife({name:child.name,country:s.country,background:s.background,seed:s.rng,goal:s.goal});
    n.age=child.age;n.generation=s.generation+1;n.cash=Math.max(0,worth(s));n.legacy=[...s.legacy,{name:s.name,age:s.age,netWorth:worth(s),achievements:s.achievements,goal:s.goal}].slice(-50);
    n.people=s.people.filter(p=>p.alive&&p.id!==id&&p.role==="child").map(p=>({...copy(p),role:"sibling"}));n.nextId=Math.max(0,...n.people.map(p=>p.id))+1;
    if(n.age>=18)n.education=0;
    n.history=[];add(n,"Inherited "+n.cash.toLocaleString("en-US")+" from "+s.name+". Continued at age "+n.age+".","milestone");return finish(n);
  }
  function validate(s){
    const finite=x=>Number.isFinite(x)&&x>=0;return !!s&&s.version===2&&typeof s.name==="string"&&s.name.length>0&&Number.isInteger(s.age)&&s.age>=0&&s.age<=110&&typeof s.alive==="boolean"&&Number.isInteger(s.rng)&&s.rng>0&&!!countries[s.country]&&statNames.every(k=>Number.isInteger(s.stats?.[k])&&s.stats[k]>=0&&s.stats[k]<=100)&&["cash","debt","investments","pension","yearsWorked"].every(k=>finite(s[k]))&&Number.isInteger(s.actions)&&s.actions>=0&&s.actions<=3&&Number.isInteger(s.education)&&s.education>=0&&s.education<=3&&Array.isArray(s.history)&&s.history.every(h=>typeof h.text==="string"&&Number.isInteger(h.age))&&Array.isArray(s.people)&&s.people.every(p=>Number.isInteger(p.id)&&typeof p.name==="string"&&typeof p.alive==="boolean"&&finite(p.age)&&finite(p.bond)&&p.bond<=100&&Array.isArray(p.memories))&&new Set(s.people.map(p=>p.id)).size===s.people.length&&Number.isInteger(s.nextId)&&s.nextId>Math.max(0,...s.people.map(p=>p.id))&&Array.isArray(s.properties)&&s.properties.every(p=>assets.some(a=>a.id===p.id)&&finite(p.value))&&new Set(s.properties.map(p=>p.id)).size===s.properties.length&&(!s.job||(!!careers[s.job.id]&&Number.isInteger(s.job.level)&&s.job.level>=0&&s.job.level<=5))&&(!s.study||(Number.isInteger(s.study.level)&&s.study.level>=1&&s.study.level<=3&&Number.isInteger(s.study.remaining)&&s.study.remaining>0))&&(!s.business||(finite(s.business.capital)&&finite(s.business.quality)&&s.business.quality<=100))&&Array.isArray(s.legacy)&&Array.isArray(s.recent)&&Array.isArray(s.achievements)&&Number.isInteger(s.generation)&&s.generation>=1&&(s.pending===null||(s.alive&&Number.isInteger(s.pending)&&!!events[s.pending]));
  }
  const goalProgress=s=>s.goal==="wealth"?Math.min(100,Math.max(0,Math.floor(worth(s)/10000))):s.goal==="family"?Math.min(100,s.people.filter(p=>p.alive&&p.bond>=80).length*25):Math.round((s.stats.health+s.stats.happiness+100-s.stats.stress)/3);
  return {countries,careers,degrees,assets,events,createLife,ageUp,resolve,commands,act,pending,worth,legacy,validate,goalProgress};
}
export const engine = makeEngine();
export default engine;
