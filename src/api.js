const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getBusinesses: () => request("/businesses"),
  getBusiness: (id) => request(`/businesses/${id}`),
  join: (businessId, service) =>
    request(`/businesses/${businessId}/join`, {
      method: "POST",
      body: JSON.stringify({ service }),
    }),
  leave: (entryId) => request(`/queue-entries/${entryId}`, { method: "DELETE" }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  callNext: (businessId, token) =>
    request(`/businesses/${businessId}/call-next`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),
  addCustomer: (businessId, token, name, service) =>
    request(`/businesses/${businessId}/customers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, service }),
    }),
};
