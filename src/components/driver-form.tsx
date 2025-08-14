
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { vehicleCategories } from '@/lib/mock-data';
import type { Driver } from '@/lib/types';
import { useEffect } from 'react';

const vehicleTypes = vehicleCategories.map(vc => vc.value).filter(v => v !== 'all') as [string, ...string[]];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().optional(),
  vehicleType: z.enum(vehicleTypes, { required_error: 'Please select a vehicle type.' }),
  vehicleModel: z.string().min(2, 'Vehicle model is required.'),
  licensePlate: z.string().min(4, 'License plate is too short.'),
  isApproved: z.boolean(),
  isAvailable: z.boolean(),
});

type DriverFormValues = z.infer<typeof formSchema>;

interface DriverFormProps {
  driver: Omit<Driver, 'location' | 'rating' | 'createdAt' | 'vehicleImage' | '_id'> & { _id?: string } | null;
  onSubmit: (data: DriverFormValues, driverId?: string) => void;
}

export default function DriverForm({ driver, onSubmit }: DriverFormProps) {
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      vehicleModel: '',
      licensePlate: '',
      isApproved: false,
      isAvailable: false,
    },
  });

  useEffect(() => {
    if (driver) {
      form.reset({
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        password: '', // Don't pre-fill password
        vehicleType: driver.vehicleType,
        vehicleModel: driver.vehicleModel,
        licensePlate: driver.licensePlate,
        isApproved: driver.isApproved,
        isAvailable: driver.isAvailable,
      });
    } else {
        form.reset({
            name: '',
            phone: '',
            email: '',
            password: '',
            vehicleModel: '',
            licensePlate: '',
            vehicleType: undefined,
            isApproved: false,
            isAvailable: false,
        });
    }
  }, [driver, form]);

  const handleSubmit = (values: DriverFormValues) => {
    onSubmit(values, driver?._id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Ranj Karem" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+964 770 123 4567" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                    <FormLabel>New Password (optional)</FormLabel>
                    <FormControl><Input type="password" placeholder="Leave blank to keep current" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="vehicleType" render={({ field }) => (
                <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a vehicle type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {vehicleCategories.filter(cat => cat.value !== 'all').map(category => (
                                <SelectItem key={category.value} value={category.value} className="capitalize">{category.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="vehicleModel" render={({ field }) => (
                <FormItem>
                    <FormLabel>Vehicle Model</FormLabel>
                    <FormControl><Input placeholder="e.g. Toyota Corolla 2022" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="licensePlate" render={({ field }) => (
                <FormItem>
                    <FormLabel>License Plate</FormLabel>
                    <FormControl><Input placeholder="2345 SUL" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        <div className="flex gap-8 pt-4">
             <FormField
                control={form.control}
                name="isApproved"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5 mr-4">
                        <FormLabel>Approved</FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5 mr-4">
                        <FormLabel>Available</FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
            />
        </div>
        <Button type="submit" className="w-full">
          {driver ? 'Save Changes' : 'Create Driver'}
        </Button>
      </form>
    </Form>
  );
}
