
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { vehicleCategories as initialVehicleCategories, mockDrivers as initialMockDrivers } from "@/lib/mock-data";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CategoryForm from '@/components/category-form';
import DriverForm from '@/components/driver-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { VehicleCategory, Driver } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';


const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || PlusCircle;
};

const DRIVERS_STORAGE_KEY = 'sulytrack_drivers';
const CATEGORIES_STORAGE_KEY = 'sulytrack_categories';

export default function AdminPage() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const storedDrivers = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (storedDrivers) {
      setDrivers(JSON.parse(storedDrivers));
    } else {
      setDrivers(initialMockDrivers);
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(initialMockDrivers));
    }

    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const parsedCategories = storedCategories ? JSON.parse(storedCategories) : initialVehicleCategories.filter(c => c.value !== 'all');
    
    // Icons are not serializable, so we need to map them back
    const categoriesWithIcons = parsedCategories.map((cat: Omit<VehicleCategory, 'icon'> & {iconName: string}) => ({
        ...cat,
        icon: getIconComponent(cat.iconName)
    }));
    setCategories(categoriesWithIcons);

  }, []);

  const updateDriversStateAndStorage = (newDrivers: Driver[]) => {
    setDrivers(newDrivers);
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(newDrivers));
    window.dispatchEvent(new Event('storage')); // Manually trigger storage event
  }
  
  const updateCategoriesStateAndStorage = (newCategories: VehicleCategory[]) => {
    const serializableCategories = newCategories.map(c => ({
      value: c.value,
      label: c.label,
      color: c.color,
      iconName: (c.icon as any).displayName || 'PlusCircle' // Store icon name instead of component
    }));
    setCategories(newCategories);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(serializableCategories));
    window.dispatchEvent(new Event('storage')); // Manually trigger storage event
  }

  const handleAddCategoryClick = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  }

  const handleEditCategoryClick = (category: VehicleCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  }

  const handleDeleteCategory = (categoryValue: string) => {
    updateCategoriesStateAndStorage(categories.filter(c => c.value !== categoryValue));
  }
  
  const handleCategoryFormSubmit = (data: Omit<VehicleCategory, 'icon'> & {iconName: string}) => {
    const IconComponent = getIconComponent(data.iconName);

    const newOrUpdatedCategory: VehicleCategory = {
      value: data.value,
      label: data.label,
      color: data.color,
      icon: IconComponent,
    };

    if (selectedCategory) {
      updateCategoriesStateAndStorage(categories.map(c => 
        c.value === selectedCategory.value ? newOrUpdatedCategory : c
      ));
    } else {
      updateCategoriesStateAndStorage([...categories, newOrUpdatedCategory]);
    }
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

  const handleDeleteDriver = (driverId: string) => {
    const updatedDrivers = drivers.filter(d => d._id !== driverId);
    updateDriversStateAndStorage(updatedDrivers);
  }

  const handleDriverFormSubmit = (data: Omit<Driver, '_id' | 'location' | 'rating' | 'createdAt' | 'vehicleImage'>, driverId?: string) => {
    if (driverId) {
        const updatedDrivers = drivers.map(d =>
            d._id === driverId ? { ...d, ...data } : d
          );
      updateDriversStateAndStorage(updatedDrivers);
    } else {
      // Add new driver
      const newDriver: Driver = {
        ...data,
        _id: (Math.random() * 10000).toString(),
        location: { type: 'Point', coordinates: [45.4333, 35.5642] }, // Default location
        rating: 5,
        createdAt: new Date().toISOString(),
        vehicleImage: 'https://placehold.co/300x200.png',
      };
      const updatedDrivers = [...drivers, newDriver];
      updateDriversStateAndStorage(updatedDrivers);
    }
    setDriverDialogOpen(false);
    setSelectedDriver(null);
  };


  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage drivers, categories, and view live tracking.</p>
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

    