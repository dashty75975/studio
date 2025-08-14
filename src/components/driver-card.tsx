import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Phone, Star } from 'lucide-react';
import type { Driver } from '@/lib/types';

const vehicleHintMap: Record<Driver['vehicleType'], string> = {
  taxi: 'car taxi',
  bus: 'bus transport',
  truck: 'truck delivery',
  motorcycle: 'motorcycle delivery',
  vegetable: 'vegetable truck',
  gas: 'gas cylinder',
  flat_recovery: 'tow truck',
};

export default function DriverCard({ driver }: { driver: Driver }) {
  return (
    <Card className="w-64 border-none shadow-none bg-transparent">
      <CardHeader className="p-2">
        <Image
          src={driver.vehicleImage}
          alt={driver.vehicleModel}
          width={250}
          height={150}
          className="rounded-t-md object-cover aspect-[3/2]"
          data-ai-hint={vehicleHintMap[driver.vehicleType]}
        />
        <CardTitle className="pt-2 text-base">{driver.name}</CardTitle>
        <CardDescription className="text-xs capitalize">{driver.vehicleType.replace('_', ' ')} - {driver.vehicleModel}</CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0 text-sm">
        <p className="text-muted-foreground text-xs">License: {driver.licensePlate}</p>
        <div className="flex items-center justify-between mt-2">
          <a href={`tel:${driver.phone}`} className="flex items-center gap-1 text-primary hover:underline text-xs">
            <Phone className="h-3 w-3" />
            {driver.phone}
          </a>
          <div className="flex items-center gap-1 font-bold">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            {driver.rating.toFixed(1)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
