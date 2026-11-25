// Original authored activity premises and four context-sensitive, mechanically distinct variants.
// Each premise expands into four scenario cards; not 692 independently hand-written narratives.
// Append order is a save compatibility contract.
export const scenarioGroups = [
  {
    "key": "childhood",
    "min": 3,
    "max": 12,
    "stat": "confidence",
    "second": "kindness",
    "gate": null,
    "items": [
      [
        "A puppet show",
        "make a puppet for the neighborhood show"
      ],
      [
        "The missing crayon",
        "share limited art supplies"
      ],
      [
        "A rainy birthday",
        "plan a celebration indoors"
      ],
      [
        "The sandcastle contest",
        "build a sandcastle with other children"
      ],
      [
        "The classroom pet",
        "help look after the classroom animal"
      ],
      [
        "A new board game",
        "learn the rules with friends"
      ],
      [
        "The garden discovery",
        "look after a small plant"
      ],
      [
        "The first sleepover",
        "spend a night away from home"
      ],
      [
        "A handmade kite",
        "make a kite with family"
      ],
      [
        "The playground queue",
        "wait for a turn on the swings"
      ],
      [
        "A paper boat race",
        "make a paper boat for a friendly race"
      ],
      [
        "The picture book",
        "invent a story from drawings"
      ]
    ]
  },
  {
    "key": "school",
    "min": 6,
    "max": 19,
    "stat": "knowledge",
    "second": "confidence",
    "gate": null,
    "items": [
      [
        "The mathematics team",
        "prepare for a mathematics contest"
      ],
      [
        "The history exhibition",
        "research a local history display"
      ],
      [
        "The class newspaper",
        "write a report for the school newspaper"
      ],
      [
        "A geography quiz",
        "study for the geography challenge"
      ],
      [
        "The robotics club",
        "assemble a small classroom robot"
      ],
      [
        "A laboratory assignment",
        "complete a supervised classroom experiment"
      ],
      [
        "The reading contest",
        "finish a reading challenge"
      ],
      [
        "A spelling tournament",
        "practice unfamiliar words"
      ],
      [
        "The school orchestra",
        "practice a new piece with classmates"
      ],
      [
        "The student garden",
        "organize a school garden"
      ],
      [
        "The language exchange",
        "practice conversation with a visiting class"
      ],
      [
        "The school fundraiser",
        "coordinate a small school fundraiser"
      ]
    ]
  },
  {
    "key": "education",
    "min": 16,
    "max": 40,
    "stat": "knowledge",
    "second": "performance",
    "gate": null,
    "items": [
      [
        "The design portfolio",
        "assemble a portfolio for a training program"
      ],
      [
        "The college application",
        "prepare an application for further study"
      ],
      [
        "A vocational workshop",
        "learn a trade in a supervised workshop"
      ],
      [
        "The research poster",
        "present a small research project"
      ],
      [
        "A technical certification",
        "study for a professional certification"
      ],
      [
        "A night course",
        "fit an evening course around other obligations"
      ],
      [
        "The internship placement",
        "complete a short supervised placement"
      ],
      [
        "A thesis proposal",
        "develop a long-form research proposal"
      ],
      [
        "A language qualification",
        "prepare for a language proficiency test"
      ],
      [
        "A peer tutoring group",
        "help other learners prepare for assessments"
      ],
      [
        "An open lecture",
        "attend a public lecture series"
      ],
      [
        "The graduate seminar",
        "prepare a discussion for an academic seminar"
      ]
    ]
  },
  {
    "key": "career",
    "min": 18,
    "max": 72,
    "stat": "performance",
    "second": "reputation",
    "gate": "job",
    "items": [
      [
        "A client briefing",
        "prepare a briefing for a client"
      ],
      [
        "The handover",
        "complete a careful handover to a colleague"
      ],
      [
        "A quality audit",
        "review work against a quality checklist"
      ],
      [
        "The training manual",
        "write a guide for new colleagues"
      ],
      [
        "A departmental meeting",
        "organize a discussion about team priorities"
      ],
      [
        "The annual proposal",
        "prepare a proposal for next year's work"
      ],
      [
        "A customer complaint",
        "resolve a customer's service concern"
      ],
      [
        "The deadline review",
        "review a project approaching its deadline"
      ],
      [
        "A process redesign",
        "improve a slow workplace process"
      ],
      [
        "The workplace survey",
        "collect feedback on working conditions"
      ],
      [
        "A recruitment panel",
        "help interview a new team member"
      ],
      [
        "The project showcase",
        "present a completed project to colleagues"
      ]
    ]
  },
  {
    "key": "business",
    "min": 18,
    "max": 85,
    "stat": "knowledge",
    "second": "reputation",
    "gate": "business",
    "items": [
      [
        "A product redesign",
        "revise an existing product"
      ],
      [
        "A supplier review",
        "evaluate a potential supplier"
      ],
      [
        "The customer survey",
        "collect feedback from customers"
      ],
      [
        "A retail display",
        "improve the way products are displayed"
      ],
      [
        "The inventory review",
        "review excess inventory"
      ],
      [
        "A promotional launch",
        "introduce a product to a new audience"
      ],
      [
        "A service contract",
        "prepare a customer service agreement"
      ],
      [
        "The production schedule",
        "plan next month's production capacity"
      ],
      [
        "A new packaging idea",
        "test a packaging concept"
      ],
      [
        "A local partnership",
        "explore a collaboration with another firm"
      ],
      [
        "The quality review",
        "evaluate defects and service quality"
      ],
      [
        "A distribution opportunity",
        "investigate an additional sales channel"
      ]
    ]
  },
  {
    "key": "finance",
    "min": 18,
    "max": 105,
    "stat": "knowledge",
    "second": "confidence",
    "gate": null,
    "items": [
      [
        "A household ledger",
        "review household spending records"
      ],
      [
        "A savings goal",
        "plan savings for an important purchase"
      ],
      [
        "An insurance review",
        "compare fictional coverage options"
      ],
      [
        "A utility bill review",
        "review recurring household expenses"
      ],
      [
        "A secondhand purchase",
        "compare used household equipment"
      ],
      [
        "The emergency reserve",
        "rebuild an emergency cash reserve"
      ],
      [
        "A subscription review",
        "review recurring subscriptions"
      ],
      [
        "A budget conversation",
        "discuss financial priorities with a trusted person"
      ],
      [
        "A large appliance purchase",
        "compare repair and replacement costs"
      ],
      [
        "A retirement projection",
        "review your long-term savings assumptions"
      ],
      [
        "A seasonal expense",
        "plan for an unusually expensive month"
      ],
      [
        "A charitable budget",
        "decide how much to set aside for community causes"
      ]
    ]
  },
  {
    "key": "relationship",
    "min": 18,
    "max": 105,
    "stat": "kindness",
    "second": "social",
    "gate": "partner",
    "items": [
      [
        "The shared weekend",
        "plan a weekend with your partner"
      ],
      [
        "A home improvement",
        "agree on a change to your shared space"
      ],
      [
        "A family invitation",
        "discuss attending a relative's event"
      ],
      [
        "The shared hobby",
        "try an activity your partner enjoys"
      ],
      [
        "A difficult conversation",
        "talk about an unresolved disagreement"
      ],
      [
        "The shared calendar",
        "coordinate overlapping responsibilities"
      ],
      [
        "A personal milestone",
        "plan a celebration for your partner"
      ],
      [
        "A quiet evening",
        "make time for an uninterrupted conversation"
      ],
      [
        "The household routine",
        "redistribute everyday household tasks"
      ],
      [
        "A shared donation",
        "decide on a cause to support together"
      ],
      [
        "The holiday plan",
        "agree on a modest holiday"
      ],
      [
        "A future goal",
        "discuss a goal for the next few years"
      ]
    ]
  },
  {
    "key": "family",
    "min": 22,
    "max": 105,
    "stat": "kindness",
    "second": "happiness",
    "gate": "child",
    "items": [
      [
        "A child’s recital",
        "support your child's performance"
      ],
      [
        "The school project",
        "help your child plan a school project"
      ],
      [
        "A child’s first budget",
        "teach your child about saving"
      ],
      [
        "A family recipe lesson",
        "cook a meal together"
      ],
      [
        "The family photo album",
        "organize photos with your child"
      ],
      [
        "A child’s new hobby",
        "encourage a new interest"
      ],
      [
        "The family outing",
        "plan an outing together"
      ],
      [
        "A child’s friendship problem",
        "listen to your child's concern"
      ],
      [
        "A family volunteering day",
        "organize a shared community activity"
      ],
      [
        "The family reading hour",
        "make time for reading together"
      ],
      [
        "A family repair project",
        "complete a simple household repair together"
      ],
      [
        "A child’s personal goal",
        "discuss your child's next milestone"
      ]
    ]
  },
  {
    "key": "friendship",
    "min": 6,
    "max": 105,
    "stat": "social",
    "second": "kindness",
    "gate": "friend",
    "items": [
      [
        "A friend’s new hobby",
        "try a friend's new interest"
      ],
      [
        "The group picnic",
        "coordinate a picnic with friends"
      ],
      [
        "A friend’s achievement",
        "celebrate a friend's milestone"
      ],
      [
        "A missed meeting",
        "reschedule a meeting with a friend"
      ],
      [
        "A shared craft",
        "make something with a friend"
      ],
      [
        "A reunion plan",
        "arrange a reunion with old friends"
      ],
      [
        "A friendship boundary",
        "discuss boundaries with a friend"
      ],
      [
        "A friend’s performance",
        "support a friend's creative work"
      ],
      [
        "The group game night",
        "organize a friendly game night"
      ],
      [
        "A friend’s difficult week",
        "offer support to a friend"
      ],
      [
        "A collaborative idea",
        "work with a friend on a small project"
      ],
      [
        "The shared memory",
        "revisit a meaningful place with a friend"
      ]
    ]
  },
  {
    "key": "health",
    "min": 12,
    "max": 105,
    "stat": "health",
    "second": "happiness",
    "gate": null,
    "items": [
      [
        "The walking routine",
        "build a sustainable walking routine"
      ],
      [
        "A sleep schedule",
        "plan a more consistent bedtime"
      ],
      [
        "A movement class",
        "join a gentle movement class"
      ],
      [
        "The outdoor break",
        "make time for outdoor activity"
      ],
      [
        "A balanced routine",
        "review your daily activity and rest"
      ],
      [
        "The screen break",
        "reduce unnecessary screen time"
      ],
      [
        "A leisure swim",
        "plan a recreational swim in a supervised facility"
      ],
      [
        "A restorative weekend",
        "make time for rest and recreation"
      ],
      [
        "A preventive appointment",
        "arrange a routine health appointment"
      ],
      [
        "A lunch break",
        "protect time for a proper lunch break"
      ],
      [
        "The stretching habit",
        "try a gentle stretching routine"
      ],
      [
        "A wellness journal",
        "record how your daily habits affect your wellbeing"
      ]
    ]
  },
  {
    "key": "creative",
    "min": 8,
    "max": 105,
    "stat": "creativity",
    "second": "confidence",
    "gate": null,
    "items": [
      [
        "A watercolor series",
        "create a series of watercolor paintings"
      ],
      [
        "A short documentary",
        "plan a short documentary"
      ],
      [
        "The poetry reading",
        "prepare a poem for a reading"
      ],
      [
        "A photography exhibit",
        "choose photographs for a small exhibition"
      ],
      [
        "A ceramic project",
        "make a simple ceramic piece"
      ],
      [
        "The community mural",
        "design part of a community mural"
      ],
      [
        "A short story",
        "write a short fictional story"
      ],
      [
        "A musical arrangement",
        "arrange a short piece of music"
      ],
      [
        "A costume project",
        "design a costume for a community event"
      ],
      [
        "The handmade journal",
        "make a handcrafted journal"
      ],
      [
        "A small animation",
        "create a short animated scene"
      ],
      [
        "The art market",
        "prepare original artwork for a local market"
      ]
    ]
  },
  {
    "key": "community",
    "min": 10,
    "max": 105,
    "stat": "kindness",
    "second": "reputation",
    "gate": null,
    "items": [
      [
        "A park cleanup",
        "organize a neighborhood cleanup"
      ],
      [
        "The library drive",
        "help collect books for a library"
      ],
      [
        "A community meal",
        "help coordinate a shared meal"
      ],
      [
        "The welcome committee",
        "welcome newcomers to the neighborhood"
      ],
      [
        "A charity walk",
        "help organize a fundraising walk"
      ],
      [
        "The community workshop",
        "plan a public skills workshop"
      ],
      [
        "A neighborhood noticeboard",
        "improve a local noticeboard"
      ],
      [
        "A repair café",
        "help organize a community repair session"
      ],
      [
        "The accessibility discussion",
        "listen to residents' accessibility concerns"
      ],
      [
        "A cultural exchange",
        "help organize a cultural exchange event"
      ],
      [
        "The volunteer roster",
        "coordinate volunteer shifts"
      ],
      [
        "A local history project",
        "collect stories for a local archive"
      ]
    ]
  },
  {
    "key": "pets",
    "min": 6,
    "max": 105,
    "stat": "kindness",
    "second": "happiness",
    "gate": "pet",
    "items": [
      [
        "The new pet routine",
        "establish a consistent routine for your pet"
      ],
      [
        "A pet’s favorite toy",
        "find a safe enrichment activity for your pet"
      ],
      [
        "The pet sitter",
        "arrange care for your pet during an absence"
      ],
      [
        "A pet photograph",
        "capture a photo of your animal companion"
      ],
      [
        "The pet shelter visit",
        "learn about local animal welfare"
      ],
      [
        "A pet’s quiet space",
        "make a comfortable space for your pet"
      ],
      [
        "The pet care checklist",
        "review your animal companion's care routine"
      ],
      [
        "A pet training session",
        "practice a basic reward-based training activity"
      ],
      [
        "A pet-friendly outing",
        "plan a safe pet-friendly outing"
      ],
      [
        "The grooming appointment",
        "arrange appropriate grooming for your pet"
      ],
      [
        "A pet’s birthday",
        "plan a simple celebration for your pet"
      ],
      [
        "The companion animal group",
        "meet other responsible pet owners"
      ]
    ]
  },
  {
    "key": "laterlife",
    "min": 55,
    "max": 109,
    "stat": "happiness",
    "second": "kindness",
    "gate": null,
    "items": [
      [
        "A lifetime scrapbook",
        "assemble memories from earlier decades"
      ],
      [
        "The retirement club",
        "join a local retirement activity"
      ],
      [
        "A family interview",
        "record stories for younger relatives"
      ],
      [
        "The neighborhood bench",
        "arrange a regular social gathering"
      ],
      [
        "An old skill revisited",
        "rediscover a skill you learned years ago"
      ],
      [
        "A personal archive",
        "organize letters and photographs"
      ],
      [
        "A new routine after retirement",
        "plan meaningful weekly activities"
      ],
      [
        "A grandchild’s question",
        "share a lesson from your life"
      ],
      [
        "The community mentor",
        "offer advice to younger adults"
      ],
      [
        "A reunion of colleagues",
        "reconnect with former coworkers"
      ],
      [
        "The legacy letter",
        "write a letter about your values"
      ],
      [
        "An anniversary reflection",
        "reflect on an important life milestone"
      ],
      [
        "The last unfinished project",
        "return to a long-delayed personal project"
      ],
      [
        "A quiet celebration",
        "plan a meaningful celebration with loved ones"
      ],
      [
        "A friendship across generations",
        "make time for an intergenerational conversation"
      ],
      [
        "The neighborhood history walk",
        "explore how your neighborhood has changed"
      ],
      [
        "A gift of knowledge",
        "share practical knowledge with a younger person"
      ]
    ]
  }
];

