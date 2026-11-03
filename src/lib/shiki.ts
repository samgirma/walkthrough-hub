import { codeToHtml } from "shiki";

export async function highlightCode(
  code: string,
  lang: string = "text"
): Promise<string> {
  const normalizedLang = (lang || "text").toLowerCase().trim();

  try {
    const html = await codeToHtml(code, {
      lang: normalizedLang,
      theme: "github-dark",
    });
    return html;
  } catch (error) {
    // Fallback to plain text if language is unknown
    const fallback = await codeToHtml(code, {
      lang: "text",
      theme: "github-dark",
    });
    return fallback;
  }
}
