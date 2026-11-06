export type TabKey = "cadastro" | "pacientes" | "mensagens" | "jogo";
export type Actor = "therapist" | "patient" | "admin";
export type GameMode = "daily" | "session";
export type CardClassification = "Sem classificação" | "Conhecer" | "Identificar" | "Explorar" | "Aprofundar" | "Refletir" | "Construir" | "Encerrar";

export type Theme = {
  id: string;
  name: string;
  description: string;
};

export type AuthSession = {
  role: Actor;
  name: string;
  email: string;
  accessToken: string;
  patientId?: string;
};

export type Patient = {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  risk: "baixo" | "moderado" | "alto";
  goal: string;
  phone: string;
  email: string;
};

export type TherapyCard = {
  id: string;
  deckId: string;
  title: string;
  theme: string;
  classification: CardClassification;
  prompt: string;
};

export type Deck = {
  id: string;
  themeId: string;
  name: string;
  description: string;
};

export type Program = {
  id: string;
  patientId: string;
  cardIds: string[];
  startedAt: string;
};

export type ResponseRecord = {
  id: string;
  patientId: string;
  cardId: string;
  mode: GameMode;
  answer: string;
  note?: string;
  createdAt: string;
};

export type ClinicalNote = {
  id: string;
  patientId: string;
  title: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
};

export type ChatMessage = {
  id: string;
  patientId: string;
  sender: Actor;
  text: string;
  time: string;
};

export type TabDefinition = {
  id: TabKey;
  label: string;
  icon: string;
};
