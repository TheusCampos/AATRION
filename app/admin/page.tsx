import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // SEC-015: Proteção explícita de rota Admin
  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const usersCount = await prisma.user.count();
  const processedEventsCount = await prisma.processedEvent.count();
  const resumesCount = await prisma.resume.count();

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-500">
        Bem-vindo ao painel administrativo. Apenas usuários com role `ADMIN` podem acessar.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Usuários</h2>
          <p className="text-4xl font-bold text-blue-600">{usersCount}</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Currículos</h2>
          <p className="text-4xl font-bold text-green-600">{resumesCount}</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Eventos de Webhook</h2>
          <p className="text-4xl font-bold text-purple-600">{processedEventsCount}</p>
        </div>
      </div>
    </div>
  );
}
