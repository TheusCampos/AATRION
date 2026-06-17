import { SignUp } from '@clerk/nextjs';

/**
 * Pagina de cadastro do ATRION.
 *
 * Renderiza o componente oficial do Clerk. No primeiro login com um
 * email que ja existe no banco (vincular por email), o helper
 * `getCurrentUser()` em lib/auth.ts faz a associacao automaticamente.
 */
export default function RegisterPage() {
  return (
    <SignUp
      routing="path"
      path="/register"
      appearance={{
        elements: {
          card: 'shadow-2xl',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
        },
      }}
      signInUrl="/login"
      forceRedirectUrl="/dashboard"
    />
  );
}
