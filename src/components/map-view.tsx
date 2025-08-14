
'use client';

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Driver, VehicleCategory, VehicleType } from '@/lib/types';
import VehicleFilter from './vehicle-filter';
import DriverCard from './driver-card';
import { Loader2, Terminal, Grip, PlusCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import * as LucideIcons from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';

const SULAYMANIYAH_COORDS = { lat: 35.5642, lng: 45.4333 };

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || PlusCircle;
  return Icon;
};


export default function MapView() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | 'all'>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [currentVehicleCategories, setCurrentVehicleCategories] = useState<VehicleCategory[]>([]);
  
  const vehicleInfoMap = useMemo(() => {
    return currentVehicleCategories.reduce((acc, category) => {
        if(category.value !== 'all') {
            acc[category.value] = {
            color: category.color,
            icon: category.icon,
            };
        }
        return acc;
    }, {} as Record<string, { color: string; icon: React.ElementType }>);
  }, [currentVehicleCategories]);


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

    // Subscribe to category updates
    const categoryUnsubscribe = onSnapshot(collection(db, "categories"), (querySnapshot) => {
        const categoriesFromDb = querySnapshot.docs.map(doc => ({
            value: doc.data().value,
            label: doc.data().label,
            color: doc.data().color,
            iconName: doc.data().iconName,
            icon: getIconComponent(doc.data().iconName),
        })) as VehicleCategory[];
        const allCategory = { value: 'all', label: 'All', icon: Grip, color: '#ffffff', iconName: 'Grip' };
        setCurrentVehicleCategories([allCategory, ...categoriesFromDb]);
    });
    
    return () => {
        categoryUnsubscribe();
    };
  }, []);

  useEffect(() => {
    const driversRef = collection(db, "drivers");
    let q;
    
    if (vehicleType === 'all') {
        q = query(driversRef, where("isApproved", "==", true), where("isAvailable", "==", true));
    } else {
        q = query(
            driversRef, 
            where("isApproved", "==", true), 
            where("isAvailable", "==", true),
            where("vehicleType", "==", vehicleType)
        );
    }

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
}, [vehicleType]);


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

  if (!userLocation || currentVehicleCategories.length === 0) {
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
          mapId="rega-map"
          disableDefaultUI={false}
          gestureHandling={'greedy'}
          className="h-full w-full"
        >
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Your Location">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
          {allDrivers.map((driver) => {
            const vehicleInfo = vehicleInfoMap[driver.vehicleType as VehicleType];
            const Icon = vehicleInfo?.icon || Pin;
            const color = vehicleInfo?.color || '#333';

            return (
              <AdvancedMarker
                key={driver._id}
                position={{ lat: driver.location.coordinates[1], lng: driver.location.coordinates[0] }}
                onClick={() => setSelectedDriver(driver)}
              >
                <div className="relative group">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {driver.vehicleType === 'bus' && (
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
                       <div className="bg-background text-foreground text-xs font-bold px-2 py-1 rounded-md shadow-md">
                         {driver.licensePlate}
                       </div>
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            )
          })}
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
        <VehicleFilter vehicleCategories={currentVehicleCategories} vehicleType={vehicleType} setVehicleType={setVehicleType} />
      </div>
    </APIProvider>
  );
}
