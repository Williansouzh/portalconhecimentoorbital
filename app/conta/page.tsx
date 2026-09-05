import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { findUserById } from "@/lib/store";
import ContaForm from "@/components/ContaForm";

export const metadata = { title: "Sua conta — Portal do Conhecimento" };

export default async function ContaPage() {
  const session = await requireSession();
  const usuario = await findUserById(session.id);
  if (!usuario) notFound();

  return <ContaForm user={session} email={usuario.email} />;
}
