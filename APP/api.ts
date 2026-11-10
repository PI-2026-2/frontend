import type { ChatMessage, ClinicalNote, Deck, Patient, Program, ResponseRecord, Theme, TherapyCard } from "./types";

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, "");
export type RegistrationPayload = {
  nome: string; email: string; senha: string; telefone: string;
  data_nascimento: string; genero: string; tipo: "TERAPEUTA" | "PACIENTE";
  terapeuta_email?: string;
};
export type RegisteredUser = { id: number; nome: string; email: string; tipo: "ADMINISTRADOR" | "TERAPEUTA" | "PACIENTE" };
export type LoginResult = {
  token: { access_token: string; token_type: string };
  usuario: { id: number; email: string; nome_completo: string; tipo_usuario: RegisteredUser["tipo"] };
};
export class ApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, method = "GET", body?: object, token?: string): Promise<T> {
  if (!configuredUrl) throw new ApiError("Configure EXPO_PUBLIC_API_URL com o endereço do backend.");
  let response: Response;
  try {
    response = await fetch(`${configuredUrl}${path}`, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
  } catch { throw new ApiError("Não foi possível conectar ao backend. Confira o endereço da API e a rede."); }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof data?.detail === "string" ? data.detail : "A solicitação não pôde ser concluída.";
    const message = path === "/login" && response.status === 401
      ? "E-mail ou senha inválidos."
      : response.status === 404 && detail === "Not Found"
        ? "O servidor não oferece esta função nesta versão."
        : detail;
    throw new ApiError(message, response.status);
  }
  return data as T;
}

type ApiPatient = Omit<Patient, "id"> & { id: number; therapist_id: number | null };
type ApiNote = { id: number; patient_id: number; title: string; text: string; created_at: string; updated_at: string | null };
type ApiMessage = { id: number; patient_id: number; sender: ChatMessage["sender"]; text: string; created_at: string };
type ApiProgram = { id: number; patient_id: number; card_ids: number[]; started_at: string };
type ApiResponse = { id: number; patient_id: number; card_id: number; mode: ResponseRecord["mode"]; answer: string; note: string | null; created_at: string };
export function userId(id: string) {
  const value = Number(id.replace(/^u/, ""));
  if (!Number.isInteger(value) || value <= 0) throw new ApiError("ID de usuário inválido.");
  return value;
}
export function cardId(id: string) {
  const value = Number(id.replace(/^c/, ""));
  if (!Number.isInteger(value) || value <= 0) throw new ApiError("Esta carta não está disponível na API.");
  return value;
}
const mapPatient = (item: ApiPatient): Patient => ({ id: `u${item.id}`, name: item.name, age: item.age, phone: item.phone, email: item.email, diagnosis: item.diagnosis, goal: item.goal, risk: item.risk });
const mapNote = (item: ApiNote): ClinicalNote => ({ id: `n${item.id}`, patientId: `u${item.patient_id}`, title: item.title, text: item.text, createdAt: item.created_at, updatedAt: item.updated_at ?? undefined });
const mapMessage = (item: ApiMessage): ChatMessage => ({ id: `m${item.id}`, patientId: `u${item.patient_id}`, sender: item.sender, text: item.text, time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(item.created_at)) });
const mapProgram = (item: ApiProgram): Program => ({ id: `g${item.id}`, patientId: `u${item.patient_id}`, cardIds: item.card_ids.map((id) => `c${id}`), startedAt: item.started_at });
const mapResponse = (item: ApiResponse): ResponseRecord => ({ id: `r${item.id}`, patientId: `u${item.patient_id}`, cardId: `c${item.card_id}`, mode: item.mode, answer: item.answer, note: item.note ?? undefined, createdAt: item.created_at });

export function login(email: string, senha: string) { return request<LoginResult>("/login", "POST", { email: email.trim().toLowerCase(), senha }); }
export async function register(payload: RegistrationPayload) { return (await request<{ cadastro: RegisteredUser }>("/cadastro", "POST", payload)).cadastro; }
export async function listPatients(token: string) { return (await request<ApiPatient[]>("/patients", "GET", undefined, token)).map(mapPatient); }
export async function createPatient(token: string, payload: RegistrationPayload, diagnosis: string, goal: string) { return mapPatient(await request<ApiPatient>("/patients", "POST", { ...payload, diagnosis, goal }, token)); }
export async function listNotes(token: string, patientId: string) { return (await request<ApiNote[]>(`/patients/${userId(patientId)}/notes`, "GET", undefined, token)).map(mapNote); }
export async function createNote(token: string, patientId: string, title: string, text: string) { return mapNote(await request<ApiNote>(`/patients/${userId(patientId)}/notes`, "POST", { title, text }, token)); }
export async function updateNote(token: string, patientId: string, noteId: string, title: string, text: string) { return mapNote(await request<ApiNote>(`/patients/${userId(patientId)}/notes/${Number(noteId.slice(1))}`, "PUT", { title, text }, token)); }
export async function listMessages(token: string, patientId?: string) { return (await request<ApiMessage[]>(patientId ? `/messages?patient_id=${userId(patientId)}` : "/messages", "GET", undefined, token)).map(mapMessage); }
export async function listConversations(token: string) { return (await request<ApiMessage[]>("/conversations", "GET", undefined, token)).map(mapMessage); }
export async function sendMessage(token: string, text: string, patientId?: string) { return mapMessage(await request<ApiMessage>("/messages", "POST", { text, ...(patientId ? { patient_id: userId(patientId) } : {}) }, token)); }
export function getCatalog(token: string) { return request<{ themes: Theme[]; decks: Deck[]; cards: TherapyCard[] }>("/catalog", "GET", undefined, token); }
export async function listPrograms(token: string, patientId?: string) { return (await request<ApiProgram[]>(patientId ? `/programs?patient_id=${userId(patientId)}` : "/programs", "GET", undefined, token)).map(mapProgram); }
export async function createProgram(token: string, program: Program) { return mapProgram(await request<ApiProgram>("/programs", "POST", { patient_id: userId(program.patientId), card_ids: program.cardIds.map(cardId) }, token)); }
export async function listResponses(token: string, patientId?: string) { return (await request<ApiResponse[]>(patientId ? `/responses?patient_id=${userId(patientId)}` : "/responses", "GET", undefined, token)).map(mapResponse); }
export async function createResponse(token: string, response: ResponseRecord, patientId?: string) { return mapResponse(await request<ApiResponse>("/responses", "POST", { card_id: cardId(response.cardId), mode: response.mode, answer: response.answer, note: response.note ?? null, ...(patientId ? { patient_id: userId(patientId) } : {}) }, token)); }
