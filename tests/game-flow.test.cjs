const test = require("node:test");
const assert = require("node:assert/strict");
const { getProgramDayIndex } = require("../APP/utils.ts");

test("seven-day plan follows the API's UTC day boundary", () => {
  const startedAt = "2026-11-09T23:50:00Z";

  assert.equal(getProgramDayIndex(startedAt, new Date("2026-11-09T23:59:00Z")), 0);
  assert.equal(getProgramDayIndex(startedAt, new Date("2026-11-10T00:01:00Z")), 1);
  assert.equal(getProgramDayIndex(startedAt, new Date("2026-11-15T12:00:00Z")), 6);
});

test("seven-day plan has no available card outside its week", () => {
  const startedAt = "2026-11-09T10:00:00Z";

  assert.equal(getProgramDayIndex(startedAt, new Date("2026-11-08T23:00:00Z")), null);
  assert.equal(getProgramDayIndex(startedAt, new Date("2026-11-16T00:00:00Z")), null);
  assert.equal(getProgramDayIndex("invalid", new Date("2026-11-09T12:00:00Z")), null);
});
