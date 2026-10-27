import React, { useState } from "react";
import { Text, View } from "react-native";
import { Input, PatientRow, PrimaryButton, Screen, Section, SegmentButton } from "../components/UI";
import { styles } from "../styles";
import { Actor, Patient } from "../types";

type RegistrationMode = "patient" | "admin";

export function RegistrationScreen({ actor, onAddPatient, onAddAdmin, patients }: {
  actor: Actor;
  onAddPatient: (patient: Patient, password: string) => string | null;
  onAddAdmin: (name: string, email: string, password: string) => string | null;
  patients: Patient[];
}) {
  const [mode, setMode] = useState<RegistrationMode>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [phone, setPhone] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function changeMode(nextMode: RegistrationMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmation("");
  }

  function submit() {
    setError("");
    setSuccess("");
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Informe nome e e-mail válidos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    if (mode === "admin") {
      const result = onAddAdmin(cleanName, cleanEmail, password);
      if (result) {
        setError(result);
        return;
      }
      setSuccess("Administrador criado.");
    } else {
      const result = onAddPatient({
        id: `p${Date.now()}`,
        name: cleanName,
        age: 30,
        diagnosis: diagnosis.trim() || "Prontuário inicial",
        risk: "baixo",
        goal: goal.trim() || "Definir objetivos terapêuticos na próxima sessão.",
        phone: phone.trim() || "(00) 00000-0000",
        email: cleanEmail
      }, password);
      if (result) {
        setError(result);
        return;
      }
      setPhone("");
      setDiagnosis("");
      setGoal("");
    }

    setName("");
    setEmail("");
    setPassword("");
    setConfirmation("");
  }

  return (
    <Screen title="Cadastro" eyebrow="Acesso e vínculo terapêutico">
      {actor === "admin" ? (
        <Section title="Tipo de perfil">
          <View style={styles.segmentRow}>
            <SegmentButton label="Paciente" active={mode === "patient"} onPress={() => changeMode("patient")} />
            <SegmentButton label="Administrador" active={mode === "admin"} onPress={() => changeMode("admin")} />
          </View>
        </Section>
      ) : null}

      <Section title={mode === "admin" ? "Criar administrador" : "Cadastrar paciente"}>
        <Input label="Nome completo" value={name} onChangeText={setName} placeholder="Nome completo" />
        <Input label="E-mail de acesso" value={email} onChangeText={setEmail} placeholder="nome@email.com" keyboardType="email-address" autoCapitalize="none" />
        {mode === "patient" ? (
          <>
            <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
            <Input label="Hipótese / demanda inicial" value={diagnosis} onChangeText={setDiagnosis} placeholder="Ex.: ansiedade, rotina, luto" />
            <Input label="Objetivo inicial" value={goal} onChangeText={setGoal} placeholder="Meta breve para o cuidado" multiline />
          </>
        ) : null}
        <Input label="Senha de acesso" value={password} onChangeText={setPassword} placeholder="Pelo menos 6 caracteres" secureTextEntry autoCapitalize="none" />
        <Input label="Confirmar senha" value={confirmation} onChangeText={setConfirmation} placeholder="Repita a senha" secureTextEntry autoCapitalize="none" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}
        <PrimaryButton label={mode === "admin" ? "Criar administrador" : "Salvar cadastro"} onPress={submit} />
      </Section>

      <Section title="Últimos pacientes criados">
        {patients.slice(0, 5).map((patient) => (
          <PatientRow key={patient.id} patient={patient} detail={`${patient.diagnosis} · risco ${patient.risk}`} />
        ))}
      </Section>
    </Screen>
  );
}
