import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Gauge,
  FileText,
  Calendar,
  User
} from 'lucide-react';

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

interface VehicleListProps {
  vehicles: Vehicle[];
  customFields: CustomField[];
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
}

const statusConfig = {
  available: { label: 'Available', color: 'bg-status-available text-white' },
  'in-use': { label: 'In Use', color: 'bg-status-in-use text-white' },
  maintenance: { label: 'Maintenance', color: 'bg-status-maintenance text-white' },
  inactive: { label: 'Inactive', color: 'bg-status-inactive text-white' }
};

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  customFields,
  onEditVehicle,
  onDeleteVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(vehicle.customFields).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <Card className="hover:shadow-medium transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{vehicle.name}</CardTitle>
              <CardDescription>
                {vehicle.customFields.vehicleType || 'Vehicle'}
              </CardDescription>
            </div>
          </div>
          <Badge className={statusConfig[vehicle.status].color}>
            {statusConfig[vehicle.status].label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {vehicle.mileage.toLocaleString()} miles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {vehicle.documents.length} docs
            </span>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="space-y-2">
          {customFields.slice(0, 2).map(field => {
            const value = vehicle.customFields[field.name];
            if (!value) return null;
            
            return (
              <div key={field.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{field.name}:</span>
                <span className="font-medium">{value}</span>
              </div>
            );
          })}
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>Updated by {vehicle.updatedBy}</span>
          <Calendar className="h-3 w-3 ml-2" />
          <span>{vehicle.lastUpdated}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => onEditVehicle(vehicle)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            onClick={() => onDeleteVehicle(vehicle.id)}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const VehicleRow = ({ vehicle }: { vehicle: Vehicle }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 grid grid-cols-6 gap-4 items-center">
              <div>
                <p className="font-medium">{vehicle.name}</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.customFields.vehicleType || 'Vehicle'}
                </p>
              </div>
              
              <Badge className={statusConfig[vehicle.status].color}>
                {statusConfig[vehicle.status].label}
              </Badge>
              
              <div className="text-sm">
                <span className="font-medium">{vehicle.mileage.toLocaleString()}</span>
                <span className="text-muted-foreground"> miles</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">{vehicle.documents.length}</span>
                <span className="text-muted-foreground"> docs</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {vehicle.updatedBy}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {vehicle.lastUpdated}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => onEditVehicle(vehicle)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onDeleteVehicle(vehicle.id)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>
                Manage and monitor your fleet vehicles
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Vehicles Display */}
      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No vehicles found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Add your first vehicle to get started'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredVehicles.map(vehicle => 
            viewMode === 'grid' 
              ? <VehicleCard key={vehicle.id} vehicle={vehicle} />
              : <VehicleRow key={vehicle.id} vehicle={vehicle} />
          )}
        </div>
      )}
    </div>
  );
};