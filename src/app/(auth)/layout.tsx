import { Suspense } from 'react';
import Loading from '../loading';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </div>
    </Suspense>
  );
}