
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDrivers as initialMockDrivers } from "@/lib/mock-data";
import type { Driver } from '@/lib/types';
import { Label } from '@/components/ui/label';

const DRIVERS_STORAGE_KEY = 'sulytrack_drivers';
const LOGGED_IN_DRIVER_KEY = 'sulytrack_logged_in_driver';

export default function DriverLoginPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    const approvedDrivers = (storedDrivers ? JSON.parse(storedDrivers) : initialMockDrivers).filter((d: Driver) => d.isApproved);
    setDrivers(approvedDrivers);
  }, []);

  const handleLogin = () => {
    if (selectedDriver) {
      localStorage.setItem(LOGGED_IN_DRIVER_KEY, selectedDriver);
      router.push('/driver/dashboard');
    }
  };

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Driver Login</CardTitle>
          <CardDescription>Select your name to manage your status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="driver-select">Select Your Profile</Label>
            <Select onValueChange={setSelectedDriver} value={selectedDriver}>
              <SelectTrigger id="driver-select">
                <SelectValue placeholder="Select your name..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver._id} value={driver._id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
           </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} disabled={!selectedDriver} className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
