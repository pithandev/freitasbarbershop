export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <a href="/" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md">
          Voltar ao Início
        </a>
      </div>
    </div>
  );
}