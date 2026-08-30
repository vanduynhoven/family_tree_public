// ═══════════════════════════════════════════════════════════
//  NpcData — dialog lines keyed by GEDCOM ID, screen assignments
//  Dutch phrases format: { dutch: '...', en: '...' }
//  All NPC dialog falls back to generic auto-generated lines
//  if no entry here (see Game.js enrichFromGEDCOM)
// ═══════════════════════════════════════════════════════════

// screen key format: `${eraId}_${screenRow}_${screenCol}`
// spawnR/spawnC: tile coordinates within the screen

export const NPC_DATA = {

  // ── Era 0 · 1539 · Aarle-Rixtel ──────────────────────

  // KEY ANCESTOR: Dirck van Duinhoven — moves through the world on a daily schedule
  // Morning (0.0-0.3): praying at church area → screen [0,0] or [1,0]
  // Midday (0.3-0.6): working east field → screen [2,2]
  // Afternoon (0.6-0.8): returning home → screen [1,1]
  // Evening (0.8-1.0): tavern/well area → screen [1,1] south side

  '0_2_2': [  // East farms — where Dirck spends the morning tending fields
    {
      gedcomId: '@I001@',
      name: 'Dirck van Duinhoven',
      given: 'Dirck',
      era: 0, spawnR: 7, spawnC: 9,
      bodyColor: '#5a4020', hairColor: '#2a1a08', skinColor: '#d0a060',
      item: { id:'family_seal', label:'Family Seal', emoji:'🔏' },
      // Schedule: morning in the field, midday rest, afternoon walk home
      schedule: [
        { time: 0.0, r: 5, c: 8 },   // early morning: east field corner
        { time: 0.25, r: 8, c: 12 }, // late morning: further in the field
        { time: 0.55, r: 6, c: 9 },  // midday: resting near path
        { time: 0.75, r: 11, c: 7 }, // afternoon: heading home
        { time: 0.9,  r: 7, c: 9 },  // evening: waiting for vespers
      ],
      lines: {
        generic: [
          { dutch:'Goede dag, vreemdeling! [Good day, stranger!]', en:'You found me at last. I wondered who was asking after me in the village.' },
          'My name is Dirck van Duinhoven. Our family has farmed this heathland for generations.',
          { dutch:'"Duinhoven" betekent "duintuin". [Duinhoven means dune garden.]', en:'Our name speaks of this land.' },
          'I give you the Family Seal. Carry it always — it is the mark of our line.',
        ],
        repeat1: [
          { dutch:'Ah, je bent terug! [Ah, you are back!]', en:'The heather blooms late this year. A hard winter is coming.' },
          'My son helps me in the east field now. He learns slowly, but he learns.',
          { dutch:'Wij horen bij dit land. [We belong to this land.]', en:'The dunes, the heath, the church bells.' },
        ],
        repeat2: [
          'The tax collector came through again. God give us patience.',
          'I am here most mornings. By midday I take my rest. Evenings — at the church.',
          { dutch:'Een eerlijk man werkt van zonsopgang tot zonsondergang. [An honest man works from sunrise to sunset.]', en:'' },
        ],
        heart2: [
          'You have come back many times. You are becoming a friend of the family.',
          'Let me tell you something I do not share easily — my grandfather\'s name was Dirck too.',
          'Three generations of Dircks on this farm. Perhaps four one day.',
        ],
        heart3: [
          { dutch:'Ik vertrouw je. [I trust you.]', en:'So I will tell you something.' },
          'There is a stone in the south field. Very old. My grandfather said it marks where the first Duinhoven built his house.',
          'Go find it if you wish. It is near the ancient shrine.',
        ],
        raven: [
          { dutch:'Raven! Weet jij wat "duinhoven" betekent? [Raven! Do you know what "duinhoven" means?]', en:'' },
          '"Dune garden." That is your family name. Say it — it is beautiful.',
          'Your line runs from this very field. Take the Seal and go learn our story.',
        ],
        starling: [
          { dutch:'Kleine vogel! [Little bird!]', en:'You are so young to travel so far.' },
          'Here — a smooth pebble from the river bank. Keep it safe on your journey.',
          'Take the Family Seal too. You will know what to do with it.',
        ],
      },
    },
  ],

  // Clue NPC at the starting screen — points the player toward Dirck
  '0_1_1': [
    {
      gedcomId: '@I002@',
      name: 'Aelken van Duinhoven',
      given: 'Aelken',
      era: 0, spawnR: 7, spawnC: 5,
      bodyColor: '#6a4a20', hairColor: '#3a2010', skinColor: '#d0a060',
      lines: {
        generic: [
          { dutch:'Het graan groeit goed dit jaar. [The grain grows well this year.]', en:'God is merciful.' },
          'Dirck is my kin. We share these fields and share the name.',
          'Looking for him? He tends the east fields every morning until midday.',
          { dutch:'Ga naar de oostelijke akkers. [Go to the eastern fields.]', en:'That is where you\'ll find Dirck.' },
        ],
        repeat1: [
          'I was up before dawn again.',
          { dutch:'Hard werken is goed voor de ziel. [Hard work is good for the soul.]', en:'My mother always said that.' },
          'Have you spoken with Dirck yet? He\'ll be in the east field until the church bell at noon.',
        ],
        heart2: [
          'You keep coming back. That means something around here.',
          'My grandmother was a Verwegen before she married. Two families, one village, for generations.',
          'Sometimes I think the fields know us. They grow better when the same hands tend them.',
        ],
      },
    },
  ],

  // ── Era 1 · 1660 · Dutch Golden Age ──────────────────

  '1_1_1': [
    {
      gedcomId: '@I010@',
      name: 'Johannes van Duynhoven',
      given: 'Johannes',
      era: 1, spawnR: 7, spawnC: 9,
      bodyColor: '#2a3a6a', hairColor: '#1a1a1a', skinColor: '#d8a870',
      item: { id:'prayer_book', label:'Prayer Book', emoji:'📖' },
      lines: {
        generic: [
          { dutch:'Welkom in de Gouden Eeuw. [Welcome to the Golden Age.]', en:'Amsterdam grows rich — but we in the south remain Catholic and careful.' },
          'The Spaniards have gone, but their taxes have not. I keep this Prayer Book close.',
          { dutch:'Wij zijn Nederlanders, maar anders. [We are Dutch, but different.]', en:'The north prospers; we endure.' },
          'Take the Prayer Book. It has kept our faith through harder times than these.',
        ],
        charlotte: [
          'Charlotte — you carry the same name, different spelling. Do you see it?',
          '"Van Duijnhoven" they write here. By your time it will change again.',
          'Names change as people move. The family stays the same underneath.',
        ],
      },
    },
  ],

  // ── Era 2 · 1799 · Napoleonic Uden ──────────────────

  '2_1_1': [
    {
      gedcomId: '@I020@',
      name: 'Petrus Joannis van Duijnhoven',
      given: 'Petrus',
      era: 2, spawnR: 7, spawnC: 9,
      bodyColor: '#3a4a3a', hairColor: '#2a2a1a', skinColor: '#d8a870',
      item: { id:'birth_record', label:'Birth Record 1799', emoji:'📜' },
      lines: {
        generic: [
          { dutch:'Pas op — de Fransen zijn overal. [Careful — the French are everywhere.]', en:'Conscription notices on every wall.' },
          'I was born right here, in this village, in the year the revolution changed everything.',
          'My father told me: keep your head down and your family close. Good advice.',
          'Here — take my birth record. The priest kept a copy in Latin. Guard it well.',
        ],
        knoxley: [
          { dutch:'Je wilt weten hoe ver terug de lijn gaat? [You want to know how far back the line goes?]', en:'Further than I can say.' },
          'My grandfather\'s grandfather farmed here too. The records go back to 1539 at least.',
          'Look in the ancient church archives. That is where the deepest roots are kept.',
        ],
      },
    },
  ],

  // ── Era 3 · 1872 · Industrial Noord-Brabant ─────────

  '3_2_1': [  // South fields — Marianus works here mornings
    {
      gedcomId: '@I042@',
      name: 'Marianus van Duijnhoven',
      given: 'Marianus',
      era: 3, spawnR: 5, spawnC: 7,
      schedule: [
        { time:0.0,  r:11, c:5 },
        { time:0.2,  r:5,  c:7 },
        { time:0.4,  r:8,  c:12 },
        { time:0.55, r:6,  c:9 },
        { time:0.7,  r:9,  c:7 },
        { time:0.85, r:12, c:5 },
        { time:0.95, r:7,  c:9 },
      ],
      bodyColor: '#3a2a18', hairColor: '#2a1808', skinColor: '#c89050',
      item: { id:'train_ticket', label:'Train Ticket', emoji:'🎟️' },
      lines: {
        generic: [
          { dutch:'Goedemorgen! Ik ben Marianus. [Good morning! I am Marianus.]', en:'You found me in the fields! Born right here in Boekel, 24 April 1872.' },
          'The railway reached Veghel last year. Everything is changing so fast.',
          { dutch:'Mijn vrouw heet Anna. [My wife is named Anna.]', en:'Anna Maria van den Elzen — we marry in 1906.' },
          'We will have twelve children. God willing, they will all survive.',
          'Take this train ticket. One day, one of my sons will use a ticket like this — to America.',
        ],
        repeat1: [
          'You are back! Anna made fresh bread this morning — the smell carries all the way to the road.',
          'The factory in Veghel is hiring again. Long hours, poor pay. But it is work.',
          { dutch:'Het leven is zwaar, maar goed. [Life is hard, but good.]', en:'We have the land, the faith, the family.' },
        ],
        repeat2: [
          'My father Martinus always said: keep your family together no matter what.',
          'I worry about the young ones who go to the cities. They lose themselves there.',
          { dutch:'Hier in Boekel kennen wij elkaar. [Here in Boekel we know each other.]', en:'The city is cold and strange.' },
        ],
        heart2: [
          'I do not often talk about this — I am afraid for my son Johan.',
          'He speaks of leaving. America, he says. There is nothing for him here, he says.',
          'Perhaps he is right. But it breaks something in me to think of it.',
        ],
        heart3: [
          { dutch:'Je bent een goede vriend geworden. [You have become a good friend.]', en:'' },
          'Let me tell you about my father Martinus. He married a Verwegen girl in 1858.',
          'Two Van Duijnhoven brothers married two Verwegen sisters — same year! Same church!',
          'That is how small this village is. Everyone is connected to everyone.',
        ],
        raven: [
          { dutch:'Raven! Weet je het woord voor trein? [Raven! Do you know the word for train?]', en:'"Trein." T-R-E-I-N.' },
          'The railway brought the modern world to our village. One day it will carry my family far away.',
        ],
        isabella: [
          'You are here about my son Johan, I think.',
          'Johan will leave for America in 1950. He was thirty-five years old. He never came back to Boekel.',
          { dutch:'Dat deed pijn. [That hurt.]', en:'But he had to go. There was no work here.' },
          'Take the train ticket — it is the first step of a long journey.',
        ],
        tenley: [
          'You ask about Anna? She is from Boekel, same as me.',
          { dutch:'Ze is een goede vrouw. [She is a good woman.]', en:'Twelve children and never a complaint.' },
          'She will outlive me by three years. She dies in Uden, December 1952.',
          'Remember her name: Anna Maria van den Elzen. She deserves to be remembered.',
        ],
      },
    },
  ],

  // ── Era 4 · 1950 · Atlantic Ocean ──────────────────

  '4_1_1': [
    {
      gedcomId: '@I060@',
      name: 'Johan van Duijnhoven',
      given: 'Johan',
      era: 4, spawnR: 7, spawnC: 9,
      bodyColor: '#2a3a5a', hairColor: '#2a2010', skinColor: '#c89050',
      item: { id:'immigration_papers', label:'Immigration Papers', emoji:'📋' },
      lines: {
        generic: [
          'Ten days at sea. My wife Anna, our children, and four suitcases. Everything we own.',
          { dutch:'We verlaten Nederland voor altijd. [We leave the Netherlands forever.]', en:'Boekel is behind us now.' },
          'America. We say it like a prayer. Moorhead, Minnesota. A Dutch Catholic community there.',
          'My father Marianus never left Brabant. I wonder sometimes if he knew what it would cost.',
          'Take these papers — immigration papers. Without them, you cannot cross the border.',
        ],
        repeat1: [
          'The sea is rough again tonight. Anna does not complain, but I can see it in her face.',
          { dutch:'Tien dagen op zee. [Ten days at sea.]', en:'Each one feels like a week.' },
          'I keep thinking about the farm. Who is living there now? Who is tending the fields?',
        ],
        repeat2: [
          'My brother Martinus stayed behind. I said goodbye knowing I might never see him again.',
          'That is the hardest part no one tells you about emigrating.',
          { dutch:'Afscheid nemen is sterven een beetje. [To say goodbye is to die a little.]', en:'A Dutch saying.' },
        ],
        heart2: [
          'I kept a small jar of Brabant soil in my coat pocket for the crossing.',
          'I thought — if something happens, at least a piece of home comes with me.',
          'When we landed in New York I left the jar on the dock. America had to be enough.',
        ],
        heart3: [
          { dutch:'Ik mis het zo erg. [I miss it so much.]', en:'But this is the right thing for the children.' },
          'Gerardus, Hubertus, little Francine — they will grow up American. They will not know what they left.',
          'And that is both the blessing and the grief of it.',
        ],
        isabella: [
          'Isabella. You came all this way to find us on the ship.',
          'The crossing takes ten days. Some are rough. Some are beautiful.',
          'I will tell you everything — but you must talk to every one of us. Anna, the children, all of them.',
          { dutch:'Wij zijn samen sterk. [Together we are strong.]', en:'That is what matters.' },
        ],
        raven: [
          { dutch:'Raven! Weet je het woord voor "schip"? [Raven! Do you know the word for "ship"?]', en:'"Schip." That is what brought your family to America.' },
          'Without this ship, there is no you.',
        ],
      },
    },
    {
      gedcomId: '@I061@',
      name: 'Anna Maria Cornelissen',
      given: 'Anna',
      era: 4, spawnR: 8, spawnC: 11,
      bodyColor: '#704020', hairColor: '#2a1808', skinColor: '#d0a060',
      lines: {
        generic: [
          { dutch:'Ik mis Boekel al. [I already miss Boekel.]', en:'But we had to go. There was no future there for the children.' },
          'I packed the boterkoek recipe in my luggage. Some things you carry no matter what.',
          'The sea is bigger than I imagined. The horizon goes on forever.',
          'I will die in Minnesota in 1987. But today — today we are just beginning.',
        ],
        repeat1: [
          'The children are seasick. I have been up since three this morning.',
          { dutch:'Maar ik klaag niet. [But I do not complain.]', en:'This is what we chose.' },
          'The cook gave me ginger for the little ones. That helped.',
        ],
        repeat2: [
          'Last night I dreamed of my mother\'s kitchen in Boekel. The smell of bread.',
          'She gave me her recipe book when we left. I have it at the bottom of the big suitcase.',
          'I told her: I will make boterkoek in America every Christmas. And I kept that promise.',
        ],
        heart2: [
          'You keep visiting. That reminds me of my sister — she always came back too.',
          'I left four sisters in Boekel. We wrote letters for twenty years.',
          { dutch:'Brieven zijn niet genoeg. [Letters are not enough.]', en:'But they are what you have.' },
        ],
        tenley: [
          'You are looking for the women of this family.',
          'We do not appear in many records. But we carried this family on our backs across an ocean.',
          { dutch:'Vrouwen maken de wereld. [Women make the world.]', en:'The men get the names. We do the work.' },
        ],
      },
    },
  ],

  // ── Era 5 · 1955 · Minnesota ─────────────────────────

  '5_1_1': [
    {
      gedcomId: '@I070@',
      name: 'Gerardus van Duijnhoven',
      given: 'Gerardus',
      era: 5, spawnR: 7, spawnC: 9,
      bodyColor: '#3a4020', hairColor: '#2a2010', skinColor: '#c89050',
      item: { id:'boterkoek', label:'Boterkoek Recipe', emoji:'🍪' },
      lines: {
        generic: [
          'Moorhead, Minnesota. We came here from Boekel in 1950 — and this is home now.',
          'The Dutch community here is strong. We pray together, farm together.',
          { dutch:'Amerika is anders, maar goed. [America is different, but good.]', en:'The children are learning English.' },
          'Mother\'s boterkoek recipe — she made me memorize it. Take it, keep it going.',
        ],
        maxwell: [
          'You want to know what daily life is really like? Come — I will show you.',
          'Morning: milk the cows. Afternoon: the fields. Evening: church, supper, family.',
          { dutch:'Elke dag hetzelfde, maar nooit saai. [Every day the same, but never boring.]', en:'That is farming.' },
        ],
      },
    },
  ],

  '5_2_3': [  // Lake — fishing
    {
      gedcomId: '@I060@',
      name: 'Johan van Duijnhoven',
      given: 'Johan',
      era: 5, spawnR: 9, spawnC: 8,
      bodyColor: '#2a3a5a', hairColor: '#3a3020', skinColor: '#c89050',
      lines: {
        generic: [
          'On Sunday afternoons, we come to the lake. It reminds me of the rivers back in Brabant.',
          { dutch:'Vissen is goed voor de ziel. [Fishing is good for the soul.]', en:'And the walleye are excellent here.' },
          'My son caught his first fish right over there. Held it up so proud.',
          'Sit with me a while. Bring a walleye and I will tell you about the crossing.',
        ],
        isabella: [
          'You have been following our family story.',
          'This lake — this is where I finally felt at home in America. The water.',
          'I left the Maas river behind in Brabant. I found this lake in Minnesota. Different water, same peace.',
          { dutch:'Thuis is waar het water rustig is. [Home is where the water is calm.]', en:'I believe that.' },
        ],
      },
    },
  ],

  // ── Era 6 · 1984 ─────────────────────────────────────

  '6_1_1': [
    {
      gedcomId: '@I080@',
      name: 'Chuck Van Duynhoven Sr.',
      given: 'Chuck Sr.',
      era: 6, spawnR: 7, spawnC: 9,
      bodyColor: '#3040a0', hairColor: '#2a2010', skinColor: '#c89050',
      lines: {
        generic: [
          'Wisconsin now. Different from Minnesota — more German neighbours, fewer Dutch.',
          'When Dad filled out the forms here, they wrote "Van Dyn Hoven." Close enough, he said.',
          'Now we spell it three different ways across the family. Does it matter? We know who we are.',
          { dutch:'Een naam is maar een naam. [A name is just a name.]', en:'The family is what counts.' },
        ],
        charlotte: [
          'Charlotte — you are asking about the name, I can tell.',
          'I have a copy of the courthouse record somewhere. The clerk simplified it. It just happened.',
          'Here — I will give you that record. Take it back to your branch of the family.',
        ],
      },
      item: { id:'courthouse_record', label:'Courthouse Record', emoji:'🗂️' },
    },
  ],

  // ── Era 7 · 2020 ──────────────────────────────────────

  '7_1_1': [
    {
      gedcomId: '@I090@',
      name: 'Arthur Van Duynhoven',
      given: 'Arthur',
      era: 7, spawnR: 7, spawnC: 9,
      bodyColor: '#2050a0', hairColor: '#1a1a2a', skinColor: '#c89050',
      lines: {
        generic: [
          'From Boekel to Haarlem — almost a full circle. The family went to America and I came back to the Netherlands.',
          'Raven and Starling are growing up Dutch-American. They speak both languages. Van Duinhoven himself would be amazed.',
          'I built the family tree website trying to hold all these threads together.',
          'Five hundred years of this family, and here we are. Still going.',
        ],
        repeat1: [
          'You know what surprised me when I moved to Haarlem? How normal it felt.',
          'Like something in my DNA already knew this place, even though I had never been here.',
          { dutch:'Thuiskomen zonder het ooit te hebben verlaten. [Coming home without ever having left.]', en:'Strange feeling.' },
        ],
        repeat2: [
          'The girls are doing well. Raven is learning Dutch faster than I did.',
          'Starling keeps asking me about every single ancestor on the family tree.',
          'She is four years old and already more curious about history than most adults I know.',
        ],
        heart2: [
          'Can I tell you something? Building that family tree changed me.',
          'When you see all those names going back to 1450 — Dirck, Johannes, Petrus, Martinus, Marianus, Johan, me — you feel very small.',
          'But also very connected. It is hard to explain.',
        ],
        henry: [
          'Henry — you\'ve been talking to all of them, haven\'t you.',
          'You\'ve met Dirck in 1539 and you\'re here now in 2020. How does it feel?',
          'This is what I was trying to do with the website. Make all of them real.',
          { dutch:'De familie is nooit echt weg. [The family is never really gone.]', en:'' },
        ],
      },
    },
    {
      gedcomId: '@I091@',
      name: 'Raven Van Duynhoven',
      given: 'Raven',
      era: 7, spawnR: 8, spawnC: 12,
      bodyColor: '#408060', hairColor: '#c03020', skinColor: '#d0b080',
      lines: {
        generic: [
          { dutch:'Hallo! Ik spreek een beetje Nederlands. [Hello! I speak a little Dutch.]', en:'Just a little. I am still learning.' },
          'Dad says we have family going back to 1539. I can\'t even imagine that.',
          'I want to go see the Netherlands someday. The real Netherlands, not just Haarlem.',
        ],
        repeat1: [
          'My Dutch teacher gave us a list of words today. I already knew three of them!',
          { dutch:'"Familie", "huis", "water". [Family, house, water.]', en:'The easy ones first.' },
          'But I want to learn the old words too. The ones from the village.',
        ],
        repeat2: [
          'I found an old photo of Boekel online. It looks exactly like I imagined it.',
          'Little cobblestone streets, a church, flat fields all around.',
          'Dad says that is where Dirck lived in 1539. The same village!',
        ],
        heart2: [
          'You know what I love about speaking Dutch? People here look surprised.',
          { dutch:'Ze verwachtten het niet van mij. [They did not expect it from me.]', en:'But I am Dutch, just… different Dutch.' },
          'American Dutch, Dad calls it. I think that is a real thing.',
        ],
        raven: [
          'Oh! It\'s me — I mean, it\'s you — I mean…',
          'This is very strange. But also kind of wonderful.',
          { dutch:'Familie is altijd met je. [Family is always with you.]', en:'I think that\'s what this is all about.' },
        ],
      },
    },
  ],

  // ── Era 8 · 2026 · Haarlem — Grote Markt & Tierney's ─

  // ── Era 8 · 2026 · Haarlem — Raven's best friend Romijn ──
  '8_0_1': [
    {
      gedcomId: null,
      name: 'Romijn',
      given: 'Romijn',
      era: 8, spawnR: 7, spawnC: 12,
      bodyColor: '#c06040', hairColor: '#d4a020', skinColor: '#d8b890',
      schedule: [
        { time: 0.1,  r: 5,  c: 10 },
        { time: 0.35, r: 7,  c: 14 },
        { time: 0.55, r: 9,  c: 11 },
        { time: 0.75, r: 6,  c: 12 },
        { time: 0.9,  r: 5,  c: 10 },
      ],
      lines: {
        generic: [
          { dutch:'Hoi! Ben jij een vriend van Raven? [Hi! Are you a friend of Raven\'s?]', en:'' },
          'We cycle to school together every morning. She\'s always at the bike shed when I arrive.',
          { dutch:'Raven is mijn beste vriendin. [Raven is my best friend.]', en:'We\'ve been friends since we were four.' },
          'She always picks the purple tulips at the Saturday market. I go for yellow.',
        ],
        repeat1: [
          { dutch:'Jij weer! [You again!]', en:'How is the journey going?' },
          'Raven told me about the old journal she found. She showed me some of the photos.',
          { dutch:'Heel bijzonder, die familie. [Very special, that family.]', en:'Going all the way back to 1539.' },
        ],
        repeat2: [
          'We\'re doing a school project together about Dutch-American history. Raven is obsessed.',
          { dutch:'Ze wil alles weten. [She wants to know everything.]', en:'I can\'t keep up.' },
          'But honestly? I learn so much just being her friend.',
        ],
        heart2: [
          'Can I tell you a secret?',
          'When Raven first got here from America she didn\'t speak any Dutch at all.',
          { dutch:'Nu spreekt ze beter dan ik! [Now she speaks better than me!]', en:'I\'m a bit jealous.' },
        ],
        raven: [
          { dutch:'RAVEN! Eindelijk! [RAVEN! Finally!]', en:'I\'ve been waiting at the canal for twenty minutes!' },
          'The tulips are in at the flower stall. She saved the purple ones for you.',
          { dutch:'We gaan toch naar Tierney\'s na de markt? [We\'re still going to Tierney\'s after the market?]', en:'' },
        ],
      },
    },
  ],

  // ── Era 8 · 2026 · Haarlem — Starling's best friend Liv ──
  '8_1_1': [
    {
      gedcomId: null,
      name: 'Liv',
      given: 'Liv',
      era: 8, spawnR: 8, spawnC: 11,
      bodyColor: '#e06080', hairColor: '#c03040', skinColor: '#d8c0a0',
      schedule: [
        { time: 0.15, r: 6,  c: 12 },
        { time: 0.4,  r: 9,  c: 9  },
        { time: 0.6,  r: 7,  c: 11 },
        { time: 0.8,  r: 5,  c: 13 },
      ],
      lines: {
        generic: [
          { dutch:'Hallo! Ken jij Starling? [Hello! Do you know Starling?]', en:'She is my best friend.' },
          'We play in the courtyard behind her house almost every day.',
          'She always brings the best snacks. Her dad makes really good boterkoek.',
          { dutch:'Starling is grappig. [Starling is funny.]', en:'She makes up the best stories.' },
        ],
        repeat1: [
          { dutch:'Jij bent terug! [You\'re back!]', en:'' },
          'Starling and I found a really cool beetle in the garden yesterday. We let it go after one day.',
          { dutch:'Starling zei dat het haar "tijdreisboulevard" was. [Starling said it was her "time travel boulevard".]', en:'I don\'t know what that means but it sounded very important.' },
        ],
        repeat2: [
          'Do you know about the old family book? Starling showed me the pictures of the old ships.',
          { dutch:'Heel oud, die foto\'s. [Very old, those photos.]', en:'From before our grandparents were born.' },
          'Starling says her great-great-great-great-great-great grandfather lived in a place called Aarle-Rixtel.',
          { dutch:'Dat klinkt als een sprookje. [That sounds like a fairy tale.]', en:'But she says it\'s real!' },
        ],
        heart2: [
          'Starling told me she wants to go see where her family is from one day.',
          { dutch:'Ik ga mee! [I\'m coming too!]', en:'She said we can go together when we\'re bigger.' },
        ],
        starling: [
          { dutch:'STARLING! Daar ben je! [STARLING! There you are!]', en:'I\'ve been looking everywhere for you!' },
          'I found a really shiny stone by the canal. I kept it for you.',
          { dutch:'Wil je spelen? [Do you want to play?]', en:'We could go to the courtyard!' },
        ],
      },
    },
  ],

  // ── Era 8 · 2026 · Haarlem — Saturday market sausage & garlic vendor ──
  // Henk runs a stall on the Grote Markt every Saturday.
  // Sells dried sausages (worst, salami) and smoked garlic — Arthur is a regular.
  '8_2_3': [
    {
      gedcomId: null,
      name: 'Henk',
      given: 'Henk',
      era: 8, spawnR: 7, spawnC: 9,
      bodyColor: '#4a3820', hairColor: '#2a1808', skinColor: '#c8a060',
      lines: {
        generic: [
          { dutch:'Verse worst en gerookte knoflook! [Fresh sausage and smoked garlic!]', en:'Best on the whole market — ask anyone.' },
          'Arthur! Your usual? Two knots of garlic sausage and a head of smoked garlic?',
          { dutch:'De knoflook komt rechtstreeks van de boer. [The garlic comes straight from the farmer.]', en:'Smoked here in Haarlem, nowhere else.' },
          'The smoked garlic goes in everything. Once you start, you can\'t stop.',
        ],
        repeat1: [
          { dutch:'Jij weer! Goedemorgen! [You again! Good morning!]', en:'' },
          'The new batch of chorizo came in this week. Arthur already bought three.',
          { dutch:'Verse worst is kunst. [Fresh sausage is art.]', en:'That\'s what my grandfather always said.' },
        ],
        repeat2: [
          'I\'ve had this stall for eighteen years. Same spot, every Saturday.',
          { dutch:'De markt is mijn leven. [The market is my life.]', en:'' },
          'Arthur brings the girls sometimes. Starling always wants to smell the garlic. Raven pretends it\'s too strong.',
        ],
        heart2: [
          'I\'ll tell you a secret about the smoked garlic.',
          'We smoke it with applewood for six hours. That\'s the trick.',
          { dutch:'Vertel het aan niemand. [Don\'t tell anyone.]', en:'Trade secret.' },
        ],
        raven: [
          { dutch:'Raven! Jij vindt het altijd te sterk! [Raven! You always say it\'s too strong!]', en:'' },
          'Tell your dad the new Ardennes sausage is in. He\'ll want some.',
          { dutch:'En één gratis worst voor jou. [And one free sausage for you.]', en:'Don\'t tell the others.' },
        ],
      },
      item: { id: 'smoked_garlic', label: 'Smoked Garlic', emoji: '🧄' },
    },
  ],

  // Tierney's Irish Pub — Spekstraat 8, Haarlem (real pub, ~30m from Sint-Bavo)
  // Paul is the owner. Arthur, Raven and Starling go every Saturday after the flower market.
  '8_3_2': [
    {
      gedcomId: null,
      name: 'Paul — Tierney\'s',
      given: 'Paul',
      era: 8, spawnR: 11, spawnC: 4,
      bodyColor: '#2a6020', hairColor: '#d03010', skinColor: '#d4a880',
      isInnkeeper: true,
      lines: {
        generic: [
          'Welcome! I\'m Paul — I own this place. Tierney\'s Irish Pub, best spot in Haarlem.',
          'Arthur and the girls come in every Saturday after the flower market. Good family.',
          'Full Irish breakfast, Guinness on tap, and a warm fire in winter. What can I get you?',
          'Rest here a while — bring me a flower from the market and the lunch is on me.',
        ],
        repeat1: [
          'Back again! Pull up a chair. The stew is on.',
          'Raven was in earlier asking about the purple tulips. She headed to the market first.',
          { dutch:'Gezelligheid, dat is het! [Cosy company, that\'s it!]', en:'That\'s what a good pub is for.' },
        ],
        repeat2: [
          'You know, Haarlem reminds me of Galway in some ways. All that water.',
          'Arthur was in last weekend telling me about his family research.',
          'Five hundred years of Dutch ancestry. Remarkable man.',
        ],
        heart2: [
          'Let me tell you a secret — we do a special Dutch-Irish fusion menu on Sundays.',
          'Stamppot with a Guinness gravy. Sounds mad but it works.',
          { dutch:'Proost! [Cheers!]', en:'Sláinte!' },
        ],
        raven: [
          { dutch:'Raven! Jouw favoriete tafeltje is vrij! [Raven! Your favourite table is free!]', en:'' },
          'The usual? Chips and a lemonade? Your dad will be along.',
          'Lies from the flower stall saved you the purple tulips again.',
        ],
        starling: [
          'Starling! Look how much you\'ve grown.',
          'I\'ve got your favourite orange juice behind the bar.',
          'Come in, come in — your dad\'s already at the corner table.',
        ],
      },
    },
  ],

  '8_1_0': [  // The family home screen
    {
      gedcomId: '@I090@',
      name: 'Arthur Van Duynhoven',
      given: 'Arthur',
      era: 8, spawnR: 9, spawnC: 9,
      bodyColor: '#2050a0', hairColor: '#1a1a2a', skinColor: '#c89050',
      lines: {
        generic: [
          'Leidsevaart 276. We\'ve lived here three years now. It still feels like a dream.',
          'On Saturdays we walk to the Grote Markt — flowers from Lies, then Tierney\'s for lunch.',
          'The girls are growing up Dutch-American. Raven speaks better Dutch than me already.',
          'If you find the old journal in the attic, come find me. There\'s a story there worth knowing.',
        ],
        repeat1: [
          'The canal outside is still this morning. Perfect weather for a bike ride.',
          { dutch:'Ik hou van Haarlem. [I love Haarlem.]', en:'It\'s the right place for us.' },
          'The family tree website keeps growing. 449 people now, going back to 1450.',
        ],
        heart2: [
          'I\'ll tell you something not many people know.',
          'Coming back to the Netherlands — I wasn\'t just following my heart. I was following the tree.',
          'Dirck van Duinhoven was from a village forty kilometres from here. I can feel it.',
        ],
      },
    },
  ],

  // ── Era 8 · 2026 · Haarlem — Raven's best friend Romijn ──
  // Romijn lives nearby on the Leidsevaart — same street, couple of doors down.
  // She and Raven go to the same school and always cycle to the Grote Markt together.

  // ── Era 8 · 2026 · Haarlem — Starling's best friend Liv ──
  // Liv is a bit younger than Starling but they are inseparable.
  // She lives two streets over and comes to play almost every day.

};

// Crop-patch side-quests: simple one-step harvest items per era
export const CROP_ITEMS = [
  { id:'wheat',   label:'Wheat',      emoji:'🌾', era:0 },
  { id:'tulip',   label:'Tulip',      emoji:'🌷', era:1 },
  { id:'rye',     label:'Rye',        emoji:'🌾', era:2 },
  { id:'potato',  label:'Potato',     emoji:'🥔', era:3 },
  // Era 4 is a ship — no crops
  { id:'corn',    label:'Corn',       emoji:'🌽', era:5 },
  { id:'tomato',  label:'Tomato',     emoji:'🍅', era:6 },
  { id:'coffee',  label:'Coffee Bean',emoji:'☕', era:7 },
];
