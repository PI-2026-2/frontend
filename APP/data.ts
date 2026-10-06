import { AuthAccount, Deck, Patient, TabDefinition, TabKey, TherapyCard } from "./types";

export const tabs: TabDefinition[] = [
  { id: "cadastro", label: "Cadastro", icon: "ID" },
  { id: "pacientes", label: "Pacientes", icon: "PC" },
  { id: "mensagens", label: "Mensagens", icon: "MS" },
  { id: "jogo", label: "Jogo", icon: "JG" }
];

export const patientTabs: TabKey[] = ["mensagens", "jogo"];

export const initialPatients: Patient[] = [
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

export const authAccounts: AuthAccount[] = [
  {
    role: "therapist",
    name: "Dra. Helena Vasconcelos",
    email: "terapeuta@therapy.com",
    password: "123456"
  },
  ...initialPatients.map((patient) => ({
    role: "patient" as const,
    name: patient.name,
    email: patient.email,
    password: "123456",
    patientId: patient.id
  }))
];

export const decks: Deck[] = [
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

export const cards: TherapyCard[] = [
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
