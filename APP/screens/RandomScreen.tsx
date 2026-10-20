import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { drawCard, RandomParts } from "../catalog";
import { PrimaryButton, Screen } from "../components/UI";
import { cards, classifications, decks, themes } from "../data";
import { palette, styles } from "../styles";
import { CardClassification, TherapyCard } from "../types";

export function RandomScreen({
  patientName,
  initialThemeId,
  initialDeckId,
  initialClassification,
  onBack,
  onUseCard
}: {
  patientName: string;
  initialThemeId: string;
  initialDeckId: string;
  initialClassification: CardClassification | null;
  onBack: () => void;
  onUseCard: (card: TherapyCard) => void;
}) {
  const [themeId, setThemeId] = useState(initialThemeId);
  const [deckId, setDeckId] = useState(initialDeckId);
  const [classification, setClassification] = useState<CardClassification | null>(initialClassification);
  const [parts, setParts] = useState<RandomParts>({ theme: false, deck: false, card: true, classification: false });
  const [result, setResult] = useState<TherapyCard | null>(null);
  const [drawAttempted, setDrawAttempted] = useState(false);
  const themeDecks = decks.filter((deck) => deck.themeId === themeId);

  function togglePart(part: keyof RandomParts) {
    setResult(null);
    setDrawAttempted(false);
    setParts((current) => {
      const next = { ...current, [part]: !current[part] };
      if (part === "theme" && next.theme) next.deck = next.card = true;
      if (part === "deck" && next.deck) next.card = true;
      if (part === "deck" && !next.deck) next.theme = false;
      if (part === "classification" && next.classification) next.card = true;
      if (part === "card" && !next.card) next.theme = next.deck = next.classification = false;
      return next;
    });
  }

  const resultDeck = result ? decks.find((deck) => deck.id === result.deckId) : undefined;
  const resultTheme = resultDeck ? themes.find((theme) => theme.id === resultDeck.themeId) : undefined;

  return (
    <Screen title="Sorteio" eyebrow={`Jogo de cartas · ${patientName}`} constrained leading={
      <TouchableOpacity accessibilityRole="button" onPress={onBack} style={styles.recordBackButton}>
        <Text style={styles.recordBackArrow}>‹</Text>
        <Text style={styles.recordBackText}>Voltar ao jogo</Text>
      </TouchableOpacity>
    }>
      <View style={styles.catalogSection}>
        <Text style={styles.sectionTitle}>O que será aleatório?</Text>
        {([
          ["theme", "Tema"], ["deck", "Baralho"], ["card", "Carta"], ["classification", "Classificação"]
        ] as [keyof RandomParts, string][]).map(([key, label]) => (
          <View key={key} style={styles.randomToggleRow}>
            <Text style={styles.randomToggleLabel}>{label}</Text>
            <Switch
              accessibilityLabel={`Aleatorizar ${label.toLowerCase()}`}
              value={parts[key]}
              onValueChange={() => togglePart(key)}
              trackColor={{ false: palette.line, true: palette.tealSoft }}
              thumbColor={parts[key] ? palette.teal : palette.muted}
            />
          </View>
        ))}
        <Text style={styles.helperText}>Tema sorteado inclui baralho e carta. Baralho ou classificação sorteados incluem carta.</Text>
      </View>

      <View style={styles.catalogSection}>
        <Text style={styles.sectionTitle}>Valores fixos</Text>
        {!parts.theme ? (
          <>
            <Text style={styles.inputLabel}>Tema</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
              {themes.map((theme) => (
                <TouchableOpacity key={theme.id} style={[styles.filterChip, themeId === theme.id && styles.filterChipActive]} onPress={() => {
                  setThemeId(theme.id);
                  setDeckId(decks.find((deck) => deck.themeId === theme.id)?.id ?? "");
                  setResult(null);
                  setDrawAttempted(false);
                }}>
                  <Text style={[styles.filterChipText, themeId === theme.id && styles.filterChipTextActive]}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}
        {!parts.deck ? (
          <>
            <Text style={styles.inputLabel}>Baralho</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
              {themeDecks.map((deck) => (
                <TouchableOpacity key={deck.id} style={[styles.filterChip, deckId === deck.id && styles.filterChipActive]} onPress={() => { setDeckId(deck.id); setResult(null); setDrawAttempted(false); }}>
                  <Text style={[styles.filterChipText, deckId === deck.id && styles.filterChipTextActive]}>{deck.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}
        {!parts.classification ? (
          <>
            <Text style={styles.inputLabel}>Classificação</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catalogFilters}>
              {([null, ...classifications] as (CardClassification | null)[]).map((item) => (
                <TouchableOpacity key={item ?? "all"} style={[styles.filterChip, classification === item && styles.filterChipActive]} onPress={() => { setClassification(item); setResult(null); setDrawAttempted(false); }}>
                  <Text style={[styles.filterChipText, classification === item && styles.filterChipTextActive]}>{item ?? "Todas"}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}
        <PrimaryButton label="Sortear carta" disabled={!Object.values(parts).some(Boolean)} onPress={() => {
          setDrawAttempted(true);
          setResult(drawCard(cards, decks, themes, { themeId, deckId, classification }, parts) ?? null);
        }} />
        {drawAttempted && !result ? <Text style={styles.helperText}>Nenhuma carta disponível para essa combinação.</Text> : null}
      </View>

      {result ? (
        <View style={styles.catalogSection}>
          <Text style={styles.sectionTitle}>Carta sorteada</Text>
          <Text style={styles.cardOrigin}>{resultTheme?.name} · {resultDeck?.name} · {result.classification}</Text>
          <Text style={styles.cardTitle}>{result.title}</Text>
          <Text style={styles.cardPrompt}>{result.prompt}</Text>
          <PrimaryButton label="Usar esta carta" onPress={() => onUseCard(result)} />
        </View>
      ) : null}
    </Screen>
  );
}
