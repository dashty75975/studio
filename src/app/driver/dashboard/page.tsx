
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import type { Driver } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const DRIVERS_STORAGE_KEY = 'sulytrack_drivers';
const LOGGED_IN_DRIVER_KEY = 'sulytrack_logged_in_driver';

export default function DriverDashboardPage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInDriverId = localStorage.getItem(LOGGED_IN_DRIVER_KEY);
    if (!loggedInDriverId) {
      router.push('/driver/login');
      return;
    }

    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    const allDrivers: Driver[] = storedDrivers ? JSON.parse(storedDrivers) : [];
    const currentDriver = allDrivers.find(d => d._id === loggedInDriverId);

    if (currentDriver) {
      setDriver(currentDriver);
    } else {
      // Driver not found, maybe data is out of sync. Clear login and redirect.
      localStorage.removeItem(LOGGED_IN_DRIVER_KEY);
      router.push('/driver/login');
    }
  }, [router]);

  const updateDriverStatus = (isAvailable: boolean) => {
    if (!driver) return;
    
    const updatedDriver = { ...driver, isAvailable };
    setDriver(updatedDriver);

    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    const allDrivers: Driver[] = storedDrivers ? JSON.parse(storedDrivers) : [];
    const updatedDrivers = allDrivers.map(d => d._id === driver._id ? updatedDriver : d);
    
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(updatedDrivers));
    window.dispatchEvent(new Event('storage')); // Manually trigger storage event for map view
  };

  const handleLogout = () => {
    localStorage.removeItem(LOGGED_IN_DRIVER_KEY);
    router.push('/driver/login');
  };

  if (!driver) {
    return <div className="container mx-auto py-12 flex justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={driver.vehicleImage} alt={driver.name} />
                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
            </Avatar>
           </div>
          <CardTitle className="text-3xl font-bold tracking-tight">{driver.name}</CardTitle>
          <CardDescription className="capitalize">{driver.vehicleType.replace('_', ' ')} - {driver.licensePlate}</CardDescription>
        </CardHeader>
        <CardContent>
            <Separator className="my-4" />
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                    <Label htmlFor="availability-switch" className="text-lg">Your Status</Label>
                    <p className="text-sm text-muted-foreground">
                        Toggle to go online or offline.
                    </p>
                </div>
                 <Switch
                    id="availability-switch"
                    checked={driver.isAvailable}
                    onCheckedChange={updateDriverStatus}
                    className="data-[state=checked]:bg-green-500"
                />
            </div>
             <p className="text-center text-xl font-bold mt-4">
                You are currently <span className={driver.isAvailable ? 'text-green-500' : 'text-red-500'}>{driver.isAvailable ? 'ONLINE' : 'OFFLINE'}</span>
            </p>
        </CardContent>
        <CardFooter>
            <Button variant="outline" onClick={handleLogout} className="w-full">
                Logout
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
