// The app's own public base URL, used to build links inside emails and
// Stripe's success/cancel redirects. Falls back to localhost for dev.
export function getAppUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}
