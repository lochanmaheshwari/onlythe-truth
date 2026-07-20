const { createClient } = require(process.cwd() + '/node_modules/@supabase/supabase-js');
const fs = require('fs');

let supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbmVjeGxjd3h5aXF5b29ienh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNzQzNzUsImV4cCI6MjA5ODY1MDM3NX0.7VOeQg8sIm83zejP1PQ_Bp13BLbCaMG2tlCV0Rj4bzY';

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const serviceKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
  if (serviceKeyMatch && serviceKeyMatch[1]) {
    supabaseKey = serviceKeyMatch[1].trim();
  }
} catch (e) {}

const supabaseUrl = 'https://zmnecxlcwxyiqyoobzxu.supabase.co';
const supabase = createClient(supabaseUrl, supabaseKey);

const reelsToUpdate = [
  'https://www.instagram.com/reel/DbBuctosdQX/',
  'https://www.instagram.com/reel/DbBuctosdQX'
];

const jantarMantarAnalysis = {
  headline: 'Delhi Jantar Mantar CJP Protest: Clashes, Police Escalation, and Staged Media Claims',
  category: 'indian_politics',
  uploadedAt: new Date().toISOString(),
  viewCount: 1,
  fight: 'The narrative clash over the CJP protest at Jantar Mantar in Delhi centers on the cause of violence and whether footage of destruction was staged. The reel speaker asserts that the majority of demonstrators were peaceful, vehicles and stones were staged beforehand, and police escalation triggered the violence. Eyewitness accounts support that the crowd remained peaceful for the bulk of the day, consisting mostly of students. Official police accounts initially denied force or detentions before later reporting over 118 injured personnel and ~60 injured protesters. Critical contention also surrounds communication blackouts and the unexplained closure of four metro stations during the event.',
  left: {
    summary: 'Student groups and civil rights advocates maintain that the protest was peaceful and orderly for most of the day. They highlight that police escalation and route blockades triggered clashes, while pre-damaged vehicles and pre-positioned stones were already present on-site before crowd assembly.',
    keyPoints: [
      'Eyewitnesses confirm damaged vehicles and stones were already present on-site prior to crowd arrival.',
      'Multiple officers operated without name tags or identification tags.',
      'Mobile internet blackouts and metro station shutdowns restricted real-time citizen reporting.'
    ],
    strongestPoint: 'Timestamped eyewitness testimony and live footage show students demonstrating peacefully for hours prior to heavy police barricading.',
    blindSpot: 'Does not detail how crowd frustration at police line blockades contributed to eventual physical confrontations.'
  },
  right: {
    summary: 'Delhi Police and government officials maintain that security forces acted to maintain public order and secure Parliament routes. Official reports state that over 118 personnel sustained injuries while managing crowd lines and enforcing security cordons.',
    keyPoints: [
      'Delhi Police cited security requirements to restrict unpermitted marches towards Parliament.',
      'Official statements recorded 118 injured security personnel during dispersal.',
      'Authorities urged the public not to share unverified viral claims.'
    ],
    strongestPoint: 'Emphasizes the legal mandate of law enforcement to protect government infrastructure and prevent unauthorized marches.',
    blindSpot: 'Initial police statements claimed no force or detentions occurred, contradicting subsequent casualty figures listing ~60 injured protesters and 118 injured officers.'
  },
  reality: 'A detailed timeline of the Jantar Mantar CJP protest demonstrates a sharp conflict between official releases and eyewitness accounts. For most of the day, the assembly was peaceful, consisting mostly of students standing, sitting, chanting, and waiting. Friction escalated when police blocked the route to Parliament. Eyewitnesses confirmed that damaged vehicles and stones were already present on-site before the crowd arrived. Furthermore, internet dropouts and four metro station closures limited real-time media transmission. While Delhi Police initially reported no use of force or detentions, later official statements reported around 60 injured protesters and over 118 injured personnel.',
  table: [
    {
      said: 'The overwhelming majority of people who came out were there to protest peacefully.',
      truth: 'First-hand eyewitness accounts confirm the protest was peaceful and orderly for most of the day, consisting primarily of students standing, sitting, chanting, and waiting.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    },
    {
      said: 'Broken vehicles and rocks were staged or pre-positioned to shape the narrative of violence.',
      truth: 'Eyewitnesses confirm that damaged vehicles and stones were already present at the Jantar Mantar site beforehand, rather than brought in or destroyed by the crowd on-site.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    },
    {
      said: 'Police officers operated without identification and police escalation triggered the violence.',
      truth: 'Multiple uniformed officers were observed operating without name tags, and escalation into violence originated from police action and route blockades rather than crowd provocation.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    },
    {
      said: 'Delhi Police issued conflicting statements regarding force used and detentions.',
      truth: 'Delhi Police initially released statements claiming no force was used and no detentions occurred, but later officially reported ~60 injured protesters and over 118 injured personnel.',
      verdict: 'TRUTH',
      source: 'Official Statements',
      link: ''
    },
    {
      said: 'Internet connectivity and metro access were shut down during critical hours of the protest.',
      truth: 'Mobile data dropped across the area around the time police blocked the route to Parliament, and four metro stations were shut down without prior public explanation.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    }
  ]
};

async function updateAll() {
  // First delete existing rows for these URLs to ensure clean insert
  for (const url of reelsToUpdate) {
    await supabase.from('instagram_cache').delete().eq('url', url);
    
    const { data, error } = await supabase
      .from('instagram_cache')
      .insert({
        url: url,
        data: jantarMantarAnalysis,
        view_count: 1
      })
      .select();

    if (error) {
      console.error(`Failed to insert for ${url}:`, error);
    } else {
      console.log(`Updated cache entry for ${url}, ID: ${data[0]?.id}`);
    }
  }
}

updateAll();
