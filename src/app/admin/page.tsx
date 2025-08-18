
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Trash2, Edit, LogOut } from "lucide-react";
import { vehicleCategories as initialVehicleCategories } from "@/lib/mock-data";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import CategoryForm from '@/components/category-form';
import DriverForm from '@/components/driver-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { VehicleCategory, Driver } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_LOGGED_IN_KEY = 'suly_admin_logged_in';

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || PlusCircle;
  // Ensure the display name is set for serialization
  if (Icon && !Icon.displayName) {
    Icon.displayName = iconName;
  }
  return Icon;
};


export default function AdminPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const router = useRouter();

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem(ADMIN_LOGGED_IN_KEY);
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch data from Firestore
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    if (querySnapshot.empty) {
       // Seed initial categories if collection is empty
      const batch = initialVehicleCategories.filter(c => c.value !== 'all').map(category => {
        const { icon, ...rest } = category;
        return addDoc(collection(db, 'categories'), rest);
      });
      await Promise.all(batch);
      fetchCategories(); // refetch after seeding
    } else {
      const fetchedCategories = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          value: doc.id,
          icon: getIconComponent(doc.data().iconName),
      })) as VehicleCategory[];
      setCategories(fetchedCategories);
    }
  };

  const fetchDrivers = async () => {
      const querySnapshot = await getDocs(collection(db, "drivers"));
      const fetchedDrivers = querySnapshot.docs.map(doc => ({
          _id: doc.id,
          ...doc.data(),
      })) as Driver[];
      setDrivers(fetchedDrivers);
  };
  
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem(ADMIN_LOGGED_IN_KEY);
    if (isAdminLoggedIn === 'true') {
        fetchCategories();
        fetchDrivers();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_LOGGED_IN_KEY);
    router.push('/admin/login');
  };

  const handleAddCategoryClick = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  }

  const handleEditCategoryClick = (category: VehicleCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  }

  const handleDeleteCategory = async (categoryValue: string) => {
    await deleteDoc(doc(db, "categories", categoryValue));
    fetchCategories();
  }
  
  const handleCategoryFormSubmit = async (data: Omit<VehicleCategory, 'icon'> & {iconName: string}) => {
    const categoryData = {
      label: data.label,
      color: data.color,
      iconName: data.iconName,
    };

    if (selectedCategory) {
      const docRef = doc(db, "categories", selectedCategory.value as string);
      await updateDoc(docRef, categoryData);
    } else {
      await addDoc(collection(db, "categories"), { ...categoryData, value: data.value });
    }
    fetchCategories();
    setCategoryDialogOpen(false);
    setSelectedCategory(null);
  };
  
  const handleAddDriverClick = () => {
    setSelectedDriver(null);
    setDriverDialogOpen(true);
  }

  const handleEditDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setDriverDialogOpen(true);
  }

  const handleDeleteDriver = async (driverId: string) => {
    await deleteDoc(doc(db, "drivers", driverId));
    fetchDrivers();
  }

  const handleDriverFormSubmit = async (data: Omit<Driver, '_id' | 'location' | 'rating' | 'createdAt' | 'vehicleImage'>, driverId?: string) => {
    if (driverId) {
        const docRef = doc(db, "drivers", driverId);
        const updateData: Partial<Driver> = { ...data };
        // Don't update password if it's not provided
        if (!data.password) {
          delete (updateData as any).password;
        }
        await updateDoc(docRef, updateData);
    } else {
      // Add new driver
      const newDriver = {
        ...data,
        location: { type: 'Point', coordinates: [45.4333, 35.5642] }, // Default location
        rating: 5,
        createdAt: serverTimestamp(),
        vehicleImage: 'https://placehold.co/300x200.png',
      };
      await addDoc(collection(db, "drivers"), newDriver);
    }
    fetchDrivers();
    setDriverDialogOpen(false);
    setSelectedDriver(null);
  };


  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-8 relative">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage drivers, categories, and view live tracking.</p>
        <Button variant="outline" size="sm" onClick={handleLogout} className="absolute top-0 right-0">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <div className="grid gap-8">
        
        {/* Driver Management */}
        <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
        <Card className="max-w-6xl mx-auto w-full">
          <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Driver Management</CardTitle>
                  <CardDescription>View, edit, and manage all registered drivers.</CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button onClick={handleAddDriverClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Driver
                  </Button>
                </DialogTrigger>
              </div>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver._id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell className="capitalize">{driver.vehicleType.replace('_', ' ')} - {driver.vehicleModel}</TableCell>
                      <TableCell>{driver.licensePlate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={driver.isApproved ? 'default' : 'destructive'} className={driver.isApproved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
                            {driver.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                          <Badge variant={driver.isAvailable ? 'default' : 'secondary'}>
                            {driver.isAvailable ? 'Available' : 'Offline'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{driver.rating.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleEditDriverClick(driver)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                  <span className="text-destructive">Delete</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the driver
                                    <span className="font-bold"> {driver.name}</span>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteDriver(driver._id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{selectedDriver ? 'Edit' : 'Add'} Driver</DialogTitle>
            </DialogHeader>
            <DriverForm
                driver={selectedDriver}
                onSubmit={handleDriverFormSubmit}
                categories={categories}
            />
        </DialogContent>
        </Dialog>


        {/* Category Management */}
        <Card className="max-w-4xl mx-auto w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vehicle Categories</CardTitle>
                <CardDescription>Manage the types of vehicles available in the app.</CardDescription>
              </div>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                   <Button onClick={handleAddCategoryClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedCategory ? 'Edit' : 'Add'} Category</DialogTitle>
                  </DialogHeader>
                  <CategoryForm
                    category={selectedCategory}
                    onSubmit={handleCategoryFormSubmit}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Icon Preview</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                   <TableRow key={category.value}>
                    <TableCell className="font-medium capitalize">{category.label}</TableCell>
                    <TableCell><category.icon className="h-5 w-5" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="font-mono text-xs">{category.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEditCategoryClick(category as VehicleCategory)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                <span className="text-destructive">Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the
                                  <span className="font-bold"> {category.label} </span> category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCategory(category.value as string)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    