import React, { useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";
import { RegistrationPayload, RegisteredUser } from "../api";
import { Input, PrimaryButton, SecondaryButton, SegmentButton } from "../components/UI";
import { palette, styles } from "../styles";

export function LoginScreen({ onLogin, onRegister }: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegistrationPayload) => Promise<RegisteredUser>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [registering, setRegistering] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [role, setRole] = useState<RegistrationPayload["tipo"]>("TERAPEUTA");

  async function submit() {
    setError(""); setSuccess("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Informe um e-mail válido."); return;
    }
    if (registering) {
      if (!name.trim() || !phone.trim() || !gender.trim() ||
          !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
          Number.isNaN(new Date(`${birthDate}T00:00:00`).getTime())) {
        setError("Informe nome, telefone, gênero e nascimento no formato AAAA-MM-DD."); return;
      }
      if (password.length < 6 || password !== confirmation) {
        setError("A senha deve ter ao menos 6 caracteres e coincidir com a confirmação."); return;
      }
    }
    setPending(true);
    try {
      if (registering) {
        await onRegister({ nome: name.trim(), email: email.trim().toLowerCase(), senha: password,
          telefone: phone.trim(), data_nascimento: birthDate, genero: gender.trim(), tipo: role });
        setRegistering(false);
        setSuccess("Cadastro concluído. Entre com seu e-mail e senha.");
      } else {
        await onLogin(email, password);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a solicitação.");
    } finally {
      setPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <ScrollView contentContainerStyle={styles.loginScreen} keyboardShouldPersistTaps="handled">
        <View style={styles.loginMark}>
          <Text style={styles.loginMarkText}>TC</Text>
        </View>
        <Text style={styles.loginTitle}>Therapy Cards</Text>
        <Text style={styles.loginSubtitle}>Acesse sua conta ou crie um perfil.</Text>

        <View style={styles.loginPanel}>
          {registering ? (
            <>
              <View style={styles.segmentRow}>
                <SegmentButton label="Terapeuta" active={role === "TERAPEUTA"} onPress={() => setRole("TERAPEUTA")} />
                <SegmentButton label="Paciente" active={role === "PACIENTE"} onPress={() => setRole("PACIENTE")} />
              </View>
              <Input label="Nome completo" value={name} onChangeText={setName} placeholder="Nome completo" />
            </>
          ) : null}
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
          />
          {registering ? (
            <>
              <Input label="Confirmar senha" value={confirmation} onChangeText={setConfirmation} placeholder="Repita a senha" secureTextEntry />
              <Input label="Telefone" value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
              <Input label="Data de nascimento" value={birthDate} onChangeText={setBirthDate} placeholder="AAAA-MM-DD" />
              <Input label="Gênero" value={gender} onChangeText={setGender} placeholder="Como se identifica" />
            </>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
          <PrimaryButton label={pending ? "Aguarde..." : registering ? "Criar conta" : "Entrar"} onPress={submit} disabled={pending} />
          <SecondaryButton label={registering ? "Voltar ao login" : "Criar conta"} onPress={() => {
            setRegistering(!registering); setError(""); setSuccess("");
          }} disabled={pending} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
