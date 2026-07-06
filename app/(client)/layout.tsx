// Kontekst podopiecznego: mobile-first, motyw ciemny (default) — klasa `dark`.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark" data-context="client">
      {children}
    </div>
  );
}
