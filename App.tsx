import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type TabKey = "cadastro" | "prontuario" | "mensagens" | "jogo";
type Actor = "therapist" | "patient";
type GameMode = "daily" | "session";

type Patient = {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  risk: "baixo" | "moderado" | "alto";
  goal: string;
  phone: string;
  email: string;
};

type TherapyCard = {
  id: string;
  deckId: string;
  title: string;
  theme: string;
  prompt: string;
};

type Deck = {
  id: string;
  name: string;
  description: string;
};

type Program = {
  id: string;
  patientId: string;
  cardIds: string[];
  startedAt: string;
};

type ResponseRecord = {
  id: string;
  patientId: string;
  cardId: string;
  mode: GameMode;
  answer: string;
  note?: string;
  createdAt: string;
};

type ChatMessage = {
  id: string;
  patientId: string;
  sender: Actor;
  text: string;
  time: string;
};

const palette = {
  ink: "#142522",
  muted: "#6B7774",
  line: "#DCE7E4",
  surface: "#F7FAF9",
  card: "#FFFFFF",
  teal: "#0F5F54",
  tealSoft: "#D8EFEB",
  mint: "#EAF6F2",
  lilac: "#EEEAFB",
  amber: "#FFF2D7",
  rose: "#FCE7EA"
};

const tabs: { id: TabKey; label: string; icon: string }[] = [
  { id: "cadastro", label: "Cadastro", icon: "ID" },
  { id: "prontuario", label: "Prontuário", icon: "PT" },
  { id: "mensagens", label: "Mensagens", icon: "MS" },
  { id: "jogo", label: "Jogo", icon: "JG" }
];

const initialPatients: Patient[] = [
  {
    id: "p1",
    name: "Rafaela Martins",
    age: 31,
    diagnosis: "Ansiedade generalizada",
    risk: "moderado",
    goal: "Reconhecer gatilhos e responder com estratégias de regulação.",
    phone: "(11) 99666-8899",
    email: "rafaela@email.com"
  },
  {
    id: "p2",
    name: "Carlos Silva",
    age: 27,
    diagnosis: "Rotina de autocuidado",
    risk: "baixo",
    goal: "Criar consistência em sono, atividade física e diário emocional.",
    phone: "(11) 91234-5678",
    email: "carlos@email.com"
  },
  {
    id: "p3",
    name: "Maria João",
    age: 42,
    diagnosis: "Humor deprimido",
    risk: "moderado",
    goal: "Mapear pensamentos automáticos e recuperar atividades prazerosas.",
    phone: "(21) 98888-1111",
    email: "maria@email.com"
  }
];

const decks: Deck[] = [
  {
    id: "ansiedade",
    name: "Ansiedade II",
    description: "Perguntas para identificar corpo, pensamento, evitação e recursos."
  },
  {
    id: "depressao",
    name: "Depressão",
    description: "Cartas para energia, rotina, valores e pequenos movimentos."
  },
  {
    id: "autocuidado",
    name: "Autocuidado",
    description: "Práticas breves de cuidado diário e percepção de necessidades."
  }
];

