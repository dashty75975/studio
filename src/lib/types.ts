export type VehicleType = 'bus' | 'taxi' | 'truck' | 'minibus' | 'motorcycle';

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
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
