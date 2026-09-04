import { Suspense } from "react";
import FavoritesView from "@/components/FavoritesView";

export const metadata = { title: "Seu espaço — Portal do Conhecimento" };

export default function FavoritesPage() {
  return (
    <Suspense fallback={null}>
      <FavoritesView />
    </Suspense>
  );
}
