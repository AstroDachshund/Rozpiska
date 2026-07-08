// Seed banku ćwiczeń dla trenera dev (trener@rozpiska.local). Idempotentny.
// Uruchom po `npm run db:seed:users`:  npm run db:seed:exercises
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.test.local' });
config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error('Brak SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (zob. .env.test.local).');
}
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: list } = await admin.auth.admin.listUsers();
const trainer = list.users.find((u) => u.email === 'trener@rozpiska.local');
if (!trainer) throw new Error('Brak trenera — uruchom najpierw `npm run db:seed:users`.');
const trainerId = trainer.id;

const TAGS = {
  muscle_group: ['Klatka', 'Plecy', 'Nogi', 'Barki', 'Biceps', 'Triceps', 'Brzuch', 'Pośladki'],
  equipment: ['Sztanga', 'Hantle', 'Maszyna', 'Wyciąg', 'Masa ciała', 'Kettlebell'],
  movement_pattern: [
    'Pchanie poziome',
    'Pchanie pionowe',
    'Ciągnięcie poziome',
    'Ciągnięcie pionowe',
    'Przysiad',
    'Zawias biodrowy',
  ],
};

// Upsert tagów (unique trainer_id, category, name) → mapa nazwa→id.
const tagId = {};
for (const [category, names] of Object.entries(TAGS)) {
  for (const name of names) {
    const { data, error } = await admin
      .from('exercise_tags')
      .upsert({ trainer_id: trainerId, category, name }, { onConflict: 'trainer_id,category,name' })
      .select('id, name')
      .single();
    if (error) throw error;
    tagId[`${category}:${name}`] = data.id;
  }
}

const EXERCISES = [
  {
    name: 'Przysiad ze sztangą',
    youtube_url: 'https://www.youtube.com/watch?v=Uv_DKDl7EjA',
    technique_note: 'Sztanga na plecach, kolana śledzą stopy, zejście do równoległości ud.',
    tags: [
      'muscle_group:Nogi',
      'muscle_group:Pośladki',
      'equipment:Sztanga',
      'movement_pattern:Przysiad',
    ],
  },
  {
    name: 'Wyciskanie sztangi na ławce płaskiej',
    youtube_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    technique_note: 'Łopatki ściągnięte, sztanga na linii sutków, łokcie ~45°.',
    tags: [
      'muscle_group:Klatka',
      'muscle_group:Triceps',
      'equipment:Sztanga',
      'movement_pattern:Pchanie poziome',
    ],
  },
  {
    name: 'Martwy ciąg klasyczny',
    youtube_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    technique_note: 'Neutralny kręgosłup, sztanga blisko goleni, napęd biodrami.',
    tags: [
      'muscle_group:Plecy',
      'muscle_group:Nogi',
      'equipment:Sztanga',
      'movement_pattern:Zawias biodrowy',
    ],
  },
  {
    name: 'Wiosłowanie sztangą w opadzie',
    youtube_url: 'https://www.youtube.com/watch?v=9efgcAjQe7E',
    technique_note: 'Tułów ~45°, sztanga do pępka, łopatki ściągane na końcu.',
    tags: [
      'muscle_group:Plecy',
      'muscle_group:Biceps',
      'equipment:Sztanga',
      'movement_pattern:Ciągnięcie poziome',
    ],
  },
  {
    name: 'Podciąganie na drążku',
    youtube_url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    technique_note: 'Pełen zakres, broda nad drążek, kontrola opuszczania.',
    tags: [
      'muscle_group:Plecy',
      'muscle_group:Biceps',
      'equipment:Masa ciała',
      'movement_pattern:Ciągnięcie pionowe',
    ],
  },
  {
    name: 'Wyciskanie hantli nad głowę',
    youtube_url: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    technique_note: 'Napięty brzuch, hantle wyciskane pionowo, bez przeprostu lędźwi.',
    tags: [
      'muscle_group:Barki',
      'muscle_group:Triceps',
      'equipment:Hantle',
      'movement_pattern:Pchanie pionowe',
    ],
  },
  {
    name: 'Uginanie ramion ze sztangą',
    youtube_url: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    technique_note: 'Łokcie przy tułowiu, bez bujania, pełny zakres.',
    tags: ['muscle_group:Biceps', 'equipment:Sztanga', 'movement_pattern:Ciągnięcie poziome'],
  },
  {
    name: 'Wykroki chodzone z hantlami',
    youtube_url: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
    technique_note: 'Długi krok, kolano zakroczne blisko podłoża, tułów pionowo.',
    tags: [
      'muscle_group:Nogi',
      'muscle_group:Pośladki',
      'equipment:Hantle',
      'movement_pattern:Przysiad',
    ],
  },
];

for (const ex of EXERCISES) {
  const { data: row, error } = await admin
    .from('exercises')
    .upsert({
      trainer_id: trainerId,
      name: ex.name,
      technique_note: ex.technique_note,
      youtube_url: ex.youtube_url,
    })
    .select('id')
    .single();
  if (error) throw error;
  const links = ex.tags
    .map((key) => tagId[key])
    .filter(Boolean)
    .map((tag_id) => ({ exercise_id: row.id, tag_id }));
  if (links.length > 0) {
    await admin.from('exercise_tag_links').upsert(links, { onConflict: 'exercise_id,tag_id' });
  }
  console.log(`= ćwiczenie: ${ex.name} (${links.length} tagów)`);
}

console.log('✓ Seed banku ćwiczeń gotowy.');
