
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { vehicleCategories as initialVehicleCategories, mockDrivers } from "@/lib/mock-data";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CategoryForm from '@/components/category-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { VehicleCategory, Driver } from '@/lib/types';
import { Badge } from '@/components/ui/badge';


export default function AdminPage() {
  const [categories, setCategories] = useState(initialVehicleCategories.filter(c => c.value !== 'all'));
  const [drivers, setDrivers] = useState(mockDrivers);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | null>(null);

  const handleAddCategoryClick = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  }

  const handleEditCategoryClick = (category: VehicleCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  }

  const handleDeleteCategory = (categoryValue: string) => {
    setCategories(categories.filter(c => c.value !== categoryValue));
  }
  
  const handleCategoryFormSubmit = (data: Omit<VehicleCategory, 'icon'> & {iconName: string}) => {
    // In a real app, you'd look up the icon component from a map
    // For now, we'll just show a placeholder or a default icon.
    const newCategory: any = {
      value: data.value,
      label: data.label,
      color: data.color,
      icon: PlusCircle, // Placeholder
    };

    if (selectedCategory) {
      setCategories(categories.map(c => c.value === selectedCategory.value ? newCategory : c));
    } else {
      setCategories([...categories, newCategory]);
    }
    setCategoryDialogOpen(false);
    setSelectedCategory(null);
  };
  
  const handleDeleteDriver = (driverId: string) => {
    setDrivers(drivers.filter(d => d._id !== driverId));
  }


  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage drivers, categories, and view live tracking.</p>
      </div>
      <div className="grid gap-8">
        
        {/* Driver Management */}
        <Card className="max-w-6xl mx-auto w-full">
          <CardHeader>
             <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Driver Management</CardTitle>
                  <CardDescription>View, edit, and manage all registered drivers.</CardDescription>
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Driver
                </Button>
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
                          <Badge variant={driver.isApproved ? 'default' : 'destructive'} className="bg-green-600 hover:bg-green-700">
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
                            <DropdownMenuItem>
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
                          <DropdownMenuItem onClick={() => handleEditCategoryClick(category as VehicleCategory)}>
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
