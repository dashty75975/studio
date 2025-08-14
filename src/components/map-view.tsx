
'use client';

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Driver, VehicleCategory, VehicleType } from '@/lib/types';
import { mockDrivers, vehicleCategories as defaultVehicleCategories } from '@/lib/mock-data';
import VehicleFilter from './vehicle-filter';
import DriverCard from './driver-card';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import * as LucideIcons from 'lucide-react';
import { PlusCircle } from 'lucide-react';


const SULAYMANIYAH_COORDS = { lat: 35.5642, lng: 45.4333 };
const DRIVERS_STORAGE_KEY = 'sulytrack_drivers';
const CATEGORIES_STORAGE_KEY = 'sulytrack_categories';

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || PlusCircle;
};


export default function MapView() {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | 'all'>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [currentVehicleCategories, setCurrentVehicleCategories] = useState<VehicleCategory[]>(defaultVehicleCategories);
  
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
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    const driversToLoad = storedDrivers ? JSON.parse(storedDrivers) : mockDrivers;
    setAllDrivers(driversToLoad.filter((d: Driver) => d.isApproved && d.isAvailable));

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

    const loadCategories = () => {
        const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (storedCategories) {
            const parsedCategories = JSON.parse(storedCategories);
            const categoriesWithIcons = parsedCategories.map((cat: Omit<VehicleCategory, 'icon'> & {iconName: string}) => ({
                ...cat,
                icon: getIconComponent(cat.iconName)
            }));
            const allCategory = defaultVehicleCategories.find(c => c.value === 'all');
            setCurrentVehicleCategories(allCategory ? [allCategory, ...categoriesWithIcons] : categoriesWithIcons);
        } else {
            setCurrentVehicleCategories(defaultVehicleCategories);
        }
    };
    loadCategories();
    
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

    // Listen for storage changes to update map in real-time
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === DRIVERS_STORAGE_KEY) {
            const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
            if (storedDrivers) {
                const allDriversFromStorage = JSON.parse(storedDrivers);
                setAllDrivers(allDriversFromStorage.filter((d: Driver) => d.isApproved && d.isAvailable));
            }
        }
        if (e.key === CATEGORIES_STORAGE_KEY) {
            const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
            if (storedCategories) {
                const parsedCategories = JSON.parse(storedCategories);
                const categoriesWithIcons = parsedCategories.map((cat: Omit<VehicleCategory, 'icon'> & {iconName: string}) => ({
                    ...cat,
                    icon: getIconComponent(cat.iconName)
                }));

                const allCategory = defaultVehicleCategories.find(c => c.value === 'all');
                setCurrentVehicleCategories(allCategory ? [allCategory, ...categoriesWithIcons] : categoriesWithIcons);
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
    };
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
      <div className="h-full w-full relative">
        <Map
          defaultCenter={userLocation}
          defaultZoom={13}
          mapId="sulytrack-map"
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
