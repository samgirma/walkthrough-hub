import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const target = params.callbackUrl ? `/login?callbackUrl=${encodeURIComponent(params.callbackUrl)}` : "/login";
  redirect(target);
}
