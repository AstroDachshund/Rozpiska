// Kontekst trenera: desktop-first, motyw jasny (default). Bez klasy `dark`.
export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <div data-context="trainer">{children}</div>;
}
