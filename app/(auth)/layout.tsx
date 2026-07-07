// app/(auth)/layout.tsx
// Kontekst auth: pre-rola, neutralny jasny motyw (bez klasy `dark`).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-context="auth"
      className="flex min-h-dvh items-center justify-center bg-background px-4 py-10"
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
