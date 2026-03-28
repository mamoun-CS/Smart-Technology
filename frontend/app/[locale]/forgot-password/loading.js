'use client';

import { PageLoading } from '@/components/ui';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <div className="container-custom py-8">
        <PageLoading variant="form" count={1} />
      </div>
    </div>
  );
}
