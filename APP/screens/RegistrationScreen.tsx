import React, { useState } from "react";
import { Input, PatientRow, PrimaryButton, Screen, Section } from "../components/UI";
import { Actor, Patient } from "../types";

export function RegistrationScreen({ actor, onAddPatient, patients }: {
  actor: Actor;
  onAddPatient: (patient: Patient) => void;
  patients: Patient[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [goal, setGoal] = useState("");

  function submit() {
    if (!name.trim()) return;

    onAddPatient({
      id: `p${Date.now()}`,
      name: name.trim(),
      age: 30,
      diagnosis: diagnosis.trim() || "Prontuário inicial",
      risk: "baixo",
      goal: goal.trim() || "Definir objetivos terapêuticos na próxima sessão.",
      phone: phone.trim() || "(00) 00000-0000",
      email: email.trim() || "sem-email@therapy.local"
    });
    setName("");
    setEmail("");
    setPhone("");
    setDiagnosis("");
    setGoal("");
  }

  return (
    <Screen title="Cadastro" eyebrow="Acesso e vínculo terapêutico">
      <Section title={actor === "therapist" ? "Cadastrar paciente" : "Criar acesso do paciente"}>
        <Input label="Nome completo" value={name} onChangeText={setName} placeholder="Ex.: Rafaela Martins" />
        <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="paciente@email.com" keyboardType="email-address" />
        <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <Input label="Hipótese / demanda inicial" value={diagnosis} onChangeText={setDiagnosis} placeholder="Ex.: ansiedade, rotina, luto" />
        <Input label="Objetivo inicial" value={goal} onChangeText={setGoal} placeholder="Meta breve para o cuidado" multiline />
        <PrimaryButton label="Salvar cadastro" onPress={submit} />
      </Section>

      <Section title="Pacientes recentes">
        {patients.map((patient) => (
          <PatientRow key={patient.id} patient={patient} detail={`${patient.diagnosis} · risco ${patient.risk}`} />
        ))}
      </Section>
    </Screen>
  );
}
