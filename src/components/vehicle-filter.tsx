'use client';

import { Button } from '@/components/ui/button';
import type { VehicleCategory, VehicleType } from '@/lib/types';

interface VehicleFilterProps {
  vehicleType: VehicleType | 'all';
  setVehicleType: (type: VehicleType | 'all') => void;
  vehicleCategories: VehicleCategory[];
}

export default function VehicleFilter({ vehicleType, setVehicleType, vehicleCategories }: VehicleFilterProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm p-1 rounded-lg shadow-lg flex gap-1 flex-wrap justify-center">
      {vehicleCategories.map((type) => (
        <Button
          key={type.value}
          variant={vehicleType === type.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setVehicleType(type.value as VehicleType | 'all')}
          className="flex items-center gap-2"
          aria-label={`Filter by ${type.label}`}
        >
          <type.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{type.label}</span>
        </Button>
      ))}
    </div>
  );
}
