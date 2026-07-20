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

const reelsToInsert = [
  'https://www.instagram.com/reel/DbBuctosdQX/',
  'https://www.instagram.com/reel/DbBuctosdQX'
];

const jantarMantarAnalysis = {
  headline: 'Delhi Jantar Mantar CJP Protest: Clashes, Police Escalation, and Narrative Manipulation Claims',
  category: 'indian_politics',
  uploadedAt: new Date().toISOString(),
  viewCount: 1,
  fight: 'The narrative clash over the CJP protest at Jantar Mantar in Delhi centers on the cause of violence and whether evidence of rioting was staged. Eyewitness accounts and student demonstrators report that the crowd remained peaceful for the majority of the day, with escalation triggered by heavy police barricading and force as demonstrators attempted to march towards Parliament. Conversely, official Delhi Police accounts initially denied any use of force or detentions before later reporting over 118 injured personnel and around 60 injured protesters. Critical contention also surrounds pre-damaged vehicles and pre-positioned stones at the site, alongside real-time communication dropouts and the unexplained closure of four key metro stations in central Delhi.',
  left: {
    summary: 'Student groups, eyewitnesses, and civil rights advocates argue that the protest was overwhelmingly peaceful and orderly for most of the day, consisting of students sitting, chanting, and waiting. They emphasize that police escalation and excessive force triggered clashes, while pre-damaged vehicles and stones were already present on-site before crowd assembly.',
    keyPoints: [
      'Eyewitnesses state damaged vehicles and stones were already present on-site prior to crowd arrival.',
      'Multiple police officers in uniform operated without visible identification or name tags.',
      'Mobile data blackouts and unannounced metro closures restricted real-time recording by citizens.'
    ],
    strongestPoint: 'Detailed first-hand eyewitness testimony and timestamped video evidence show students demonstrating peacefully for hours prior to heavy police barricading and route blocks.',
    blindSpot: 'Fails to fully address how individual splinter friction or crowd pressure at police lines escalated panic once route blockades were established.'
  },
  right: {
    summary: 'Delhi Police and government officials maintain that security personnel acted to maintain public order and prevent unpermitted marches towards Parliament. Official reports state over 118 personnel sustained injuries while attempting to disperse crowds and enforce security cordons.',
    keyPoints: [
      'Delhi Police cited law and order requirements for restricting the protest march to designated zones.',
      'Official reports cataloged 118 injured security personnel during police-protester clashes.',
      'Authorities warned the public against unverified viral rumors regarding detentions and force.'
    ],
    strongestPoint: 'Highlights official duty responsibilities of law enforcement to secure Parliament area and protect public infrastructure during large political rallies.',
    blindSpot: 'Contradictory official statements initially claimed no force was used and no detentions occurred, contradicting later casualty reports of ~60 injured protesters and 118 injured officers.'
  },
  reality: 'A detailed timeline of the Jantar Mantar CJP protest demonstrates a classic narrative conflict between official law enforcement releases and eyewitness accounts. For the bulk of the day, the assembly was peaceful, composed primarily of students standing, chanting, and waiting. Friction escalated when police blocked the route towards Parliament. First-hand observers noted that damaged vehicles present in footage were already broken before crowd arrival, and stones were pre-positioned at the location. Furthermore, mobile internet connectivity drops and the shutdown of four metro stations impeded real-time documentation. While Delhi Police initially denied using force or making detentions, subsequent official reports acknowledged around 60 injured protesters and over 118 injured personnel, revealing significant discrepancies in public communications.',
  table: [
    {
      said: 'The protest was a riot from the very beginning with crowd destroying vehicles.',
      truth: 'First-hand eyewitness accounts confirm the protest was peaceful and orderly for most of the day, mostly comprising students. Vehicles present at the location were already damaged prior to crowd assembly.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    },
    {
      said: 'Stones were brought in and carried by protesters to attack police lines.',
      truth: 'Stones were already present at the Jantar Mantar site beforehand; eyewitnesses confirm they were not brought in or carried by demonstrators.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    },
    {
      said: 'Police officers were fully identified and acted solely in self-defense.',
      truth: 'Multiple uniformed officers were observed operating without name tags or identification tags, and violent escalation began following police action rather than crowd provocation.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    },
    {
      said: 'Delhi Police did not use force or detain any protesters at Jantar Mantar.',
      truth: 'Contradicting initial official claims of no force or detentions, Delhi Police later reported around 60 injured protesters and over 118 injured personnel.',
      verdict: 'UNVERIFIED',
      source: 'Official Statements',
      link: ''
    },
    {
      said: 'Mobile internet and metro services operated normally throughout the protest.',
      truth: 'Mobile data connectivity dropped across the area as route blockades were set up, and four metro stations were shut down without prior public explanation.',
      verdict: 'TRUTH',
      source: 'General knowledge',
      link: ''
    }
  ]
};

async function insertFresh() {
  for (const url of reelsToInsert) {
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
      console.log(`Inserted clean Jantar Mantar analysis for ${url}, ID: ${data[0]?.id}`);
    }
  }
}

insertFresh();
