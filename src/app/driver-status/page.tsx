
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { mockDrivers as initialMockDrivers } from "@/lib/mock-data";
import type { Driver } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DRIVERS_STORAGE_KEY = 'sulytrack_drivers';

export default function DriverStatusPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (storedDrivers) {
      setDrivers(JSON.parse(storedDrivers));
    } else {
      setDrivers(initialMockDrivers);
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(initialMockDrivers));
    }
  }, []);

  const updateDriversStateAndStorage = (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(newDrivers));
    window.dispatchEvent(new Event('storage')); // Manually trigger storage event for map view
  };

  const handleStatusChange = (driverId: string, isAvailable: boolean) => {
    const updatedDrivers = drivers.map(d =>
      d._id === driverId ? { ...d, isAvailable } : d
    );
    updateDriversStateAndStorage(updatedDrivers);
  };

  return (
    <div className="container mx-auto py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Driver Status</CardTitle>
          <CardDescription>Toggle your availability to appear on the map.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead className="text-right">Status (Online/Offline)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.filter(d => d.isApproved).map((driver) => (
                <TableRow key={driver._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                       <Avatar>
                        <AvatarImage src={driver.vehicleImage} alt={driver.name} />
                        <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{driver.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{driver.vehicleType.replace('_', ' ')} - {driver.licensePlate}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={driver.isAvailable}
                      onCheckedChange={(checked) => handleStatusChange(driver._id, checked)}
                      aria-label={`${driver.name}'s availability status`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