const cards: TherapyCard[] = [
  {
    id: "a1",
    deckId: "ansiedade",
    title: "Sinais do Corpo",
    theme: "Corpo",
    prompt: "Quais sensações físicas surgem no seu corpo quando você percebe o início de uma situação estressante?"
  },
  {
    id: "a2",
    deckId: "ansiedade",
    title: "Pensamento Automático",
    theme: "Cognição",
    prompt: "Qual frase aparece na sua mente quando você imagina que algo pode dar errado?"
  },
  {
    id: "a3",
    deckId: "ansiedade",
    title: "Evitação",
    theme: "Comportamento",
    prompt: "Que situação você tem evitado e que pequeno passo poderia testar com segurança?"
  },
  {
    id: "a4",
    deckId: "ansiedade",
    title: "Respiração",
    theme: "Regulação",
    prompt: "Qual sinal mostra que sua respiração ficou curta ou acelerada?"
  },
  {
    id: "a5",
    deckId: "ansiedade",
    title: "Rede de Apoio",
    theme: "Suporte",
    prompt: "Quem poderia ser acionado quando a ansiedade passa de moderada para intensa?"
  },
  {
    id: "a6",
    deckId: "ansiedade",
    title: "Medo Central",
    theme: "Emoção",
    prompt: "Se a ansiedade pudesse completar uma frase, o que ela diria que está tentando proteger?"
  },
  {
    id: "a7",
    deckId: "ansiedade",
    title: "Depois da Crise",
    theme: "Integração",
    prompt: "O que costuma ajudar você a voltar para o presente depois de um pico de ansiedade?"
  },
  {
    id: "d1",
    deckId: "depressao",
    title: "Energia do Dia",
    theme: "Energia",
    prompt: "Qual atividade pequena parece possível hoje, mesmo que a vontade esteja baixa?"
  },
  {
    id: "d2",
    deckId: "depressao",
    title: "Valor Vivo",
    theme: "Valores",
    prompt: "Que valor seu ainda aparece nos detalhes do dia, mesmo em uma semana difícil?"
  },
  {
    id: "d3",
    deckId: "depressao",
    title: "Pensamento Pesado",
    theme: "Cognição",
    prompt: "Qual pensamento tem voltado com frequência e que evidência poderia ser revisada?"
  },
  {
    id: "d4",
    deckId: "depressao",
    title: "Contato Seguro",
    theme: "Vínculo",
    prompt: "Com quem você poderia trocar uma mensagem simples hoje?"
  },
  {
    id: "d5",
    deckId: "depressao",
    title: "Atividade Possível",
    theme: "Comportamento",
    prompt: "Qual atividade de baixo esforço poderia trazer um pouco de movimento para o seu dia?"
  },
  {
    id: "d6",
    deckId: "depressao",
    title: "Autocrítica",
    theme: "Autocompaixão",
    prompt: "Como você falaria com alguém querido que estivesse vivendo o que você viveu hoje?"
  },
  {
    id: "d7",
    deckId: "depressao",
    title: "Registro de Progresso",
    theme: "Evidências",
    prompt: "Que pequeno sinal mostra que você não está exatamente no mesmo lugar de antes?"
  },
  {
    id: "u1",
    deckId: "autocuidado",
    title: "Sono",
    theme: "Rotina",
    prompt: "O que poderia deixar sua noite 10% mais previsível?"
  },
  {
    id: "u2",
    deckId: "autocuidado",
    title: "Limites",
    theme: "Limites",
    prompt: "Onde você percebeu que disse sim quando precisava pausar?"
  },
  {
    id: "u3",
    deckId: "autocuidado",
    title: "Cuidado Prático",
    theme: "Ação",
    prompt: "Qual cuidado concreto com seu corpo ou ambiente cabe nos próximos 15 minutos?"
  },
  {
    id: "u4",
    deckId: "autocuidado",
    title: "Alimentação",
    theme: "Corpo",
    prompt: "O que ajudaria você a fazer uma próxima refeição com mais presença?"
  },
  {
    id: "u5",
    deckId: "autocuidado",
    title: "Pausa",
    theme: "Regulação",
    prompt: "Qual pausa curta você pode inserir antes da próxima tarefa do dia?"
  },
  {
    id: "u6",
    deckId: "autocuidado",
    title: "Ambiente",
    theme: "Organização",
    prompt: "Que pequena mudança no ambiente deixaria seu cuidado mais fácil hoje?"
  },
  {
    id: "u7",
    deckId: "autocuidado",
    title: "Pedido de Ajuda",
    theme: "Suporte",
    prompt: "Qual pedido simples você poderia fazer para não carregar tudo sozinho?"
  }
];

const todayLabel = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit"
}).format(new Date());

