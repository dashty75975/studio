
import DriverRegistrationForm from '@/components/driver-registration-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Driver Registration</CardTitle>
          <CardDescription>Join REGA and start driving today. Fill out the form below to apply.</CardDescription>
        </CardHeader>
        <CardContent>
          <DriverRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
