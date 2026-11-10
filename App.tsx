import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, Text, View } from "react-native";
import { BottomTabs, TopBar } from "./APP/components/Navigation";
import { EmptyState, Screen } from "./APP/components/UI";
import { patientTabs, tabs } from "./APP/data";
import {
  ApiError, createNote, createPatient, createProgram, createResponse, getCatalog,
  listConversations, listNotes, listPatients, listPrograms, listResponses,
  login as apiLogin, register as apiRegister, RegistrationPayload,
  sendMessage as apiSendMessage, updateNote
} from "./APP/api";
import { GameScreen } from "./APP/screens/GameScreen";
import { LoginScreen } from "./APP/screens/LoginScreen";
import { MessagesScreen } from "./APP/screens/MessagesScreen";
import { PatientsScreen } from "./APP/screens/PatientsScreen";
import { RecordScreen } from "./APP/screens/RecordScreen";
import { RegistrationScreen } from "./APP/screens/RegistrationScreen";
import { palette, styles } from "./APP/styles";
import { AuthSession, ChatMessage, ClinicalNote, Deck, Patient, Program, ResponseRecord, SessionGame, TabKey, Theme, TherapyCard } from "./APP/types";
import { getProgramDayIndex, getTodayLabel } from "./APP/utils";

const emptyPatient: Patient = { id: "", name: "Selecione um paciente", age: 0, diagnosis: "", risk: "baixo", goal: "", phone: "", email: "" };

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("cadastro");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [openRecordPatientId, setOpenRecordPatientId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sessionGames, setSessionGames] = useState<SessionGame[]>([]);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<TherapyCard[]>([]);
  const [loadError, setLoadError] = useState("");

  async function login(email: string, password: string) {
    const result = await apiLogin(email, password);
    const user = result.usuario;
    if (!user?.id || !user.email) {
      throw new ApiError("O servidor precisa ser atualizado para esta versão do aplicativo.");
    }
    const role: AuthSession["role"] = user.tipo_usuario === "PACIENTE" ? "patient" : user.tipo_usuario === "TERAPEUTA" ? "therapist" : "admin";
    const token = result.token.access_token;
    const [loadedPatients, catalog] = await Promise.all([
      role === "admin" ? Promise.resolve([]) : listPatients(token), getCatalog(token)
    ]);
    setPatients(loadedPatients);
    setThemes(catalog.themes); setDecks(catalog.decks); setCards(catalog.cards);
    setSelectedPatientId(loadedPatients[0]?.id ?? "");
    setActiveTab(role === "patient" ? "mensagens" : "cadastro");
    setLoadError("");
    setSession({ role, name: user.nome_completo, email: user.email, accessToken: token,
      patientId: role === "patient" ? `u${user.id}` : undefined });
  }

  useEffect(() => {
    if (!session || session.role === "admin") return;
    let active = true;
    const refresh = () => listConversations(session.accessToken)
      .then((data) => { if (active) setMessages(data); })
      .catch((error) => { if (active) setLoadError(error instanceof Error ? error.message : "Erro ao carregar mensagens."); });
    refresh();
    const timer = activeTab === "mensagens" ? setInterval(refresh, 15_000) : undefined;
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [session?.accessToken, activeTab, selectedPatientId]);

  useEffect(() => {
    if (!session || session.role !== "therapist") return;
    let active = true;
    const refresh = () => listPatients(session.accessToken).then((data) => {
      if (!active) return;
      setPatients(data);
      setSelectedPatientId((current) => current || data[0]?.id || "");
    }).catch((error) => {
      if (active) setLoadError(error instanceof Error ? error.message : "Erro ao carregar pacientes.");
    });
    refresh();
    const timer = setInterval(refresh, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, [session?.accessToken, activeTab]);

  useEffect(() => {
    if (!session || !selectedPatientId || session.role === "admin") return;
    let active = true;
    const token = session.accessToken;
    const patientId = session.role === "therapist" ? selectedPatientId : undefined;
    const refresh = () => Promise.all([
      session.role === "therapist" ? listNotes(token, selectedPatientId) : Promise.resolve([]),
      listPrograms(token, patientId), listResponses(token, patientId)
    ]).then(([notes, loadedPrograms, loadedResponses]) => {
      if (!active) return;
      setClinicalNotes((current) => [...current.filter((item) => item.patientId !== selectedPatientId), ...notes]);
      setPrograms((current) => [...current.filter((item) => item.patientId !== selectedPatientId), ...loadedPrograms]);
      setResponses((current) => {
        const previous = new Map(current.map((response) => [response.id, response]));
        return [...current.filter((item) => item.patientId !== selectedPatientId), ...loadedResponses.map((response) => {
          const prior = previous.get(response.id);
          const program = loadedPrograms[0];
          const dayIndex = program && response.mode === "daily"
            ? getProgramDayIndex(program.startedAt, new Date(response.createdAt)) : null;
          const belongsToProgram = dayIndex !== null && program?.cardIds[dayIndex] === response.cardId;
          return {
            ...response,
            programId: prior?.programId ?? (belongsToProgram ? program?.id : undefined),
            programDay: prior?.programDay ?? (belongsToProgram ? dayIndex! + 1 : undefined),
            sessionGameId: prior?.sessionGameId
          };
        })];
      });
      if (session.role === "therapist" && loadedResponses.length) {
        const patientName = patients.find((item) => item.id === selectedPatientId)?.name ?? "Paciente";
        const incoming = loadedResponses.filter((response) => response.mode === "daily").slice(0, 5).map((response) => {
          const cardTitle = cards.find((card) => card.id === response.cardId)?.title ?? "carta";
          return `${patientName} respondeu "${cardTitle}" em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(response.createdAt))}.`;
        });
        setNotifications((current) => [...incoming.filter((item) => !current.includes(item)), ...current]);
      }
    }).catch((error) => {
      if (!active) return;
      if (session.role === "patient" && error instanceof ApiError && error.status === 404) return;
      setLoadError(error instanceof Error ? error.message : "Erro ao carregar dados do paciente.");
    });
    refresh();
    const timer = activeTab === "jogo" || activeTab === "pacientes" ? setInterval(refresh, 15_000) : undefined;
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [session?.accessToken, selectedPatientId, activeTab]);

  function logout() {
    setSession(null); setActiveTab("cadastro"); setPatients([]); setSelectedPatientId("");
    setOpenRecordPatientId(null); setMessages([]); setPrograms([]); setSessionGames([]); setResponses([]);
    setClinicalNotes([]); setNotifications([]); setThemes([]); setDecks([]); setCards([]); setLoadError("");
  }

  async function addPatient(payload: RegistrationPayload, diagnosis: string, goal: string): Promise<string | null> {
    if (!session || session.role !== "therapist") return "Acesso exclusivo do terapeuta.";
    const patient = await createPatient(session.accessToken, payload, diagnosis, goal);
    setPatients((current) => [patient, ...current]);
    setSelectedPatientId(patient.id); setOpenRecordPatientId(patient.id); setActiveTab("pacientes");
    return null;
  }

  if (!session) return <LoginScreen onLogin={login} onRegister={apiRegister} />;
  const accessToken = session.accessToken;
  const actor = session.role;
  const availableTabs = tabs.filter((tab) => actor !== "patient" || patientTabs.includes(tab.id));
  const currentTab = actor === "patient" && !patientTabs.includes(activeTab) ? "mensagens" : activeTab;
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? emptyPatient;
  const recordPatient = patients.find((patient) => patient.id === openRecordPatientId);

  function changeTab(tab: TabKey) { setOpenRecordPatientId(null); setActiveTab(tab); }
  function openPatient(patientId: string) { setSelectedPatientId(patientId); setOpenRecordPatientId(patientId); }

  async function saveClinicalNote(title: string, text: string) {
    if (!recordPatient) return;
    const note = await createNote(accessToken, recordPatient.id, title, text);
    setClinicalNotes((current) => [note, ...current]);
  }
  async function updateClinicalNote(noteId: string, title: string, text: string) {
    if (!recordPatient) return;
    const note = await updateNote(accessToken, recordPatient.id, noteId, title, text);
    setClinicalNotes((current) => current.map((item) => item.id === note.id ? note : item));
  }
  async function addResponse(response: ResponseRecord) {
    const saved = await createResponse(accessToken, response, actor === "therapist" ? selectedPatientId : undefined);
    const card = cards.find((item) => item.id === saved.cardId);
    setResponses((current) => [{ ...saved, programId: response.programId, programDay: response.programDay,
      sessionGameId: response.sessionGameId }, ...current]);
    if (response.mode === "daily") {
      setNotifications((current) => [`${selectedPatient.name} respondeu "${card?.title ?? "carta"}" em ${getTodayLabel()}.`, ...current]);
    }
  }
  function addSessionGame(game: SessionGame) {
    setSessionGames((current) => [game, ...current]);
  }
  async function addProgram(program: Program) {
    const saved = await createProgram(accessToken, program);
    setPrograms((current) => [saved, ...current.filter((item) => item.patientId !== saved.patientId)]);
    setNotifications((current) => [`Novo jogo de 7 dias configurado para ${selectedPatient.name}.`, ...current]);
  }
  async function sendMessage(text: string) {
    const saved = await apiSendMessage(accessToken, text, actor === "therapist" ? selectedPatientId : undefined);
    setMessages((current) => [...current, saved]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <View style={styles.appShell}>
        <TopBar session={session} patient={selectedPatient} onLogout={logout} />
        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
        <View style={styles.content}>
          {currentTab === "cadastro" ? <RegistrationScreen actor={actor} onAddPatient={addPatient} patients={patients} /> : null}
          {currentTab === "pacientes" ? recordPatient ? (
            <RecordScreen patient={recordPatient} responses={responses} notes={clinicalNotes} cards={cards}
              onBack={() => setOpenRecordPatientId(null)} onSaveNote={saveClinicalNote} onUpdateNote={updateClinicalNote} />
          ) : <PatientsScreen patients={patients} onOpenPatient={openPatient} /> : null}
          {currentTab === "mensagens" ? <MessagesScreen actor={actor} messages={messages} patient={selectedPatient}
            patients={patients} onSelectPatient={setSelectedPatientId} onSendMessage={sendMessage} /> : null}
          {currentTab === "jogo" ? patients.length === 0 ? (
            <Screen title="Jogo de cartas" eyebrow="Paciente"><EmptyState text="Cadastre um paciente para iniciar o jogo." /></Screen>
          ) : <GameScreen actor={actor} notifications={notifications} patient={selectedPatient} patients={patients}
            programs={programs} sessionGames={sessionGames} responses={responses} selectedPatientId={selectedPatientId}
            cards={cards} decks={decks} themes={themes} onAddProgram={addProgram} onAddSessionGame={addSessionGame} onAddResponse={addResponse}
            onSelectPatient={setSelectedPatientId} /> : null}
        </View>
        <BottomTabs activeTab={currentTab} tabs={availableTabs} onChange={changeTab} />
      </View>
    </SafeAreaView>
  );
}
