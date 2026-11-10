const test = require("node:test");
const assert = require("node:assert/strict");
const { getProgramDayIndex } = require("../APP/utils.ts");

test("seven-day plan changes cards at local midnight", () => {
  const startedAt = new Date(2026, 10, 9, 23, 50).toISOString();

  assert.equal(getProgramDayIndex(startedAt, new Date(2026, 10, 9, 23, 59)), 0);
  assert.equal(getProgramDayIndex(startedAt, new Date(2026, 10, 10, 0, 1)), 1);
  assert.equal(getProgramDayIndex(startedAt, new Date(2026, 10, 15, 12)), 6);
});

test("seven-day plan has no available card outside its week", () => {
  const startedAt = new Date(2026, 10, 9, 10).toISOString();

  assert.equal(getProgramDayIndex(startedAt, new Date(2026, 10, 8, 23)), null);
  assert.equal(getProgramDayIndex(startedAt, new Date(2026, 10, 16, 0)), null);
  assert.equal(getProgramDayIndex("invalid", new Date(2026, 10, 9)), null);
});
