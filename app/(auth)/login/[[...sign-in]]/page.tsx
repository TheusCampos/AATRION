import { SignIn } from '@clerk/nextjs';

/**
 * Pagina de login do ATRION.
 */
export default function LoginPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[450px]">
      <SignIn
        routing="path"
        path="/login"
        appearance={{
          elements: {
            card: 'shadow-2xl border border-slate-200/80 rounded-2xl',
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium',
          },
        }}
        signUpUrl="/register"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
