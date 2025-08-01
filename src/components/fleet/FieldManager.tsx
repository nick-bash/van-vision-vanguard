import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings2, 
  Type, 
  Hash, 
  List,
  X,
  Save,
  AlertCircle,
  Palette
} from 'lucide-react';

interface DropdownOption {
  value: string;
  color?: string;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'dropdown';
  options?: DropdownOption[];
  required: boolean;
}

interface FieldManagerProps {
  fields: CustomField[];
  onUpdateFields: (fields: CustomField[]) => void;
}

const fieldTypeConfig = {
  text: { icon: Type, label: 'Text', color: 'bg-blue-500' },
  number: { icon: Hash, label: 'Number', color: 'bg-green-500' },
  dropdown: { icon: List, label: 'Dropdown', color: 'bg-purple-500' }
};

export const FieldManager: React.FC<FieldManagerProps> = ({
  fields,
  onUpdateFields
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as CustomField['type'],
    options: [] as DropdownOption[],
    required: false
  });
  const [newOption, setNewOption] = useState('');
  const [newOptionColor, setNewOptionColor] = useState('#6366f1');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'text',
      options: [],
      required: false
    });
    setNewOption('');
    setNewOptionColor('#6366f1');
    setErrors({});
    setEditingField(null);
  };

  const handleAddField = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditField = (field: CustomField) => {
    setFormData({
      name: field.name,
      type: field.type,
      options: field.options || [],
      required: field.required
    });
    setEditingField(field);
    setShowForm(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required';
    } else if (fields.some(f => f.name.toLowerCase() === formData.name.toLowerCase() && f.id !== editingField?.id)) {
      newErrors.name = 'Field name already exists';
    }

    if (formData.type === 'dropdown' && formData.options.length === 0) {
      newErrors.options = 'At least one option is required for dropdown fields';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const fieldData: CustomField = {
      id: editingField?.id || Date.now().toString(),
      name: formData.name.trim(),
      type: formData.type,
      options: formData.type === 'dropdown' ? formData.options : undefined,
      required: formData.required
    };

    if (editingField) {
      onUpdateFields(fields.map(f => f.id === editingField.id ? fieldData : f));
    } else {
      onUpdateFields([...fields, fieldData]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDeleteField = (fieldId: string) => {
    onUpdateFields(fields.filter(f => f.id !== fieldId));
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.some(opt => opt.value === newOption.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { value: newOption.trim(), color: newOptionColor }]
      }));
      setNewOption('');
      setNewOptionColor('#6366f1');
      if (errors.options) {
        setErrors(prev => ({ ...prev, options: '' }));
      }
    }
  };

  const removeOption = (optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== optionIndex)
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Configure custom fields to track additional vehicle information
              </CardDescription>
            </div>
            <Button onClick={handleAddField} variant="fleet">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <Settings2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No custom fields yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create custom fields to track specific information about your vehicles
              </p>
              <Button onClick={handleAddField} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Field
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => {
                const TypeIcon = fieldTypeConfig[field.type].icon;
                
                return (
                  <Card key={field.id} className="hover:shadow-medium transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${fieldTypeConfig[field.type].color} text-white`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{field.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {fieldTypeConfig[field.type].label}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {field.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditField(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {field.type === 'dropdown' && field.options && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Options:</p>
                          <div className="flex flex-wrap gap-1">
                            {field.options.slice(0, 3).map((option, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs flex items-center gap-1"
                              >
                                {option.color && (
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: option.color }}
                                  />
                                )}
                                {option.value}
                              </Badge>
                            ))}
                            {field.options.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{field.options.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {editingField ? 'Edit Field' : 'Add New Field'}
                  </CardTitle>
                  <CardDescription>
                    Configure field properties and options
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
                  <Label htmlFor="fieldName">Field Name *</Label>
                  <Input
                    id="fieldName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Vehicle Type"
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
                  <Label htmlFor="fieldType">Field Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: CustomField['type']) => 
                      setFormData(prev => ({ ...prev, type: value, options: [] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldTypeConfig).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'dropdown' && (
                  <div className="space-y-2">
                    <Label>Options *</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Add an option"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addOption();
                            }
                          }}
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                            >
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: newOptionColor }}
                              />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="end">
                            <HexColorPicker 
                              color={newOptionColor} 
                              onChange={setNewOptionColor} 
                            />
                          </PopoverContent>
                        </Popover>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addOption}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    {formData.options.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full border" 
                                style={{ backgroundColor: option.color }}
                              />
                              <span className="text-sm">{option.value}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.options && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.options}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={formData.required}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, required: checked }))
                    }
                  />
                  <Label htmlFor="required">Required field</Label>
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
                  {editingField ? 'Update Field' : 'Add Field'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};