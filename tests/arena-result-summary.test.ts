import test from "node:test";
import assert from "node:assert/strict";
import { resultBreakdown, performanceAnalysis } from "../src/lib/arena/result-summary";

test('l’analyse compare les scores pondérés par type et évite les appréciations sans contraste', () => {
  assert.deepEqual(performanceAnalysis([{type:'QRU',score:2,max:2},{type:'QRM',score:1,max:4},{type:'QRM',score:0,max:1}]), {strong:'QRU',weak:'QRM'});
  assert.equal(performanceAnalysis([{type:'QRU',score:1,max:2},{type:'QRM',score:2,max:4}]),undefined);
  assert.equal(performanceAnalysis([]),undefined);
});

test("results partition active questions and count unanswered questions as unsuccessful", () => {
  const questions = ["perfect", "partial", "wrong", "unanswered"].map((id) => ({
    id,
    neutralized_at: null,
  }));
  const answers = [
    { question_id: "perfect", is_perfect: true, score: 2 },
    { question_id: "partial", is_perfect: false, score: 0.2 },
    { question_id: "wrong", is_perfect: false, score: 0 },
    { question_id: "other-round", is_perfect: true, score: 1 },
  ];
  assert.deepEqual(resultBreakdown(questions, answers), {
    perfect: 1,
    partial: 1,
    failed: 2,
  });
});

test("neutralized questions do not affect the response breakdown", () => {
  assert.deepEqual(
    resultBreakdown(
      [{ id: "neutralized", neutralized_at: "2026-09-09T12:00:00Z" }],
      [{ question_id: "neutralized", is_perfect: true, score: 1 }],
    ),
    { perfect: 0, partial: 0, failed: 0 },
  );
});

test("ungraded and expired empty responses never count as successful", () => {
  assert.deepEqual(
    resultBreakdown(
      [{ id: "empty", neutralized_at: null }],
      [{ question_id: "empty", is_perfect: null, score: null }],
    ),
    { perfect: 0, partial: 0, failed: 1 },
  );
});
