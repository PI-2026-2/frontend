-- Catalog structure for a future persistent SQLite integration.
-- Expected content: 12 themes, 100 decks in total and up to 100 cards per deck.
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  theme_id TEXT NOT NULL REFERENCES themes(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS decks_theme_id_idx ON decks(theme_id);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL REFERENCES decks(id),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 100),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  prompt TEXT NOT NULL,
  classification TEXT NOT NULL CHECK (classification IN (
    'Conhecer', 'Identificar', 'Explorar', 'Aprofundar',
    'Refletir', 'Construir', 'Encerrar'
  )),
  UNIQUE (deck_id, position)
);

CREATE INDEX IF NOT EXISTS cards_deck_classification_idx ON cards(deck_id, classification);
