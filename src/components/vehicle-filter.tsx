'use client';

import { Button } from '@/components/ui/button';
import type { VehicleType } from '@/lib/types';
import { Car, Bus, Truck, Bike, Users2, Grip, Carrot, Fuel, Wrench } from 'lucide-react';

const vehicleTypes: { value: VehicleType | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Grip className="h-4 w-4" /> },
  { value: 'taxi', label: 'Taxi', icon: <Car className="h-4 w-4" /> },
  { value: 'bus', label: 'Bus', icon: <Bus className="h-4 w-4" /> },
  { value: 'truck', label: 'Truck', icon: <Truck className="h-4 w-4" /> },
  { value: 'motorcycle', label: 'Motorcycle', icon: <Bike className="h-4 w-4" /> },
  { value: 'vegetable', label: 'Vegetable', icon: <Carrot className="h-4 w-4" /> },
  { value: 'gas', label: 'Gas', icon: <Fuel className="h-4 w-4" /> },
  { value: 'flat_recovery', label: 'Flat Recovery', icon: <Wrench className="h-4 w-4" /> },
];

interface VehicleFilterProps {
  vehicleType: VehicleType | 'all';
  setVehicleType: (type: VehicleType | 'all') => void;
}

export default function VehicleFilter({ vehicleType, setVehicleType }: VehicleFilterProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-lg flex gap-1 flex-wrap justify-center">
      {vehicleTypes.map((type) => (
        <Button
          key={type.value}
          variant={vehicleType === type.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setVehicleType(type.value)}
          className="flex items-center gap-2"
          aria-label={`Filter by ${type.label}`}
        >
          {type.icon}
          <span className="hidden sm:inline">{type.label}</span>
        </Button>
      ))}
    </div>
  );
}
