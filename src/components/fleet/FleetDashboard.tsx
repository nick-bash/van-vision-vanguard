import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Plus, 
  Settings2, 
  FileText, 
  AlertCircle, 
  Calendar,
  Gauge,
  Users,
  BarChart3
} from 'lucide-react';
import { VehicleList } from './VehicleList';
import { VehicleForm } from './VehicleForm';
import { FieldManager } from './FieldManager';
import { RemindersPanel } from './RemindersPanel';

interface Vehicle {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance' | 'inactive';
  mileage: number;
  customFields: Record<string, any>;
  documents: string[];
  lastUpdated: string;
  updatedBy: string;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown';
  options?: string[];
  required: boolean;
}

interface Reminder {
  id: string;
  vehicleId: string;
  description: string;
  triggerType: 'date' | 'mileage';
  triggerValue: string | number;
  status: 'incomplete' | 'complete';
  completedAt?: string;
  completedBy?: string;
}

// Mock data
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Fleet Van 001',
    status: 'available',
    mileage: 45670,
    customFields: {
      vehicleType: 'Cargo Van',
      licensePlate: 'ABC-123',
      year: 2022
    },
    documents: ['insurance.pdf', 'registration.pdf'],
    lastUpdated: '2024-01-15 10:30',
    updatedBy: 'John Smith'
  },
  {
    id: '2',
    name: 'Fleet Van 002',
    status: 'in-use',
    mileage: 38920,
    customFields: {
      vehicleType: 'Delivery Van',
      licensePlate: 'DEF-456',
      year: 2021
    },
    documents: ['insurance.pdf'],
    lastUpdated: '2024-01-14 15:45',
    updatedBy: 'Sarah Johnson'
  },
  {
    id: '3',
    name: 'Fleet Truck 003',
    status: 'maintenance',
    mileage: 67340,
    customFields: {
      vehicleType: 'Box Truck',
      licensePlate: 'GHI-789',
      year: 2020
    },
    documents: ['insurance.pdf', 'maintenance_log.pdf'],
    lastUpdated: '2024-01-13 09:15',
    updatedBy: 'Mike Wilson'
  }
];

const mockFields: CustomField[] = [
  { id: '1', name: 'Vehicle Type', type: 'dropdown', options: ['Cargo Van', 'Delivery Van', 'Box Truck', 'Pickup Truck'], required: true },
  { id: '2', name: 'License Plate', type: 'text', required: true },
  { id: '3', name: 'Year', type: 'number', required: false },
  { id: '4', name: 'Fuel Type', type: 'dropdown', options: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'], required: false }
];

const mockReminders: Reminder[] = [
  {
    id: '1',
    vehicleId: '1',
    description: 'Annual inspection due',
    triggerType: 'date',
    triggerValue: '2024-02-15',
    status: 'incomplete'
  },
  {
    id: '2',
    vehicleId: '2',
    description: 'Oil change required',
    triggerType: 'mileage',
    triggerValue: 40000,
    status: 'incomplete'
  },
  {
    id: '3',
    vehicleId: '3',
    description: 'Brake inspection',
    triggerType: 'date',
    triggerValue: '2024-01-20',
    status: 'complete',
    completedAt: '2024-01-18 14:30',
    completedBy: 'Mike Wilson'
  }
];

export const FleetDashboard: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [customFields, setCustomFields] = useState<CustomField[]>(mockFields);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const getStatusCounts = () => {
    return vehicles.reduce((counts, vehicle) => {
      counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();
  const pendingReminders = reminders.filter(r => r.status === 'incomplete').length;

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleSaveVehicle = (vehicleData: Partial<Vehicle>) => {
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id 
          ? { ...v, ...vehicleData, lastUpdated: new Date().toLocaleString(), updatedBy: 'Current User' }
          : v
      ));
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        name: vehicleData.name || '',
        status: vehicleData.status || 'available',
        mileage: vehicleData.mileage || 0,
        customFields: vehicleData.customFields || {},
        documents: vehicleData.documents || [],
        lastUpdated: new Date().toLocaleString(),
        updatedBy: 'Current User'
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
    setShowVehicleForm(false);
    setEditingVehicle(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fleet Management</h1>
                <p className="text-muted-foreground">Manage your delivery vehicles efficiently</p>
              </div>
            </div>
            <Button onClick={handleAddVehicle} variant="fleet" size="lg">
              <Plus className="h-5 w-5" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                  <p className="text-3xl font-bold text-foreground">{vehicles.length}</p>
                </div>
                <Car className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available</p>
                  <p className="text-3xl font-bold text-success">{statusCounts.available || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-status-available/20 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-status-available" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reminders Due</p>
                  <p className="text-3xl font-bold text-destructive">{pendingReminders}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl bg-muted">
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Fields
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleList 
              vehicles={vehicles}
              customFields={customFields}
              onEditVehicle={handleEditVehicle}
              onDeleteVehicle={(id) => setVehicles(prev => prev.filter(v => v.id !== id))}
            />
          </TabsContent>

          <TabsContent value="fields">
            <FieldManager 
              fields={customFields}
              onUpdateFields={setCustomFields}
            />
          </TabsContent>

          <TabsContent value="reminders">
            <RemindersPanel 
              reminders={reminders}
              vehicles={vehicles}
              onUpdateReminders={setReminders}
            />
          </TabsContent>

        </Tabs>
      </div>

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <VehicleForm
          vehicle={editingVehicle}
          customFields={customFields}
          onSave={handleSaveVehicle}
          onCancel={() => {
            setShowVehicleForm(false);
            setEditingVehicle(null);
          }}
        />
      )}
    </div>
  );
};