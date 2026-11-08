import { SITE_URL } from "@/config/site";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "01e9c885c93ef48b";

/**
 * Ping IndexNow search engines (Bing, Yandex, Naver) when writeups are published or updated.
 */
export async function notifyIndexNow(urls: string[]): Promise<boolean> {
  if (!urls || urls.length === 0) return true;

  const host = new URL(SITE_URL).hostname;

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.map((u) => (u.startsWith("http") ? u : `${SITE_URL}${u}`)),
      }),
    });

    if (response.ok || response.status === 202) {
      return true;
    }

    console.warn(`[IndexNow] Non-200 response: ${response.status}`);
    return false;
  } catch (err) {
    // Non-blocking background telemetry: never throw to the user
    console.warn("[IndexNow] Ping failed (ignorable in offline/dev):", err);
    return false;
  }
}
