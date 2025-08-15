
import type { VehicleCategory } from './types';
import { Car, Bus, Truck, Bike, Carrot, Fuel, Wrench } from 'lucide-react';

export const vehicleCategories: Omit<VehicleCategory, 'icon'> & { icon: React.ElementType, iconName: string }[] = [
    { value: 'taxi', label: 'Taxi', icon: Car, color: '#FFD700', iconName: 'Car' },
    { value: 'bus', label: 'Bus', icon: Bus, color: '#00BFFF', iconName: 'Bus' },
    { value: 'truck', label: 'Truck', icon: Truck, color: '#DC143C', iconName: 'Truck' },
    { value: 'motorcycle', label: 'Motorcycle', icon: Bike, color: '#FF8C00', iconName: 'Bike' },
    { value: 'vegetable', label: 'Vegetable', icon: Carrot, color: '#228B22', iconName: 'Carrot' },
    { value: 'gas', label: 'Gas', icon: Fuel, color: '#FF4500', iconName: 'Fuel' },
    { value: 'flat_recovery', label: 'Flat Recovery', icon: Wrench, color: '#4682B4', iconName: 'Wrench' },
];
