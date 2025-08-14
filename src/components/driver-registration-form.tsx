'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const vehicleTypes = ['bus', 'taxi', 'truck', 'minibus', 'motorcycle'] as const;

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.'),
  email: z.string().email('Invalid email address.'),
  licenseNumber: z.string().min(5, 'License number is too short.'),
  vehicleType: z.enum(vehicleTypes, { required_error: 'Please select a vehicle type.' }),
  vehicleModel: z.string().min(2, 'Vehicle model is required.'),
  licensePlate: z.string().min(4, 'License plate is too short.'),
  vehicleImage: z.any().refine((files) => files?.length === 1, 'Vehicle image is required.'),
});

export default function DriverRegistrationForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      licenseNumber: '',
      vehicleModel: '',
      licensePlate: '',
      vehicleImage: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would submit this to your backend, likely using a server action.
    console.log(values);
    toast({
      title: "Registration Submitted!",
      description: "Your application is under review. We will notify you once it's approved.",
    });
    form.reset();
  }

  const fileRef = form.register("vehicleImage");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
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
                <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Driving License Number</FormLabel>
                        <FormControl><Input placeholder="SUL12345" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
        </div>
        <Separator />
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="vehicleType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a vehicle type" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {vehicleTypes.map(type => (<SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>))}
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
                <FormField control={form.control} name="vehicleImage" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vehicle Image</FormLabel>
                        <FormControl><Input type="file" accept="image/*" {...fileRef} /></FormControl>
                        <FormDescription>A clear picture of your vehicle.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
        </div>
        <Button type="submit" className="w-full">Submit Application</Button>
      </form>
    </Form>
  );
}
