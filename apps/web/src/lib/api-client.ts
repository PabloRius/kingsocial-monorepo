import { auth } from "./auth";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const session = await auth();

  const headers = new Headers(options.headers);
  if (session?.user) {
    headers.set("Authorization", `Bearer ${session.sessionToken}`);
  }

  return fetch(url, { ...options, headers });
}
