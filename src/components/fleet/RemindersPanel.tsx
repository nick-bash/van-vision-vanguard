import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Calendar, 
  Gauge, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2,
  X,
  Save,
  AlertCircle,
  Car,
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

interface RemindersPanelProps {
  reminders: Reminder[];
  vehicles: Vehicle[];
  onUpdateReminders: (reminders: Reminder[]) => void;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({
  reminders,
  vehicles,
  onUpdateReminders
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    description: '',
    triggerType: 'date' as 'date' | 'mileage',
    triggerValue: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      description: '',
      triggerType: 'date',
      triggerValue: ''
    });
    setErrors({});
    setEditingReminder(null);
  };

  const handleAddReminder = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setFormData({
      vehicleId: reminder.vehicleId,
      description: reminder.description,
      triggerType: reminder.triggerType,
      triggerValue: reminder.triggerValue.toString()
    });
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Please select a vehicle';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.triggerValue) {
      newErrors.triggerValue = 'Trigger value is required';
    } else if (formData.triggerType === 'mileage' && (isNaN(Number(formData.triggerValue)) || Number(formData.triggerValue) <= 0)) {
      newErrors.triggerValue = 'Mileage must be a positive number';
    } else if (formData.triggerType === 'date') {
      const date = new Date(formData.triggerValue);
      if (isNaN(date.getTime())) {
        newErrors.triggerValue = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const reminderData: Reminder = {
      id: editingReminder?.id || Date.now().toString(),
      vehicleId: formData.vehicleId,
      description: formData.description.trim(),
      triggerType: formData.triggerType,
      triggerValue: formData.triggerType === 'mileage' 
        ? Number(formData.triggerValue) 
        : formData.triggerValue,
      status: editingReminder?.status || 'incomplete',
      completedAt: editingReminder?.completedAt,
      completedBy: editingReminder?.completedBy
    };

    if (editingReminder) {
      onUpdateReminders(reminders.map(r => r.id === editingReminder.id ? reminderData : r));
    } else {
      onUpdateReminders([...reminders, reminderData]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleCompleteReminder = (reminderId: string) => {
    onUpdateReminders(reminders.map(r => 
      r.id === reminderId 
        ? { 
            ...r, 
            status: 'complete', 
            completedAt: new Date().toLocaleString(),
            completedBy: 'Current User'
          }
        : r
    ));
  };

  const handleDeleteReminder = (reminderId: string) => {
    onUpdateReminders(reminders.filter(r => r.id !== reminderId));
  };

  const getVehicleName = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.name || 'Unknown Vehicle';
  };

  const getCurrentMileage = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)?.mileage || 0;
  };

  const isReminderDue = (reminder: Reminder) => {
    if (reminder.status === 'complete') return false;
    
    if (reminder.triggerType === 'date') {
      const triggerDate = new Date(reminder.triggerValue as string);
      const today = new Date();
      return triggerDate <= today;
    } else {
      const currentMileage = getCurrentMileage(reminder.vehicleId);
      return currentMileage >= (reminder.triggerValue as number);
    }
  };

  const incompleteReminders = reminders.filter(r => r.status === 'incomplete');
  const completedReminders = reminders.filter(r => r.status === 'complete');
  const dueReminders = incompleteReminders.filter(isReminderDue);

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const isDue = isReminderDue(reminder);
    const vehicle = vehicles.find(v => v.id === reminder.vehicleId);
    
    return (
      <Card className={`hover:shadow-medium transition-shadow ${isDue && reminder.status === 'incomplete' ? 'border-destructive' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{getVehicleName(reminder.vehicleId)}</span>
                {isDue && reminder.status === 'incomplete' && (
                  <Badge variant="destructive" className="text-xs">
                    Due
                  </Badge>
                )}
                {reminder.status === 'complete' && (
                  <Badge className="bg-success text-success-foreground text-xs">
                    Completed
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-foreground mb-2">{reminder.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  {reminder.triggerType === 'date' ? (
                    <Calendar className="h-3 w-3" />
                  ) : (
                    <Gauge className="h-3 w-3" />
                  )}
                  <span>
                    {reminder.triggerType === 'date' 
                      ? new Date(reminder.triggerValue as string).toLocaleDateString()
                      : `${reminder.triggerValue.toLocaleString()} miles`
                    }
                  </span>
                </div>
                
                {reminder.triggerType === 'mileage' && vehicle && (
                  <div className="text-xs">
                    Current: {vehicle.mileage.toLocaleString()} miles
                  </div>
                )}
              </div>
              
              {reminder.status === 'complete' && reminder.completedAt && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Completed by {reminder.completedBy} on {reminder.completedAt}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {reminder.status === 'incomplete' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCompleteReminder(reminder.id)}
                  className="text-success hover:text-success"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditReminder(reminder)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteReminder(reminder.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Reminders</CardTitle>
              <CardDescription>
                Track maintenance schedules and important vehicle events
              </CardDescription>
            </div>
            <Button onClick={handleAddReminder} variant="fleet">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Now</p>
                    <p className="text-2xl font-bold text-destructive">{dueReminders.length}</p>
                  </div>
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </CardContent>
            </Card>
            
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success">{completedReminders.length}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reminders Tabs */}
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="pending">
                Pending ({incompleteReminders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedReminders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {incompleteReminders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">No pending reminders</p>
                  <p className="text-sm text-muted-foreground">All your vehicles are up to date!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incompleteReminders.map(reminder => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedReminders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">No completed reminders</p>
                  <p className="text-sm text-muted-foreground">Completed reminders will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedReminders.map(reminder => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reminder Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                  </CardTitle>
                  <CardDescription>
                    Set up maintenance and inspection reminders
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleId">Vehicle *</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
                  >
                    <SelectTrigger className={errors.vehicleId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            {vehicle.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicleId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.vehicleId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Annual inspection due"
                    className={errors.description ? 'border-destructive' : ''}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select
                    value={formData.triggerType}
                    onValueChange={(value: 'date' | 'mileage') => 
                      setFormData(prev => ({ ...prev, triggerType: value, triggerValue: '' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </div>
                      </SelectItem>
                      <SelectItem value="mileage">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4" />
                          Mileage
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerValue">
                    {formData.triggerType === 'date' ? 'Due Date *' : 'Mileage Threshold *'}
                  </Label>
                  <Input
                    id="triggerValue"
                    type={formData.triggerType === 'date' ? 'date' : 'number'}
                    value={formData.triggerValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, triggerValue: e.target.value }))}
                    placeholder={formData.triggerType === 'date' ? 'Select date' : 'Enter mileage'}
                    className={errors.triggerValue ? 'border-destructive' : ''}
                  />
                  {errors.triggerValue && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.triggerValue}
                    </p>
                  )}
                </div>
              </CardContent>

              <div className="flex justify-end gap-3 p-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="fleet">
                  <Save className="h-4 w-4 mr-2" />
                  {editingReminder ? 'Update Reminder' : 'Add Reminder'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};