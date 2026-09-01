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
        charlotte: [
          'Charlotte — you came to ask about the name.',
          'Van Duinhoven. We have always spelled it this way. One day it will change — but the family stays the same.',
          'Here — take the Family Seal. It proves who you are, in any era.',
        ],
        tenley: [
          'You are looking for the women of this family?',
          'They are here. My wife, my daughters, my mother. They built this place as much as I did.',
          'The women of our name are strong. Go find them — take the Seal with you.',
        ],
        knoxley: [
          'The youngest one wants to know the oldest things! Come here.',
          'My father taught me the name. His father taught him. And so it goes, all the way back.',
          'Take the Seal, young one. And find the old stones — they know things I do not.',
        ],
        isabella: [
          'Isabella — you came to understand why we left?',
          'We did not leave. Our children left. Their children went even further.',
          'Take the Seal. One day, one of us will cross an ocean. That day has already come.',
        ],
        henry: [
          'You want to talk to all of us? Then start here — the beginning.',
          'My name is Dirck. I have farmed this land my whole life. That is my story.',
          'Take the Seal and keep going. There are many more waiting to meet you.',
        ],
        maxwell: [
          'You want to know what a day in my life looks like? Get up before sunrise.',
          'Tend the fields until noon. Eat bread and cheese under the oak. Work until dark.',
          'That is every day. A good life. Take the Family Seal — it will open doors ahead.',
        ],
        traveller: [
          'A traveller, are you? Welcome to Aarle-Rixtel.',
          'Not family, but curious about us? I respect that.',
          'Take the Family Seal — even a traveller can carry our story forward.',
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
        // ── Character-specific dialog ──
        // Aelken is Dirck's kinswoman — she greets Dutch-speaking players (Raven/Starling) more warmly
        raven: [
          { dutch:'Jij spreekt Nederlands? Wat een verrassing! [You speak Dutch? What a surprise!]', en:'' },
          { dutch:'Wij zijn familie, voel ik het. [We are family, I feel it.]', en:'Something in your face looks familiar.' },
          { dutch:'Ga naar de oostelijke akkers — Dirck wacht op jou. [Go to the east fields — Dirck is waiting for you.]', en:'' },
        ],
        starling: [
          { dutch:'Nederlands! En zo goed! [Dutch! And so well!]', en:'You speak our language — that is rare for a traveller.' },
          { dutch:'Jouw naam klinkt als een vogel. [Your name sounds like a bird.]', en:'We have them in the fields here — the starlings.' },
          { dutch:'Dirck is je voorouder. Ga hem zoeken. [Dirck is your ancestor. Go find him.]', en:'' },
        ],
        charlotte: [
          'Charlotte — a city name for a country girl! Where are you from?',
          'You are looking for Dirck, I can tell. He is in the eastern fields, working at sunrise.',
          'He will not talk to just anyone. But he knows family when he sees it.',
        ],
        tenley: [
          'A girl travelling alone — that is unusual here. You must have a reason.',
          'You are looking for the oldest ancestor you can find? That would be Dirck.',
          'East fields, just past the old oak. He is always there in the morning.',
        ],
        knoxley: [
          'You have that look — the one that means you are searching for something.',
          'If it is roots you want, Dirck van Duinhoven is who you need.',
          'Follow the furrows east. He will be there.',
        ],
        isabella: [
          'Isabella — that is a Spanish name. Strange thing to hear in Brabant.',
          'The world is bigger than this field, I know that much.',
          'If you are family, Dirck will know it. East fields. Go now, before midday.',
        ],
        henry: [
          'A lad with questions — I like that.',
          'Dirck keeps the oldest memories of this place. Find him.',
          'East of here, past the oak, at the edge of the field.',
        ],
        maxwell: [
          'You want to know how life works here? Get up before dawn and watch.',
          'Every hand has a job. The fields feed the family. The family keeps the fields.',
          'Find Dirck — he has been at this longer than anyone.',
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
        raven: [
          { dutch:'Jij spreekt Nederlands! Wij zijn verwanten, dat voel ik. [You speak Dutch! We are kin, I feel it.]', en:'' },
          { dutch:'"Van Duijnhoven" — zo schrijven we het hier. ["Van Duijnhoven" — that is how we write it here.]', en:'Your name will change spelling as the family moves.' },
          { dutch:'Neem het gebedenboek mee. Het heeft ons door de zwaarste tijden gedragen. [Take the prayer book. It has carried us through the hardest times.]', en:'' },
        ],
        starling: [
          { dutch:'Nederlands! Wat goed! Kom hier, kom hier. [Dutch! How good! Come here, come here.]', en:'' },
          { dutch:'Wij zijn dezelfde familie — ik zie het aan je ogen. [We are the same family — I can see it in your eyes.]', en:'' },
          { dutch:'Dit gebedenboek is voor jou. Bewaar het goed. [This prayer book is for you. Keep it safe.]', en:'' },
        ],
        tenley: [
          { dutch:'Welkom, vreemdeling. [Welcome, stranger.]', en:'What brings you to this church?' },
          'The name on these walls is Van Duijnhoven. Your name too, I suspect.',
          'Take the prayer book — it connects your family across the centuries.',
        ],
        knoxley: [
          { dutch:'De Gouden Eeuw — en kijk, het jongste kind is het meest nieuwsgierig! [The Golden Age — and look, the youngest child is the most curious!]', en:'' },
          'Most children your age want to play. You want to know who came before you.',
          'Your ancestors kept the faith here. That spirit clearly runs in the family.',
        ],
        isabella: [
          { dutch:'Welkom in de zeventiende eeuw. [Welcome to the seventeenth century.]', en:'' },
          'Amsterdam is rich, but we are something richer — we are old.',
          'This prayer book has the family names going back even further. Take it.',
        ],
        henry: [
          { dutch:'Welkom. [Welcome.]', en:'You look like you have been travelling a long time.' },
          'The family name goes back further than even I know.',
          'Start with the prayer book. The answers are in the margins.',
        ],
        maxwell: [
          { dutch:'Hoe gaat het? [How goes it?]', en:'You seem weary from the road.' },
          'Sit a moment. The church is quiet at this hour.',
          'Life here is simple — prayer, work, family. The same as your time, I imagine.',
        ],
      },
    },
  ],

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
        raven: [
          { dutch:'Je spreekt Nederlands! In deze tijd is dat niet zo gewoon. [You speak Dutch! In this era that is not so common for a traveller.]', en:'' },
          { dutch:'Dit geboorteregister is voor jou — bewijs dat wij hier al eeuwen leven. [This birth record is yours — proof we have lived here for centuries.]', en:'' },
          { dutch:'De Fransen proberen alles te veranderen, maar wij blijven wie we zijn. [The French try to change everything, but we remain who we are.]', en:'' },
        ],
        starling: [
          { dutch:'Nederlands! Goed zo! Hier in Napoleontische tijd is dat dapper. [Dutch! Well done! In Napoleonic times that is brave.]', en:'' },
          { dutch:'Wij van Duijnhoven — wij zijn hier al honderden jaren. [We van Duijnhoven — we have been here hundreds of years.]', en:'' },
          { dutch:'Neem het geboorteregister. Het is jouw bewijs van onze familie. [Take the birth record. It is your proof of our family.]', en:'' },
        ],
        charlotte: [
          'Charlotte — you want the record of our family name?',
          'I was born in 1799, the year Napoleon\'s armies marched through here.',
          'Here — take the birth record. One day it will matter more than you know.',
        ],
        tenley: [
          'You are curious about the women of the family? Good.',
          'My mother kept this family together when the French occupation made everything harder.',
          'Take the birth record. The women\'s names are in there too.',
        ],
        isabella: [
          'Isabella — looking for roots in Napoleonic times!',
          'This was a difficult era. But the family name survived everything.',
          'Take this record. It proves where you come from.',
        ],
        henry: [
          'A young man looking for history — I respect that.',
          'In 1799 the world was changing faster than anyone could understand.',
          'Your family kept their head down and survived. Take the record.',
        ],
        maxwell: [
          'You want to know what life was like under Napoleon\'s laws?',
          'Conscription, taxes, French everywhere. But the family kept going.',
          'Here — take the birth record. Proof we were here.',
        ],
      },
    },
  ],

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
          { dutch:'Raven! Je spreekt onze taal! Geweldig! [Raven! You speak our language! Wonderful!]', en:'' },
          { dutch:'Weet je het woord voor trein? "Trein." T-R-E-I-N. [Do you know the word for train? "Trein."]', en:'The railway brought the modern world to our village.' },
          { dutch:'Een dag zal de trein mijn familie ver weg brengen. [One day the train will carry my family far away.]', en:'But not yet. Not yet.' },
          { dutch:'Hier — dit treinkaartje is voor jou. [Here — this train ticket is for you.]', en:'' },
        ],
        starling: [
          { dutch:'Je spreekt Nederlands! Hier in 1872 is dat een verrassing. [You speak Dutch! Here in 1872 that is a surprise.]', en:'' },
          { dutch:'Mijn naam is Marianus. Ik ben jouw overgrootgrootvader. [My name is Marianus. I am your great-great-great-grandfather.]', en:'' },
          { dutch:'Het leven hier is eenvoudig maar zwaar. Maar de familie houdt alles samen. [Life here is simple but hard. But the family holds everything together.]', en:'' },
          { dutch:'Neem het treinkaartje mee. Het begint een lange reis. [Take the train ticket. It begins a long journey.]', en:'' },
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
        charlotte: [
          'Charlotte — the women in our family carried everything.',
          'My Anna had twelve children and kept this household running through hard years.',
          { dutch:'Sterke vrouwen maken sterke families. [Strong women make strong families.]', en:'Remember that.' },
          'Take the train ticket — it will make sense later.',
        ],
        knoxley: [
          'You want to go further back? Good — I like that spirit.',
          'My father is Martinus, born 1830. His father before him farmed here too.',
          { dutch:'Ga naar de kerk — de oude archieven gaan terug tot 1539. [Go to the church — the old archives go back to 1539.]', en:'' },
          'Dirck van Duinhoven. That is the name you want.',
        ],
        henry: [
          'Henry! A young man on a mission.',
          'Let me tell you what daily life was like here in 1872.',
          'We wake at dawn, work the fields, eat together as a family. Church on Sunday.',
          { dutch:'Simpel leven, goed leven. [Simple life, good life.]', en:'Do not let anyone tell you otherwise.' },
        ],
        maxwell: [
          'You want to know about daily life here?',
          'The factory in Veghel is new. Before that, only farming.',
          { dutch:'Wij werken van zonsopgang tot zonsondergang. [We work from sunrise to sunset.]', en:'Every day, every season.' },
          'But in the evening — family, food, and stories. That is what matters.',
        ],
        traveller: [
          'A traveller! Welcome to Boekel, 1872.',
          'You are not family, but you are curious about us. That is enough for me.',
          'Here — take the train ticket. One day someone will use it to cross an ocean.',
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
          { dutch:'Je spreekt Nederlands op een schip midden op de oceaan! [You speak Dutch on a ship in the middle of the ocean!]', en:'' },
          { dutch:'"Schip" — dat is het woord. Dit schip brengt jouw familie naar Amerika. ["Ship" — that is the word. This ship takes your family to America.]', en:'' },
          { dutch:'Zonder dit schip ben jij er niet. Begrijp je dat? [Without this ship, you would not exist. Do you understand that?]', en:'' },
          { dutch:'Hier zijn de immigratiepapieren — bewaar ze goed. [Here are the immigration papers — keep them safe.]', en:'' },
        ],
        starling: [
          { dutch:'Starling! Je spreekt Nederlands! Op de oceaan! [Starling! You speak Dutch! On the ocean!]', en:'' },
          { dutch:'Wij verlaten Nederland voor altijd. Dat doet pijn. [We leave the Netherlands forever. That hurts.]', en:'' },
          { dutch:'Maar jij bent geboren in Haarlem — de familie is teruggekomen! [But you were born in Haarlem — the family came back!]', en:'' },
          { dutch:'Dat maakt deze reis de moeite waard. [That makes this journey worth it.]', en:'' },
        ],
        charlotte: [
          'Charlotte — you found us in the middle of the Atlantic!',
          'Your grandfather Peter John is a child on this very ship.',
          { dutch:'Kijk — daar speelt hij. [Look — there he plays.]', en:'That small boy is the reason you exist.' },
          'Take the papers. They cross an ocean, just like you.',
        ],
        tenley: [
          'Tenley! Your grandmother Mary Campbell is waiting in Minnesota.',
          'Your grandfather Peter John will meet her there. The family grows from that meeting.',
          'Everything depends on this crossing.',
          { dutch:'Alles begint hier. [Everything begins here.]', en:'' },
        ],
        knoxley: [
          'Look at you — the youngest one, and already searching for the deepest roots.',
          'This is the moment everything changed. Before 1950 — Dutch. After 1950 — American.',
          { dutch:'Maar wij vergeten nooit waar we vandaan komen. [But we never forget where we come from.]', en:'' },
          'That is the promise of this whole journey.',
        ],
        henry: [
          'Henry! You want to know what this ship was really like.',
          'Three hundred people below deck. Forty days of storms.',
          { dutch:'Maar wij kwamen aan. Dat is het enige wat telt. [But we arrived. That is all that matters.]', en:'' },
        ],
        maxwell: [
          'Maxwell — you want the details of daily life on this ship.',
          'Boiled potatoes, salted fish, and sea water spray in your face every morning.',
          { dutch:'Tien dagen op zee. Elke dag een nieuw avontuur. [Ten days at sea. Every day a new adventure.]', en:'' },
          'But also sunsets over the ocean you would not believe.',
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
          'I\'m Anna Maria — Johan van Duijnhoven\'s wife. We are sailing to America together.',
          { dutch:'Ik mis Boekel al. [I already miss Boekel.]', en:'But we had to go. There was no future there for the children.' },
          'I packed the boterkoek recipe in my luggage. Some things you carry no matter what.',
          'The sea is bigger than I imagined. The horizon goes on forever.',
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
        isabella: [
          'Isabella — you came to find us on this ship.',
          'Ten days at sea. Johan worries. I pack the boterkoek recipe and keep everyone fed.',
          'That is how we cross an ocean. Together. With a recipe and a prayer.',
          'I am so glad you came to find us.',
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
          'Moorhead, Minnesota. My parents brought us here from Boekel in 1950 — and this is home now.',
          'I was a grown man when we crossed. But my children? Born right here in Minnesota. True Americans.',
          { dutch:'Wij zijn nu Amerikaans. [We are American now.]', en:'But we remember where we came from.' },
          'Mother\'s boterkoek recipe — she made me memorize it. Take it, keep it going.',
        ],
        maxwell: [
          'You want to know what daily life is really like? Come — I will show you.',
          'Morning: milk the cows. Afternoon: the fields. Evening: church, supper, family.',
          { dutch:'Elke dag hetzelfde, maar nooit saai. [Every day the same, but never boring.]', en:'That is farming.' },
        ],
        charlotte: [
          'Charlotte! Your father Chuck is my cousin — so we are family.',
          'Moorhead is a good Dutch community. Everyone knows everyone.',
          { dutch:'Wij helpen elkaar. [We help each other.]', en:'That is how it works here.' },
        ],
        tenley: [
          'Tenley! You are looking for Grandpa Peter John, I imagine.',
          'He lives just down the road. Find him — he has the whole family story.',
          { dutch:'Hij weet alles over ons. [He knows everything about us.]', en:'' },
        ],
        knoxley: [
          'Knoxley — you want to go deeper. I know that look.',
          'Peter John knows the story from the beginning — 1950, the ship, Boekel.',
          'Find him. He will tell you everything.',
        ],
        isabella: [
          'Isabella! Your grandfather Peter John is my brother.',
          'You have the same eyes as your grandmother Mary Campbell.',
          { dutch:'Welkom in Minnesota. [Welcome to Minnesota.]', en:'The Dutch community here is warm.' },
        ],
        henry: [
          'Henry — you want to know how a Dutch farm family became American.',
          'Slowly. One English word at a time. One Sunday church service at a time.',
          { dutch:'Nu zijn we Amerikaans, maar ons hart blijft Nederlands. [Now we are American, but our heart stays Dutch.]', en:'' },
        ],
        raven: [
          { dutch:'Raven! Je spreekt Nederlands! Hier in Minnesota! [Raven! You speak Dutch! Here in Minnesota!]', en:'' },
          { dutch:'Je opa Peter John zal zo blij zijn. [Your grandpa Peter John will be so happy.]', en:'Go find him — he is just down the road.' },
          { dutch:'De boterkoekjes zijn net klaar. Wil je er eentje? [The boterkoekjes are just done. Do you want one?]', en:'Dutch butter cake — your dad\'s favourite.' },
        ],
        starling: [
          { dutch:'Starling! Wat een mooie naam! En je spreekt Nederlands! [Starling! What a lovely name! And you speak Dutch!]', en:'' },
          { dutch:'Oma maakte dit recept elke zondag. Nu geef ik het aan jou. [Grandma made this recipe every Sunday. Now I give it to you.]', en:'' },
          { dutch:'Bewaar het goed — het is familie-erfgoed. [Keep it safe — it is family heritage.]', en:'' },
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
        raven: [
          { dutch:'Raven! Je spreekt onze taal — zelfs hier bij het meer! [Raven! You speak our language — even here at the lake!]', en:'' },
          { dutch:'Weet je het woord voor "meer"? [Do you know the word for "lake"?]', en:'"Meer." Here in Brabant we had rivers. Here in Minnesota — a meer. Different water, same peace.' },
          { dutch:'Jij bent de toekomst van onze familie. Vergeet ons niet. [You are the future of our family. Don\'t forget us.]', en:'' },
        ],
        starling: [
          { dutch:'Starling! Je bent zo ver gekomen om ons te vinden. [Starling! You came so far to find us.]', en:'' },
          { dutch:'Het meer hier — het doet me denken aan de rivieren thuis in Brabant. [This lake here — it reminds me of the rivers back home in Brabant.]', en:'' },
          { dutch:'Wij dachten dat we alles achterlieten. Maar jij bent teruggekomen. [We thought we left everything behind. But you came back.]', en:'' },
        ],
        charlotte: [
          'Charlotte — you found an old man fishing on a Sunday.',
          'This is my favourite place in all of Minnesota.',
          'Sit down. The fish are not going anywhere. Neither are the stories.',
        ],
        tenley: [
          'Tenley — you want to know the quieter side of immigrant life.',
          'It is right here. Sunday at the lake. Children running, fish jumping.',
          { dutch:'Zelfs in Amerika vinden we rust. [Even in America we find peace.]', en:'' },
        ],
        knoxley: [
          'Knoxley — good to see you. How far back have you gone?',
          'Every journey needs a quiet moment. Sit by the lake.',
          'The walleye is good this year. Almost as good as the carp back in Brabant.',
        ],
        henry: [
          'Henry! You found the Sunday fishing spot.',
          'This is where the family talks. Really talks.',
          { dutch:'Op zondag is er tijd voor verhalen. [On Sunday there is time for stories.]', en:'Ask me anything.' },
        ],
        maxwell: [
          'Maxwell — you want to know what the food and daily rhythm was really like.',
          'Sunday afternoon: fishing. Monday to Saturday: work. That was the life.',
          { dutch:'Simpel maar goed. [Simple but good.]', en:'The walleye was excellent.' },
        ],
      },
    },
  ],

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
          'Charlotte — my girl! You came all the way back to find me.',
          'I\'ve been thinking about the family name too. Let me tell you what really happened.',
          'The clerk simplified it when we moved to Wisconsin. Just like that — a piece of history changed.',
          'And look — I found your dad\'s old floppy disk with the first family tree database. Take it.',
        ],
        tenley: [
          'Tenley! You\'re asking about the women of the family, I can tell.',
          'Your grandmother Mary Campbell — she held this whole family together. Start with her.',
          'And don\'t forget Grandpa Peter John. He\'s the one who brought us all together.',
        ],
        knoxley: [
          'My youngest — and already asking the biggest questions! That\'s my girl.',
          'You want to know how far back it goes? Your grandfather Peter John knew the whole story.',
          'Go find Grandpa Peter John — he\'s back in 2026 Mankato. He knows the whole story.',
        ],
        // Generic parent for non-Chuck children
        isabella: [
          'Isabella! Your dad is William — my brother. So I\'m your uncle Chuck.',
          'Our grandparents came from the Netherlands in 1950 — we were born here in America.',
          'Find your grandfather Peter John. He was there when it all began.',
        ],
        henry: [
          'Henry! Looking to meet everyone? That\'s the spirit.',
          'Your grandfather Peter John is the key to it all. Find him in Mankato, 2026.',
          'He can tell you more than anyone alive about this family.',
        ],
        maxwell: [
          'Maxwell! You want to know what daily life was really like.',
          'Your grandfather Peter John lived it. Farm in Minnesota, church every Sunday.',
          'Find him in 2026 Mankato. He remembers every detail of the farm years.',
        ],
        raven: [
          'Raven! Arthur\'s daughter — all the way from Haarlem to find me!',
          'Your dad and I talk sometimes. He tells me you\'re growing up Dutch-American, just like we did.',
          'Here — I found something in the attic. A floppy disk with the first family tree database.',
          'Your dad built it on his first computer. Take it — it belongs with you.',
        ],
        starling: [
          'Starling! Arthur\'s youngest — I can see the resemblance.',
          'You were born in Haarlem, the country we left in 1950. That\'s something remarkable.',
          'Here — take this old floppy disk. Your dad\'s first family tree, 1984 style.',
        ],
      },
      item: { id:'floppy_disk', label:'Floppy Disk', emoji:'💾' },
    },
    // ── Peter John (born 1956, age 28 in 1984) — young married man ──────────
    {
      gedcomId: '@I023@',
      name: 'Peter John van Duynhoven',
      given: 'Peter John',
      era: 6, spawnR: 9, spawnC: 11,
      bodyColor: '#5a4830', hairColor: '#2a1808', skinColor: '#c89050',
      lines: {
        generic: [
          'Peter John van Duynhoven. Twenty-eight years old and already chasing the history books.',
          'Born here in Minnesota, 1956. My folks came over from Boekel, Netherlands six years before I arrived.',
          'I grew up hearing Dutch at the dinner table — "eet smakelijk" before every meal.',
          'Now I have a family of my own. Trying to pass those stories on.',
        ],
        repeat1: [
          'My father Johan told me the ship was called the Queen Elizabeth. Ten days across the Atlantic.',
          'I never took that journey — I was born on American soil. But I know every detail from his stories.',
          'I keep a Dutch prayer book from my grandmother Anna. I can\'t read it, but I keep it.',
        ],
        heart2: [
          'You know what I want my kids to understand? That we didn\'t lose anything when we came here.',
          'We added something. Dutch roots, American life. That\'s who we are.',
          'My father knew Boekel. I know Minnesota. My kids will know both.',
        ],
        raven:    ['Raven! Arthur\'s daughter from Haarlem! The family has gone full circle.', 'Born in the Netherlands, just like my grandparents. That makes my heart full.'],
        starling: ['Starling! A collector — you\'d love the stories my dad Johan used to tell.', 'He had a way of making 1950 sound like yesterday.'],
        charlotte: ['Charlotte! You want to understand the family name? Ask your grandfather — me, later.', 'Right now I\'m still figuring it all out too.'],
        tenley:   ['Tenley! The women of the family. You should hear about my mother Anna — tough as nails.', 'Crossed the Atlantic at thirty-seven with six kids. Nothing scared that woman.'],
        knoxley:  ['The youngest! Looking for the deep roots? Start at Era 3 — Boekel, 1872.', 'That\'s where Marianus was born. Your anchor to the old country.'],
        isabella: ['Isabella! Your dad is William — my son. So I\'m your grandfather Peter John.', 'One day you will want to know about the crossing. Ask me then — I will tell you everything.'],
        henry:    ['Henry! Meeting the whole family? You\'ve got a long list ahead of you.', 'Start with the elders. Johan — your great-grandfather — is still with us. Find him.'],
        maxwell:  ['Maxwell! Daily life in 1984? Drive to work, fix the farm, come home to kids.', 'Different from 1872 — but the love for the land? Same thing.'],
      },
    },
  ],

  // ── Era 5 · 1955 — Peter John (grandfather of ALL US Gen-7) ──────────────
  // Peter John @I023@ is the grandparent of Charlotte, Tenley, Knoxley,
  // Isabella, Henry, Maxwell — and great-grandfather of Raven and Starling
  '5_2_2': [
    {
      gedcomId: '@I023@',
      name: 'Peter John van Duynhoven',
      given: 'Peter John',
      era: 8, spawnR: 8, spawnC: 8,  // born 1956 in Minnesota — DOES NOT appear in Era 5
      bodyColor: '#5a4830', hairColor: '#2a1808', skinColor: '#c89050',
      lines: {
        // Peter John came to America as a child — he speaks English, not Dutch.
        // He knows a few Dutch words his parents used at home, but does not use them himself.
        generic: [
          'Peter John van Duynhoven. Born right here in Minnesota, April 1956.',
          'My parents Johan and Anna came over from Boekel, Netherlands in 1950. I was their fourth child.',
          'I grew up hearing Dutch at the dinner table — Mom and Dad, Grandma Anna, all of them.',
          'Seventy years old now. America is the only home I\'ve ever known. But I carry Boekel in my heart.',
          'The family farm is east of Moorhead. Come visit — I\'ll show you how we do things here.',
        ],
        repeat1: [
          'I farmed this land for forty years. Retired now, but I still walk the fields.',
          'You know what I miss? The Dutch bakeries my parents used to talk about. Boekel bread.',
          'Minnesota is home. Always has been. But the roots go deep — all the way back to 1539.',
        ],
        heart2: [
          'I keep a photo of Boekel on my wall. I\'ve never been there, but I know every street name.',
          'My father Johan used to tell me stories about the fields, the church, the neighbours.',
          'He carried Boekel with him all his life. Now I carry it too, even though I was born here.',
        ],
        // ── Grandchild-specific dialog ──
        charlotte: [
          'Charlotte! My grandchild! You came all this way to find me!',
          'Your father Charles — he is a good boy. Very proud of this family.',
          'Now you are learning our history too. That makes me so happy.',
          'Every ancestor you find is a gift. Keep going.',
        ],
        tenley: [
          'Tenley! My granddaughter — come here!',
          'You want to know about the women of this family? Your grandmother Mary Campbell is the one to find.',
          'She is the strongest woman I know. Ask her everything.',
        ],
        knoxley: [
          'My youngest granddaughter here — all the way back through family history! I love that.',
          'You want the deepest roots? Go find Johan — my father — at Era 4. On the ship.',
          'And then find Marianus — his father — at Era 3. The answers go all the way back.',
        ],
        isabella: [
          'Isabella! My granddaughter from William\'s family.',
          'Your father William is so much like me. Quiet, steady, always there.',
          'You are here to learn our story. I will tell you everything I know.',
        ],
        henry: [
          'Henry! You\'ve been talking to everyone, haven\'t you!',
          'That\'s the spirit — meet them all. That\'s what this family deserves.',
          'When you finish, come back and tell me who was the most interesting.',
        ],
        maxwell: [
          'Maxwell! You want to know what daily life was like.',
          'I will tell you exactly. Wake at five. Milk the cows. Church on Sunday. Family dinner.',
          'Simple life. Good life. Everything we needed right here.',
        ],
        raven: [
          'Raven! My great-grandchild! You came all the way back to find me!',
          'You are Arthur\'s daughter — I can see it in your eyes.',
          'You were born in Haarlem! My parents came from the Netherlands in 1950, and now here you are.',
          'I am so proud of you. Go find all of us. We are all waiting for you.',
        ],
        starling: [
          'Starling! What a beautiful name. You must be Arthur\'s youngest.',
          'Your father told me — you were born in Haarlem, back in the old country!',
          'The family went to America and then came back. That is something remarkable.',
          'My father Johan would not believe it. Go find him — he\'s on the ship at Era 4.',
        ],
      },
    },
    // ── Carolyn — Peter John's sister, learning Dutch ──
    // Born American after Johan and Anna emigrated. Growing up in Minnesota.
    // She never learned Dutch at home but has been practicing basic phrases on her own.
    {
      gedcomId: '@I101@',
      name: 'Carolyn Kay van Duynhoven',
      given: 'Carolyn',
      era: 6,  // born 1957, appears in Era 6 (1984, age 27) spawnR: 6, spawnC: 11,
      bodyColor: '#a04060', hairColor: '#6a2010', skinColor: '#d8b080',
      lines: {
        generic: [
          'Hi! I\'m Carolyn — Peter John\'s sister. We all grew up here in Moorhead.',
          'Mom and Dad spoke Dutch sometimes at home, but we kids never really learned it.',
          'I\'ve been trying to pick up a few words though. It feels important, you know?',
          'I keep a little notebook. I write down the Dutch words I learn.',
        ],
        repeat1: [
          'Oh, you\'re back! I just learned a new word today.',
          'My brother Peter John says I\'ll never be fluent. But I don\'t care — even a few words matter.',
          'Our parents would be so happy knowing someone still cares about the language.',
        ],
        heart2: [
          'Can I try something? I\'ve been practicing.',
          { dutch:'Goedemorgen! [Good morning!]', en:'Ha! I did it! Was that right?' },
          'I\'ve also been learning the numbers. Een, twee, drie — that\'s one, two, three!',
          'Mom used to count things in Dutch when she thought we weren\'t listening.',
        ],
        // ── Raven-specific: Carolyn is amazed and wants to practice with her ──
        raven: [
          { dutch:'Oh! Jij spreekt echt Nederlands! [Oh! You actually speak real Dutch!]', en:'' },
          'Wait — was that right? Did I say it right?',
          'You really speak it! Can you teach me something? A real sentence?',
          { dutch:'Ik oefen elke dag. Is dat goed? [I practice every day. Is that good?]', en:'Please say yes!' },
        ],
        raven_repeat1: [
          'You came back! Okay — I have been practicing.',
          { dutch:'Ik heet Carolyn. Hoe heet jij? [My name is Carolyn. What is your name?]', en:'Did I get it?' },
          'My brother says the Dutch "g" sound is impossible for Americans. He\'s probably right.',
          'But you — you grew up with it. That\'s amazing.',
        ],
        // ── Starling-specific: same excitement, slightly simpler ──
        starling: [
          { dutch:'Hallo! Goede... goede... dag? [Hello! Good... good... day?]', en:'Was that right?' },
          'You actually speak Dutch! Like real Dutch! You grew up in Haarlem!',
          'Oh I have so many questions. How do you say "family"? Is it "familie"?',
          { dutch:'Familie! [Family!]', en:'I knew it! Mom used that word.' },
        ],
        starling_repeat1: [
          'Starling! I learned a new one.',
          { dutch:'Ik hou van mijn familie. [I love my family.]', en:'That\'s the one I wanted most.' },
          'Mom used to whisper it to us when we were little. I finally know what it means.',
        ],
        charlotte: [
          'Charlotte! Are you exploring the whole family history?',
          'I\'m just learning a few Dutch words. Nothing like what your cousins know.',
          'But even saying "goedemorgen" to myself in the morning makes me feel connected.',
        ],
        tenley: [
          'Tenley! Come sit — I\'m writing in my Dutch notebook.',
          'I just learned the word for grandmother — "oma." And grandfather — "opa."',
          'Our grandparents in the Netherlands — I wish I could have talked to them.',
        ],
        knoxley: [
          'Knoxley! The littlest one asking the biggest questions — that is so you!',
          'I\'m still on "hello" and "thank you" in Dutch — I\'ll leave the deep research to you.',
          { dutch:'Dank je wel! [Thank you!]', en:'See? I\'m getting there!' },
        ],
        isabella: [
          'Isabella! It\'s so good to meet cousins on the adventure.',
          'I\'m the one in the family trying to learn Dutch — everyone else gave up.',
          'Een, twee, drie — one, two, three. That\'s as far as I got today.',
        ],
        henry: [
          'Henry! Did Peter John send you over?',
          'I\'m practicing Dutch words. Mom and Dad spoke it — we kids never really learned.',
          'I keep thinking if I learn enough, it\'s like having a conversation with them somehow.',
        ],
        maxwell: [
          'Maxwell! Come listen — I learned a Dutch word for food today.',
          { dutch:'Boterkoek! [Butter cake!]', en:'That\'s the easy one. Grandma\'s recipe.' },
          'I can say all the food words. Now I just need the rest of the sentence.',
        ],
      },
    },
  ],

  // ── Era 6 · 1984 — Johan (age 69) + Anna (age 71) as visiting grandparents ─
  '6_2_3': [
    {
      gedcomId: '@I060@',
      name: 'Johan van Duijnhoven',
      given: 'Johan',
      era: 6, spawnR: 7, spawnC: 8,
      bodyColor: '#704020', hairColor: '#d0c8b0', skinColor: '#c08050',
      lines: {
        generic: [
          'Sixty-nine years old now. Still on the farm, but slower than I used to be.',
          'I remember arriving in 1950 like it was last week. The cold. The strange language. The kindness of the church community.',
          'Minnesota became home. But Boekel — Boekel is still home too, in here.',
          { dutch:'Thuis is waar het hart is. [Home is where the heart is.]', en:'Two homes. Two hearts.' },
        ],
        repeat1: [
          'I\'ve watched my children grow up American. Peter John, Carolyn, Anna Maria — good people.',
          'Sometimes they speak Dutch phrases without knowing it. "Gezellig," they say.',
          'They inherited the language of their heart, even if they never learned to speak it properly.',
        ],
        repeat2: [
          'The farm here is good land. Flat, like Brabant.',
          'First year, I planted rye — just like home. Neighbours looked at me like I was strange.',
          'Second year, I planted corn. They left me alone after that.',
        ],
        heart2: [
          'When I am gone, I want my grandchildren to know one thing.',
          'We left not because we stopped loving the Netherlands. We left because we loved our children more.',
          'That\'s what every immigrant leaves behind. And what every child should carry forward.',
        ],
        raven:    ['Raven — born in Haarlem! The old country! Tell me, does the polder still smell the same in spring?', 'I close my eyes and I am back there. Sixty-nine years old and I can still smell it.'],
        starling: ['Starling! A collector from every time. You remind me of my mother Anna Maria.', 'She kept everything. A button, a prayer card, a ribbon. Small things that held everything together.'],
        charlotte: ['Charlotte. The family name — yes, I know about that. The clerk in Wisconsin...', 'Your grandfather Peter John will tell you. Ask him. He has the story right.'],
        tenley:   ['Tenley! You want to hear about the women? Then you want to hear about Anna Maria.', 'She crossed that ocean and never complained once. Stronger than anyone I\'ve ever known.'],
        knoxley:  ['The youngest one! Here — I have a Dutch coin in my pocket. From Boekel.', 'I brought it on the ship in 1950. Forty years I\'ve kept it. Now you keep it.'],
        isabella: ['Isabella — the crossing is your quest! I can tell you exactly what it was like.', 'The smell of the engine room. The colour of the North Sea. The sound of Anna praying at night.'],
        henry:    ['Henry! You want to meet everyone? Then start with the oldest memories.', 'I have stories that go back to my father Marianus. And his father before him. All the way back.'],
        maxwell:  ['Maxwell! Daily life — mine started at 4am. Every day for forty years.', 'Milk the cows, tend the crops, feed the family. Not glamorous. But good.'],
      },
      item: { id:'dutch_coin', label:'Dutch Coin', emoji:'🪙' },
    },
    {
      gedcomId: '@I061@',
      name: 'Anna Maria Cornelissen',
      given: 'Anna',
      era: 6, spawnR: 8, spawnC: 12,
      bodyColor: '#805060', hairColor: '#d8d0c0', skinColor: '#c89060',
      lines: {
        generic: [
          'Anna Maria van Duijnhoven now — Cornelissen by birth. Seventy-one years old.',
          'I still make Dutch recipes every Sunday. Stampot. Erwtensoep. The family knows when Sunday is coming.',
          'This kitchen smells like Boekel on Sundays. That\'s how I keep it alive.',
          { dutch:'Zondagse erwtensoep voor iedereen! [Sunday pea soup for everyone!]', en:'Come eat — you look too thin.' },
        ],
        repeat1: [
          'People ask me: do you miss the Netherlands? I say: yes, every single day.',
          'But I would not trade this life. Not for anything.',
          'My children are here. My grandchildren are here. This is where I am meant to be.',
        ],
        heart2: [
          'I want to tell you about the ship. The Queen Elizabeth, November 1950.',
          'Six children, two suitcases, and a prayer book. Johan had a Boekel soil in his coat pocket.',
          'I had nothing but faith. It was enough. It has always been enough.',
        ],
        raven:    ['Raven! You speak Dutch — say something for me.', 'When I hear Dutch spoken by a young person, I think: the language lives on. Good.'],
        starling: ['Starling! You collect things from every era?', 'I have my mother\'s recipe book from Boekel. In Dutch, of course. A hundred years old. Here — you can hold it.'],
        charlotte: ['Charlotte — looking for the family roots. Then you need to know about the crossing.', 'My husband Johan will tell you the history. I will tell you what it felt like.'],
        knoxley:  ['The youngest! Knoxley, come here — let me look at you.', 'You have the Cornelissen eyes. Same as my grandmother. Five generations of strong women.'],
        isabella: ['Isabella! The crossing quest — that one is mine to tell. Come, sit.', 'Ten days on the North Atlantic. Every detail is still here.', 'Find me in Era 4 first — on the ship. Then come back and I\'ll tell you how the story ended.'],
        tenley:   ['Tenley! Women of the family. That\'s exactly the right question to ask.', 'Start with me. Then go back to Geertruda in 1799. Then Aelken in 1539. We are the thread.'],
        henry:    ['Henry! Meeting everyone — then you must talk to Johan. He has the family timeline memorised.', 'I have the recipes memorised. Together we cover everything.'],
        maxwell:  ['Maxwell! You want to know about daily life. Then come to my kitchen.', 'That\'s where daily life happened. That\'s where the family was fed and held together.'],
      },
    },
    {
      gedcomId: '@I070@',
      name: 'Gerardus van Duijnhoven',
      given: 'Gerardus',
      era: 6, spawnR: 10, spawnC: 9,
      bodyColor: '#405060', hairColor: '#c8c0b0', skinColor: '#c09060',
      lines: {
        generic: [
          'Gerardus van Duijnhoven. Seventy-five years old. Still sharp, still here.',
          'I came to America in 1950 with Johan\'s family. We were neighbours in Boekel first.',
          'You know what surprised me about Minnesota? The silence at night. After Boekel — quiet.',
          { dutch:'Stil als een muis. [Still as a mouse.]', en:'Beautiful silence. I never got used to the Netherlands noise after that.' },
        ],
        repeat1: [
          'I had a farm of my own here. Not as big as Boekel, but mine.',
          'Johan was always the organised one. I was always the one who needed organising.',
          'Good friendship, ours. Fifty years in the same county.',
        ],
        heart2: [
          'At seventy-five you start counting. Not years — people.',
          'How many are still here. How many you wish could see what happened next.',
          'My parents brought us here. I have grandchildren in three states now. They would be proud.',
        ],
        raven:    ['Raven — you came all the way from Haarlem! I never went back after 1950.', 'Tell me — does Sint-Lambertus Church still stand in Aarle-Rixtel?'],
        knoxley:  ['The youngest one — deep roots quest! Then let me tell you about digging.', 'Every spring I planted. Same rhythm as my father Jozef in Boekel. Same rhythm as his father before him.'],
        isabella: ['Isabella! The crossing? I was on that ship too. Different family, same voyage.', 'Find me in Era 5 first — I was forty-six in Minnesota. Then come back here.'],
        henry:    ['Henry! Family facts — ask me anything about the Minnesota years.', 'Forty years of being neighbours with Johan. I know their family as well as my own.'],
        maxwell:  ['Maxwell! Daily life 1984? Wake up at five. Coffee. Walk the fields.', 'Still the same as 1955. Some things don\'t change and shouldn\'t.'],
      },
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
        // ── Special dialog when a child/grandchild is playing ──
        raven: [
          { dutch:'Raven, mijn kleine tijdreiziger! [Raven, my little time traveller!]', en:'' },
          'I am so proud of you for going back to find all these ancestors.',
          'You were born right here in Haarlem, just like I came back to. This city is in our blood.',
          'Remember — every ancestor you meet is a part of who you are.',
        ],
        starling: [
          { dutch:'Starling! Mijn avonturierster! [Starling! My little adventurer!]', en:'' },
          'You are exploring the family tree — I always knew you would love this.',
          'You were born in Haarlem, same city where our family came back to after 500 years.',
          'Go find them all. Every one of those ancestors has a story just for you.',
        ],
        charlotte: [
          'Charlotte! Good to see you on this adventure.',
          'Your grandfather Peter John would have loved to see you here.',
          'He was the one who held all the family memories together.',
        ],
        tenley: [
          'Tenley! You came to meet the ancestors too.',
          'Your grandfather Peter John — he knew every family story. Ask about him.',
          'The women of this family kept everything going. You\'ll find that out.',
        ],
        knoxley: [
          'You are the youngest one, Knoxley — and you want to go the furthest back. I love that.',
          'Your grandfather Peter John had the same spirit. He would be so proud of you.',
          'There is more history here than any of us could ever imagine.',
        ],
        isabella: [
          'Isabella! Welcome to the family history adventure.',
          'Your grandfather Peter John started putting these stories together.',
          'Find him — he has things to tell you that nobody else knows.',
        ],
        henry: [
          'Henry — you\'ve been talking to all of them, haven\'t you.',
          'You\'ve met Dirck in 1539 and you\'re here now in 2020. How does it feel?',
          'This is what I was trying to do with the website. Make all of them real.',
          { dutch:'De familie is nooit echt weg. [The family is never really gone.]', en:'' },
        ],
        maxwell: [
          'Maxwell! A day in their life — that\'s what you want to know.',
          'Your grandfather Peter John lived that prairie Minnesota life.',
          'He would sit you down and talk for hours about what it was really like.',
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
      location: 'haarlem',   // only spawns in Haarlem, not Mankato
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
          'Raven has always been curious about her family — even when we were little she would ask her dad questions about the old photos.',
          { dutch:'Nu spreekt ze beter dan ik! [Now she speaks better than me!]', en:'At Dutch at school I mean — she\'s really good!' },
        ],
        heart3: [
          { dutch:'Jij bent ook een vriend van de familie. [You are also a friend of the family.]', en:'' },
          'Raven said you are on a big adventure through her family history.',
          'I hope you find all the answers. She deserves to know where she comes from.',
        ],
        // ── Raven-specific dialog ──
        // Every line is direct second-person — Romijn is talking TO Raven
        raven: [
          { dutch:'RAVEN! Eindelijk! [RAVEN! Finally!]', en:'I\'ve been waiting at the canal for twenty minutes!' },
          'The purple tulips are in at Lies\'s stall. She saved them for you!',
          { dutch:'We gaan toch naar Tierney\'s na de markt? [We\'re still going to Tierney\'s after the market?]', en:'Your usual — hot chocolate and a cheese toastie!' },
        ],
        raven_repeat1: [
          { dutch:'Goedemorgen, Raven! [Good morning, Raven!]', en:'Ready for school?' },
          'I was at your house yesterday but you were already out with your dad. He was buying sausages from Henk again.',
          { dutch:'Jouw vader en die worst! [Your dad and those sausages!]', en:'Every single Saturday!' },
        ],
        raven_repeat2: [
          'Have you been to the Saturday market yet this week?',
          { dutch:'Lies heeft roze tulpen voor je bewaard. [Lies saved pink tulips for you.]', en:'' },
          'She knows you always come. She started saving the good ones on purpose.',
        ],
        raven_heart2: [
          'Raven — I\'ve been thinking about your school project on the family history.',
          { dutch:'Jij bent zo slim. [You are so smart.]', en:'Finding all those ancestors going back hundreds of years.' },
          'My oma says your family is one of the most interesting in Haarlem. I\'m honestly a bit jealous.',
        ],
        raven_heart3: [
          { dutch:'Raven, ik ben zo trots op jou. [Raven, I am so proud of you.]', en:'' },
          'You went all the way back to 1539 to meet your family. That is the bravest thing I\'ve ever heard.',
          'When you come back, you have to tell me everything. Every single ancestor.',
          { dutch:'Belooft? [Promise?]', en:'' },
        ],
        // ── Starling-specific dialog ──
        starling: [
          { dutch:'Starling! Waar is je zusje? [Starling! Where is your sister?]', en:'Is Raven coming to the market too?' },
          'I made a drawing for you! A beetle — because we found that one in the garden.',
          { dutch:'Voor jou! [For you!]', en:'It\'s in my bag.' },
        ],
        starling_repeat1: [
          'Starling! The courtyard is free. Do you want to play?',
          { dutch:'We kunnen verstoppertje spelen. [We can play hide and seek.]', en:'' },
          'Last time you hid in the big flower pot and nobody found you for twenty minutes!',
        ],
        starling_repeat2: [
          'We should cycle to the Grote Markt together this Saturday.',
          { dutch:'Jij neemt de tulpen, ik neem de stroopwafels. [You take the tulips, I\'ll take the stroopwafels.]', en:'' },
          'Deal? It\'s always more fun when we go together.',
        ],
        starling_heart2: [
          'Starling — can I tell you something?',
          'You know more about your family history than anyone I\'ve ever met.',
          { dutch:'Dat is echt bijzonder. [That is really special.]', en:'Not everyone can say their family goes back to 1539.' },
        ],
        starling_heart3: [
          { dutch:'Starling, ik ben zo blij dat we vriendinnen zijn. [Starling, I am so glad we are friends.]', en:'' },
          'You went on the most incredible adventure through your whole family history.',
          'When you come back, you have to tell me everything — especially about the oldest one!',
          { dutch:'Belooft? [Promise?]', en:'' },
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
      location: 'haarlem',   // only spawns in Haarlem, not Mankato
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
        heart3: [
          { dutch:'Jij bent ook vrienden met haar familie? [Are you also friends with her family?]', en:'' },
          'Then you must be a good person. Starling only has good friends.',
          { dutch:'Pas goed op haar, hè? [Take good care of her, okay?]', en:'' },
        ],
        // ── Starling-specific dialog ──
        // Every line is direct second-person — Liv is talking TO Starling
        starling: [
          { dutch:'STARLING! Daar ben je! [STARLING! There you are!]', en:'I\'ve been looking everywhere for you!' },
          'I found a really shiny stone by the canal. I kept it for you.',
          { dutch:'Wil je spelen? [Do you want to play?]', en:'We could go to the courtyard!' },
        ],
        starling_repeat1: [
          { dutch:'Starling! Ik heb een idee! [Starling! I have an idea!]', en:'' },
          'Let\'s make a map of all the places your ancestors lived. I have coloured pencils!',
          { dutch:'Jij tekent de schepen, ik teken de huizen. [You draw the ships, I\'ll draw the houses.]', en:'' },
        ],
        starling_repeat2: [
          'Remember last winter when you told me about Johan sailing across the ocean?',
          { dutch:'Dat was zo spannend! [That was so exciting!]', en:'I went home and told my mum.' },
          'She looked it up and said it\'s all real! Ten days on a ship! Can you imagine?',
        ],
        starling_heart2: [
          'Starling — you know what I like best about being your friend?',
          'You always have the most amazing stories. But they\'re all TRUE.',
          { dutch:'Jouw familie is echt bijzonder. [Your family is really special.]', en:'Not everyone can trace their family back 500 years.' },
        ],
        starling_heart3: [
          { dutch:'Starling, ik ben zo trots op jou. [Starling, I am so proud of you.]', en:'' },
          'You went all the way back through your whole family history.',
          'When you come back — and you ARE coming back — you have to draw it all for me.',
          { dutch:'Elke voorouder. Belooft? [Every ancestor. Promise?]', en:'' },
        ],
        // ── Raven-specific dialog ──
        // Raven is Starling's sister — Liv talks to Raven directly, not about Starling in third person
        raven: [
          { dutch:'Raven! Is Starling bij jou? [Raven! Is Starling with you?]', en:'We were supposed to meet at the fountain!' },
          'I have drawings of the family tree for both of you. I used all my best pencils.',
          { dutch:'Voor jullie allebei. [For both of you.]', en:'One each — yours has the ship on it.' },
        ],
        raven_repeat1: [
          'Oh good — maybe you know where Starling went after school.',
          'I wanted to show you both my ancestor map before it gets dark.',
          { dutch:'Kom je mee zoeken? [Will you come look with me?]', en:'' },
        ],
        raven_repeat2: [
          'Raven — are you going on the big family history adventure too?',
          'Starling talked about it but I didn\'t know you were also going back in time!',
          { dutch:'Dat is zo cool! [That is so cool!]', en:'You have to take notes for me.' },
        ],
        raven_heart2: [
          'Raven — it makes me so happy that both of you are doing this together.',
          'You and Starling are always better as a team.',
          { dutch:'Jullie zijn geweldig. [You two are amazing.]', en:'I mean it.' },
        ],
        raven_heart3: [
          'Raven — you and Starling have been on the most incredible adventure.',
          'When you both come back, I want to hear every single story.',
          { dutch:'Beloof je dat je alles vertelt? [Promise you\'ll tell me everything?]', en:'' },
          'All the way back to 1539. That is honestly the coolest thing I have ever heard.',
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
      location: 'haarlem',
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
        starling: [
          { dutch:'Starling! Jij houdt wél van de knoflook! [Starling! You do like the garlic!]', en:'' },
          'Unlike your sister — she always makes a face.',
          { dutch:'Een stukje gerookte worst voor jou. [A piece of smoked sausage for you.]', en:'Your dad\'s favourite kind.' },
        ],
      },
    },
  ],

  // Tierney's Irish Pub — Spekstraat 8, Haarlem (real pub, ~30m from Sint-Bavo)
  // Paul is the owner. Arthur, Raven and Starling go every Saturday after the flower market.
  '8_3_2': [
    {
      gedcomId: null,
      name: 'Paul — Tierney\'s',
      location: 'haarlem',   // Tierney's is in Haarlem
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
          'The usual? Hot chocolate and a cheese toastie coming right up.',
          'Your booth next to the bar is free — the cosy enclosed one. Your dad\'s already in there.',
        ],
        starling: [
          'Starling! Come in, come in.',
          'Hot chocolate and a cheese toastie — I\'ve already put the order in.',
          { dutch:'Jouw tafeltje staat klaar. [Your table is ready.]', en:'The booth next to the bar — nice and cosy.' },
        ],
      },
    },
  ],

  '8_1_0': [  // The family home screen
    {
      gedcomId: '@I090@',
      name: 'Arthur Van Duynhoven',
      given: 'Arthur',
      location: 'haarlem',
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
        // ── Parent-specific dialog ──
        raven: [
          { dutch:'Raven! Mijn meisje! [Raven! My girl!]', en:'' },
          'You found the journal! I knew you would be the one to go on this adventure.',
          'You were born right here in Haarlem — and now you\'re going back 500 years to meet everyone.',
          'I am so proud of you. Go find them all. Every single one.',
        ],
        starling: [
          { dutch:'Starling! Mijn kleine avonturierster! [Starling! My little adventurer!]', en:'' },
          'You found the family journal! That\'s my curious girl.',
          'You were born here in Haarlem — the same city our family came back to after 500 years in America.',
          'Every ancestor you meet is a part of you. Go find them!',
        ],
      },
    },
  ],

  // ── Era 6 · 1984 — Chuck (parent of Charlotte, Tenley, Knoxley) ──────────
  // Already in 6_1_1 — adding parent dialog

  // ── Era 6 · Peter John and William — grandparents of ALL Gen-7 characters ──
  // Peter John @I023@ is the grandfather connecting US and NL branches
  // He appears at Era 5 (1955 Minnesota) but we add special dialog for grandchildren

  // ══════════════════════════════════════════════════════════
  //  DEEP-ANCESTOR NPCs — one companion ancestor per early era
  //  (added alongside the key ancestors already placed above)
  // ══════════════════════════════════════════════════════════

  // ── Era 0 · ~1460 · The maternal Blaffarts line (ancient stones) ──
  '0_0_3': [
    {
      gedcomId: '@I090@',
      name: 'Ariaen Jan Blaffarts',
      given: 'Ariaen',
      era: 0, spawnR: 7, spawnC: 9,
      bodyColor: '#4a3a24', hairColor: '#20140a', skinColor: '#c89a5e',
      lines: {
        generic: [
          { dutch:'Wees welkom bij de oude stenen. [Be welcome at the ancient stones.]', en:'Few travellers come this far out onto the heath.' },
          'I am Ariaen Jan Blaffarts. My line runs into the Van der Heijden family — the mother\'s side of your tree.',
          { dutch:'Namen vervagen, maar het bloed blijft. [Names fade, but the blood remains.]', en:'Remember mine.' },
        ],
        raven: [
          { dutch:'Jij spreekt onze taal! Dat verwarmt een oud hart. [You speak our tongue! That warms an old heart.]', en:'' },
          'The Blaffarts and the Van der Heijden — through them the mother\'s blood reaches you.',
        ],
        starling: [
          { dutch:'Klein vogeltje, zo ver van huis. [Little bird, so far from home.]', en:'' },
          'Even the oldest roots have two sides — the father\'s and the mother\'s. I am the mother\'s side.',
        ],
      },
    },
  ],

  // ── Era 1 · 1796 · Elisabeth van Boxtel (Petrus\'s mother-line spouse) ──
  '2_3_1': [
    {
      gedcomId: '@I291@',  // unique ID — @I091@ belongs to Raven
      name: 'Elisabeth van Boxtel',
      given: 'Elisabeth',
      era: 2, spawnR: 7, spawnC: 8,
      bodyColor: '#5a3a4a', hairColor: '#2a1810', skinColor: '#dcae7a',
      lines: {
        generic: [
          { dutch:'Goedendag. Ik ben Elisabeth van Boxtel. [Good day. I am Elisabeth van Boxtel.]', en:'I married into the Van Duijnhoven family in 1796.' },
          'People sometimes muddle my story — my second marriage, to Joannes Timmers, was in 1808. But the Van Duijnhoven match came first, in \'96.',
          { dutch:'Onthoud de juiste datum. [Remember the right date.]', en:'The records are easily confused.' },
        ],
        raven: [
          { dutch:'Wat lief dat je Nederlands spreekt! [How sweet that you speak Dutch!]', en:'' },
          'A wife carries the family forward as much as any husband. Do not forget the women in your tree.',
        ],
        starling: [
          { dutch:'Zo\'n jonge reiziger, en toch zo beleefd. [Such a young traveller, and yet so polite.]', en:'' },
          'I married in 1796 — write it down so no one mistakes it for the later wedding.',
        ],
      },
    },
  ],

  // ── Era 2 · ~1798 · Johanna van der Heijden (maternal line) ──
  '2_2_2': [
    {
      gedcomId: '@I092@',
      name: 'Johanna van der Heijden',
      given: 'Johanna',
      era: 2, spawnR: 7, spawnC: 9,
      bodyColor: '#3a4a5a', hairColor: '#2a2010', skinColor: '#dca878',
      lines: {
        generic: [
          { dutch:'Ik ben Johanna van der Heijden. [I am Johanna van der Heijden.]', en:'My family reaches back to the old Blaffarts line, out on the heath.' },
          'Through me the maternal blood joins the Van Duijnhoven line — two rivers meeting.',
          { dutch:'De vrouwen dragen de familie net zo goed als de mannen. [The women carry the family as much as the men.]', en:'' },
        ],
        raven: [
          { dutch:'Nederlands, en zo goed! [Dutch, and so well!]', en:'' },
          'Ariaen Jan Blaffarts, out at the ancient stones — he is of my mother\'s people. Go greet him if you can.',
        ],
        starling: [
          { dutch:'Welkom, klein reizigertje. [Welcome, little traveller.]', en:'' },
          'The maternal line matters. Van der Heijden, and Blaffarts before that.',
        ],
      },
    },
    // ── Geertruda Verwegen (@I031@) born ~1790, age ~9 in 1799 ──────────────
    {
      gedcomId: '@I031@',
      name: 'Geertruda Verwegen',
      given: 'Geertruda',
      era: 2, spawnR: 9, spawnC: 8,
      bodyColor: '#804060', hairColor: '#5a3020', skinColor: '#d4a870',
      lines: {
        generic: [
          'I am Geertruda Verwegen. Nine years old and curious about everything.',
          'My father farms near Boekel. He says this soil has been tended by the same families for centuries.',
          'One day I will marry a Van Duijnhoven. Mama says Martinus is the right one. I think he is nice.',
          { dutch:'Hoe oud ben jij? [How old are you?]', en:'I am nine. Almost ten!' },
        ],
        repeat1: [
          'I helped plant the rye this morning. My hands are still dirty.',
          'Martinus van Duijnhoven waved to me today. He is twelve. Very serious for his age.',
          'Mama says I will understand when I am older. I wish older would hurry up.',
        ],
        heart2: [
          'Will you keep a secret? I already know I want to marry Martinus.',
          'He showed me his father\'s field and said: one day this will be ours.',
          'That is the most romantic thing I have heard. Even if I am only nine.',
        ],
        tenley: [
          'You are asking about the women! Then ask me — I will be one of the important ones.',
          'My grandmother says our family has strong women going back many generations.',
          'I plan to be the strongest. You will see.',
        ],
        raven: [
          'You speak Dutch so well! Are you from Boekel too?',
          { dutch:'Welkom in ons dorp! [Welcome to our village!]', en:'We do not get many visitors here.' },
        ],
        knoxley:  ['Looking for ancient things? The stones at the north heath are very old.', 'My grandfather showed me one. He said families put them there to mark the land.'],
        starling: ['You collect things from every era? Here — a button from my mother\'s dress.', 'Buttons show where a family came from. Different patterns, different places.'],
      },
    },
  ],

  // ── Era 3 · 1829 · Martinus van Duijnhoven (Marianus\'s father) ──
  '3_1_1': [
    {
      gedcomId: '@I093@',
      name: 'Martinus van Duijnhoven',
      given: 'Martinus',
      era: 3, spawnR: 7, spawnC: 9,
      bodyColor: '#3a2a1a', hairColor: '#241606', skinColor: '#c89050',
      item: { id:'marriage_record', label:'Marriage Record 1858', emoji:'💍' },
      lines: {
        generic: [
          { dutch:'Ik ben Martinus, geboren in 1829. [I am Martinus, born in 1829.]', en:'Marianus, who works the south fields, is my son.' },
          'In February 1858 I married Geertruda Verwegen — and my brother married her sister the very same year, in the same church.',
          'Take this marriage record. It ties two families together for good.',
        ],
        knoxley: [
          { dutch:'Wil je verder terug? [Do you want to go further back?]', en:'My father farmed this soil, and his father before him.' },
          'The oldest names rest in the church archives — all the way back to 1539.',
        ],
        raven: [
          { dutch:'Raven! Je spreekt Nederlands! [Raven! You speak Dutch!]', en:'' },
          'Two Van Duijnhoven brothers, two Verwegen sisters, one wedding year. That is how small Boekel is.',
        ],
        starling: [
          { dutch:'Zo\'n kleine reiziger, zo ver terug in de tijd. [Such a small traveller, so far back in time.]', en:'' },
          'My son Marianus works the south fields. Go and find him next.',
        ],
      },
    },
  ],

  // ── Era 3 · 1833 · Geertruda Verwegen (Martinus\'s wife) ──
  '3_2_2': [
    {
      gedcomId: '@I094@',
      name: 'Geertruda Verwegen',
      given: 'Geertruda',
      era: 3, spawnR: 7, spawnC: 8,
      bodyColor: '#4a2a3a', hairColor: '#2a1808', skinColor: '#d8a468',
      lines: {
        generic: [
          { dutch:'Ik ben Geertruda Verwegen. [I am Geertruda Verwegen.]', en:'I married Martinus van Duijnhoven in 1858.' },
          'My sister married his brother the same year — so the Verwegen and Van Duijnhoven lines are doubly bound.',
          { dutch:'Marianus is mijn zoon. [Marianus is my son.]', en:'He will have twelve children of his own.' },
        ],
        tenley: [
          'You ask about the women? Good — too often we are left out of the records.',
          'Two Verwegen sisters, two Van Duijnhoven brothers. Remember us both.',
        ],
        raven: [
          { dutch:'Nederlands! Wat een vreugde! [Dutch! What a joy!]', en:'' },
          'The Verwegen name runs through you too, child. Not only the Van Duijnhoven.',
        ],
        starling: [
          { dutch:'Welkom, klein vogeltje. [Welcome, little bird.]', en:'' },
          'My husband Martinus is nearby, in the north of the village. Go and meet him.',
        ],
      },
    },
  ],

  // ── Era 4 · 1878 · Anna Maria van den Elzen (Marianus\'s wife) ──
  '4_2_1': [
    {
      gedcomId: '@I095@',
      name: 'Anna Maria van den Elzen',
      given: 'Anna Maria',
      era: 4, spawnR: 7, spawnC: 9,
      bodyColor: '#3a3a5a', hairColor: '#241408', skinColor: '#dcac78',
      lines: {
        generic: [
          { dutch:'Ik ben Anna Maria van den Elzen. [I am Anna Maria van den Elzen.]', en:'I married Marianus in Boekel, 18 May 1906.' },
          'Twelve children we raised together. Our son Johan sailed for America.',
          { dutch:'Ik overleef mijn man met drie jaar. [I outlive my husband by three years.]', en:'I die in Uden, December 1952. Remember me.' },
        ],
        tenley: [
          'The women hold a family together through everything. Never forget that.',
          'Twelve children, and I knew every one of their birthdays by heart.',
        ],
        isabella: [
          'You are looking for Johan\'s story, I think. My son. He left for America in 1950.',
          'It broke my heart — but a mother lets her children go where they must.',
        ],
        raven: [
          { dutch:'Je spreekt Nederlands! Kom, zit bij me. [You speak Dutch! Come, sit with me.]', en:'' },
          'My husband Marianus works the south fields. Together we began the whole American branch.',
        ],
        starling: [
          { dutch:'Zo\'n klein meisje, zo dapper. [Such a little girl, so brave.]', en:'' },
          'Anna Maria van den Elzen — say my name so it is not forgotten.',
        ],
      },
    },
  ],

  // ── Era 8 · 2026 · Mankato — Chuck's wife Daina ─────────────────────────
  '8_1_2': [
    {
      gedcomId: '@I029@',
      name: 'Daina',
      given: 'Daina',
      location: 'mankato',
      era: 8, spawnR: 7, spawnC: 10,
      bodyColor: '#805060', hairColor: '#301820', skinColor: '#d4a880',
      lines: {
        generic: [
          'Hi! I\'m Daina — Chuck\'s wife. We\'ve lived at 313 Hanover for twenty years now.',
          'Mankato is a good place to grow up. Close to the river, good schools.',
          'Chuck talks about the Dutch side of the family all the time. I married into quite a history!',
          'If you ever want to know what this house was like when the kids were little, just ask.',
        ],
        repeat1: [
          'I was just making coffee. Want some?',
          'Chuck\'s out back. He always finds something to fix on Saturdays.',
          'Did you know there\'s a Blue Earth River just four blocks west? Beautiful walking path.',
        ],
        heart2: [
          'Can I tell you something? When I married Chuck I didn\'t know the family went back to 1539.',
          'Then I saw the family tree Arthur built. Five hundred years. I was speechless.',
          'I\'m so glad the kids are curious about it. That\'s rare.',
        ],
        charlotte: [
          'Charlotte! My girl — come in, come in.',
          'I made boterkoek this morning. Your grandfather\'s recipe, the one Anna brought from Boekel.',
          'Sit down. Tell me everything you\'ve found.',
        ],
        tenley: [
          'Tenley! You\'re exploring the family history — I love that.',
          'The women of this family — you should ask your grandfather about his mother Anna Maria.',
          'She crossed the Atlantic with twelve children. Can you imagine?',
        ],
        knoxley: [
          'My littlest one asking the biggest questions! Come here.',
          'I\'ve been baking — boterkoek, straight from the recipe Anna brought from the Netherlands.',
          'I think you\'re going to find something really special on this adventure.',
        ],
        isabella: ['Isabella! Your dad William and I were just talking about you.', 'I\'m so proud you\'re learning your family history.', 'Come in — there\'s coffee and boterkoek.'],
        henry:    ['Henry! You want to meet everyone — I love that spirit.', 'Start here at home and work your way back. 1539 is a long way!'],
        maxwell:  ['Maxwell! Daily life — you want to know what it\'s really like?', 'Wake up. Make coffee. Drive to work. Come home. That\'s 2026 Mankato.', 'But your ancestors\' daily life? That\'s much more interesting.'],
        raven:    ['Raven! It\'s so good to see you. How is Haarlem?', 'I miss Holland sometimes. The canals, the cheese...', 'Your dad said you\'ve been exploring the family history. Tell me everything!'],
        starling: ['Starling! My little adventurer.', 'You\'re collecting things from every era? That\'s my girl.', 'Come inside — I have something from the attic that might interest you.'],
      },
    },
  ],

  // ── Era 8 · 2026 · Mankato — William's wife Leslie ───────────────────────
  '8_2_1': [
    {
      gedcomId: '@I037@',
      name: 'Leslie',
      given: 'Leslie',
      location: 'mankato',
      era: 8, spawnR: 8, spawnC: 9,
      bodyColor: '#506070', hairColor: '#202818', skinColor: '#d8b890',
      lines: {
        generic: [
          'Hi — I\'m Leslie, William\'s wife. Welcome to Mankato!',
          'We\'re right near Minnesota State University. It\'s a good neighbourhood.',
          'William and I have been here since the kids were babies.',
          'The Van Duynhoven family history is remarkable. I\'m always learning something new.',
        ],
        repeat1: [
          'Good to see you again! William\'s at work but he\'ll be back later.',
          'I was just looking through some old photos of the family.',
          'Have you been to the Blue Earth River yet? Beautiful this time of year.',
        ],
        heart2: [
          'You know what strikes me most about this family?',
          'They crossed an ocean with almost nothing and built something real.',
          'That takes courage. I hope the kids understand how much.',
        ],
        isabella: [
          'Isabella! My girl — come in.',
          'I was just thinking about the crossing. Your great-grandparents on a ship for ten days.',
          'You want to understand why they went. I think about that too.',
        ],
        henry:    ['Henry! Talking to everyone — that\'s a big goal.', 'But honestly? Every person has a story worth knowing.', 'Start with Grandpa Peter John. He remembers the family in Minnesota when it was new.'],
        maxwell:  ['Maxwell! Daily life in every era — I love that.', 'Our daily life is pretty ordinary. But 1539? 1872? That must have been something.', 'Go find out. Come back and tell me.'],
        charlotte: ['Charlotte! You\'re tracing the name — fascinating project.', 'Van Duynhoven, Van Dyn Hoven, Duynhoven... all the same family.', 'Names change. Families persist.'],
        tenley:    ['Tenley! The women of the family.', 'There are so many remarkable women in this line.', 'Go find them. I want to hear all about it when you get back.'],
        knoxley:   ['Knoxley! The littlest one on the biggest quest.', 'You know, I\'ve always thought the youngest ask the best questions.', 'Don\'t let anyone tell you you\'re too small for this adventure.'],
        raven:     ['Raven! How\'s Haarlem? We miss you.', 'You were born there, same city the family came from. That\'s remarkable.'],
        starling:  ['Starling! A collection from every era — brilliant idea.', 'I\'m going to want to see it when you\'re done.'],
      },
    },
  ],

  // ── Era 8 · 2026 · Mankato — Peter John's wife Mary Campbell ─────────────
  '8_3_1': [
    {
      gedcomId: '@I025@',
      name: 'Mary Cecilia Campbell',
      given: 'Mary',
      location: 'mankato',
      era: 8, spawnR: 6, spawnC: 12,
      bodyColor: '#406060', hairColor: '#d8d0c0', skinColor: '#d4b080',  // silver hair
      lines: {
        generic: [
          'I\'m Mary — Mary Campbell, Peter John\'s wife. We came here from Minnesota a long time ago.',
          'The Campbell family came from Scotland generations back. A long journey, just like the Van Duynhovens.',
          'Peter John and I raised our children to know both sides of the family.',
          'There is so much history in this family. I\'m glad someone is still curious about it.',
        ],
        repeat1: [
          'Peter John talks about Boekel sometimes. The fields, the church.',
          'I never saw it. But I feel like I know it from his stories.',
          'That\'s what stories do, I suppose. They carry places across time.',
        ],
        heart2: [
          'Can I show you something?',
          'I have a photo of Johan and Anna on the ship. 1950. They look so young.',
          'Peter John was just a boy then. He doesn\'t talk about the crossing much.',
          'But I think it shaped everything that came after.',
        ],
        charlotte: [
          'Charlotte! You\'re tracing the name through history.',
          'Van Duynhoven, Van Duijnhoven, Van Dyn Hoven — your grandfather always laughed about that.',
          'He said: "The name changed, but we always knew who we were."',
        ],
        tenley: [
          'Tenley! The women of the family — that\'s MY kind of history.',
          'The women kept this family together through everything.',
          'Ask me anything. I know more than I let on.',
        ],
        knoxley: [
          'The youngest one, all the way here to find us.',
          'Your grandfather would be so moved by this.',
          'You have his curiosity, you know. That\'s the rarest thing.',
        ],
        isabella: ['Isabella! You want to understand the crossing.', 'Your great-grandmother Anna Maria was the one who kept everyone together on that ship.', 'Ten days at sea with children. I can\'t imagine.'],
        henry:    ['Henry! You want to meet everyone — then start with us, the ones who remember the most.'],
        maxwell:  ['Maxwell! Daily life — come ask me. I have stories that will surprise you.'],
        raven:    ['Raven! Born in Haarlem, just like your great-great-grandparents.', 'The family went to America and came back. That makes my heart full.'],
        starling: ['Starling! A collection from every time.', 'I have a small smooth stone from Minnesota. Would that count?', 'Your great-grandfather found it by the river in 1955.'],
      },
    },
    // ── Boda Swoboda — husband of Anna Maria van Duynhoven, passionate fisherman ──
    {
      gedcomId: '@I199@',
      name: 'Boda Swoboda',
      given: 'Boda',
      location: 'mankato',
      era: 8, spawnR: 10, spawnC: 8,
      bodyColor: '#4a6030', hairColor: '#d0c0a0', skinColor: '#c89060',
      lines: {
        generic: [
          'Galen James Swoboda — but everyone calls me Boda. Married Anna Maria Van Duynhoven back in \'77.',
          'I\'ve been fishing this pond for forty years. Blue Earth River, too. Nothing beats it.',
          'Early morning, before sunrise, rod in hand — that\'s when I think clearest.',
          'You want to fish? Grab a rod. Best walleye in Sibley County right here.',
        ],
        repeat1: [
          'Caught a 28-inch walleye last Tuesday. Anna didn\'t believe me until I showed her the photo.',
          'The Blue Earth River is quarter-mile west. If you haven\'t fished it, you\'re missing out.',
          'I\'ve been married to a Van Duynhoven for nearly fifty years. Quite a family.',
        ],
        repeat2: [
          'You know what Anna always says? "Boda, the fish will still be there tomorrow." She\'s wrong, but I love her.',
          'Dutch family, this one. Strong tradition of hard work and good food.',
          'There\'s a beautiful quiet on the water at dawn. I understand why they call it "hooked."',
        ],
        heart2: [
          'I\'ll tell you something. I married into this family and I got more than a wife.',
          'The whole Van Duynhoven story — five hundred years, two continents, twelve children on the Boekel farm.',
          'I\'m just a Minnesota boy who loves to fish. But I\'m proud to be part of it.',
        ],
        // ── Character-specific ──
        raven: [
          'Raven! You\'re Arthur\'s kid — I can tell. Same eyes as the whole family.',
          'You know your great-aunt Anna Maria loves fishing too? Must be the Blue Earth River in your blood.',
          'Here — take this old lure. Belongs to someone who uses it. Go fish!',
        ],
        starling: [
          'Starling! Collecting things from every era? Ask your great-aunt Anna about the fishing lures.',
          'I\'ve got one from 1977 — the year we married. Practically a family heirloom.',
        ],
        charlotte: ['Charlotte! Looking for family stories? I\'ve got one: the best fishing stories in Sibley County.',    'Your family is famous here. Van Duynhovens don\'t brag — they just quietly do everything well.'],
        tenley:   ['Tenley! The women of the family? Your great-aunt Anna could outfish anyone in the county.',           'Strong women, this family. I should know — I\'ve been married to one for fifty years.'],
        knoxley:  ['The youngest one! Come here, I\'ll show you how to cast a line.',                                     'Your family goes back to 1539. My family goes back to... last Tuesday\'s catch. Ha!'],
        isabella: ['Isabella! You want to understand why people crossed oceans? Same reason I get up at 4am.',            'For something worth doing. For the people you love.'],
        henry:    ['Henry! Meeting everyone? Then sit down and let me tell you about fishing with your great-uncle Morris.', 'We used to go out at dawn on the Blue Earth. Those were good days.'],
        maxwell:  ['Maxwell — daily life, you said? My daily life is wake up, make coffee, grab the rod.',               'Simple. Good. Exactly the same as your ancestor Dirck tending his fields in 1539.'],
      },
      item: { id:'old_lure', label:'Old Fishing Lure', emoji:'🎣' },
    },
  ],

  // ── Era 8 · 2026 · Mankato — Peter John van Duynhoven (born 1956, age 70) ──
  '8_3_0': [
    {
      gedcomId: '@I023@',
      name: 'Peter John van Duynhoven',
      given: 'Peter John',
      location: 'mankato',
      era: 8, spawnR: 8, spawnC: 8,
      bodyColor: '#5a4830', hairColor: '#d8cdb0', skinColor: '#c89050',
      lines: {
        generic: [
          'Peter John van Duynhoven. Born right here in Minnesota, April 1956.',
          'My parents Johan and Anna came over from Boekel, Netherlands in 1950. I was their fourth child.',
          'I grew up hearing Dutch at the dinner table. Eet smakelijk before every meal.',
          'Seventy years old now. America is the only home I have known. But I carry Boekel in my heart.',
        ],
        repeat1: [
          'I farmed this land for forty years. Retired now, but I still walk the fields every morning.',
          'You know what I miss? The Dutch bakeries my parents always talked about. Boekel rye bread.',
          'Minnesota is home. Always has been. But the roots go deep, all the way back to 1539.',
        ],
        heart2: [
          'I keep a photo of Boekel on my wall. I have never been there, but I know every street name.',
          'My father Johan told me stories about the fields, the church, the neighbours.',
          'He carried Boekel with him all his life. Now I carry it too, even though I was born here.',
        ],
        raven:    ['Raven! Your great-grandparents came from the Netherlands in 1950, and here you are born there.', 'The family went the whole way around. That makes my heart full.'],
        starling: ['Starling! Find Johan in Era 4 and Era 5. He made 1950 sound like yesterday.', 'Your great-great-grandmother Anna kept a Dutch recipe book. It is still in this house.'],
        charlotte: ['Charlotte! You found the family name trail.', 'I was there when your dad Chuck got the Wisconsin forms stamped.'],
        tenley:   ['Tenley! Your grandmother Mary Campbell held everything together.', 'And Anna Cornelissen before her. Tough as nails, both of them.'],
        knoxley:  ['The youngest! Your family goes back to 1539.', 'Great-grandfather Johan documented everything. Go find him in Era 4.'],
        isabella: ['Isabella! Find Johan and Anna in Era 4 for the crossing story.', 'Ten days on the North Atlantic, 1950. They will tell you everything.'],
        henry:    ['Henry! Start with Johan in Era 4, then Gerardus in Era 5, then work back to Dirck.', 'It is a long family. You have the best quest.'],
        maxwell:  ['Maxwell! Tend the land, feed the family, go to church.', 'Same in 1539 as in 2026. Some things should not change.'],
      },
    },
  ],


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

