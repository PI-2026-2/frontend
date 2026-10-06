import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";
import { Patient } from "../types";
import { matchesPatientSearch } from "../utils";

export function Screen({ title, eyebrow, leading, constrained, children }: {
  title: string;
  eyebrow: string;
  leading?: React.ReactNode;
  constrained?: boolean;
  children: React.ReactNode;
}) {
  const content = (
    <>
      {leading}
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.screenTitle}>{title}</Text>
      {children}
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      {constrained ? <View style={styles.constrainedScreen}>{content}</View> : content}
    </ScrollView>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function PatientPicker({ patients, selectedPatientId, onSelectPatient }: {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const visiblePatients = patients.filter((patient) => matchesPatientSearch(patient, query));

  return (
    <View style={styles.patientPickerPanel}>
      <TextInput
        accessibilityLabel="Buscar pacientes por nome, ID ou telefone"
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por nome, ID ou telefone"
        placeholderTextColor="#9AA6A3"
        style={styles.patientSearchInput}
      />
      <Text style={styles.patientPickerSelected}>Paciente selecionado: {selectedPatient?.name}</Text>
      {visiblePatients.length === 0 ? (
        <Text style={styles.patientPickerEmpty}>Nenhum paciente encontrado.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.patientPicker}>
          {visiblePatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar ${patient.name}`}
              style={[styles.patientChip, patient.id === selectedPatientId ? styles.patientChipActive : null]}
              onPress={() => {
                onSelectPatient(patient.id);
                setQuery("");
              }}
            >
              <Avatar name={patient.name} size={32} />
              <Text style={[styles.patientChipText, patient.id === selectedPatientId ? styles.patientChipTextActive : null]}>
                {patient.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export function PatientRow({ patient, detail }: { patient: Patient; detail: string }) {
  return (
    <View style={styles.patientRow}>
      <Avatar name={patient.name} size={40} />
      <View style={styles.patientRowText}>
        <Text style={styles.rowTitle}>{patient.name}</Text>
        <Text style={styles.bodyText}>{detail}</Text>
      </View>
      <Text style={styles.statusPill}>ativo</Text>
    </View>
  );
}

export function Avatar({ name, size }: { name: string; size: number }) {
  const initials = useMemo(
    () => name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    [name]
  );

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export function Input({ label, multiline, ...props }: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#9AA6A3"
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity disabled={disabled} style={[styles.primaryButton, disabled ? styles.buttonDisabled : null]} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.segmentButton, active ? styles.segmentButtonActive : null]} onPress={onPress}>
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Metric({ label, value, tone }: { label: string; value: string; tone: "mint" | "lilac" | "amber" | "rose" }) {
  const toneStyle = {
    mint: styles.metricMint,
    lilac: styles.metricLilac,
    amber: styles.metricAmber,
    rose: styles.metricRose
  }[tone];

  return (
    <View style={[styles.metric, toneStyle]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}