function getProgramDayIndex(startedAt: string) {
  const start = new Date(startedAt);
  const now = new Date();
  const elapsedMs = now.getTime() - start.getTime();
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  return Math.min(6, Math.max(0, elapsedDays));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("cadastro");
  const [actor, setActor] = useState<Actor>("therapist");
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

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];

  function addPatient(patient: Patient) {
    setPatients((current) => [patient, ...current]);
    setSelectedPatientId(patient.id);
  }

  function addResponse(response: ResponseRecord) {
    const card = cards.find((item) => item.id === response.cardId);
    setResponses((current) => [response, ...current]);
    setNotifications((current) => [
      `${selectedPatient.name} respondeu "${card?.title ?? "carta"}" em ${todayLabel}.`,
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
        <TopBar actor={actor} onChangeActor={setActor} patient={selectedPatient} />
        <View style={styles.content}>
          {activeTab === "cadastro" ? (
            <RegistrationScreen actor={actor} onAddPatient={addPatient} patients={patients} />
          ) : null}
          {activeTab === "prontuario" ? (
            <RecordScreen
              patient={selectedPatient}
              patients={patients}
              responses={responses}
              selectedPatientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
            />
          ) : null}
          {activeTab === "mensagens" ? (
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
          {activeTab === "jogo" ? (
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
        <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function TopBar({
  actor,
  onChangeActor,
  patient
}: {
  actor: Actor;
  onChangeActor: (actor: Actor) => void;
  patient: Patient;
}) {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.appTitle}>Therapy Portal</Text>
        <Text style={styles.appSubtitle}>
          {actor === "therapist" ? "Área do terapeuta" : `Paciente: ${patient.name}`}
        </Text>
      </View>
      <View style={styles.actorSwitch}>
        <SegmentButton active={actor === "therapist"} label="Terapeuta" onPress={() => onChangeActor("therapist")} />
        <SegmentButton active={actor === "patient"} label="Paciente" onPress={() => onChangeActor("patient")} />
      </View>
    </View>
  );
}

function RegistrationScreen({
  actor,
  onAddPatient,
  patients
}: {
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
    if (!name.trim()) {
      return;
    }

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

function RecordScreen({
  patient,
  patients,
  responses,
  selectedPatientId,
  onSelectPatient
}: {
  patient: Patient;
  patients: Patient[];
  responses: ResponseRecord[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}) {
  const [note, setNote] = useState("");
  const patientResponses = responses.filter((response) => response.patientId === patient.id);

  return (
    <Screen title="Prontuário mínimo" eyebrow="Resumo clínico essencial">
      <PatientPicker patients={patients} selectedPatientId={selectedPatientId} onSelectPatient={onSelectPatient} />

      <Section title="Identificação">
        <View style={styles.profileHeader}>
          <Avatar name={patient.name} size={64} />
          <View style={styles.profileText}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.bodyText}>{patient.age} anos · {patient.phone}</Text>
            <Text style={styles.bodyText}>{patient.email}</Text>
          </View>
        </View>
        <View style={styles.metricsGrid}>
          <Metric label="Risco" value={patient.risk} tone={patient.risk === "alto" ? "rose" : patient.risk === "moderado" ? "amber" : "mint"} />
          <Metric label="Respostas" value={String(patientResponses.length)} tone="lilac" />
          <Metric label="Vínculo" value="ativo" tone="mint" />
        </View>
      </Section>

      <Section title="Hipótese e objetivo">
        <InfoLine label="Demanda" value={patient.diagnosis} />
        <InfoLine label="Objetivo" value={patient.goal} />
      </Section>

      <Section title="Evolução da sessão">
        <Input
          label="Nota clínica"
          value={note}
          onChangeText={setNote}
          placeholder="Registre observações, intervenções e plano de continuidade."
          multiline
        />
        <PrimaryButton label="Salvar evolução" onPress={() => setNote("")} />
      </Section>

      <Section title="Respostas do jogo">
        {patientResponses.length === 0 ? (
          <EmptyState text="Nenhuma resposta registrada para este paciente ainda." />
        ) : (
          patientResponses.map((response) => {
            const card = cards.find((item) => item.id === response.cardId);
            return (
              <View key={response.id} style={styles.responseItem}>
                <Text style={styles.responseTitle}>{card?.title}</Text>
                <Text style={styles.bodyText}>{response.answer}</Text>
                {response.note ? <Text style={styles.noteText}>Nota: {response.note}</Text> : null}
              </View>
            );
          })
        )}
      </Section>
    </Screen>
  );
}

function MessagesScreen({
  actor,
  messages,
  patient,
  patients,
  selectedPatientId,
  onSelectPatient,
  onSendMessage
}: {
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
    if (!draft.trim()) {
      return;
    }

    onSendMessage(draft.trim());
    setDraft("");
  }

  return (
    <Screen title="Mensagens" eyebrow="Contato assíncrono">
      <PatientPicker patients={patients} selectedPatientId={selectedPatientId} onSelectPatient={onSelectPatient} />

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

function GameScreen({
  actor,
  notifications,
  patient,
  patients,
  programs,
  responses,
  selectedPatientId,
  onAddProgram,
  onAddResponse,
  onSelectPatient
}: {
  actor: Actor;
  notifications: string[];
  patient: Patient;
  patients: Patient[];
  programs: Program[];
  responses: ResponseRecord[];
  selectedPatientId: string;
  onAddProgram: (program: Program) => void;
  onAddResponse: (response: ResponseRecord) => void;
  onSelectPatient: (patientId: string) => void;
}) {
  const [mode, setMode] = useState<GameMode>("daily");
  const [deckId, setDeckId] = useState(decks[0].id);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [patientAnswer, setPatientAnswer] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const deckCards = cards.filter((card) => card.deckId === deckId);
  const patientProgram = programs.find((program) => program.patientId === patient.id);
  const dayIndex = patientProgram ? getProgramDayIndex(patientProgram.startedAt) : 0;
  const cardOfDay = patientProgram ? cards.find((card) => card.id === patientProgram.cardIds[dayIndex]) : undefined;
  const selectedCards = selectedCardIds.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as TherapyCard[];

  function toggleCard(cardId: string) {
    setSelectedCardIds((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }

      const limit = mode === "daily" ? 7 : 1;
      return [...current.slice(-(limit - 1)), cardId];
    });
  }

  function randomSeven() {
    setMode("daily");
    setSelectedCardIds(deckCards.slice(0, 7).map((card) => card.id));
  }

  function configureDailyProgram() {
    if (selectedCardIds.length !== 7) {
      return;
    }

    onAddProgram({
      id: `g${Date.now()}`,
      patientId: patient.id,
      cardIds: selectedCardIds,
      startedAt: new Date().toISOString()
    });
  }

  function submitPatientAnswer() {
    if (!cardOfDay || !patientAnswer.trim()) {
      return;
    }

    onAddResponse({
      id: `r${Date.now()}`,
      patientId: patient.id,
      cardId: cardOfDay.id,
      mode: "daily",
      answer: patientAnswer.trim(),
      createdAt: new Date().toISOString()
    });
    setPatientAnswer("");
  }

  function saveSessionResponse() {
    const card = selectedCards[0];
    if (!card || !sessionNote.trim()) {
      return;
    }

    onAddResponse({
      id: `r${Date.now()}`,
      patientId: patient.id,
      cardId: card.id,
      mode: "session",
      answer: sessionNote.trim(),
      note: "Registrado pelo terapeuta durante a sessão.",
      createdAt: new Date().toISOString()
    });
    setSessionNote("");
  }

  const alreadyAnsweredToday = responses.some((response) => response.patientId === patient.id && response.cardId === cardOfDay?.id);

  return (
    <Screen title="Jogo de cartas" eyebrow="Paciente primeiro, cartas depois">
      <PatientPicker patients={patients} selectedPatientId={selectedPatientId} onSelectPatient={onSelectPatient} />

      {actor === "therapist" ? (
        <>
          <Section title="Modo de jogo">
            <View style={styles.segmentRow}>
              <SegmentButton
                active={mode === "daily"}
                label="7 dias"
                onPress={() => {
                  setMode("daily");
                  setSelectedCardIds([]);
                }}
              />
              <SegmentButton
                active={mode === "session"}
                label="Sessão"
                onPress={() => {
                  setMode("session");
                  setSelectedCardIds([]);
                }}
              />
            </View>
          </Section>

          <Section title="Escolher baralho">
            {decks.map((deck) => (
              <TouchableOpacity
                key={deck.id}
                style={[styles.deckRow, deck.id === deckId ? styles.deckRowActive : null]}
                onPress={() => {
                  setDeckId(deck.id);
                  setSelectedCardIds([]);
                }}
              >
                <View>
                  <Text style={styles.deckTitle}>{deck.name}</Text>
                  <Text style={styles.bodyText}>{deck.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Section>

          <Section title={mode === "daily" ? "Selecionar 7 cartas" : "Selecionar carta da sessão"}>
            {mode === "daily" ? <SecondaryButton label="Selecionar 7 automaticamente" onPress={randomSeven} /> : null}
            <View style={styles.cardGrid}>
              {deckCards.map((card) => {
                const selected = selectedCardIds.includes(card.id);
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[styles.playCard, selected ? styles.playCardSelected : null]}
                    onPress={() => toggleCard(card.id)}
                  >
                    <Text style={styles.cardTheme}>{card.theme}</Text>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardPrompt}>{card.prompt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.helperText}>
              {mode === "daily" ? `${selectedCardIds.length}/7 cartas selecionadas` : `${selectedCardIds.length}/1 carta selecionada`}
            </Text>
            {mode === "daily" ? (
              <PrimaryButton label="Configurar jogo de 7 dias" onPress={configureDailyProgram} disabled={selectedCardIds.length !== 7} />
            ) : (
              <>
                <Input
                  label="Resposta anotada em sessão"
                  value={sessionNote}
                  onChangeText={setSessionNote}
                  placeholder="Registre o que o paciente respondeu durante a sessão."
                  multiline
                />
                <PrimaryButton label="Salvar resposta da sessão" onPress={saveSessionResponse} disabled={selectedCardIds.length !== 1} />
              </>
            )}
          </Section>

          <Section title="Notificações">
            {notifications.length === 0 ? (
              <EmptyState text="As respostas do paciente aparecerão aqui." />
            ) : (
              notifications.map((notification, index) => (
                <View key={`${notification}-${index}`} style={styles.notification}>
                  <Text style={styles.notificationDot}>!</Text>
                  <Text style={styles.bodyText}>{notification}</Text>
                </View>
              ))
            )}
          </Section>
        </>
      ) : (
        <Section title="Carta do dia">
          {cardOfDay ? (
            <>
              <View style={styles.cardOfDay}>
                <Text style={styles.cardTheme}>{cardOfDay.theme}</Text>
                <Text style={styles.bigCardTitle}>{cardOfDay.title}</Text>
                <Text style={styles.bigCardPrompt}>{cardOfDay.prompt}</Text>
              </View>
              <Input
                label="Sua resposta"
                value={patientAnswer}
                onChangeText={setPatientAnswer}
                placeholder="Escreva como isso aparece para você hoje."
                multiline
              />
              <PrimaryButton
                label={alreadyAnsweredToday ? "Enviar nova resposta" : "Enviar resposta"}
                onPress={submitPatientAnswer}
              />
            </>
          ) : (
            <EmptyState text="Seu terapeuta ainda não configurou um jogo de 7 dias." />
          )}
        </Section>
      )}
    </Screen>
  );
}

function Screen({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.screenTitle}>{title}</Text>
      {children}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function PatientPicker({
  patients,
  selectedPatientId,
  onSelectPatient
}: {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.patientPicker}>
      {patients.map((patient) => (
        <TouchableOpacity
          key={patient.id}
          style={[styles.patientChip, patient.id === selectedPatientId ? styles.patientChipActive : null]}
          onPress={() => onSelectPatient(patient.id)}
        >
          <Avatar name={patient.name} size={32} />
          <Text style={[styles.patientChipText, patient.id === selectedPatientId ? styles.patientChipTextActive : null]}>
            {patient.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function PatientRow({ patient, detail }: { patient: Patient; detail: string }) {
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

function Avatar({ name, size }: { name: string; size: number }) {
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    [name]
  );

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

function Input({
  label,
  multiline,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
}) {
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

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity disabled={disabled} style={[styles.primaryButton, disabled ? styles.buttonDisabled : null]} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.segmentButton, active ? styles.segmentButtonActive : null]} onPress={onPress}>
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "mint" | "lilac" | "amber" | "rose" }) {
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function BottomTabs({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={() => onChange(tab.id)}>
          <View style={[styles.tabIcon, activeTab === tab.id ? styles.tabIconActive : null]}>
            <Text style={[styles.tabIconText, activeTab === tab.id ? styles.tabIconTextActive : null]}>{tab.icon}</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === tab.id ? styles.tabLabelActive : null]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.surface
  },
  appShell: {
    flex: 1,
    backgroundColor: palette.surface
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    backgroundColor: palette.card,
    gap: 12
  },
  appTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  appSubtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2
  },
  actorSwitch: {
    flexDirection: "row",
    backgroundColor: palette.mint,
    borderRadius: 8,
    padding: 4,
    gap: 4
  },
  content: {
    flex: 1
  },
  screen: {
    padding: 20,
    paddingBottom: 110
  },
  eyebrow: {
    color: palette.teal,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  screenTitle: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 18
  },
  section: {
    backgroundColor: palette.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: "#12342F",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FBFDFC",
    color: palette.ink,
    fontSize: 14
  },
  inputMultiline: {
    minHeight: 104,
    textAlignVertical: "top"
  },
  primaryButton: {
    backgroundColor: palette.teal,
    minHeight: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginTop: 4
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800"
  },
  secondaryButton: {
    backgroundColor: palette.tealSoft,
    minHeight: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginBottom: 12
  },
  secondaryButtonText: {
    color: palette.teal,
    fontSize: 14,
    fontWeight: "800"
  },
  buttonDisabled: {
    opacity: 0.46
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8
  },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    paddingHorizontal: 10
  },
  segmentButtonActive: {
    backgroundColor: palette.teal
  },
  segmentText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  segmentTextActive: {
    color: "#FFFFFF"
  },
  patientPicker: {
    gap: 8,
    paddingBottom: 12
  },
  patientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: palette.card
  },
  patientChipActive: {
    borderColor: palette.teal,
    backgroundColor: palette.mint
  },
  patientChipText: {
    color: palette.muted,
    fontWeight: "700",
    fontSize: 12
  },
  patientChipTextActive: {
    color: palette.teal
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.line
  },
  patientRowText: {
    flex: 1
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  bodyText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19
  },
  statusPill: {
    color: palette.teal,
    backgroundColor: palette.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "800"
  },
  profileHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 14
  },
  profileText: {
    flex: 1
  },
  patientName: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2
  },
  avatar: {
    backgroundColor: palette.tealSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: palette.teal,
    fontWeight: "900"
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8
  },
  metric: {
    flex: 1,
    borderRadius: 8,
    padding: 10
  },
  metricMint: {
    backgroundColor: palette.mint
  },
  metricLilac: {
    backgroundColor: palette.lilac
  },
  metricAmber: {
    backgroundColor: palette.amber
  },
  metricRose: {
    backgroundColor: palette.rose
  },
  metricValue: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  infoLine: {
    marginBottom: 10
  },
  infoLabel: {
    color: palette.teal,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 3
  },
  infoValue: {
    color: palette.ink,
    fontSize: 14,
    lineHeight: 20
  },
  responseItem: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8
  },
  responseTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4
  },
  noteText: {
    color: palette.teal,
    fontSize: 12,
    marginTop: 6
  },
  chatBox: {
    gap: 8,
    marginBottom: 12
  },
  bubble: {
    maxWidth: "84%",
    borderRadius: 8,
    padding: 12
  },
  bubbleOwn: {
    alignSelf: "flex-end",
    backgroundColor: palette.teal
  },
  bubbleOther: {
    alignSelf: "flex-start",
    backgroundColor: palette.mint
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20
  },
  bubbleTextOwn: {
    color: "#FFFFFF"
  },
  bubbleTextOther: {
    color: palette.ink
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 5,
    textAlign: "right"
  },
  bubbleTimeOwn: {
    color: "#D6F2EE"
  },
  bubbleTimeOther: {
    color: palette.muted
  },
  deckRow: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#FBFDFC"
  },
  deckRowActive: {
    borderColor: palette.teal,
    backgroundColor: palette.mint
  },
  deckTitle: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3
  },
  cardGrid: {
    gap: 10
  },
  playCard: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#FBFDFC"
  },
  playCardSelected: {
    borderColor: palette.teal,
    backgroundColor: palette.tealSoft
  },
  cardTheme: {
    color: palette.teal,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 6
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 5
  },
  cardPrompt: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19
  },
  helperText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 6
  },
  cardOfDay: {
    minHeight: 220,
    backgroundColor: palette.teal,
    borderRadius: 8,
    padding: 20,
    justifyContent: "center",
    marginBottom: 14
  },
  bigCardTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 12
  },
  bigCardPrompt: {
    color: "#E5F6F3",
    fontSize: 16,
    lineHeight: 24
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  notificationDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 24,
    backgroundColor: palette.teal,
    color: "#FFFFFF",
    fontWeight: "900"
  },
  emptyState: {
    minHeight: 76,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.mint,
    borderRadius: 8,
    padding: 12
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18
  },
  bottomTabs: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: palette.card,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 10
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 4
  },
  tabIcon: {
    width: 34,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface
  },
  tabIconActive: {
    backgroundColor: palette.teal
  },
  tabIconText: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  tabIconTextActive: {
    color: "#FFFFFF"
  },
  tabLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  tabLabelActive: {
    color: palette.teal
  }
});
