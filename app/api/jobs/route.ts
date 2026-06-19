import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/br/search';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // SEC-006: Rate limiting por usuário
  const rl = await checkRateLimit(`jobs:${user.id}`, RATE_LIMITS.jobs);
  if (!rl.allowed) return rl.response;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const page = searchParams.get('page') || '1';

  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    return NextResponse.json({ error: 'Adzuna API credentials not configured' }, { status: 500 });
  }

  try {
    const url = new URL(`${ADZUNA_BASE_URL}/${page}`);
    url.searchParams.append('app_id', ADZUNA_APP_ID);
    url.searchParams.append('app_key', ADZUNA_APP_KEY);
    url.searchParams.append('results_per_page', '20');
    
    if (query) {
      url.searchParams.append('what', query);
    }
    
    if (location) {
      url.searchParams.append('where', location);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Adzuna API error:', response.status, await response.text());
      return NextResponse.json({ error: 'Falha ao buscar vagas na API do Adzuna' }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar vagas' }, { status: 500 });
  }
}
