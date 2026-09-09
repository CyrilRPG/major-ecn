import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {attemptProgress} from '../src/lib/arena/attempt-progress';
import {publicRules} from '../src/lib/arena/texts';

test('une reprise suit les réponses enregistrées, sans sauter ni rejouer une question', () => {
  const progress=attemptProgress(['a','b','c'],[{question_id:'a',validated_at:'2026-09-09T10:00:00Z'}]);
  assert.equal(progress.nextId,'b'); assert.equal(progress.finished,false);
  assert.equal(progress.lastValidatedAt,'2026-09-09T10:00:00Z');
  assert.equal(attemptProgress(['a'],[{question_id:'a',validated_at:'2026-09-09T10:00:00Z'}]).finished,true);
});
test('les règles utilisent le format et le seuil du tournoi sans inventer une fenêtre de 24 heures', () => {
  const rules=publicRules({questions_per_round:20,seconds_per_question:45,threshold_pct:65}).join(' ');
  assert.match(rules,/20 questions/); assert.match(rules,/45 s/); assert.match(rules,/65 %/);
  assert.doesNotMatch(rules,/ouverte 24 h|Sous 50 %/);
});
test('la base conserve les marques privées et impose un ordre unique de validation', async () => {
  const db=new PGlite();
  const a='00000000-0000-4000-8000-000000000001', q1='00000000-0000-4000-8000-000000000011',q2='00000000-0000-4000-8000-000000000012';
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create table arena_attempts(id uuid primary key,status text,question_order uuid[]);
      create table arena_questions(id uuid primary key);
      create table arena_answers(attempt_id uuid,question_id uuid, unique(attempt_id,question_id));
      insert into arena_questions values ('${q1}'),('${q2}');
      insert into arena_attempts values ('${a}','in_progress',array['${q1}','${q2}']::uuid[]);`);
    await db.exec(await readFile('supabase/migrations/20260909170000_arena_functional_actions.sql','utf8'));
    await assert.rejects(db.query('insert into arena_answers values ($1,$2)',[a,q2]),/question en cours/);
    await db.query('insert into arena_answers values ($1,$2)',[a,q1]);
    await assert.rejects(db.query('insert into arena_answers values ($1,$2)',[a,q1]),/unique constraint/);
    await db.query('insert into arena_question_marks(attempt_id,question_id) values ($1,$2)',[a,q1]);
    assert.equal((await db.query('select * from arena_question_marks')).rows.length,1);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from arena_question_marks'),/permission denied/);
    await db.exec('reset role');
    await db.query("update arena_attempts set status='submitted' where id=$1",[a]);
    await assert.rejects(db.query('insert into arena_answers values ($1,$2)',[a,q2]),/terminée/);
  } finally { await db.close(); }
});
