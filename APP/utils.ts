export function getProgramDayIndex(startedAt: string) {
  const start = new Date(startedAt);
  const elapsedMs = new Date().getTime() - start.getTime();
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  return Math.min(6, Math.max(0, elapsedDays));
}

export function getTodayLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}
