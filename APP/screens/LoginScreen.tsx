import React, { useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";
import { Input, PrimaryButton } from "../components/UI";
import { palette, styles } from "../styles";

export function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => boolean }) {
  const [email, setEmail] = useState("terapeuta@therapy.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  function submit() {
    const didLogin = onLogin(email, password);
    setError(didLogin ? "" : "E-mail ou senha inválidos.");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.surface} />
      <ScrollView contentContainerStyle={styles.loginScreen} keyboardShouldPersistTaps="handled">
        <View style={styles.loginMark}>
          <Text style={styles.loginMarkText}>TC</Text>
        </View>
        <Text style={styles.loginTitle}>Therapy Cards</Text>
        <Text style={styles.loginSubtitle}>Entre com um acesso de administrador, terapeuta ou paciente.</Text>

        <View style={styles.loginPanel}>
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
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <PrimaryButton label="Entrar" onPress={submit} />
        </View>

        <View style={styles.credentialsPanel}>
          <Text style={styles.credentialsTitle}>Acessos de teste</Text>
          <Text style={styles.credentialsText}>Administrador: admin@therapy.com / 123456</Text>
          <Text style={styles.credentialsText}>Terapeuta: terapeuta@therapy.com / 123456</Text>
          <Text style={styles.credentialsText}>Paciente: rafaela@email.com / 123456</Text>
          <Text style={styles.credentialsText}>Paciente: carlos@email.com / 123456</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
