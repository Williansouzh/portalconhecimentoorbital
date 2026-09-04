import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Entrar — Portal do Conhecimento" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
