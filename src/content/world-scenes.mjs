// Hand-authored, gated, cross-system scenes, never mechanically duplicated templates.
export const worldScenes = [
  {
    "domain": "entertainment",
    "title": "The forgotten co-writer",
    "min": 18,
    "max": 80,
    "prompt": "A songwriter whose early ideas shaped your breakthrough asks for credit after your latest release gains attention.",
    "choices": [
      {
        "text": "Update the credits",
        "effects": {
          "fame": 3,
          "reputation": 7,
          "kindness": 5
        }
      },
      {
        "text": "Arrange a mediated conversation",
        "effects": {
          "reputation": 3,
          "stress": 3
        }
      },
      {
        "text": "Refuse to acknowledge them",
        "effects": {
          "fame": -7,
          "reputation": -9,
          "stress": 5
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "A quiet film premiere",
    "min": 18,
    "max": 90,
    "prompt": "Your first screening sells few tickets, but the audience stays afterwards to discuss a scene that moved them.",
    "choices": [
      {
        "text": "Listen to the audience",
        "effects": {
          "fame": 5,
          "creativity": 5,
          "social": 4
        }
      },
      {
        "text": "Focus on the poor turnout",
        "effects": {
          "stress": 8,
          "confidence": -5
        }
      },
      {
        "text": "Organize a smaller second screening",
        "effects": {
          "cash": -250,
          "fame": 8,
          "reputation": 3
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "A contract with an impossible clause",
    "min": 20,
    "max": 85,
    "prompt": "A studio offers a lucrative agreement with restrictions that could prevent you from doing independent work.",
    "choices": [
      {
        "text": "Negotiate creative control",
        "effects": {
          "confidence": 8,
          "fame": 3,
          "stress": 4
        }
      },
      {
        "text": "Take the guaranteed money",
        "effects": {
          "cash": 2500,
          "creativity": -5
        }
      },
      {
        "text": "Decline and stay independent",
        "effects": {
          "creativity": 7,
          "stress": -4
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "The overnight viral clip",
    "min": 18,
    "max": 85,
    "prompt": "An unrehearsed moment from a performance goes viral. Fans want you to repeat it rather than make new work.",
    "choices": [
      {
        "text": "Enjoy the attention and move on",
        "effects": {
          "fame": 5,
          "happiness": 4
        }
      },
      {
        "text": "Build a whole act around it",
        "effects": {
          "fame": 12,
          "creativity": -6,
          "stress": 5
        }
      },
      {
        "text": "Tell followers about your creative process",
        "effects": {
          "fame": 3,
          "creativity": 7
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "A mentor leaves the stage",
    "min": 22,
    "max": 105,
    "prompt": "The performer who encouraged your first audition announces retirement and asks you to share their final concert.",
    "choices": [
      {
        "text": "Appear together",
        "effects": {
          "fame": 5,
          "kindness": 7,
          "bond": 4
        }
      },
      {
        "text": "Help prepare the tribute",
        "effects": {
          "creativity": 5,
          "kindness": 7
        }
      },
      {
        "text": "Send a thoughtful letter",
        "effects": {
          "happiness": 5,
          "stress": -2
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "A fictional awards backlash",
    "min": 20,
    "max": 95,
    "prompt": "Your nomination divides a fan community, with accusations that the selection favored popularity over craft.",
    "choices": [
      {
        "text": "Thank the jury and acknowledge peers",
        "effects": {
          "reputation": 7,
          "fame": 3
        }
      },
      {
        "text": "Turn the controversy into publicity",
        "effects": {
          "fame": 11,
          "reputation": -7
        }
      },
      {
        "text": "Withdraw from the debate",
        "effects": {
          "stress": -5,
          "fame": -3
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "The missing master recording",
    "min": 18,
    "max": 95,
    "prompt": "A backup failure destroys part of a nearly completed recording session before the release deadline.",
    "choices": [
      {
        "text": "Record again",
        "effects": {
          "cash": -650,
          "creativity": 7,
          "stress": 6
        }
      },
      {
        "text": "Release a simpler version",
        "effects": {
          "fame": 3,
          "stress": -4
        }
      },
      {
        "text": "Postpone the release",
        "effects": {
          "reputation": -3,
          "knowledge": 4
        }
      }
    ]
  },
  {
    "domain": "entertainment",
    "title": "A tiny theater in another city",
    "min": 18,
    "max": 95,
    "prompt": "A small venue offers to host your next show. The fee is modest, but the audience may become devoted followers.",
    "choices": [
      {
        "text": "Accept the intimate venue",
        "effects": {
          "fame": 7,
          "kindness": 3,
          "cash": 300
        }
      },
      {
        "text": "Negotiate better travel support",
        "effects": {
          "cash": 800,
          "reputation": 3
        }
      },
      {
        "text": "Decline and seek a larger stage",
        "effects": {
          "confidence": 4,
          "stress": 3
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "The last-minute substitute",
    "min": 18,
    "max": 55,
    "prompt": "Your coach asks you to fill in at a position you have never practiced because a teammate was injured.",
    "choices": [
      {
        "text": "Play for the team",
        "effects": {
          "sportForm": 5,
          "kindness": 5,
          "stress": 5
        }
      },
      {
        "text": "Suggest a safer substitute",
        "effects": {
          "knowledge": 4,
          "reputation": 3
        }
      },
      {
        "text": "Refuse without discussing it",
        "effects": {
          "sportForm": -4,
          "social": -5
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "An unsafe training shortcut",
    "min": 16,
    "max": 55,
    "prompt": "Someone at the club recommends extreme training to recover lost form quickly. Your health adviser disagrees.",
    "choices": [
      {
        "text": "Follow the safer plan",
        "effects": {
          "health": 6,
          "sportForm": 3,
          "confidence": 3
        }
      },
      {
        "text": "Get a second qualified opinion",
        "effects": {
          "knowledge": 6,
          "stress": -3
        }
      },
      {
        "text": "Ignore the advice and overtrain",
        "effects": {
          "sportForm": 5,
          "health": -13,
          "stress": 8
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "A rival needs help",
    "min": 18,
    "max": 60,
    "prompt": "Your strongest rival twists an ankle at a community competition. The organizers have already called for assistance.",
    "choices": [
      {
        "text": "Help coordinate a safe response",
        "effects": {
          "kindness": 8,
          "reputation": 6
        }
      },
      {
        "text": "Give the organizers space",
        "effects": {
          "reputation": 3,
          "stress": -2
        }
      },
      {
        "text": "Use the delay to unsettle opponents",
        "effects": {
          "kindness": -7,
          "sportForm": 3
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "The disputed finish",
    "min": 18,
    "max": 60,
    "prompt": "A close championship ends with a technical disagreement. Video footage may clarify the result.",
    "choices": [
      {
        "text": "Request a fair review",
        "effects": {
          "reputation": 7,
          "sportForm": 3
        }
      },
      {
        "text": "Accept the officials' provisional result",
        "effects": {
          "confidence": 4,
          "stress": -5
        }
      },
      {
        "text": "Make public accusations",
        "effects": {
          "reputation": -9,
          "stress": 8
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "A sponsor wants your silence",
    "min": 18,
    "max": 65,
    "prompt": "A potential sponsor asks you to avoid discussing athlete welfare in public.",
    "choices": [
      {
        "text": "Insist on speaking freely",
        "effects": {
          "kindness": 7,
          "reputation": 6,
          "cash": -200
        }
      },
      {
        "text": "Negotiate a neutral agreement",
        "effects": {
          "cash": 1000,
          "stress": 3
        }
      },
      {
        "text": "Accept the restrictions",
        "effects": {
          "cash": 2400,
          "reputation": -6
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "The children's sports clinic",
    "min": 22,
    "max": 75,
    "prompt": "A local club invites you to lead a beginner sports session for children who cannot afford membership.",
    "choices": [
      {
        "text": "Volunteer for a free clinic",
        "effects": {
          "kindness": 9,
          "reputation": 7,
          "sportForm": 2
        }
      },
      {
        "text": "Help fund equipment",
        "effects": {
          "cash": -300,
          "kindness": 7
        }
      },
      {
        "text": "Recommend another qualified coach",
        "effects": {
          "social": 5,
          "knowledge": 3
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "A second season after injury",
    "min": 20,
    "max": 60,
    "prompt": "After a long recovery you can return to competition, but you may never reach your previous level of fitness.",
    "choices": [
      {
        "text": "Start with shorter competitions",
        "effects": {
          "health": 4,
          "sportForm": 6
        }
      },
      {
        "text": "Invest time in coaching others",
        "effects": {
          "kindness": 7,
          "confidence": 5
        }
      },
      {
        "text": "Rush into the largest event",
        "effects": {
          "sportForm": 5,
          "health": -8,
          "stress": 6
        }
      }
    ]
  },
  {
    "domain": "sports",
    "title": "A teammate's record-breaking day",
    "min": 18,
    "max": 65,
    "prompt": "Your teammate breaks a long-standing record and asks you to stand beside them in the photograph.",
    "choices": [
      {
        "text": "Celebrate wholeheartedly",
        "effects": {
          "social": 6,
          "kindness": 5
        }
      },
      {
        "text": "Ask for a shared interview",
        "effects": {
          "reputation": 5,
          "sportForm": 3
        }
      },
      {
        "text": "Avoid the attention",
        "effects": {
          "stress": -3,
          "social": -5
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "The inaccessible town hall",
    "min": 25,
    "max": 100,
    "prompt": "Residents with mobility challenges cannot enter the building chosen for your fictional public meeting.",
    "choices": [
      {
        "text": "Move to an accessible venue",
        "effects": {
          "publicApproval": 8,
          "kindness": 7,
          "cash": -450
        }
      },
      {
        "text": "Arrange a second accessible session",
        "effects": {
          "publicApproval": 6,
          "social": 5
        }
      },
      {
        "text": "Continue without changes",
        "effects": {
          "publicApproval": -12,
          "reputation": -6
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "A debate opponent misquoted you",
    "min": 25,
    "max": 100,
    "prompt": "A short clip from a civic debate circulates without context. It makes you look dismissive of local concerns.",
    "choices": [
      {
        "text": "Share the full discussion",
        "effects": {
          "publicApproval": 6,
          "reputation": 5
        }
      },
      {
        "text": "Invite a moderated conversation",
        "effects": {
          "social": 6,
          "publicApproval": 5
        }
      },
      {
        "text": "Attack the opponent personally",
        "effects": {
          "publicApproval": -9,
          "stress": 6
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "A budget shortfall",
    "min": 25,
    "max": 100,
    "prompt": "A city budget projection comes in lower than expected. Residents want services protected and debt controlled.",
    "choices": [
      {
        "text": "Present transparent trade-offs",
        "effects": {
          "publicApproval": 7,
          "knowledge": 5
        }
      },
      {
        "text": "Consult service workers and residents",
        "effects": {
          "kindness": 7,
          "publicApproval": 4
        }
      },
      {
        "text": "Promise everything without a plan",
        "effects": {
          "publicApproval": -11,
          "stress": 8
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "A campaign donor's request",
    "min": 25,
    "max": 100,
    "prompt": "A prominent supporter offers campaign funds while privately requesting special treatment for their business.",
    "choices": [
      {
        "text": "Refuse the condition",
        "effects": {
          "publicApproval": 6,
          "kindness": 7
        }
      },
      {
        "text": "Return the donation and disclose concerns",
        "effects": {
          "reputation": 8,
          "stress": 3
        }
      },
      {
        "text": "Accept the private arrangement",
        "effects": {
          "cash": 1200,
          "legalRisk": 55,
          "publicApproval": -9
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "The youth council invitation",
    "min": 25,
    "max": 100,
    "prompt": "Teenagers ask for a seat at the fictional district's planning meetings.",
    "choices": [
      {
        "text": "Create a youth consultation forum",
        "effects": {
          "publicApproval": 7,
          "kindness": 6
        }
      },
      {
        "text": "Invite a student delegation",
        "effects": {
          "publicApproval": 5,
          "social": 5
        }
      },
      {
        "text": "Tell them to wait until adulthood",
        "effects": {
          "publicApproval": -7,
          "kindness": -5
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "A policy that hurt a neighbor",
    "min": 25,
    "max": 100,
    "prompt": "A resident explains that an otherwise successful policy caused a hardship you had not anticipated.",
    "choices": [
      {
        "text": "Review and revise the policy",
        "effects": {
          "publicApproval": 9,
          "knowledge": 5
        }
      },
      {
        "text": "Offer individual assistance and collect evidence",
        "effects": {
          "kindness": 7,
          "publicApproval": 5
        }
      },
      {
        "text": "Defend the original decision without review",
        "effects": {
          "publicApproval": -8,
          "confidence": 4
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "Your last day in office",
    "min": 26,
    "max": 105,
    "prompt": "A term is ending and staff ask what public records and transition notes you want to leave for your successor.",
    "choices": [
      {
        "text": "Prepare a transparent handover",
        "effects": {
          "reputation": 8,
          "publicApproval": 7
        }
      },
      {
        "text": "Create a practical briefing",
        "effects": {
          "knowledge": 7,
          "publicApproval": 4
        }
      },
      {
        "text": "Take a private break from politics",
        "effects": {
          "stress": -5,
          "publicApproval": -3
        }
      }
    ]
  },
  {
    "domain": "politics",
    "title": "The election-night call",
    "min": 25,
    "max": 90,
    "prompt": "A former rival telephones after a close election, asking whether the two campaigns can cooperate on emergency relief.",
    "choices": [
      {
        "text": "Agree on a shared relief effort",
        "effects": {
          "publicApproval": 8,
          "kindness": 8
        }
      },
      {
        "text": "Offer limited bipartisan cooperation",
        "effects": {
          "publicApproval": 5,
          "reputation": 4
        }
      },
      {
        "text": "Refuse any contact",
        "effects": {
          "publicApproval": -5,
          "confidence": 3
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "The family portrait",
    "min": 18,
    "max": 100,
    "prompt": "A court portrait excludes the people who support your household behind the scenes.",
    "choices": [
      {
        "text": "Invite the staff into a second portrait",
        "effects": {
          "royalSupport": 8,
          "kindness": 7
        }
      },
      {
        "text": "Arrange a personal thank-you",
        "effects": {
          "royalSupport": 5,
          "kindness": 5
        }
      },
      {
        "text": "Keep the traditional format",
        "effects": {
          "royalSupport": -4,
          "confidence": 4
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "A crown worn too early",
    "min": 18,
    "max": 100,
    "prompt": "Courtiers encourage you to give a grand public speech despite your uncertainty about the subject.",
    "choices": [
      {
        "text": "Consult community representatives",
        "effects": {
          "knowledge": 6,
          "royalSupport": 8
        }
      },
      {
        "text": "Deliver a modest message",
        "effects": {
          "confidence": 4,
          "royalSupport": 4
        }
      },
      {
        "text": "Speak without preparation",
        "effects": {
          "royalSupport": -10,
          "stress": 8
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "A charitable invitation",
    "min": 18,
    "max": 100,
    "prompt": "A community shelter asks for a royal visit but does not want the residents photographed without consent.",
    "choices": [
      {
        "text": "Visit quietly",
        "effects": {
          "royalSupport": 9,
          "kindness": 7
        }
      },
      {
        "text": "Help supply needed items",
        "effects": {
          "cash": -500,
          "royalSupport": 6
        }
      },
      {
        "text": "Turn the visit into publicity",
        "effects": {
          "fame": 7,
          "royalSupport": -8
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "The younger heir",
    "min": 20,
    "max": 105,
    "prompt": "A younger relative worries that royal succession leaves them with no freedom to choose their own path.",
    "choices": [
      {
        "text": "Offer them independence",
        "effects": {
          "familyStanding": 7,
          "kindness": 8
        }
      },
      {
        "text": "Discuss roles honestly",
        "effects": {
          "royalSupport": 5,
          "familyStanding": 4
        }
      },
      {
        "text": "Insist they preserve appearances",
        "effects": {
          "familyStanding": -8,
          "royalSupport": -5
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "A neglected royal estate",
    "min": 25,
    "max": 105,
    "prompt": "A historical estate associated with your fictional house is deteriorating and residents want it made useful.",
    "choices": [
      {
        "text": "Open a publicly accessible cultural space",
        "effects": {
          "cash": -800,
          "royalSupport": 9,
          "culture": 5
        }
      },
      {
        "text": "Seek an independent preservation plan",
        "effects": {
          "knowledge": 6,
          "royalSupport": 5
        }
      },
      {
        "text": "Close the estate indefinitely",
        "effects": {
          "royalSupport": -6,
          "stress": -3
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "The shared family title",
    "min": 25,
    "max": 105,
    "prompt": "Two family members disagree over who should represent your house at a public ceremony.",
    "choices": [
      {
        "text": "Let them share the role",
        "effects": {
          "familyStanding": 7,
          "royalSupport": 5
        }
      },
      {
        "text": "Ask a neutral adviser",
        "effects": {
          "knowledge": 5,
          "familyStanding": 4
        }
      },
      {
        "text": "Choose one without discussion",
        "effects": {
          "familyStanding": -8,
          "confidence": 3
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "A long queue at the palace",
    "min": 18,
    "max": 105,
    "prompt": "Visitors have waited hours in the rain for a brief audience. Your organizers propose shortening the event.",
    "choices": [
      {
        "text": "Provide shelter and a fairer schedule",
        "effects": {
          "cash": -650,
          "royalSupport": 9,
          "kindness": 6
        }
      },
      {
        "text": "Meet fewer people carefully",
        "effects": {
          "royalSupport": 5,
          "stress": -3
        }
      },
      {
        "text": "Cancel without explanation",
        "effects": {
          "royalSupport": -11,
          "reputation": -5
        }
      }
    ]
  },
  {
    "domain": "royalty",
    "title": "A public promise",
    "min": 25,
    "max": 105,
    "prompt": "An old pledge made by your family has not yet been fulfilled. A journalist asks what has changed.",
    "choices": [
      {
        "text": "Release a transparent progress statement",
        "effects": {
          "royalSupport": 8,
          "reputation": 5
        }
      },
      {
        "text": "Consult affected residents",
        "effects": {
          "royalSupport": 6,
          "kindness": 5
        }
      },
      {
        "text": "Dismiss the historical promise",
        "effects": {
          "royalSupport": -9,
          "familyStanding": -6
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "A lost travel journal",
    "min": 18,
    "max": 100,
    "prompt": "You discover your notebook is missing after a long train ride. It contains memories but no essential documents.",
    "choices": [
      {
        "text": "Reconstruct the journey with photos",
        "effects": {
          "culture": 7,
          "creativity": 6
        }
      },
      {
        "text": "Ask the railway for lost property assistance",
        "effects": {
          "knowledge": 4,
          "stress": -3
        }
      },
      {
        "text": "Accept the loss and enjoy the next day",
        "effects": {
          "happiness": 4,
          "stress": -5
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "A language misunderstanding",
    "min": 18,
    "max": 100,
    "prompt": "A phrase you translated literally sounds rude in a local conversation. The other person looks surprised.",
    "choices": [
      {
        "text": "Apologize and ask how to say it politely",
        "effects": {
          "culture": 9,
          "kindness": 5
        }
      },
      {
        "text": "Ask a guide for context",
        "effects": {
          "culture": 6,
          "knowledge": 4
        }
      },
      {
        "text": "Walk away embarrassed",
        "effects": {
          "stress": 7,
          "social": -4
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "The closed museum",
    "min": 18,
    "max": 100,
    "prompt": "The museum you traveled to see is unexpectedly closed. A nearby community workshop welcomes visitors.",
    "choices": [
      {
        "text": "Join the workshop",
        "effects": {
          "culture": 7,
          "creativity": 6
        }
      },
      {
        "text": "Explore local streets responsibly",
        "effects": {
          "culture": 5,
          "happiness": 4
        }
      },
      {
        "text": "Return early to your hotel",
        "effects": {
          "stress": -5,
          "happiness": 2
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "A storm changes the itinerary",
    "min": 18,
    "max": 100,
    "prompt": "Severe weather disrupts local transport. Your host recommends avoiding unnecessary journeys.",
    "choices": [
      {
        "text": "Follow local safety guidance",
        "effects": {
          "health": 6,
          "knowledge": 4
        }
      },
      {
        "text": "Rearrange the itinerary",
        "effects": {
          "culture": 4,
          "stress": -2
        }
      },
      {
        "text": "Ignore the disruption",
        "effects": {
          "health": -8,
          "stress": 8
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "A childhood recipe abroad",
    "min": 18,
    "max": 100,
    "prompt": "An elderly cook demonstrates a dish that reminds you of home. They explain the ingredients have different names here.",
    "choices": [
      {
        "text": "Learn the family recipe",
        "effects": {
          "culture": 8,
          "kindness": 5
        }
      },
      {
        "text": "Record the story with permission",
        "effects": {
          "culture": 6,
          "creativity": 5
        }
      },
      {
        "text": "Enjoy the meal and thank them",
        "effects": {
          "happiness": 5,
          "social": 4
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "The crowded festival",
    "min": 18,
    "max": 100,
    "prompt": "A neighborhood festival welcomes visitors but asks them to respect community areas reserved for residents.",
    "choices": [
      {
        "text": "Follow the request",
        "effects": {
          "culture": 8,
          "kindness": 6
        }
      },
      {
        "text": "Ask about the event's history",
        "effects": {
          "knowledge": 5,
          "culture": 7
        }
      },
      {
        "text": "Ignore the signs",
        "effects": {
          "reputation": -7,
          "culture": -3
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "An unexpected professional contact",
    "min": 18,
    "max": 90,
    "prompt": "A fellow traveler works in an industry you have long admired and offers to explain their career path.",
    "choices": [
      {
        "text": "Arrange an informational conversation",
        "effects": {
          "knowledge": 6,
          "culture": 3
        }
      },
      {
        "text": "Exchange contacts without commitments",
        "effects": {
          "social": 5,
          "confidence": 3
        }
      },
      {
        "text": "Keep your trip entirely recreational",
        "effects": {
          "happiness": 5,
          "stress": -3
        }
      }
    ]
  },
  {
    "domain": "travel",
    "title": "The journey home",
    "min": 18,
    "max": 110,
    "prompt": "Back home, someone asks whether your latest journey changed your view of the world.",
    "choices": [
      {
        "text": "Share a nuanced story",
        "effects": {
          "culture": 6,
          "social": 5
        }
      },
      {
        "text": "Organize your photos and notes",
        "effects": {
          "creativity": 5,
          "knowledge": 4
        }
      },
      {
        "text": "Keep the memories private",
        "effects": {
          "happiness": 4,
          "stress": -2
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "The heir's independent dream",
    "min": 24,
    "max": 100,
    "prompt": "Your chosen heir says they would prefer a different profession from the family tradition.",
    "choices": [
      {
        "text": "Help them explore the new field",
        "effects": {
          "familyStanding": 8,
          "bond": 8
        }
      },
      {
        "text": "Discuss a compromise",
        "effects": {
          "bond": 5,
          "kindness": 4
        }
      },
      {
        "text": "Threaten to remove family support",
        "effects": {
          "familyStanding": -7,
          "bond": -12
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "An old family dispute resurfaces",
    "min": 25,
    "max": 105,
    "prompt": "Two relatives ask you to take sides in a quarrel over an event that happened decades ago.",
    "choices": [
      {
        "text": "Arrange a calm family meeting",
        "effects": {
          "familyStanding": 8,
          "kindness": 7
        }
      },
      {
        "text": "Record both perspectives fairly",
        "effects": {
          "familyStanding": 6,
          "knowledge": 5
        }
      },
      {
        "text": "Choose a side immediately",
        "effects": {
          "bond": -7,
          "stress": 6
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "The first family scholarship",
    "min": 28,
    "max": 100,
    "prompt": "A young relative wants to study a subject the family has never worked in. Your household has saved a small education fund.",
    "choices": [
      {
        "text": "Offer financial help without conditions",
        "effects": {
          "cash": -500,
          "familyStanding": 8,
          "kindness": 5
        }
      },
      {
        "text": "Help them find independent funding",
        "effects": {
          "knowledge": 5,
          "familyStanding": 5
        }
      },
      {
        "text": "Insist they choose a family profession",
        "effects": {
          "familyStanding": -5,
          "bond": -7
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "The hidden box of letters",
    "min": 30,
    "max": 105,
    "prompt": "A forgotten box contains letters from relatives who immigrated before you were born.",
    "choices": [
      {
        "text": "Preserve and catalog them",
        "effects": {
          "familyStanding": 8,
          "knowledge": 6
        }
      },
      {
        "text": "Share selected stories with children",
        "effects": {
          "familyStanding": 7,
          "bond": 5
        }
      },
      {
        "text": "Leave them unopened for now",
        "effects": {
          "stress": -3,
          "knowledge": -2
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "A grandchild's question",
    "min": 45,
    "max": 109,
    "prompt": "A younger relative asks why the family speaks proudly about one ancestor but never mentions another.",
    "choices": [
      {
        "text": "Offer a balanced account",
        "effects": {
          "familyStanding": 9,
          "kindness": 7
        }
      },
      {
        "text": "Look for reliable records together",
        "effects": {
          "knowledge": 6,
          "familyStanding": 5
        }
      },
      {
        "text": "Avoid the difficult subject",
        "effects": {
          "familyStanding": -6,
          "stress": 4
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "The generous but risky inheritance",
    "min": 35,
    "max": 105,
    "prompt": "A relative proposes investing the entire family trust in one unfamiliar venture.",
    "choices": [
      {
        "text": "Diversify and protect the trust",
        "effects": {
          "financialSkill": 7,
          "familyStanding": 6
        }
      },
      {
        "text": "Seek an independent evaluation",
        "effects": {
          "knowledge": 7,
          "stress": 2
        }
      },
      {
        "text": "Agree immediately",
        "effects": {
          "familyStanding": -9,
          "stress": 7
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "The family reunion disagreement",
    "min": 30,
    "max": 109,
    "prompt": "At a reunion, younger family members ask to change a tradition that older relatives cherish.",
    "choices": [
      {
        "text": "Invite everyone to shape a new tradition",
        "effects": {
          "familyStanding": 8,
          "social": 6
        }
      },
      {
        "text": "Preserve old and new celebrations",
        "effects": {
          "familyStanding": 7,
          "kindness": 5
        }
      },
      {
        "text": "Insist nothing may change",
        "effects": {
          "familyStanding": -8,
          "bond": -6
        }
      }
    ]
  },
  {
    "domain": "dynasty",
    "title": "The final family promise",
    "min": 45,
    "max": 109,
    "prompt": "You find an old promise to support relatives during difficult times and wonder what legacy you want to leave.",
    "choices": [
      {
        "text": "Create a clear support plan",
        "effects": {
          "familyStanding": 9,
          "knowledge": 4
        }
      },
      {
        "text": "Discuss your values openly",
        "effects": {
          "familyStanding": 6,
          "bond": 6
        }
      },
      {
        "text": "Keep your plans private",
        "effects": {
          "confidence": 3,
          "stress": -2
        }
      }
    ]
  }
];
export const worldEventCards = (startId)=>worldScenes.map((scene,i)=>({...scene,id:startId+i,origin:'world-drama',category:scene.domain}));
