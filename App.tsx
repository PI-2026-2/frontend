import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { BottomTabs, TopBar } from "./APP/components/Navigation";
import { cards, initialPatients, patientTabs, tabs } from "./APP/data";
import { login as apiLogin, register as apiRegister, RegistrationPayload } from "./APP/api";
import { GameScreen } from "./APP/screens/GameScreen";
import { LoginScreen } from "./APP/screens/LoginScreen";
import { MessagesScreen } from "./APP/screens/MessagesScreen";
import { PatientsScreen } from "./APP/screens/PatientsScreen";
import { RecordScreen } from "./APP/screens/RecordScreen";
import { RegistrationScreen } from "./APP/screens/RegistrationScreen";
import { palette, styles } from "./APP/styles";
import { AuthSession, ChatMessage, ClinicalNote, Patient, Program, ResponseRecord, TabKey } from "./APP/types";
import { getTodayLabel } from "./APP/utils";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("cadastro");
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatients[0].id);
  const [openRecordPatientId, setOpenRecordPatientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      patientId: "p1",
      sender: "patient",
      text: "Completei a resposta da carta de hoje.",
      time: "09:12"
    },
    {
      id: "m2",
      patientId: "p1",
      sender: "therapist",
      text: "Obrigada, Rafaela. Vamos retomar isso na sessão.",
      time: "09:18"
    }
  ]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  async function login(email: string, password: string) {
    const result = await apiLogin(email, password);
    const user = result.usuario;
    const role: AuthSession["role"] = user.tipo_usuario === "PACIENTE"
      ? "patient" : user.tipo_usuario === "TERAPEUTA" ? "therapist" : "admin";
    const patientId = role === "patient" ? `u${user.id}` : undefined;
    const nextSession: AuthSession = { role, name: user.nome_completo, email: user.email,
      accessToken: result.token.access_token, patientId };
    setSession(nextSession);

    if (patientId) {
      setPatients((current) => current.some((item) => item.id === patientId)
        ? current : [{ id: patientId, name: user.nome_completo, email: user.email,
          age: 0, phone: "", diagnosis: "", goal: "", risk: "baixo" }, ...current]);
      setSelectedPatientId(patientId);
      setActiveTab("mensagens");
    } else {
      setActiveTab("cadastro");
    }

  }

  function logout() {
    setSession(null);
    setActiveTab("cadastro");
    setSelectedPatientId(initialPatients[0].id);
    setOpenRecordPatientId(null);
  }

  async function addPatient(payload: RegistrationPayload, diagnosis: string, goal: string): Promise<string | null> {
    if (!session || session.role === "patient") return "Acesso não permitido.";
    const registered = await apiRegister(payload);
    const patient: Patient = {
      id: `u${registered.id}`, name: registered.nome, email: registered.email,
      age: Math.max(0, new Date().getFullYear() - Number(payload.data_nascimento.slice(0, 4))),
      phone: payload.telefone, diagnosis: diagnosis || "Prontuário inicial",
      goal: goal || "Definir objetivos terapêuticos na próxima sessão.", risk: "baixo"
    };
    setPatients((current) => [patient, ...current]);
    setSelectedPatientId(patient.id);
    setOpenRecordPatientId(patient.id);
    setActiveTab("pacientes");
    return null;
  }

  if (!session) return <LoginScreen onLogin={login} onRegister={apiRegister} />;

  const actor = session.role;
  const availableTabs = tabs.filter((tab) => actor !== "patient" || patientTabs.includes(tab.id));
  const currentTab = actor === "patient" && !patientTabs.includes(activeTab) ? "mensagens" : activeTab;
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const recordPatient = patients.find((patient) => patient.id === openRecordPatientId);

  function changeTab(tab: TabKey) {
    setOpenRecordPatientId(null);
    setActiveTab(tab);
  }

  function openPatient(patientId: string) {
    setSelectedPatientId(patientId);
    setOpenRecordPatientId(patientId);
  }

  function saveClinicalNote(title: string, text: string) {
    if (!recordPatient) return;
    setClinicalNotes((current) => [{
      id: `n${Date.now()}`,
      patientId: recordPatient.id,
      title,
      text,
      createdAt: new Date().toISOString()
    }, ...current]);
  }

  function updateClinicalNote(noteId: string, title: string, text: string) {
    if (!recordPatient) return;
    setClinicalNotes((current) => current.map((note) =>
      note.id === noteId && note.patientId === recordPatient.id
        ? { ...note, title, text, updatedAt: new Date().toISOString() }
        : note
    ));
  }

  function addResponse(response: ResponseRecord) {
    const card = cards.find((item) => item.id === response.cardId);
    setResponses((current) => [response, ...current]);
    setNotifications((current) => [
      `${selectedPatient.name} respondeu "${card?.title ?? "carta"}" em ${getTodayLabel()}.`,
      ...current
    ]);
  }

  function addProgram(program: Program) {
    setPrograms((current) => [program, ...current.filter((item) => item.patientId !== program.patientId)]);
    setNotifications((current) => [
      `Novo jogo de 7 dias configurado para ${selectedPatient.name}.`,
      ...current
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <View style={styles.appShell}>
        <TopBar session={session} patient={selectedPatient} onLogout={logout} />
        <View style={styles.content}>
          {currentTab === "cadastro" ? (
            <RegistrationScreen
              actor={actor}
              onAddPatient={addPatient}
              patients={patients}
            />
          ) : null}
          {currentTab === "pacientes" ? (
            recordPatient ? (
              <RecordScreen
                patient={recordPatient}
                responses={responses}
                notes={clinicalNotes}
                onBack={() => setOpenRecordPatientId(null)}
                onSaveNote={saveClinicalNote}
                onUpdateNote={updateClinicalNote}
              />
            ) : (
              <PatientsScreen
                patients={patients}
                onOpenPatient={openPatient}
              />
            )
          ) : null}
          {currentTab === "mensagens" ? (
            <MessagesScreen
              actor={actor}
              messages={messages}
              patient={selectedPatient}
              patients={patients}
              onSelectPatient={setSelectedPatientId}
              onSendMessage={(text) =>
                setMessages((current) => [
                  ...current,
                  {
                    id: `m${Date.now()}`,
                    patientId: selectedPatient.id,
                    sender: actor,
                    text,
                    time: new Intl.DateTimeFormat("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    }).format(new Date())
                  }
                ])
              }
            />
          ) : null}
          {currentTab === "jogo" ? (
            <GameScreen
              actor={actor}
              notifications={notifications}
              patient={selectedPatient}
              patients={patients}
              programs={programs}
              responses={responses}
              selectedPatientId={selectedPatientId}
              onAddProgram={addProgram}
              onAddResponse={addResponse}
              onSelectPatient={setSelectedPatientId}
            />
          ) : null}
        </View>
        <BottomTabs activeTab={currentTab} tabs={availableTabs} onChange={changeTab} />
      </View>
    </SafeAreaView>
  );
}
