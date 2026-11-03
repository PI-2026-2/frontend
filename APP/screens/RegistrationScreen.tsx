import React, { useState } from "react";
import { Text } from "react-native";
import { RegistrationPayload } from "../api";
import { Input, PatientRow, PrimaryButton, Screen, Section } from "../components/UI";
import { styles } from "../styles";
import { Actor, Patient } from "../types";

export function RegistrationScreen({ actor, onAddPatient, patients }: {
  actor: Actor;
  onAddPatient: (payload: RegistrationPayload, diagnosis: string, goal: string) => Promise<string | null>;
  patients: Patient[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Informe nome e e-mail válidos."); return;
    }
    if (password.length < 6 || password !== confirmation) {
      setError("A senha deve ter ao menos 6 caracteres e coincidir com a confirmação."); return;
    }
    if (!phone.trim() || !gender.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
        Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime())) {
      setError("Informe telefone, gênero e nascimento no formato AAAA-MM-DD."); return;
    }
    setPending(true);
    try {
      const result = await onAddPatient({
        nome: name.trim(), email: cleanEmail, senha: password, telefone: phone.trim(),
        data_nascimento: birthDate, genero: gender.trim(), tipo: "PACIENTE"
      }, diagnosis.trim(), goal.trim());
      if (result) { setError(result); return; }
      setName(""); setEmail(""); setPassword(""); setConfirmation("");
      setPhone(""); setBirthDate(""); setGender(""); setDiagnosis(""); setGoal("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível cadastrar o paciente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen title="Cadastro" eyebrow="Acesso e vínculo terapêutico">
      <Section title="Cadastrar paciente">
        <Input label="Nome completo" value={name} onChangeText={setName} placeholder="Nome completo" />
        <Input label="E-mail de acesso" value={email} onChangeText={setEmail} placeholder="nome@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <Input label="Data de nascimento" value={birthDate} onChangeText={setBirthDate} placeholder="AAAA-MM-DD" />
        <Input label="Gênero" value={gender} onChangeText={setGender} placeholder="Como se identifica" />
        <Input label="Hipótese / demanda inicial" value={diagnosis} onChangeText={setDiagnosis} placeholder="Ex.: ansiedade, rotina, luto" />
        <Input label="Objetivo inicial" value={goal} onChangeText={setGoal} placeholder="Meta breve para o cuidado" multiline />
        <Input label="Senha de acesso" value={password} onChangeText={setPassword} placeholder="Pelo menos 6 caracteres" secureTextEntry autoCapitalize="none" />
        <Input label="Confirmar senha" value={confirmation} onChangeText={setConfirmation} placeholder="Repita a senha" secureTextEntry autoCapitalize="none" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton label={pending ? "Salvando..." : "Salvar cadastro"} onPress={submit} disabled={pending || actor === "patient"} />
      </Section>
      <Section title="Últimos pacientes criados nesta sessão">
        {patients.slice(0, 5).map((patient) => (
          <PatientRow key={patient.id} patient={patient} detail={`${patient.diagnosis} · risco ${patient.risk}`} />
        ))}
      </Section>
    </Screen>
  );
}
