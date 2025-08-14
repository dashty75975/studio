
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Driver } from '@/lib/types';

const LOGGED_IN_DRIVER_KEY = 'sulytrack_logged_in_driver';

export default function DriverLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Please enter both email and password.",
        });
        return;
    }

    try {
        const driversRef = collection(db, "drivers");
        const q = query(driversRef, where("email", "==", email), where("isApproved", "==", true));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password, or your account is not approved.",
            });
            return;
        }

        const driverDoc = querySnapshot.docs[0];
        const driver = { _id: driverDoc.id, ...driverDoc.data() } as Driver;

        if (driver.password === password) {
            localStorage.setItem(LOGGED_IN_DRIVER_KEY, driver._id);
            router.push('/driver/dashboard');
        } else {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid email or password, or your account is not approved.",
            });
        }
    } catch (error) {
        console.error("Error logging in: ", error);
        toast({
            variant: "destructive",
            title: "Login Error",
            description: "An unexpected error occurred. Please try again.",
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
