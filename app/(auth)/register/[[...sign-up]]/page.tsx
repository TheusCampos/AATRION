import { SignUp } from '@clerk/nextjs';

/**
 * Pagina de cadastro do ATRION.
 */
export default function RegisterPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[450px]">
      <SignUp
        routing="path"
        path="/register"
        appearance={{
          elements: {
            card: 'shadow-2xl border border-slate-200/80 rounded-2xl',
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium',
          },
        }}
        signInUrl="/login"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
