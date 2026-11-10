const test = require("node:test");
const assert = require("node:assert/strict");

process.env.EXPO_PUBLIC_API_URL = "http://localhost:8000/";
const api = require("../APP/api.ts");

test("weekly program uses the backend's numeric patient and card IDs", async () => {
  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({
      id: 8, patient_id: 3, card_ids: [11, 12, 13, 14, 15, 16, 17], started_at: "2026-11-09T12:00:00Z"
    }) };
  };
  try {
    const result = await api.createProgram("token", {
      id: "draft", patientId: "u3", cardIds: [11, 12, 13, 14, 15, 16, 17].map((id) => `c${id}`),
      startedAt: "2026-11-09T12:00:00Z"
    });
    assert.equal(request.url, "http://localhost:8000/programs");
    assert.equal(request.options.method, "POST");
    assert.equal(request.options.headers.Authorization, "Bearer token");
    assert.deepEqual(JSON.parse(request.options.body), {
      patient_id: 3, card_ids: [11, 12, 13, 14, 15, 16, 17]
    });
    assert.equal(result.id, "g8");
  } finally { global.fetch = originalFetch; }
});

test("patient and therapist answers use the supported responses endpoint", async () => {
  const originalFetch = global.fetch;
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({
      id: requests.length, patient_id: 3, card_id: 11, mode: requests.length === 1 ? "daily" : "session",
      answer: "resposta", note: null, created_at: "2026-11-09T12:00:00Z"
    }) };
  };
  try {
    await api.createResponse("token", {
      id: "draft", patientId: "u3", cardId: "c11", mode: "daily",
      programId: "g8", programDay: 1, answer: "resposta", createdAt: "2026-11-09T12:00:00Z"
    });
    await api.createResponse("token", {
      id: "draft", patientId: "u3", cardId: "c11", mode: "session",
      sessionGameId: "s1", answer: "resposta", createdAt: "2026-11-09T12:00:00Z"
    }, "u3");
    assert.deepEqual(requests, [
      { url: "http://localhost:8000/responses", body: { card_id: 11, mode: "daily", answer: "resposta", note: null } },
      { url: "http://localhost:8000/responses", body: { card_id: 11, mode: "session", answer: "resposta", note: null, patient_id: 3 } }
    ]);
  } finally { global.fetch = originalFetch; }
});
