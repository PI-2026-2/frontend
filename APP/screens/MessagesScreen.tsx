import React, { useState } from "react";
import { Text, View } from "react-native";
import { Input, PatientPicker, PrimaryButton, Screen, Section } from "../components/UI";
import { styles } from "../styles";
import { Actor, ChatMessage, Patient } from "../types";

export function MessagesScreen({ actor, messages, patient, patients, selectedPatientId, onSelectPatient, onSendMessage }: {
  actor: Actor;
  messages: ChatMessage[];
  patient: Patient;
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onSendMessage: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const conversation = messages.filter((message) => message.patientId === patient.id);

  function send() {
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft("");
  }

  return (
    <Screen title="Mensagens" eyebrow="Contato assíncrono">
      {actor === "therapist" ? (
        <PatientPicker patients={patients} selectedPatientId={selectedPatientId} onSelectPatient={onSelectPatient} />
      ) : null}

      <Section title={`Conversa com ${patient.name}`}>
        <View style={styles.chatBox}>
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
        <PrimaryButton label="Enviar mensagem" onPress={send} />
      </Section>
    </Screen>
  );
}
