import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Upload, 
  FileText, 
  Trash2,
  Car,
  Save,
  AlertCircle
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

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  customFields: CustomField[];
  onSave: (vehicle: Partial<Vehicle>) => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: 'available', label: 'Available', color: 'bg-status-available' },
  { value: 'in-use', label: 'In Use', color: 'bg-status-in-use' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-status-maintenance' },
  { value: 'inactive', label: 'Inactive', color: 'bg-status-inactive' }
];

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  customFields,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'available' as Vehicle['status'],
    mileage: 0,
    customFields: {} as Record<string, any>,
    documents: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        status: vehicle.status,
        mileage: vehicle.mileage,
        customFields: vehicle.customFields,
        documents: vehicle.documents
      });
    }
  }, [vehicle]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vehicle name is required';
    }

    if (formData.mileage < 0) {
      newErrors.mileage = 'Mileage cannot be negative';
    }

    // Validate required custom fields
    customFields.forEach(field => {
      if (field.required && !formData.customFields[field.name]) {
        newErrors[`custom_${field.id}`] = `${field.name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value
      }
    }));
    
    // Clear error for this field
    const fieldId = customFields.find(f => f.name === fieldName)?.id;
    if (fieldId && errors[`custom_${fieldId}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`custom_${fieldId}`];
        return newErrors;
      });
    }
  };

  const handleDocumentUpload = () => {
    // Simulate document upload
    const newDoc = `document_${Date.now()}.pdf`;
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  const removeDocument = (docIndex: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, index) => index !== docIndex)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </CardTitle>
                <CardDescription>
                  {vehicle 
                    ? 'Update vehicle information and settings'
                    : 'Enter details for the new vehicle'
                  }
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vehicle Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Fleet Van 001"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Vehicle['status']) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${option.color}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Current Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter current mileage"
                  className={errors.mileage ? 'border-destructive' : ''}
                />
                {errors.mileage && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.mileage}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {customFields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map(field => {
                    const fieldError = errors[`custom_${field.id}`];
                    
                    return (
                      <div key={field.id} className="space-y-2">
                        <Label>
                          {field.name}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        
                        {field.type === 'text' && (
                          <Input
                            value={formData.customFields[field.name] || ''}
                            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            className={fieldError ? 'border-destructive' : ''}
                          />
                        )}
                        
                        {field.type === 'number' && (
                          <Input
                            type="number"
                            value={formData.customFields[field.name] || ''}
                            onChange={(e) => handleCustomFieldChange(field.name, parseFloat(e.target.value) || '')}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            className={fieldError ? 'border-destructive' : ''}
                          />
                        )}
                        
                        {field.type === 'dropdown' && field.options && (
                          <Select
                            value={formData.customFields[field.name] || ''}
                            onValueChange={(value) => handleCustomFieldChange(field.name, value)}
                          >
                            <SelectTrigger className={fieldError ? 'border-destructive' : ''}>
                              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {fieldError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {fieldError}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documents</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDocumentUpload}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
              
              {formData.documents.length > 0 ? (
                <div className="space-y-2">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No documents uploaded</p>
                </div>
              )}
            </div>
          </CardContent>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="fleet"
            >
              <Save className="h-4 w-4 mr-2" />
              {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};