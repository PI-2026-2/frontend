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

O Jogo agora separa Tema, Baralho e Cartas. A busca das cartas combina texto, tema, baralho e as classificações Conhecer, Identificar, Explorar, Aprofundar, Refletir, Construir e Encerrar. Cada resultado mostra seu tema e baralho. O botão Aleatório abre uma tela onde se escolhe quais partes serão sorteadas; sortear um tema também exige sortear baralho e carta, para manter as relações válidas.

Os dados atuais são apenas uma demonstração: 3 temas, 3 baralhos e 21 cartas. A estrutura foi preparada para o catálogo planejado de 12 temas, 100 baralhos e 100 cartas por baralho. O esquema relacional está em `database/catalog.sql`, mas ainda não está conectado ao aplicativo. Não foram criadas milhares de cartas fictícias. Para testar as regras do catálogo, execute `npm run test:catalog`.

## Rodar

```bash
npm install
npm run start
```

Depois, abra o QR Code no Expo Go.

## Acessos de teste

- Administrador: `admin@therapy.com` / `123456`
- Terapeuta: `terapeuta@therapy.com` / `123456`
- Paciente: `rafaela@email.com` / `123456`

O cadastro de paciente cria um login com o e-mail e a senha informados. Somente um administrador pode criar outro administrador. A lista de mensagens mostra até cinco conversas recentes; a busca encontra pacientes fora dessa lista. As evoluções clínicas têm título, edição e busca.

Este protótipo mantém contas, pacientes, mensagens e evoluções apenas na memória. Ao reiniciar ou atualizar o app, os dados criados voltam ao estado inicial; ainda não há autenticação ou banco de dados de produção.
