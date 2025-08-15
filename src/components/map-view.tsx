
'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Driver } from '@/lib/types';
import DriverCard from './driver-card';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const SULAYMANIYAH_COORDS = { lat: 35.5642, lng: 45.4333 };

export default function MapView() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    // Set user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation(SULAYMANIYAH_COORDS); // Fallback to city center
        }
      );
    } else {
        setUserLocation(SULAYMANIYAH_COORDS); // Fallback for browsers without geolocation
    }

    // Subscribe to all available & approved driver updates
    const driversRef = collection(db, "drivers");
    const q = query(driversRef, where("isApproved", "==", true), where("isAvailable", "==", true));
    const driverUnsubscribe = onSnapshot(q, (querySnapshot) => {
        const driversFromDb = querySnapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data(),
        })) as Driver[];
        setAllDrivers(driversFromDb);
    });

    return () => {
        driverUnsubscribe();
    };
  }, []);


  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted p-4">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Google Maps API Key is missing. Please add <code className="font-mono bg-muted-foreground/20 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-full w-full relative">
        <Map
          defaultCenter={userLocation}
          defaultZoom={13}
          mapId="suly-track-map"
          disableDefaultUI={false}
          gestureHandling={'greedy'}
          className="h-full w-full"
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Your Location">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
          {allDrivers.map((driver) => (
              <AdvancedMarker
                key={driver._id}
                position={{ lat: driver.location.coordinates[1], lng: driver.location.coordinates[0] }}
                onClick={() => setSelectedDriver(driver)}
              >
                <Pin />
              </AdvancedMarker>
            )
          )}
          {selectedDriver && (
            <InfoWindow
              position={{ lat: selectedDriver.location.coordinates[1] + 0.002, lng: selectedDriver.location.coordinates[0] }}
              onCloseClick={() => setSelectedDriver(null)}
              pixelOffset={[0, -50]}
            >
              <DriverCard driver={selectedDriver} />
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}
