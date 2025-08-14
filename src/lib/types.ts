
import type { Timestamp } from 'firebase/firestore';

export type VehicleType = 'bus' | 'taxi' | 'truck' | 'motorcycle' | 'vegetable' | 'gas' | 'flat_recovery';

export interface VehicleCategory {
  value: VehicleType | 'all' | string;
  label: string;
  icon: React.ElementType;
  iconName: string; // Add this to store the name for serialization
  color: string;
}

export interface Driver {
  _id: string; // Firestore document ID
  name: string;
  phone: string;
  email: string;
  password?: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  licensePlate: string;
  vehicleImage: string;
  isAvailable: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  rating: number;
  isApproved: boolean;
  createdAt: Timestamp | string; // Firestore Timestamp
}
