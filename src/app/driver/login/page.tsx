
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockDrivers as initialMockDrivers } from "@/lib/mock-data";
import type { Driver } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const DRIVERS_STORAGE_KEY = 'sulytrack_drivers';
const LOGGED_IN_DRIVER_KEY = 'sulytrack_logged_in_driver';

export default function DriverLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    const allDrivers = storedDrivers ? JSON.parse(storedDrivers) : initialMockDrivers;
    setDrivers(allDrivers);
  }, []);

  const handleLogin = () => {
    const driver = drivers.find(d => d.email === email && d.isApproved);

    if (driver && driver.password === password) {
      localStorage.setItem(LOGGED_IN_DRIVER_KEY, driver._id);
      router.push('/driver/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password, or your account is not approved.",
      });
    }
  };

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Driver Login</CardTitle>
          <CardDescription>Enter your credentials to manage your status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="********" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} disabled={!email || !password} className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
