-- M2 S2.2 fix — tylko trener może TWORZYĆ zaproszenia (nie tylko "swoje").
-- Poprzednia polityka `invites_trainer_all` sprawdzała jedynie własność
-- (trainer_id = auth.uid()), więc zalogowany KLIENT mógł wywołać server action
-- createInviteAction z trainer_id = własne uid i sfałszować zaproszenie —
-- po jego akceptacji zyskując podopiecznego wbrew regule "jeden klient → jeden trener".
--
-- Rola dopisana wyłącznie w WITH CHECK: klient i tak nie ma własnych wierszy invites
-- (USING po trainer_id go nie wpuści do SELECT/UPDATE/DELETE), więc USING zostaje
-- czystą kontrolą własności; to WITH CHECK blokuje próbę wstawienia nowego wiersza.

drop policy "invites_trainer_all" on public.invites;

create policy "invites_trainer_all"
  on public.invites for all
  to authenticated
  using ((select auth.uid()) = trainer_id)
  with check (
    (select auth.uid()) = trainer_id
    and private.current_user_role() = 'trainer'
  );
