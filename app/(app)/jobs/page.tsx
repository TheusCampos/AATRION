'use client';

import { useState } from 'react';
import { Search, MapPin, Briefcase, Building, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';


function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

interface JobResult {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  created: string;
}

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const searchJobs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (location) params.append('location', location);

      const res = await fetch(`/api/jobs?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Falha ao buscar vagas');
      }

      const data = await res.json();
      setJobs(data.results || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar as vagas.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Buscar Vagas</h1>
        <p className="text-muted-foreground">
          Encontre oportunidades de emprego usando a inteligência do ATRION conectada ao Adzuna.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <form onSubmit={searchJobs} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cargo, palavra-chave ou empresa"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-5 relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cidade, estado ou região"
              className="pl-9"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Buscando as melhores oportunidades para você...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        {!loading && hasSearched && jobs.length === 0 && !error && (
          <div className="py-12 flex flex-col items-center justify-center text-center border rounded-lg border-dashed">
            <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">Nenhuma vaga encontrada</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              Não encontramos vagas para &quot;{query}&quot; em &quot;{location}&quot;. Tente usar termos mais genéricos ou mudar a localização.
            </p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-muted-foreground">
              Exibindo {jobs.length} resultados
            </h3>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-5 hover:border-primary/50 transition-colors bg-card flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="space-y-2 flex-1">
                    <h4 className="font-semibold text-lg text-primary line-clamp-1">{stripHtml(job.title)}</h4>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {job.company?.display_name && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" />
                          <span>{job.company.display_name}</span>
                        </div>
                      )}

                      {job.location?.display_name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{job.location.display_name}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-foreground/80 line-clamp-2 mt-2">{stripHtml(job.description)}</p>
                  </div>

                  <div className="shrink-0 mt-2 sm:mt-0">
                    <a href={job.redirect_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-card text-foreground hover:bg-accent shadow-sm h-10 px-4 text-sm">
                      Ver Vaga
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
