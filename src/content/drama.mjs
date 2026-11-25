// Independently authored dramatic events. Append only.
export const dramaticRows=[
  [
    "The family shop closes",
    7,
    17,
    "family",
    "parent",
    "A parent closes the family shop after months of falling sales. The family must adjust to a smaller income.",
    "Help with everyday responsibilities",
    {
      "bond": 9,
      "kindness": 5,
      "stress": 4
    },
    "Keep school and friendships stable",
    {
      "knowledge": 5,
      "happiness": 3
    },
    "Ask for help from a trusted adult",
    {
      "stress": -5,
      "bond": 4
    }
  ],
  [
    "An award you didn't earn",
    10,
    18,
    "school",
    null,
    "A school competition accidentally credits your work with another student's achievement. The teacher announces your name.",
    "Explain the mistake publicly",
    {
      "kindness": 9,
      "reputation": 5,
      "confidence": 3
    },
    "Speak privately to the teacher",
    {
      "kindness": 6,
      "stress": -2
    },
    "Accept the mistaken recognition",
    {
      "kindness": -9,
      "confidence": 3,
      "stress": 6
    }
  ],
  [
    "A sibling's secret worry",
    8,
    18,
    "family",
    "parent",
    "A family member admits that they are worried about a major change at home. They have not told the adults yet.",
    "Encourage a trusted adult's support",
    {
      "kindness": 6,
      "bond": 5
    },
    "Listen without promising to fix it",
    {
      "bond": 6,
      "stress": 2
    },
    "Change the subject",
    {
      "bond": -4,
      "happiness": 2
    }
  ],
  [
    "The unsigned apology",
    12,
    25,
    "friendship",
    "friend",
    "Someone sends an anonymous apology for a rumor that damaged your friendship. Your friend asks what you want to do.",
    "Discuss what happened honestly",
    {
      "bond": 9,
      "confidence": 4
    },
    "Let the matter rest",
    {
      "stress": -5,
      "bond": 2
    },
    "End the friendship emotionally",
    {
      "bond": -12,
      "confidence": 3
    }
  ],
  [
    "The scholarship deadline",
    16,
    25,
    "education",
    null,
    "A scholarship application closes tomorrow, but your family has asked you to help with a difficult situation.",
    "Ask for help and finish the application",
    {
      "knowledge": 7,
      "stress": 8
    },
    "Prioritize family responsibilities",
    {
      "bond": 8,
      "kindness": 5
    },
    "Request an extension",
    {
      "confidence": 4,
      "stress": 2
    }
  ],
  [
    "A research credit dispute",
    21,
    60,
    "career",
    "job",
    "A supervisor takes sole credit for a project you substantially contributed to.",
    "Request a documented discussion",
    {
      "reputation": 4,
      "confidence": 7,
      "stress": 5
    },
    "Seek advice from a mentor",
    {
      "knowledge": 5,
      "social": 3
    },
    "Let it go to protect your position",
    {
      "stress": -4,
      "performance": -3
    }
  ],
  [
    "The hidden product defect",
    20,
    75,
    "business",
    "business",
    "A customer reports a serious defect in a product your business has shipped. Fixing it may cost a substantial part of your reserves.",
    "Pause sales and arrange repairs",
    {
      "cash": -2500,
      "businessQuality": 10,
      "reputation": 9
    },
    "Arrange an independent review",
    {
      "cash": -1000,
      "knowledge": 7,
      "stress": 5
    },
    "Ignore the warning",
    {
      "businessQuality": -12,
      "reputation": -10,
      "legalRisk": 25
    }
  ],
  [
    "A supplier's last appeal",
    20,
    85,
    "business",
    "business",
    "A small supplier asks for more time to fulfill an important order after a personal emergency.",
    "Negotiate a reasonable extension",
    {
      "businessQuality": 3,
      "kindness": 7,
      "stress": 4
    },
    "Find a temporary alternative",
    {
      "cash": -700,
      "knowledge": 4
    },
    "End the agreement fairly",
    {
      "businessQuality": -3,
      "stress": -3
    }
  ],
  [
    "Your name on the complaint",
    18,
    80,
    "justice",
    null,
    "You are named in a fictional civil complaint over a misunderstanding. You have a chance to resolve it peacefully.",
    "Seek qualified legal advice",
    {
      "cash": -500,
      "knowledge": 5,
      "stress": -2
    },
    "Offer mediation",
    {
      "cash": -250,
      "kindness": 4
    },
    "Ignore the notice",
    {
      "legalRisk": 30,
      "stress": 8
    }
  ],
  [
    "Pressure to break the rules",
    18,
    65,
    "justice",
    "job",
    "A colleague pressures you to accept an unlawful payment. You could benefit briefly but face serious consequences.",
    "Refuse and document concerns",
    {
      "kindness": 8,
      "reputation": 5,
      "stress": 3
    },
    "Seek confidential professional guidance",
    {
      "knowledge": 6,
      "stress": -2
    },
    "Accept the fictional wrongdoing",
    {
      "cash": 1000,
      "legalRisk": 70,
      "kindness": -15
    }
  ],
  [
    "The second chance interview",
    21,
    75,
    "justice",
    null,
    "An employer asks you to discuss a past mistake. You can respond honestly or withdraw from consideration.",
    "Explain lessons learned",
    {
      "confidence": 7,
      "reputation": 5
    },
    "Ask about the employer's process",
    {
      "knowledge": 4,
      "stress": -2
    },
    "Withdraw and search elsewhere",
    {
      "happiness": 3,
      "stress": -3
    }
  ],
  [
    "A disputed rental deposit",
    20,
    90,
    "property",
    "property",
    "A tenant disputes a deduction from a fictional rental deposit. An independent review is available.",
    "Seek a fair resolution",
    {
      "cash": -350,
      "kindness": 6,
      "reputation": 4
    },
    "Request independent mediation",
    {
      "cash": -200,
      "knowledge": 5
    },
    "Refuse to engage",
    {
      "legalRisk": 25,
      "reputation": -6
    }
  ],
  [
    "The empty building",
    25,
    90,
    "finance",
    "property",
    "A neighboring building has remained vacant for months. It makes you reconsider your own property expenses.",
    "Review your reserves",
    {
      "financialSkill": 8,
      "stress": -2
    },
    "Plan maintenance for the year",
    {
      "cash": -400,
      "knowledge": 5
    },
    "Avoid thinking about the problem",
    {
      "stress": 5,
      "financialSkill": -2
    }
  ],
  [
    "An inheritance with strings",
    30,
    100,
    "finance",
    null,
    "A relative offers a modest gift, but expects you to take on responsibilities that could conflict with your own plans.",
    "Discuss expectations before accepting",
    {
      "cash": 1200,
      "bond": 4,
      "stress": 3
    },
    "Decline kindly",
    {
      "kindness": 5,
      "confidence": 4
    },
    "Accept without discussion",
    {
      "cash": 1600,
      "stress": 10,
      "bond": -4
    }
  ],
  [
    "The sudden market reversal",
    18,
    95,
    "finance",
    "investor",
    "A fictional market report shows a sharp fall after several strong years. You are worried about your investment decisions.",
    "Review your risk tolerance",
    {
      "financialSkill": 8,
      "stress": -3
    },
    "Talk to an independent adviser",
    {
      "cash": -250,
      "knowledge": 5
    },
    "Obsess over every report",
    {
      "stress": 9,
      "happiness": -5
    }
  ],
  [
    "A friend needs a guarantor",
    20,
    80,
    "friendship",
    "friend",
    "A friend asks you to guarantee a debt that you cannot comfortably repay if things go wrong.",
    "Decline and offer practical help",
    {
      "bond": 3,
      "financialSkill": 6
    },
    "Discuss a smaller form of help",
    {
      "cash": -250,
      "bond": 6
    },
    "Accept the fictional obligation",
    {
      "debt": 4500,
      "bond": 8,
      "stress": 8
    }
  ],
  [
    "The unexpected reunion",
    18,
    100,
    "friendship",
    "friend",
    "An old friend you have not seen in years appears at a community event. Both of you remember a painful misunderstanding.",
    "Invite them to talk privately",
    {
      "bond": 10,
      "kindness": 5
    },
    "Exchange a warm greeting",
    {
      "bond": 4,
      "happiness": 4
    },
    "Avoid the encounter",
    {
      "stress": -2,
      "bond": -5
    }
  ],
  [
    "The missing graduation guest",
    18,
    30,
    "family",
    "parent",
    "A parent cannot attend an important milestone because of their work commitments. You feel disappointed.",
    "Discuss your disappointment honestly",
    {
      "bond": 7,
      "confidence": 4
    },
    "Celebrate with the people available",
    {
      "happiness": 7,
      "social": 4
    },
    "Hold the disappointment inside",
    {
      "bond": -6,
      "stress": 6
    }
  ],
  [
    "A partner's new direction",
    22,
    75,
    "relationship",
    "partner",
    "Your partner wants to change careers, even though it may temporarily reduce household stability.",
    "Make a joint financial plan",
    {
      "bond": 8,
      "financialSkill": 6
    },
    "Encourage an independent decision",
    {
      "bond": 5,
      "kindness": 4
    },
    "Insist on the current arrangement",
    {
      "bond": -10,
      "stress": 5
    }
  ],
  [
    "A child questions tradition",
    30,
    95,
    "family",
    "child",
    "Your child disagrees with a family tradition that matters deeply to you.",
    "Ask what the tradition means to them",
    {
      "bond": 9,
      "kindness": 5
    },
    "Find a compromise",
    {
      "bond": 6,
      "creativity": 3
    },
    "Demand agreement",
    {
      "bond": -12,
      "confidence": 3
    }
  ],
  [
    "The missed final performance",
    25,
    90,
    "family",
    "child",
    "Your child's important performance overlaps with a career obligation that cannot easily be moved.",
    "Arrange cover and attend",
    {
      "bond": 12,
      "performance": -5
    },
    "Explain and arrange another celebration",
    {
      "bond": 5,
      "happiness": 3
    },
    "Prioritize work without discussion",
    {
      "bond": -9,
      "performance": 5
    }
  ],
  [
    "The quiet caregiver",
    35,
    100,
    "family",
    "parent",
    "A relative has been quietly caring for an older family member and is becoming exhausted.",
    "Offer practical assistance",
    {
      "cash": -300,
      "kindness": 8,
      "bond": 6
    },
    "Arrange a shared plan",
    {
      "bond": 8,
      "social": 5
    },
    "Keep your existing commitments",
    {
      "stress": -3,
      "bond": -4
    }
  ],
  [
    "An uncomfortable diagnosis",
    30,
    100,
    "health",
    null,
    "A routine fictional checkup raises a concern that requires follow-up. You are nervous about the uncertainty.",
    "Arrange appropriate follow-up",
    {
      "cash": -250,
      "health": 5,
      "stress": -4
    },
    "Discuss questions with a clinician",
    {
      "knowledge": 6,
      "stress": -3
    },
    "Put off the discussion",
    {
      "health": -5,
      "stress": 7
    }
  ],
  [
    "A difficult recovery",
    25,
    100,
    "health",
    null,
    "You are disappointed by a slower-than-expected recovery from a fictional health setback.",
    "Adjust your expectations with professional support",
    {
      "health": 5,
      "stress": -5
    },
    "Ask someone for everyday help",
    {
      "bond": 5,
      "happiness": 4
    },
    "Try to maintain all previous obligations",
    {
      "health": -5,
      "stress": 8
    }
  ],
  [
    "The canceled tour",
    18,
    80,
    "creative",
    "creator",
    "A planned creative event is canceled after weeks of preparation. Your audience is waiting for an explanation.",
    "Explain the cancellation transparently",
    {
      "reputation": 7,
      "stress": -3
    },
    "Offer a smaller alternative event",
    {
      "cash": -250,
      "audience": 400,
      "creativity": 5
    },
    "Stop communicating",
    {
      "reputation": -8,
      "audience": -500
    }
  ],
  [
    "The disputed credit",
    18,
    80,
    "creative",
    "creator",
    "A collaborator claims they were not properly credited in your latest project.",
    "Review the contribution and correct credit",
    {
      "reputation": 7,
      "kindness": 5
    },
    "Arrange a neutral discussion",
    {
      "social": 5,
      "stress": 2
    },
    "Dismiss the concern",
    {
      "reputation": -10,
      "stress": 6
    }
  ],
  [
    "The archive fire",
    30,
    100,
    "creative",
    null,
    "A storage accident destroys copies of a long-running personal project. Some memories are recoverable through relatives and friends.",
    "Reconstruct the project with their help",
    {
      "creativity": 8,
      "bond": 5,
      "stress": 5
    },
    "Create a new work inspired by it",
    {
      "creativity": 7,
      "confidence": 4
    },
    "Accept the loss and rest",
    {
      "happiness": 3,
      "stress": -5
    }
  ],
  [
    "The community vote",
    25,
    90,
    "community",
    null,
    "Residents must decide whether to spend a limited fund on accessibility improvements or a community event.",
    "Help develop a compromise",
    {
      "kindness": 7,
      "reputation": 6
    },
    "Argue for accessibility improvements",
    {
      "kindness": 8,
      "confidence": 4
    },
    "Support the celebration plan",
    {
      "social": 5,
      "happiness": 4
    }
  ],
  [
    "A neighbor's flooded home",
    16,
    100,
    "community",
    null,
    "A neighbor temporarily loses access to their home after a flood. Local volunteers are organizing assistance.",
    "Offer time and practical help",
    {
      "kindness": 9,
      "reputation": 5,
      "stress": 4
    },
    "Contribute to an organized relief fund",
    {
      "cash": -200,
      "kindness": 7
    },
    "Share verified relief information",
    {
      "social": 4,
      "knowledge": 3
    }
  ],
  [
    "The animal shelter decision",
    12,
    95,
    "pets",
    "pet",
    "An animal shelter is looking for volunteers, but you already have responsibilities toward your own companion.",
    "Volunteer a manageable amount",
    {
      "kindness": 6,
      "petBond": 3,
      "stress": 2
    },
    "Donate supplies",
    {
      "cash": -80,
      "kindness": 5
    },
    "Prioritize your own pet",
    {
      "petBond": 9,
      "happiness": 3
    }
  ],
  [
    "The old companion",
    12,
    105,
    "pets",
    "pet",
    "Your pet is growing older and needs a more comfortable daily routine.",
    "Discuss care with a veterinarian",
    {
      "cash": -100,
      "petBond": 10,
      "knowledge": 3
    },
    "Adapt your home routine",
    {
      "petBond": 8,
      "happiness": 3
    },
    "Ask family for help",
    {
      "petBond": 5,
      "bond": 4
    }
  ],
  [
    "The final workday",
    60,
    100,
    "laterlife",
    null,
    "A former colleague invites you back for an anniversary celebration. You wonder how much of your identity was tied to work.",
    "Share your experiences with younger colleagues",
    {
      "reputation": 8,
      "kindness": 6
    },
    "Enjoy the reunion quietly",
    {
      "happiness": 7,
      "social": 4
    },
    "Decline and explore a new interest",
    {
      "creativity": 6,
      "stress": -3
    }
  ],
  [
    "The letter never sent",
    55,
    109,
    "laterlife",
    null,
    "You find an old letter written to someone you once disappointed. Years have passed.",
    "Write a thoughtful new letter",
    {
      "kindness": 7,
      "stress": -4
    },
    "Record what you learned privately",
    {
      "knowledge": 5,
      "happiness": 4
    },
    "Leave the past alone",
    {
      "stress": -3,
      "confidence": 2
    }
  ],
  [
    "The family heirloom",
    45,
    109,
    "family",
    null,
    "Two relatives disagree about who should receive a meaningful family heirloom.",
    "Invite a shared discussion",
    {
      "bond": 7,
      "kindness": 6
    },
    "Document the item's history for everyone",
    {
      "creativity": 5,
      "knowledge": 4
    },
    "Remove yourself from the dispute",
    {
      "stress": -4,
      "bond": -3
    }
  ],
  [
    "A younger colleague returns",
    35,
    90,
    "career",
    "job",
    "Someone you mentored years ago is now offered a position above yours.",
    "Congratulate them and offer support",
    {
      "kindness": 7,
      "reputation": 5
    },
    "Ask for feedback on your own development",
    {
      "knowledge": 6,
      "performance": 5
    },
    "Withdraw from the relationship",
    {
      "social": -6,
      "stress": 4
    }
  ],
  [
    "The business succession plan",
    50,
    90,
    "business",
    "business",
    "Your company has grown, but nobody is ready to take responsibility if you step away.",
    "Develop a succession plan",
    {
      "businessQuality": 8,
      "knowledge": 5
    },
    "Train a promising employee",
    {
      "cash": -600,
      "businessQuality": 6
    },
    "Put off the discussion",
    {
      "stress": 5,
      "businessQuality": -5
    }
  ]
];
export function dramaticCards(start){return dramaticRows.map(([title,min,max,category,requires,prompt,a,ae,b,be,c,ce],i)=>({id:start+i,title,min,max,category,requires:requires||undefined,prompt,origin:'dramatic',choices:[{text:a,effects:ae},{text:b,effects:be},{text:c,effects:ce}]}));}
