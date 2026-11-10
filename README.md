# Therapy Cards

Protótipo em React Native com Expo Go baseado nas telas do Figma e no escopo priorizado:

- Cadastro
- Pacientes (lista com busca e ficha de prontuário mínimo)
- Mensagens
- Jogo de cartas

O fluxo do jogo parte sempre do terapeuta escolhendo o paciente e depois as cartas. Há dois modos:

- Plano de 7 dias: o terapeuta seleciona 7 cartas de um mesmo baralho, aleatoriamente ou manualmente. O paciente responde uma carta por dia no aplicativo. As respostas aparecem na ficha do paciente e o terapeuta recebe uma notificação local no protótipo.
- Sessão ao vivo: o terapeuta escolhe quantas perguntas precisar e finaliza a seleção. As perguntas aparecem na tela do terapeuta, onde ele abre uma caixa para anotar ou editar a resposta do paciente. As respostas também aparecem na ficha do paciente.

## Catálogo de cartas

O Jogo separa Tema, Baralho e Cartas. O catálogo usado no aplicativo vem de `GET /catalog`; os dados em `APP/data.ts` servem apenas aos testes locais. A busca combina texto, tema, baralho e classificação. O botão Aleatório abre uma tela onde se escolhe quais partes serão sorteadas.

As cartas importadas pelo backend aparecem como `Sem classificação` enquanto o banco não oferecer esse campo. O catálogo de demonstração contém 3 temas, 3 baralhos e 21 cartas. Para testar a integração de rotas e as regras do jogo, execute `npm test`.

## Rodar

```bash
npm install
npm run start
```

Copie `.env.example` para `.env` e configure `EXPO_PUBLIC_API_URL` com o endereço do backend. No Expo Go em um telefone, use o IP local do computador; `localhost` aponta para o próprio telefone. No emulador Android, use `http://10.0.2.2:8000`. Depois, abra o QR Code no Expo Go.

## Integração com a API

O frontend usa `POST /login` e `POST /cadastro` para acesso, `GET/POST /patients` para pacientes, `GET /catalog` para cartas, `GET/POST /programs` para o jogo de 7 dias e `GET/POST /responses` para respostas. Mensagens e evoluções usam as rotas `/messages`, `/conversations` e `/patients/{id}/notes`. As rotas do jogo dependem da branch `conectar-api-backend`; a `main` atual do backend ainda não as expõe.

O paciente responde uma carta por dia via `POST /responses`, e o terapeuta consulta as respostas no prontuário via `GET /responses`. O backend usa a data UTC para liberar a carta do dia; o frontend segue a mesma regra. Na sessão, o terapeuta seleciona as perguntas no próprio aplicativo e registra cada resposta via `POST /responses`.

Ainda não existe endpoint para salvar a seleção completa da sessão nem para editar uma resposta de sessão. A seleção permanece em memória até o aplicativo ser reiniciado; as respostas já enviadas ficam no backend e aparecem no prontuário. Por isso, a interface não oferece edição de resposta salva.
