import React, { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { BottomTabs, TopBar } from "./APP/components/Navigation";
import { authAccounts, cards, initialPatients, patientTabs, tabs } from "./APP/data";
import { GameScreen } from "./APP/screens/GameScreen";
import { LoginScreen } from "./APP/screens/LoginScreen";
import { MessagesScreen } from "./APP/screens/MessagesScreen";
import { RecordScreen } from "./APP/screens/RecordScreen";
import { RegistrationScreen } from "./APP/screens/RegistrationScreen";
import { palette, styles } from "./APP/styles";
import { AuthSession, ChatMessage, Patient, Program, ResponseRecord, TabKey } from "./APP/types";
import { getTodayLabel } from "./APP/utils";

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("cadastro");
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatients[0].id);
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
  const [notifications, setNotifications] = useState<string[]>([]);

  function login(email: string, password: string) {
    const account = authAccounts.find(
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
  }

  function addPatient(patient: Patient) {
    setPatients((current) => [patient, ...current]);
    setSelectedPatientId(patient.id);
  }

  if (!session) return <LoginScreen onLogin={login} />;

  const actor = session.role;
  const availableTabs = tabs.filter((tab) => actor === "therapist" || patientTabs.includes(tab.id));
  const currentTab = actor === "patient" && !patientTabs.includes(activeTab) ? "mensagens" : activeTab;
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

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
            <RegistrationScreen actor={actor} onAddPatient={addPatient} patients={patients} />
          ) : null}
          {currentTab === "prontuario" ? (
            <RecordScreen
              patient={selectedPatient}
              patients={patients}
              responses={responses}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          ) : null}
          {currentTab === "mensagens" ? (
            <MessagesScreen
              actor={actor}
              messages={messages}
              patient={selectedPatient}
              patients={patients}
              selectedPatientId={selectedPatientId}
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
        <BottomTabs activeTab={currentTab} tabs={availableTabs} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}
