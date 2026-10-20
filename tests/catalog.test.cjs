const { test } = require("node:test");
const assert = require("node:assert/strict");
const { cards, classifications, decks, themes } = require("../APP/data.ts");
const { drawCard, findCards, pickDailyCards } = require("../APP/catalog.ts");

test("demo catalog has valid theme, deck and classification relationships", () => {
  assert.equal(themes.length, 3);
  assert.equal(decks.length, 3);
  assert.equal(cards.length, 21);
  for (const deck of decks) assert.ok(themes.some((theme) => theme.id === deck.themeId));
  for (const card of cards) {
    assert.ok(decks.some((deck) => deck.id === card.deckId));
    assert.ok(classifications.includes(card.classification));
  }
});

test("search matches accents and identifies origin", () => {
  const found = findCards(cards, decks, themes, { query: "respiracao" });
  assert.equal(found.length, 1);
  assert.equal(found[0].id, "a4");
  assert.equal(findCards(cards, decks, themes, { query: "ansiedade ii" }).length, 7);
});

test("filters combine theme, deck and classification", () => {
  const found = findCards(cards, decks, themes, {
    themeId: "t-ansiedade", deckId: "ansiedade", classification: "Explorar"
  });
  assert.deepEqual(found.map((card) => card.id), ["a3"]);
  assert.equal(findCards(cards, decks, themes, { themeId: "t-depressao", deckId: "ansiedade" }).length, 0);
});

test("random draw respects fixed deck and classification", () => {
  const result = drawCard(cards, decks, themes,
    { themeId: "t-ansiedade", deckId: "ansiedade", classification: "Construir" },
    { theme: false, deck: false, card: true, classification: false },
    () => 0.8
  );
  assert.equal(result?.id, "a6");
});

test("random theme and deck remain linked", () => {
  const result = drawCard(cards, decks, themes,
    { themeId: "t-ansiedade", deckId: "ansiedade" },
    { theme: true, deck: true, card: true, classification: true },
    () => 0.99
  );
  assert.equal(result?.deckId, "autocuidado");
  assert.equal(result?.classification, "Encerrar");
});

test("seven-day draw keeps a single deck and distinct topics", () => {
  const drawn = pickDailyCards(cards.filter((card) => card.deckId === "ansiedade"), 7, () => 0.5);
  assert.equal(drawn.length, 7);
  assert.equal(new Set(drawn.map((card) => card.deckId)).size, 1);
  assert.equal(new Set(drawn.map((card) => card.theme)).size, 7);
});

test("filter handles the planned 12/100/100 catalog size", () => {
  const largeThemes = Array.from({ length: 12 }, (_, index) => ({ id: `t${index}`, name: `Tema ${index}`, description: "" }));
  const largeDecks = Array.from({ length: 100 }, (_, index) => ({ id: `d${index}`, themeId: `t${index % 12}`, name: `Baralho ${index}`, description: "" }));
  const largeCards = largeDecks.flatMap((deck) => Array.from({ length: 100 }, (_, index) => ({
    id: `${deck.id}-c${index}`, deckId: deck.id, title: `Carta ${index}`,
    theme: `Assunto ${index}`, prompt: "Pergunta de teste", classification: classifications[index % 7]
  })));
  const found = findCards(largeCards, largeDecks, largeThemes, { themeId: "t4", deckId: "d4", classification: "Conhecer" });
  assert.equal(largeCards.length, 10000);
  assert.equal(found.length, 15);
  assert.ok(found.every((card) => card.deckId === "d4" && card.classification === "Conhecer"));
});
