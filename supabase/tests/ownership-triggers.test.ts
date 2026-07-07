// Testy triggerów spójności właściciela na drzewie struktury (decyzja §9.9).
// Triggery działają NIEZALEŻNIE od RLS — dlatego seedujemy service_role'em (bypass RLS),
// żeby sprawdzić samą warstwę triggerów/CHECK-ów w Postgresie.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, cleanupUsers, createUser, seedTemplateTree, type TestUser } from './helpers';

let trainerA: TestUser;
let trainerB: TestUser;
let treeA: Awaited<ReturnType<typeof seedTemplateTree>>;

beforeAll(async () => {
  trainerA = await createUser('trainer', 'Trener A (triggers)');
  trainerB = await createUser('trainer', 'Trener B (triggers)');
  treeA = await seedTemplateTree(trainerA.userId);
});

afterAll(async () => {
  await cleanupUsers();
});

describe('dziedziczenie i niezmienność właściciela', () => {
  it('dziedziczy trainer_id z rodzica, gdy nie podano jawnie', async () => {
    const { data } = await admin
      .from('plan_days')
      .select('trainer_id, client_id, template_id')
      .eq('week_id', treeA.weekId);
    expect(data?.[0]?.trainer_id).toBe(trainerA.userId);
    expect(data?.[0]?.client_id).toBeNull(); // szablon → client_id NULL
    expect(data?.[0]?.template_id).toBe(treeA.templateId);
  });

  it('ODRZUCA ręcznie wstawiony wiersz struktury z niezgodnym trainer_id', async () => {
    // week należy do trenera A; próbujemy podpiąć dzień z trainer_id = trener B.
    const { error } = await admin.from('plan_days').insert({
      week_id: treeA.weekId,
      name: 'Dzień z podmienionym trenerem',
      trainer_id: trainerB.userId,
    });
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/trainer_id .* niezgodny z rodzicem/);
  });

  it('ODRZUCA zmianę trainer_id istniejącego wiersza (kolumny niezmienne)', async () => {
    const { error } = await admin
      .from('plan_days')
      .update({ trainer_id: trainerB.userId })
      .eq('week_id', treeA.weekId);
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/niezmienne/);
  });
});

describe('CHECK-i integralności drzewa', () => {
  it('ODRZUCA plan_weeks bez rodzica (ani template, ani assigned)', async () => {
    const { error } = await admin.from('plan_weeks').insert({ week_number: 1 });
    expect(error).not.toBeNull();
  });

  it('ODRZUCA plan_weeks z DWOMA rodzicami naraz (naruszenie XOR)', async () => {
    // Potrzebny prawdziwy assigned_plan, by przejść FK; XOR i tak odrzuci.
    const client = await createUser('client', 'Klient XOR');
    const { data: ap } = await admin
      .from('assigned_plans')
      .insert({ trainer_id: trainerA.userId, client_id: client.userId, name: 'XOR' })
      .select('id')
      .single();

    const { error } = await admin.from('plan_weeks').insert({
      week_number: 1,
      template_id: treeA.templateId,
      assigned_plan_id: (ap as { id: string }).id,
    });
    expect(error).not.toBeNull();
  });
});
