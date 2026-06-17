import { SignIn } from '@clerk/nextjs';

/**
 * Pagina de login do ATRION.
 *
 * Renderiza o componente oficial do Clerk com aparencia customizada
 * para casar com a identidade visual da plataforma. Apos o login
 * bem-sucedido, o usuario e redirecionado para /dashboard.
 */
export default function LoginPage() {
  return (
    <SignIn
      routing="path"
      path="/login"
      appearance={{
        elements: {
          card: 'shadow-2xl',
          formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
        },
      }}
      signUpUrl="/register"
      forceRedirectUrl="/dashboard"
    />
  );
}
