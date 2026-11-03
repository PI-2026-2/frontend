# Therapy Cards

Protótipo em React Native com Expo Go baseado nas telas do Figma e no escopo priorizado:

- Cadastro
- Pacientes (lista com busca e ficha de prontuário mínimo)
- Mensagens
- Jogo de cartas

O fluxo do jogo parte sempre do terapeuta escolhendo o paciente e depois as cartas. Há dois modos:

- Plano de 7 dias: o terapeuta seleciona 7 cartas de um mesmo baralho, aleatoriamente ou manualmente. O paciente responde a carta do dia e o terapeuta recebe uma notificação local no protótipo.
- Sessão ao vivo: o terapeuta escolhe uma carta para mostrar ao paciente e registra a resposta durante a sessão.

## Catálogo de cartas

O Jogo agora separa Tema, Baralho e Cartas. A busca das cartas combina texto, tema, baralho e as classificações Conhecer, Identificar, Explorar, Aprofundar, Refletir, Construir e Encerrar. Cada resultado mostra seu tema e baralho. O botão Aleatório abre uma tela onde se escolhe quais partes serão sorteadas; sortear um tema também exige sortear baralho e carta, para manter as relações válidas.

Os dados atuais são apenas uma demonstração: 3 temas, 3 baralhos e 21 cartas. A estrutura foi preparada para o catálogo planejado de 12 temas, 100 baralhos e 100 cartas por baralho. O esquema relacional está em `database/catalog.sql`, mas ainda não está conectado ao aplicativo. Não foram criadas milhares de cartas fictícias. Para testar as regras do catálogo, execute `npm run test:catalog`.

## Rodar

```bash
npm install
npm run start
```

Copie `.env.example` para `.env` e defina `EXPO_PUBLIC_API_URL` com a URL alcançável do backend (sem barra final). No Expo Go em um telefone, use o IP local do computador; `localhost` aponta para o próprio telefone. No emulador Android, use `http://10.0.2.2:8000`. Inicie o backend antes de abrir o QR Code.

## Autenticação

Crie uma conta de terapeuta ou paciente na tela inicial e entre com o e-mail e a senha cadastrados. O login e o cadastro usam `POST /login` e `POST /cadastro` do backend. Um terapeuta também pode cadastrar pacientes pela aba Cadastro. O administrador não pode ser criado pela interface porque a API de cadastro aceita apenas terapeuta e paciente.

A lista de mensagens mostra até cinco conversas recentes; a busca encontra pacientes fora dessa lista. As evoluções clínicas têm título, edição e busca.

O backend persiste as contas cadastradas. A lista de pacientes exibida pelo aplicativo, seus dados clínicos, mensagens, programas e evoluções ainda são dados de demonstração ou dados mantidos somente na memória. Cadastros novos aparecem na lista durante a sessão atual, mas não serão recarregados após reiniciar o app até que existam endpoints de listagem e prontuário. O token de login fica somente na memória do aplicativo.
