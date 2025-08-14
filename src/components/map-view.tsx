'use client';

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Driver, VehicleType } from '@/lib/types';
import { mockDrivers, vehicleCategories } from '@/lib/mock-data';
import VehicleFilter from './vehicle-filter';
import DriverCard from './driver-card';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const SULAYMANIYAH_COORDS = { lat: 35.5642, lng: 45.4333 };

const vehicleColorMap = vehicleCategories.reduce((acc, category) => {
  if(category.value !== 'all') {
    acc[category.value] = category.color;
  }
  return acc;
}, {} as Record<VehicleType, string>);

export default function MapView() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | 'all'>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    // Initial load of approved and available drivers
    setAllDrivers(mockDrivers.filter(d => d.isApproved && d.isAvailable));

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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates by slightly moving drivers
      setAllDrivers(prevDrivers => prevDrivers.map(d => ({
        ...d,
        location: {
          ...d.location,
          coordinates: [
            d.location.coordinates[0] + (Math.random() - 0.5) * 0.001,
            d.location.coordinates[1] + (Math.random() - 0.5) * 0.001
          ]
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = useMemo(() => {
    if (vehicleType === 'all') {
      return allDrivers;
    }
    return allDrivers.filter((driver) => driver.vehicleType === vehicleType);
  }, [allDrivers, vehicleType]);

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
      <div className="relative h-full w-full">
        <Map
          center={userLocation}
          zoom={13}
          mapId="sulytrack-map"
          disableDefaultUI={true}
          gestureHandling={'greedy'}
          className="h-full w-full"
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Your Location">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
          {filteredDrivers.map((driver) => (
            <AdvancedMarker
              key={driver._id}
              position={{ lat: driver.location.coordinates[1], lng: driver.location.coordinates[0] }}
              onClick={() => setSelectedDriver(driver)}
            >
              {driver.vehicleType === 'bus' ? (
                <div className="flex flex-col items-center">
                  <div className="bg-background text-foreground text-xs font-bold px-2 py-1 rounded-md shadow-md -translate-y-2">
                    {driver.licensePlate}
                  </div>
                  <Pin background={vehicleColorMap[driver.vehicleType]} glyphColor="#fff" borderColor={vehicleColorMap[driver.vehicleType]} />
                </div>
              ) : (
                <Pin background={vehicleColorMap[driver.vehicleType]} glyphColor="#fff" borderColor={vehicleColorMap[driver.vehicleType]} />
              )}
            </AdvancedMarker>
          ))}
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
        <VehicleFilter vehicleType={vehicleType} setVehicleType={setVehicleType} />
      </div>
    </APIProvider>
  );
}
