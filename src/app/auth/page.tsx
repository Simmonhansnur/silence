import { AuthForm } from "./auth-form";

export default function AuthPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 animate-breath bg-background">
      <div className="max-w-md w-full gap-8 text-center bg-transparent">
        <h1 className="text-3xl font-serif text-foreground tracking-wide mb-8">Authentication</h1>
        <AuthForm />
      </div>
    </main>
  );
}
