const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, "");

export type RegistrationPayload = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  data_nascimento: string;
  genero: string;
  tipo: "TERAPEUTA" | "PACIENTE";
};

export type RegisteredUser = {
  id: number;
  nome: string;
  email: string;
  tipo: "ADMINISTRADOR" | "TERAPEUTA" | "PACIENTE";
};

export type LoginResult = {
  token: { access_token: string; token_type: string };
  usuario: {
    id: number;
    email: string;
    nome_completo: string;
    tipo_usuario: RegisteredUser["tipo"];
  };
};

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

async function post<T>(path: string, body: object): Promise<T> {
  if (!configuredUrl) {
    throw new ApiError("Configure EXPO_PUBLIC_API_URL com o endereço do backend.");
  }
  let response: Response;
  try {
    response = await fetch(`${configuredUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao backend. Confira o endereço da API e a rede.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof data?.detail === "string" ? data.detail : "A solicitação não pôde ser concluída.";
    throw new ApiError(response.status === 401 ? "E-mail ou senha inválidos." : detail, response.status);
  }
  return data as T;
}

export function login(email: string, senha: string) {
  return post<LoginResult>("/login", { email: email.trim().toLowerCase(), senha });
}

export async function register(payload: RegistrationPayload) {
  const result = await post<{ cadastro: RegisteredUser }>("/cadastro", payload);
  return result.cadastro;
}
