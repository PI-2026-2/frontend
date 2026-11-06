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

O catálogo exibido no aplicativo vem de `GET /catalog`. Importe as cartas no backend antes de usar o jogo. O arquivo `APP/data.ts` contém um catálogo de demonstração usado apenas pelos testes de busca e sorteio (`npm run test:catalog`). O banco atual não registra classificação de cartas; as importadas aparecem como `Sem classificação`.

## Rodar

```bash
npm install
npm run start
```

Copie `.env.example` para `.env` e defina `EXPO_PUBLIC_API_URL` com a URL alcançável do backend (sem barra final). No Expo Go em um telefone, use o IP local do computador; `localhost` aponta para o próprio telefone. No emulador Android, use `http://10.0.2.2:8000`. Inicie o backend antes de abrir o QR Code.

## Autenticação

Crie uma conta de terapeuta ou paciente na tela inicial e entre com o e-mail e a senha cadastrados. O login e o cadastro usam `POST /login` e `POST /cadastro` do backend. O paciente informa o e-mail do terapeuta para criar o vínculo. Um terapeuta também pode cadastrar pacientes pela aba Cadastro; esse fluxo usa `POST /patients` e vincula o paciente à sua conta. O administrador não pode ser criado pela interface porque a API de cadastro aceita apenas terapeuta e paciente.

A lista de mensagens mostra até cinco conversas recentes; a busca encontra pacientes fora dessa lista. As evoluções clínicas têm título, edição e busca.

Pacientes, dados clínicos, mensagens, programas, respostas e evoluções são lidos da API e persistidos no banco. O aplicativo atualiza conversas e dados do jogo periodicamente enquanto essas abas estão abertas. O token de login fica somente na memória do aplicativo e uma nova autenticação é necessária após reiniciar.
