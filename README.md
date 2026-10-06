# Therapy Cards

Protótipo em React Native com Expo Go baseado nas telas do Figma e no escopo priorizado:

- Cadastro
- Pacientes (lista com busca e ficha de prontuário mínimo)
- Mensagens
- Jogo de cartas

O fluxo do jogo parte sempre do terapeuta escolhendo o paciente e depois as cartas. Há dois modos:

- Plano de 7 dias: o terapeuta seleciona 7 cartas de um mesmo baralho, aleatoriamente ou manualmente. O paciente responde a carta do dia e o terapeuta recebe uma notificação local no protótipo.
- Sessão ao vivo: o terapeuta escolhe uma carta para mostrar ao paciente e registra a resposta durante a sessão.

## Rodar

```bash
npm install
npm run start
```

Depois, abra o QR Code no Expo Go.
