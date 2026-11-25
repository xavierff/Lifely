// Twenty-five individually authored, name-aware recurring-character scenarios.
// Appended after all previous scenario IDs. Generated titles are never reused.
export const characterScenes=[
  [
    "athlete",
    "The Rival Who Won't Shake Hands",
    "After a close match, {npc} refuses the customary handshake. Cameras are watching, and your teammates are angry.",
    [
      "Offer a respectful handshake anyway",
      {
        "athleteRespect": 10,
        "athleteRivalry": -5,
        "reputation": 4
      }
    ],
    [
      "Discuss the incident privately",
      {
        "athleteRespect": 6,
        "confidence": 5
      }
    ],
    [
      "Criticize the rival publicly",
      {
        "athleteRivalry": 13,
        "reputation": -5,
        "stress": 4
      }
    ]
  ],
  [
    "athlete",
    "A Teammate on the Sidelines",
    "Your rival {npc} has missed several competitions with an injury and quietly asks for help finding a safe training plan.",
    [
      "Share your recovery resources",
      {
        "athleteRespect": 12,
        "kindness": 7,
        "sportForm": 2
      }
    ],
    [
      "Suggest a qualified professional",
      {
        "athleteRespect": 7,
        "knowledge": 4
      }
    ],
    [
      "Avoid getting involved",
      {
        "athleteRivalry": 5,
        "stress": -2
      }
    ]
  ],
  [
    "athlete",
    "The Invitation to Train Together",
    "{npc} proposes a two-week practice camp before the championship. Your coach worries that you might reveal your strategy.",
    [
      "Train together with clear boundaries",
      {
        "athleteRespect": 9,
        "sportForm": 8,
        "stress": 3
      }
    ],
    [
      "Suggest a neutral skills workshop",
      {
        "athleteRespect": 5,
        "sportForm": 5
      }
    ],
    [
      "Turn the offer down",
      {
        "athleteRivalry": 6,
        "confidence": 3
      }
    ]
  ],
  [
    "athlete",
    "An Uneven Playing Field",
    "You discover that a community tournament provides worse equipment to participants competing against {npc}.",
    [
      "Ask organizers to make equipment fair",
      {
        "athleteRespect": 8,
        "kindness": 8,
        "reputation": 5
      }
    ],
    [
      "Raise the concern confidentially",
      {
        "knowledge": 5,
        "athleteRespect": 4
      }
    ],
    [
      "Ignore the unequal conditions",
      {
        "athleteRivalry": 6,
        "kindness": -6
      }
    ]
  ],
  [
    "athlete",
    "The Interview Before the Final",
    "A journalist tries to provoke a bitter quote about your rivalry with {npc}.",
    [
      "Praise their achievements",
      {
        "athleteRespect": 9,
        "reputation": 6
      }
    ],
    [
      "Focus on your own preparation",
      {
        "confidence": 5,
        "sportForm": 3
      }
    ],
    [
      "Take the bait and trade insults",
      {
        "athleteRivalry": 12,
        "reputation": -7,
        "fame": 4
      }
    ]
  ],
  [
    "politician",
    "A Shared Flood-Relief Plan",
    "Your fictional political rival {npc} offers to co-sponsor emergency relief but asks to share the announcement.",
    [
      "Share credit and help residents",
      {
        "politicianRivalry": -12,
        "politicianApproval": 6,
        "publicApproval": 7,
        "kindness": 6
      }
    ],
    [
      "Agree after reviewing the budget",
      {
        "politicianRivalry": -7,
        "knowledge": 5
      }
    ],
    [
      "Reject cooperation for political advantage",
      {
        "politicianRivalry": 12,
        "publicApproval": -7
      }
    ]
  ],
  [
    "politician",
    "An Anonymous Debate Briefing",
    "An aide hands you an unverified document containing accusations about {npc} just before a debate.",
    [
      "Verify the claims independently",
      {
        "politicianRivalry": -2,
        "knowledge": 7,
        "reputation": 5
      }
    ],
    [
      "Set the document aside",
      {
        "confidence": 3,
        "stress": -4
      }
    ],
    [
      "Repeat the accusations without checking",
      {
        "politicianRivalry": 12,
        "publicApproval": -8,
        "legalRisk": 10
      }
    ]
  ],
  [
    "politician",
    "The Closed-Door Invitation",
    "{npc} invites you to discuss a proposed fictional transportation policy without your advisors present.",
    [
      "Bring a neutral recorder and meet",
      {
        "politicianRivalry": -6,
        "politicianApproval": 4,
        "knowledge": 4
      }
    ],
    [
      "Request a transparent public discussion",
      {
        "publicApproval": 7,
        "reputation": 4
      }
    ],
    [
      "Use the meeting to spread rumors",
      {
        "politicianRivalry": 10,
        "publicApproval": -6
      }
    ]
  ],
  [
    "politician",
    "The Opposition's Good Idea",
    "A policy developed by {npc}'s civic party could improve local services, even though it conflicts with your campaign message.",
    [
      "Support the policy on its merits",
      {
        "politicianRivalry": -10,
        "publicApproval": 8,
        "kindness": 4
      }
    ],
    [
      "Propose evidence-based amendments",
      {
        "knowledge": 6,
        "publicApproval": 5
      }
    ],
    [
      "Oppose it purely for advantage",
      {
        "politicianRivalry": 11,
        "publicApproval": -7
      }
    ]
  ],
  [
    "politician",
    "An Election-Night Phone Call",
    "After a heated fictional election, {npc} asks whether you can help discourage hostile behavior among supporters.",
    [
      "Issue a joint call for civility",
      {
        "politicianRivalry": -13,
        "publicApproval": 8,
        "reputation": 6
      }
    ],
    [
      "Make a separate measured statement",
      {
        "publicApproval": 5,
        "confidence": 3
      }
    ],
    [
      "Keep escalating the dispute",
      {
        "politicianRivalry": 13,
        "stress": 7,
        "publicApproval": -9
      }
    ]
  ],
  [
    "agent",
    "A Contract in Fine Print",
    "Your representative {npc} presents an opportunity, but a clause would limit your right to work with other artists.",
    [
      "Ask for an independent contract review",
      {
        "agentTrust": 6,
        "knowledge": 7,
        "cash": -350
      }
    ],
    [
      "Negotiate a narrower clause",
      {
        "agentTrust": 4,
        "confidence": 6
      }
    ],
    [
      "Sign without reading further",
      {
        "agentTrust": -7,
        "cash": 900,
        "stress": 5
      }
    ]
  ],
  [
    "agent",
    "A Promise to the Audience",
    "{npc} says a sponsor wants you to endorse a product you have never personally tried.",
    [
      "Decline the endorsement honestly",
      {
        "agentTrust": 7,
        "reputation": 8
      }
    ],
    [
      "Request a genuine trial before deciding",
      {
        "knowledge": 6,
        "agentTrust": 5
      }
    ],
    [
      "Accept an unverified endorsement",
      {
        "cash": 1200,
        "agentTrust": -7,
        "reputation": -9
      }
    ]
  ],
  [
    "agent",
    "A Missed Audition Call",
    "Your agent {npc} failed to forward a time-sensitive casting invitation. You learn about it the following morning.",
    [
      "Discuss a process for preventing mistakes",
      {
        "agentTrust": 6,
        "confidence": 4
      }
    ],
    [
      "Ask for a documented explanation",
      {
        "agentTrust": 2,
        "knowledge": 6
      }
    ],
    [
      "Publicly blame the entire team",
      {
        "agentTrust": -12,
        "fame": 3,
        "stress": 6
      }
    ]
  ],
  [
    "agent",
    "The Unpaid Collaborator",
    "{npc} negotiates a creative partnership, but a junior collaborator says their contribution has not been compensated.",
    [
      "Insist on fair compensation",
      {
        "agentTrust": 8,
        "reputation": 8,
        "cash": -400
      }
    ],
    [
      "Review the agreement with everyone",
      {
        "agentTrust": 6,
        "knowledge": 5
      }
    ],
    [
      "Tell them to accept exposure instead",
      {
        "agentTrust": -9,
        "reputation": -10
      }
    ]
  ],
  [
    "agent",
    "An Award-Season Decision",
    "Your agent {npc} recommends spending heavily on awards publicity rather than new creative work.",
    [
      "Invest in improving the next project",
      {
        "creativity": 8,
        "agentTrust": 3,
        "cash": -500
      }
    ],
    [
      "Set a modest publicity budget",
      {
        "fame": 5,
        "agentTrust": 5,
        "cash": -300
      }
    ],
    [
      "Spend lavishly on self-promotion",
      {
        "fame": 10,
        "cash": -1800,
        "stress": 7
      }
    ]
  ],
  [
    "family",
    "An Unspoken Financial Boundary",
    "{npc} says a longstanding family arrangement has felt unfair. Neither of you has explained expectations clearly.",
    [
      "Write down a fair shared agreement",
      {
        "familyTension": -14,
        "bond": 8,
        "financialSkill": 5
      }
    ],
    [
      "Listen without deciding immediately",
      {
        "familyTension": -9,
        "bond": 5
      }
    ],
    [
      "Insist nothing will ever change",
      {
        "familyTension": 15,
        "bond": -12
      }
    ]
  ],
  [
    "family",
    "The Holiday Invitation",
    "During a family disagreement, {npc} invites you to a small celebration. Other relatives want you to refuse.",
    [
      "Attend and keep the conversation respectful",
      {
        "familyTension": -13,
        "bond": 9,
        "kindness": 5
      }
    ],
    [
      "Offer to meet separately",
      {
        "familyTension": -6,
        "bond": 5
      }
    ],
    [
      "Reject the invitation harshly",
      {
        "familyTension": 13,
        "bond": -10
      }
    ]
  ],
  [
    "family",
    "What Was Really Said",
    "A message from {npc} has been forwarded without context, making the family conflict worse.",
    [
      "Ask for the original conversation",
      {
        "familyTension": -11,
        "knowledge": 5,
        "bond": 5
      }
    ],
    [
      "Use a neutral family mediator",
      {
        "familyTension": -16,
        "cash": -250,
        "bond": 7
      }
    ],
    [
      "Reply angrily to everyone",
      {
        "familyTension": 14,
        "stress": 6,
        "bond": -10
      }
    ]
  ],
  [
    "family",
    "The Family Loan Disagreement",
    "{npc} insists that an old informal loan was a gift. Your written records are incomplete.",
    [
      "Discuss a reasonable compromise",
      {
        "familyTension": -12,
        "financialSkill": 4,
        "bond": 6
      }
    ],
    [
      "Suggest independent mediation",
      {
        "familyTension": -9,
        "cash": -350,
        "knowledge": 5
      }
    ],
    [
      "Demand full repayment immediately",
      {
        "familyTension": 18,
        "bond": -12,
        "confidence": 5
      }
    ]
  ],
  [
    "family",
    "A Younger Relative Is Listening",
    "As you argue with {npc}, a younger family member hears the disagreement and becomes upset.",
    [
      "Stop and make the situation safe",
      {
        "familyTension": -13,
        "kindness": 8,
        "bond": 6
      }
    ],
    [
      "Continue later in private",
      {
        "familyTension": -7,
        "confidence": 4
      }
    ],
    [
      "Continue the argument anyway",
      {
        "familyTension": 12,
        "bond": -10,
        "kindness": -6
      }
    ]
  ],
  [
    "legacy",
    "The Ancestor's Promise",
    "During your family's work on {promise}, a letter from {npc} reveals that the original promise was more complicated than anyone knew.",
    [
      "Preserve the letter and discuss it",
      {
        "legacyContribution": 2,
        "familyStanding": 7,
        "knowledge": 7
      }
    ],
    [
      "Share it with everyone before deciding",
      {
        "legacyContribution": 1,
        "kindness": 5
      }
    ],
    [
      "Hide the letter to avoid conflict",
      {
        "legacyContribution": -2,
        "familyStanding": -8,
        "stress": 5
      }
    ]
  ],
  [
    "legacy",
    "A Different Generation, A Different Choice",
    "A younger relative asks why {npc}'s promise about {promise} should determine their future.",
    [
      "Invite them to reinterpret the promise",
      {
        "legacyContribution": 2,
        "familyStanding": 8,
        "bond": 5
      }
    ],
    [
      "Document both perspectives",
      {
        "legacyContribution": 1,
        "knowledge": 6
      }
    ],
    [
      "Demand exact obedience",
      {
        "legacyContribution": -2,
        "familyStanding": -9,
        "bond": -9
      }
    ]
  ],
  [
    "legacy",
    "The Missing Family Record",
    "An important document connected with {promise} is missing. Older relatives disagree about what {npc} originally intended.",
    [
      "Organize a careful search",
      {
        "legacyContribution": 2,
        "knowledge": 6,
        "stress": 4
      }
    ],
    [
      "Record oral histories with consent",
      {
        "legacyContribution": 1,
        "familyStanding": 6
      }
    ],
    [
      "Accept an unsupported explanation",
      {
        "legacyContribution": -2,
        "stress": -2
      }
    ]
  ],
  [
    "legacy",
    "Money Can't Solve Every Promise",
    "Someone proposes paying for {promise} without involving the people who will live with the result.",
    [
      "Ask affected relatives to shape the plan",
      {
        "legacyContribution": 2,
        "familyStanding": 8,
        "cash": -450
      }
    ],
    [
      "Fund a small consultative pilot",
      {
        "legacyContribution": 1,
        "knowledge": 4,
        "cash": -600
      }
    ],
    [
      "Pay immediately and demand gratitude",
      {
        "legacyContribution": -1,
        "familyStanding": -7,
        "cash": -1000
      }
    ]
  ],
  [
    "legacy",
    "The Generational Hand-Off",
    "A relative brings a box of unfinished work connected with {npc}'s promise. Your children may someday be responsible for it.",
    [
      "Create an open family archive",
      {
        "legacyContribution": 2,
        "familyStanding": 8,
        "knowledge": 5
      }
    ],
    [
      "Offer future generations a choice",
      {
        "legacyContribution": 1,
        "kindness": 7
      }
    ],
    [
      "Keep the responsibility secret",
      {
        "legacyContribution": -2,
        "familyStanding": -7,
        "stress": 4
      }
    ]
  ]
];
export const characterEventCards=start=>characterScenes.map(([cast,title,prompt,...choicePairs],i)=>({
 id:start+i,cast,origin:'character-drama',title,category:cast,min:18,max:105,prompt,
 choices:choicePairs.map(([text,effects])=>({text,effects}))
}));
