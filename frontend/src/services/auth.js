const API_URL = "http://localhost:3000/auth";

// Register a new user with provided data (firstname, lastname, email, password)
export async function register(userData) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return res.json();
}

// Authenticate user with credentials (email, password) and return JWT token
export async function login(credentials) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return res.json();
}
