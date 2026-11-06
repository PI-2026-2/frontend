import { Patient } from "./types";

export function getProgramDayIndex(startedAt: string) {
  const start = new Date(startedAt).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return Math.round((Date.parse(today) - Date.parse(start)) / 86_400_000);
}

export function getTodayLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

export function getPatientDisplayId(patientId: string) {
  const id = patientId.replace(/^p/, "");
  return id.length > 8 ? id.slice(-6) : id;
}

export function matchesPatientSearch(patient: Patient, query: string) {
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const term = normalize(query.trim());
  return [patient.id, getPatientDisplayId(patient.id), patient.name, patient.phone]
    .some((value) => normalize(value).includes(term));
}
