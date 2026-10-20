import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Avatar, EmptyState, Input, PrimaryButton, Screen, Section } from "../components/UI";
import { styles } from "../styles";
import { Actor, ChatMessage, Patient } from "../types";
import { matchesPatientSearch } from "../utils";

export function MessagesScreen({ actor, messages, patient, patients, onSelectPatient, onSendMessage }: {
  actor: Actor;
  messages: ChatMessage[];
  patient: Patient;
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onSendMessage: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [openConversation, setOpenConversation] = useState(false);
  const conversation = messages.filter((message) => message.patientId === patient.id);
  const latestByPatient = new Map<string, { message: ChatMessage; index: number }>();
  messages.forEach((message, index) => latestByPatient.set(message.patientId, { message, index }));

  const visiblePatients = query.trim()
    ? patients.filter((item) => matchesPatientSearch(item, query)).sort((a, b) =>
        (latestByPatient.get(b.id)?.index ?? -1) - (latestByPatient.get(a.id)?.index ?? -1)
      )
    : [...latestByPatient.entries()]
        .sort((a, b) => b[1].index - a[1].index)
        .slice(0, 5)
        .map(([patientId]) => patients.find((item) => item.id === patientId))
        .filter((item): item is Patient => Boolean(item));

  function send() {
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft("");
  }

  function openPatientConversation(patientId: string) {
    setDraft("");
    onSelectPatient(patientId);
    setOpenConversation(true);
  }

  return (
    <Screen title="Mensagens" eyebrow="Contato assíncrono" constrained>
      {actor !== "patient" && !openConversation ? (
        <>
          <TextInput
            accessibilityLabel="Buscar conversa por nome, ID ou telefone"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nome, ID ou telefone"
            placeholderTextColor="#9AA6A3"
            style={[styles.patientSearchInput, styles.conversationSearchInput]}
          />
          <Text style={styles.conversationListTitle}>
            {query.trim() ? "Resultados da busca" : "Conversas recentes"}
          </Text>
          {visiblePatients.length === 0 ? (
            <EmptyState text={query.trim() ? "Nenhum paciente encontrado." : "Nenhuma conversa recente."} />
          ) : (
            <View style={styles.conversationList}>
              {visiblePatients.map((item) => {
                const latest = latestByPatient.get(item.id)?.message;
                return (
                  <TouchableOpacity
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir conversa com ${item.name}`}
                    style={styles.conversationRow}
                    onPress={() => openPatientConversation(item.id)}
                  >
                    <Avatar name={item.name} size={42} />
                    <View style={styles.conversationRowContent}>
                      <Text style={styles.conversationRowName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.conversationRowPreview} numberOfLines={1}>
                        {latest?.text ?? "Sem mensagens"}
                      </Text>
                    </View>
                    <View style={styles.conversationRowEnd}>
                      {latest ? <Text style={styles.conversationRowTime}>{latest.time}</Text> : null}
                      <Text style={styles.conversationRowChevron}>›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <>
          {actor !== "patient" ? (
            <TouchableOpacity accessibilityRole="button" style={styles.recordBackButton} onPress={() => setOpenConversation(false)}>
              <Text style={styles.recordBackArrow}>‹</Text>
              <Text style={styles.recordBackText}>Conversas</Text>
            </TouchableOpacity>
          ) : null}
          <Section title={actor === "patient" ? "Conversa com terapeuta" : `Conversa com ${patient.name}`}>
            <View style={styles.chatBox}>
              {conversation.length === 0 ? <EmptyState text="Nenhuma mensagem nesta conversa." /> : null}
              {conversation.map((message) => {
                const isOwn = message.sender === actor;
                return (
                  <View key={message.id} style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther]}>{message.text}</Text>
                    <Text style={[styles.bubbleTime, isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther]}>{message.time}</Text>
                  </View>
                );
              })}
            </View>
            <Input label="Nova mensagem" value={draft} onChangeText={setDraft} placeholder="Escreva uma mensagem breve..." multiline />
            <PrimaryButton label="Enviar mensagem" onPress={send} disabled={!draft.trim()} />
          </Section>
        </>
      )}
    </Screen>
  );
}
