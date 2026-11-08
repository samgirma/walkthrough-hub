export const dynamic = "force-static";

export async function GET() {
  return new Response("google-site-verification: google01e9c885c93ef48b.html", {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
