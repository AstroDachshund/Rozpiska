// Testy integracyjne RLS — izolacja tenantów. To testy BEZPIECZEŃSTWA (§ testing policy):
// nigdy nie osłabiamy ani nie pomijamy. Uruchamiane przeciw lokalnemu Supabase.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  anon,
  cleanupUsers,
  createUser,
  linkClient,
  seedAssignedPlan,
  seedTemplateTree,
  type TestUser,
} from './helpers';

let trainerA: TestUser;
let trainerB: TestUser;
let clientA1: TestUser;
let clientB1: TestUser;
let treeA: Awaited<ReturnType<typeof seedTemplateTree>>;
let planA1: Awaited<ReturnType<typeof seedAssignedPlan>>;

beforeAll(async () => {
  trainerA = await createUser('trainer', 'Trener A');
  trainerB = await createUser('trainer', 'Trener B');
  clientA1 = await createUser('client', 'Klient A1');
  clientB1 = await createUser('client', 'Klient B1');

  await linkClient(trainerA.userId, clientA1.userId, 'active');
  await linkClient(trainerB.userId, clientB1.userId, 'active');

  treeA = await seedTemplateTree(trainerA.userId);
  planA1 = await seedAssignedPlan(trainerA.userId, clientA1.userId);
});

afterAll(async () => {
  await cleanupUsers();
});

describe('izolacja między trenerami', () => {
  it('trener B nie widzi ćwiczeń trenera A', async () => {
    const { data } = await trainerB.client
      .from('exercises')
      .select('id')
      .eq('id', treeA.exerciseId);
    expect(data).toEqual([]);
  });

  it('trener B nie widzi szablonów trenera A', async () => {
    const { data } = await trainerB.client
      .from('plan_templates')
      .select('id')
      .eq('id', treeA.templateId);
    expect(data).toEqual([]);
  });

  it('trener B nie widzi przypisanych planów trenera A', async () => {
    const { data } = await trainerB.client
      .from('assigned_plans')
      .select('id')
      .eq('id', planA1.assignedPlanId);
    expect(data).toEqual([]);
  });
});

describe('widoczność dla klienta', () => {
  it('klient nie widzi ŻADNEGO szablonu (tylko przypisania)', async () => {
    const { data } = await clientA1.client.from('plan_templates').select('id');
    expect(data).toEqual([]);
  });

  it('klient A1 widzi własny przypisany plan i jego drzewo', async () => {
    const { data: plan } = await clientA1.client
      .from('assigned_plans')
      .select('id')
      .eq('id', planA1.assignedPlanId)
      .maybeSingle();
    expect(plan?.id).toBe(planA1.assignedPlanId);

    const { data: sets } = await clientA1.client
      .from('plan_sets')
      .select('id')
      .eq('assigned_plan_id', planA1.assignedPlanId);
    expect(sets?.length).toBeGreaterThan(0);
  });

  it('klient B1 nie widzi planu klienta A1', async () => {
    const { data } = await clientB1.client
      .from('assigned_plans')
      .select('id')
      .eq('id', planA1.assignedPlanId);
    expect(data).toEqual([]);
  });

  it('klient nie widzi wierszy struktury szablonu (client_id IS NULL)', async () => {
    const { data } = await clientA1.client.from('plan_sets').select('id').eq('id', treeA.planSetId);
    expect(data).toEqual([]);
  });

  it('klient A1 widzi ćwiczenia banku swojego trenera (podgląd wideo/notatki)', async () => {
    const { data } = await clientA1.client
      .from('exercises')
      .select('id')
      .eq('id', treeA.exerciseId);
    expect(data?.length).toBe(1);
  });
});

describe('klient zarchiwizowany = read-only (§9.4)', () => {
  it('widzi swój plan, ale nie może zalogować serii', async () => {
    const archived = await createUser('client', 'Klient zarchiwizowany');
    const trainerC = await createUser('trainer', 'Trener C');
    await linkClient(trainerC.userId, archived.userId, 'archived');
    const plan = await seedAssignedPlan(trainerC.userId, archived.userId);

    // SELECT działa
    const { data: visible } = await archived.client
      .from('assigned_plans')
      .select('id')
      .eq('id', plan.assignedPlanId);
    expect(visible?.length).toBe(1);

    // INSERT sesji — odrzucony (status != 'active')
    const { error } = await archived.client.from('workout_sessions').insert({
      assigned_plan_id: plan.assignedPlanId,
    });
    expect(error).not.toBeNull();
  });
});

describe('anon nie widzi niczego', () => {
  it('anonimowy klient dostaje pustkę na profiles/exercises/assigned_plans', async () => {
    for (const table of ['profiles', 'exercises', 'assigned_plans'] as const) {
      const { data } = await anon.from(table).select('id');
      expect(data ?? []).toEqual([]);
    }
  });
});
