import type { Patient } from "./types";

export function getProgramDayIndex(startedAt: string, now = new Date()): number | null {
  const start = new Date(startedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(now.getTime())) return null;
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const elapsedDays = Math.round((currentDay - startDay) / 86_400_000);

  return elapsedDays >= 0 && elapsedDays < 7 ? elapsedDays : null;
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
