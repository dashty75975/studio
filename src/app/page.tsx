'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-muted"><p>Loading Map...</p></div>,
});

export default function Home() {
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <MapView />
    </div>
  );
}