// ── Static screen drops ─────────────────────────────────
// Items guaranteed to appear on specific screens (Knoxley quest stones,
// collectible curiosities). Format: { screenKey, r, c, item }
// Each stone appears once in a different Era 0 screen quadrant.
// decorOnly:true items are visual only — they cannot be picked up.
export const STATIC_SCREEN_DROPS = [
  // Knoxley: deep_roots quest — ancient stones hidden in Era 0 screens
  { screenKey:'0_0_0', r:8, c:6,  item:{ id:'ancient_stone_1', label:'Ancient Stone I',   emoji:'🪨' } },
  { screenKey:'0_0_2', r:6, c:14, item:{ id:'ancient_stone_2', label:'Ancient Stone II',  emoji:'🪨' } },
  { screenKey:'0_2_0', r:9, c:5,  item:{ id:'ancient_stone_3', label:'Ancient Stone III', emoji:'🪨' } },
  { screenKey:'0_3_3', r:7, c:13, item:{ id:'ancient_stone_4', label:'Ancient Stone IV',  emoji:'🪨' } },
  // Previous fishing curiosities — now findable on the ground in their era
  { screenKey:'0_1_0', r:8, c:8,  item:{ id:'old_boot',     label:'Old Boot',        emoji:'👢' } },
  { screenKey:'1_2_1', r:7, c:12, item:{ id:'voc_coin',     label:'VOC Coin',        emoji:'🪙' } },
  { screenKey:'2_1_2', r:9, c:9,  item:{ id:'fr_button',    label:'French Button',   emoji:'🔘' } },
  { screenKey:'3_1_3', r:6, c:10, item:{ id:'iron_gear',    label:'Iron Gear',       emoji:'⚙️' } },
  { screenKey:'4_2_2', r:8, c:11, item:{ id:'flotsam',      label:'Flotsam',         emoji:'🪵' } },
  { screenKey:'5_0_3', r:7, c:8,  item:{ id:'old_lure',     label:'Old Lure',        emoji:'🎣' } },
  { screenKey:'6_3_0', r:6, c:7,  item:{ id:'retro_lure',   label:'Retro Lure',      emoji:'🎣' } },
  { screenKey:'7_2_1', r:9, c:10, item:{ id:'smart_buoy',   label:'Smart Buoy',      emoji:'📡' } },
  { screenKey:'8_2_3', r:8, c:6,  item:{ id:'old_coin',     label:'Old Dutch Coin',  emoji:'🪙' }, location:'haarlem' },

  // ── Era 0 · 1539 Brabant — farm animals ─────────────────────────────────
  { screenKey:'0_1_2', r:9,  c:14, item:{ id:'decor_cow',    label:'Cow',      emoji:'🐄', decorOnly:true } },
  { screenKey:'0_1_2', r:10, c:13, item:{ id:'decor_sheep',  label:'Sheep',    emoji:'🐑', decorOnly:true } },
  { screenKey:'0_1_3', r:7,  c:13, item:{ id:'decor_goat',   label:'Goat',     emoji:'🐐', decorOnly:true } },
  { screenKey:'0_1_3', r:8,  c:15, item:{ id:'decor_chicken',label:'Chicken',  emoji:'🐔', decorOnly:true } },
  { screenKey:'0_2_1', r:6,  c:6,  item:{ id:'decor_pig',    label:'Pig',      emoji:'🐖', decorOnly:true } },
  { screenKey:'0_2_1', r:7,  c:7,  item:{ id:'decor_chicken',label:'Chicken',  emoji:'🐔', decorOnly:true } },

  // ── Era 3 · 1872 Noord-Brabant — potato fields + farm animals ───────────
  { screenKey:'3_2_3', r:5,  c:4,  item:{ id:'potato',       label:'Potato',   emoji:'🥔' } },  // harvestable
  { screenKey:'3_2_3', r:6,  c:7,  item:{ id:'potato',       label:'Potato',   emoji:'🥔' } },
  { screenKey:'3_1_2', r:5,  c:4,  item:{ id:'potato',       label:'Potato',   emoji:'🥔' } },  // farm screen
  { screenKey:'3_1_2', r:6,  c:8,  item:{ id:'decor_cow',    label:'Cow',      emoji:'🐄', decorOnly:true } },
  { screenKey:'3_1_2', r:7,  c:8,  item:{ id:'decor_pig',    label:'Pig',      emoji:'🐖', decorOnly:true } },
  { screenKey:'3_2_1', r:9,  c:13, item:{ id:'decor_horse',  label:'Workhorse',emoji:'🐎', decorOnly:true } },
  { screenKey:'3_2_1', r:10, c:14, item:{ id:'decor_cow',    label:'Cow',      emoji:'🐄', decorOnly:true } },
  { screenKey:'3_1_3', r:7,  c:5,  item:{ id:'decor_sheep',  label:'Sheep',    emoji:'🐑', decorOnly:true } },
  { screenKey:'3_1_3', r:8,  c:6,  item:{ id:'decor_sheep',  label:'Sheep',    emoji:'🐑', decorOnly:true } },

  // ── Era 5 · 1955 Minnesota — corn + farm animals ─────────────────────────
  { screenKey:'5_1_1', r:7,  c:6,  item:{ id:'corn',         label:'Corn',     emoji:'🌽' } },  // harvestable
  { screenKey:'5_1_1', r:8,  c:6,  item:{ id:'decor_cow',    label:'Dairy Cow',emoji:'🐄', decorOnly:true } },
  { screenKey:'5_1_1', r:9,  c:6,  item:{ id:'decor_cow',    label:'Dairy Cow',emoji:'🐄', decorOnly:true } },
  { screenKey:'5_1_2', r:6,  c:13, item:{ id:'decor_horse',  label:'Horse',    emoji:'🐎', decorOnly:true } },
  { screenKey:'5_1_2', r:7,  c:14, item:{ id:'decor_pig',    label:'Pig',      emoji:'🐖', decorOnly:true } },
  { screenKey:'5_1_2', r:8,  c:13, item:{ id:'decor_chicken',label:'Chicken',  emoji:'🐔', decorOnly:true } },
  { screenKey:'5_0_0', r:8,  c:7,  item:{ id:'decor_sheep',  label:'Sheep',    emoji:'🐑', decorOnly:true } },
  { screenKey:'5_0_0', r:9,  c:8,  item:{ id:'decor_sheep',  label:'Sheep',    emoji:'🐑', decorOnly:true } },

  // ── Era 1 · 1660 Dutch Golden Age — Polder Farm + Fishermen's Wharf ───────
  { screenKey:'1_3_2', r:7,  c:6,  item:{ id:'decor_cow',     label:'Cow',      emoji:'🐄', decorOnly:true } },
  { screenKey:'1_3_2', r:8,  c:7,  item:{ id:'decor_sheep',   label:'Sheep',    emoji:'🐑', decorOnly:true } },
  { screenKey:'1_3_2', r:9,  c:5,  item:{ id:'decor_chicken', label:'Chicken',  emoji:'🐔', decorOnly:true } },
  { screenKey:'1_2_0', r:7,  c:8,  item:{ id:'decor_horse',   label:'Dray Horse',emoji:'🐎', decorOnly:true } },

  // ── Era 2 · 1799 Napoleonic — farmland animals ────────────────────────────
  { screenKey:'2_1_2', r:10, c:12, item:{ id:'decor_cow',     label:'Cow',      emoji:'🐄', decorOnly:true } },
  { screenKey:'2_1_2', r:11, c:11, item:{ id:'decor_sheep',   label:'Sheep',    emoji:'🐑', decorOnly:true } },
  { screenKey:'2_3_1', r:6,  c:6,  item:{ id:'decor_cow',     label:'Cow',      emoji:'🐄', decorOnly:true } },
  { screenKey:'2_3_1', r:7,  c:5,  item:{ id:'decor_chicken', label:'Chicken',  emoji:'🐔', decorOnly:true } },
];
