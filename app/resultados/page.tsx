import { Suspense } from "react";
import ResultsView from "@/components/ResultsView";

export const metadata = { title: "Resultados da pesquisa — Portal do Conhecimento" };

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsView />
    </Suspense>
  );
}
