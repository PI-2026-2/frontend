import type { CardClassification, Deck, Theme, TherapyCard } from "./types";

export type CardFilters = {
  query?: string;
  themeId?: string | null;
  deckId?: string | null;
  classification?: CardClassification | null;
};

export type RandomParts = {
  theme: boolean;
  deck: boolean;
  card: boolean;
  classification: boolean;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function findCards(allCards: TherapyCard[], allDecks: Deck[], allThemes: Theme[], filters: CardFilters) {
  const deckById = new Map(allDecks.map((deck) => [deck.id, deck]));
  const themeById = new Map(allThemes.map((theme) => [theme.id, theme]));
  const term = normalize(filters.query ?? "");

  return allCards.filter((card) => {
    const deck = deckById.get(card.deckId);
    const theme = deck ? themeById.get(deck.themeId) : undefined;
    if (!deck || !theme) return false;
    if (filters.themeId && theme.id !== filters.themeId) return false;
    if (filters.deckId && deck.id !== filters.deckId) return false;
    if (filters.classification && card.classification !== filters.classification) return false;
    if (!term) return true;
    return normalize([card.title, card.theme, card.prompt, card.classification, deck.name, theme.name].join(" ")).includes(term);
  });
}

function choose<T>(items: T[], random: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))];
}

export function drawCard(
  allCards: TherapyCard[],
  allDecks: Deck[],
  allThemes: Theme[],
  fixed: CardFilters,
  parts: RandomParts,
  random: () => number = Math.random
) {
  const eligible = findCards(allCards, allDecks, allThemes, {
    themeId: parts.theme ? null : fixed.themeId,
    deckId: parts.deck ? null : fixed.deckId,
    classification: parts.classification ? null : fixed.classification
  });
  const deckById = new Map(allDecks.map((deck) => [deck.id, deck]));
  const themeIds = [...new Set(eligible.map((card) => deckById.get(card.deckId)?.themeId).filter((id): id is string => Boolean(id)))];
  const themeId = parts.theme ? choose(themeIds, random) : fixed.themeId;
  const themed = eligible.filter((card) => deckById.get(card.deckId)?.themeId === themeId);
  const deckId = parts.deck ? choose([...new Set(themed.map((card) => card.deckId))], random) : fixed.deckId;
  const deckCards = themed.filter((card) => card.deckId === deckId);
  const classification = parts.classification
    ? choose([...new Set(deckCards.map((card) => card.classification))], random)
    : fixed.classification;
  const matching = deckCards.filter((card) => !classification || card.classification === classification);
  return parts.card ? choose(matching, random) : matching[0];
}

export function pickDailyCards(deckCards: TherapyCard[], count = 7, random: () => number = Math.random) {
  const shuffled = [...deckCards];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  const topics = new Set<string>();
  return shuffled.filter((card) => {
    if (topics.has(card.theme)) return false;
    topics.add(card.theme);
    return true;
  }).slice(0, count);
}
