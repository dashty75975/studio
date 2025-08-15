
'use client';

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Driver, VehicleCategory } from '@/lib/types';
import DriverCard from './driver-card';
import { Loader2, Terminal, Grip } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import * as LucideIcons from 'lucide-react';
import VehicleFilter from './vehicle-filter';

const SULAYMANIYAH_COORDS = { lat: 35.5642, lng: 45.4333 };

const getIconComponent = (iconName: string): React.ElementType => {
  const Icon = (LucideIcons as any)[iconName];
  if (Icon) {
    if (!Icon.displayName) {
      Icon.displayName = iconName;
    }
    return Icon;
  }
  return Grip;
};

export default function MapView() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [currentVehicleCategories, setCurrentVehicleCategories] = useState<VehicleCategory[]>([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');

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
    const q = query(driversRef);
    const driverUnsubscribe = onSnapshot(q, (querySnapshot) => {
        const driversFromDb = querySnapshot.docs
            .map(doc => ({ _id: doc.id, ...doc.data() } as Driver))
            .filter(driver => driver.isApproved && driver.isAvailable); // Filter for approved and available drivers
        setAllDrivers(driversFromDb);
    });

     // Subscribe to category updates
    const categoryUnsubscribe = onSnapshot(collection(db, "categories"), (querySnapshot) => {
        const categoriesFromDb = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            value: doc.id,
            icon: getIconComponent(doc.data().iconName),
        })) as VehicleCategory[];
        const allCategory = { value: 'all', label: 'All', icon: Grip, color: '#ffffff', iconName: 'Grip' };
        setCurrentVehicleCategories([allCategory, ...categoriesFromDb]);
    });

    return () => {
        driverUnsubscribe();
        categoryUnsubscribe();
    };
  }, []);

  const filteredDrivers = useMemo(() => {
    if (selectedVehicleType === 'all') {
      return allDrivers;
    }
    return allDrivers.filter(driver => driver.vehicleType === selectedVehicleType);
  }, [allDrivers, selectedVehicleType]);

  const vehicleInfoMap = useMemo(() => {
    const map = new Map<string, { icon: React.ElementType, color: string }>();
    currentVehicleCategories.forEach(cat => {
      if (cat.value !== 'all') {
        map.set(cat.value, { icon: cat.icon, color: cat.color });
      }
    });
    return map;
  }, [currentVehicleCategories]);

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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full px-4">
            <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm max-w-2xl mx-auto shadow-lg">
                <VehicleFilter
                categories={currentVehicleCategories}
                selectedType={selectedVehicleType}
                onSelectType={setSelectedVehicleType}
                />
            </div>
        </div>
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
          {filteredDrivers.map((driver) => {
              const vehicleInfo = vehicleInfoMap.get(driver.vehicleType);
              const CustomIcon = vehicleInfo?.icon || Pin;
              return (
                <AdvancedMarker
                  key={driver._id}
                  position={{ lat: driver.location.coordinates[1], lng: driver.location.coordinates[0] }}
                  onClick={() => setSelectedDriver(driver)}
                >
                  <div className="p-2 bg-background rounded-full shadow-md">
                     <CustomIcon style={{ color: vehicleInfo?.color || '#000000' }} className="w-5 h-5" />
                  </div>
                </AdvancedMarker>
              )
            }
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
