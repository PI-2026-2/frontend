import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { BottomTabs, TopBar } from "./APP/components/Navigation";
import { authAccounts, cards, initialPatients, patientTabs, tabs } from "./APP/data";
import { GameScreen } from "./APP/screens/GameScreen";
import { LoginScreen } from "./APP/screens/LoginScreen";
import { MessagesScreen } from "./APP/screens/MessagesScreen";
import { PatientsScreen } from "./APP/screens/PatientsScreen";
import { RecordScreen } from "./APP/screens/RecordScreen";
import { RegistrationScreen } from "./APP/screens/RegistrationScreen";
import { palette, styles } from "./APP/styles";
import { AuthAccount, AuthSession, ChatMessage, ClinicalNote, Patient, Program, ResponseRecord, TabKey } from "./APP/types";
import { getTodayLabel } from "./APP/utils";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [accounts, setAccounts] = useState<AuthAccount[]>(authAccounts);
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

  function login(email: string, password: string) {
    const account = accounts.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password
    );

    if (!account) return false;

    const { password: _password, ...nextSession } = account;
    setSession(nextSession);

    if (account.role === "patient" && account.patientId) {
      setSelectedPatientId(account.patientId);
      setActiveTab("mensagens");
    } else {
      setActiveTab("cadastro");
    }

    return true;
  }

  function logout() {
    setSession(null);
    setActiveTab("cadastro");
    setSelectedPatientId(initialPatients[0].id);
    setOpenRecordPatientId(null);
  }

  function addPatient(patient: Patient, password: string): string | null {
    if (!session || session.role === "patient") return "Acesso não permitido.";
    const email = patient.email.trim().toLowerCase();
    if (accounts.some((account) => account.email.toLowerCase() === email)) {
      return "Este e-mail já está cadastrado.";
    }
    setAccounts((current) => [...current, {
      role: "patient",
      name: patient.name,
      email,
      password,
      patientId: patient.id
    }]);
    setPatients((current) => [patient, ...current]);
    setSelectedPatientId(patient.id);
    setOpenRecordPatientId(patient.id);
    setActiveTab("pacientes");
    return null;
  }

  function addAdmin(name: string, email: string, password: string): string | null {
    if (session?.role !== "admin") return "Apenas administradores podem criar este perfil.";
    const normalizedEmail = email.trim().toLowerCase();
    if (accounts.some((account) => account.email.toLowerCase() === normalizedEmail)) {
      return "Este e-mail já está cadastrado.";
    }
    setAccounts((current) => [...current, { role: "admin", name: name.trim(), email: normalizedEmail, password }]);
    return null;
  }

  if (!session) return <LoginScreen onLogin={login} />;

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
              onAddAdmin={addAdmin}
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