export function buildScenarioVariants(startId) {
 const cards=[];
 for(const g of scenarioGroups)for(const [name,task] of g.items){
   const relational=['partner','child','friend'].includes(g.gate),business=g.gate==='business',career=g.gate==='job',financial=g.key==='finance',child=g.max<=19,pet=g.gate==='pet';
   const gain=(a,b)=>({[g.stat]:a,...(g.second!==g.stat?{[g.second]:b}:{})});
   const context=relational?{bond:5}:business?{businessQuality:4}:career?{performance:5}:pet?{petBond:6}:financial?{financialSkill:5}:{};
   const downside=relational?{bond:-5}:business?{businessQuality:-4}:career?{performance:-4}:pet?{petBond:-4}:{};
   const benefit=relational?{bond:8}:business?{businessQuality:7}:career?{performance:8}:pet?{petBond:9}:financial?{financialSkill:8}:{};
   const push=(suffix,prompt,choices,variant)=>cards.push({id:startId+cards.length,title:name+' — '+suffix,min:g.min,max:g.max,prompt,requires:g.gate||undefined,category:g.key,variant,origin:'activity-variant',premise:name,choices});
   push('An opportunity','You have a chance to '+task+'. Taking it seriously requires time and effort. How will you approach it?',[
     {text:'Commit to the full project',effects:{...gain(6,3),...context,stress:4,experience:2}},
     {text:'Try a manageable first step',effects:{...gain(3,2),stress:-2,experience:1}},
     {text:'Choose another priority',effects:{happiness:3,stress:-3}}
   ],'opportunity');
   push('Limited resources','Your plan to '+task+' has run into a shortage of '+(child?'time and materials':financial?'available savings':business?'staff time and funds':career?'team capacity':relational?'shared time':pet?'time and supplies':'time and resources')+'. You need to adapt.',[
     {text:'Scale down and finish what you can',effects:{...gain(3,2),...context,stress:-2,experience:1}},
     {text:child?'Ask an adult for help':'Commit extra resources',effects:{...gain(6,2),...(child?{bond:3}:{cash:business?-500:financial?-150:-80}),...benefit,stress:5}},
     {text:'Postpone the plan',effects:{stress:-5,...downside}}
   ],'constraint');
   push('An unexpected setback','Just as you were ready to '+task+', an unexpected change has disrupted your plans. You can learn from the disruption, but it may take extra effort.',[
     {text:'Identify the cause and rebuild the plan',effects:{...gain(5,2),knowledge:Math.max(g.stat==='knowledge'?5:0,3),experience:3,stress:3,...context}},
     {text:'Find a simpler alternative',effects:{...gain(2,2),creativity:4,stress:-2}},
     {text:'Accept the setback and recover',effects:{happiness:3,stress:-5,...downside}}
   ],'setback');
   push('Different expectations','Someone affected by your decision to '+task+' has a different idea of what should happen. Your response may affect the people around you.',[
     {text:'Listen and agree on a shared approach',effects:{kindness:5,social:4,...context,experience:2}},
     {text:'Explain your reasoning and set a boundary',effects:{confidence:5,...gain(2,1),stress:2}},
     {text:'Step back from the disagreement',effects:{stress:-4,...downside}}
   ],'negotiation');
 }
 return cards;
}
