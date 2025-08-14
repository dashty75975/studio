export type VehicleType = 'bus' | 'taxi' | 'truck' | 'motorcycle' | 'vegetable' | 'gas' | 'flat_recovery';

export interface VehicleCategory {
  value: VehicleType | 'all' | string;
  label: string;
  icon: React.ElementType;
  color: string;
}


export interface Driver {
  _id: string;
  name: string;
  phone: string;
  email: string;
  password?: string; // Made optional for existing drivers
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
  createdAt: string;
}
