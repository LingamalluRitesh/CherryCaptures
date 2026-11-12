// Application environment and helpers
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "cherrycaptures2026";
}

export function getPort() {
  return Number(process.env.PORT || 3000);
}

export function getHost() {
  return process.env.HOST || "127.0.0.1";
}
