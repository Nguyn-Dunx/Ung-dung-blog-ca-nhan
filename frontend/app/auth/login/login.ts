// app/auth/login/login.ts
export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthResponse {
  token?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export async function login(data: LoginInput): Promise<LoginResult> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    let json: AuthResponse;

    try {
      json = JSON.parse(text) as AuthResponse;
    } catch {
      console.error("Response không phải JSON, raw:", text);
      return {
        ok: false,
        error:
          "Server trả về HTML hoặc nội dung không phải JSON. Kiểm tra lại route /api/auth/login.",
      };
    }

    if (!res.ok) {
      const errorMessage =
        (json.message as string | undefined) ||
        (json.error as string | undefined) ||
        "Login failed";
      return { ok: false, error: errorMessage };
    }

    // Thành công: cookie JWT đã được set ở API route
    return { ok: true };
  } catch (err) {
    console.error("Login request error:", err);
    return {
      ok: false,
      error: "Cannot connect to server. Please try again later.",
    };
  }
}
