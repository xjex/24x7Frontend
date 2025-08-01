import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { DentistFormData, DentistUpdateData } from '@/stores/adminStore'
import { X, Plus } from 'lucide-react'

interface DentistFormProps {
  initialData?: Partial<DentistFormData>
  onSubmit: (data: DentistFormData | DentistUpdateData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

const SPECIALIZATIONS = [
  'General Dentistry',
  'Orthodontics',
  'Endodontics',
  'Periodontics',
  'Prosthodontics',
  'Oral Surgery',
  'Pediatric Dentistry',
  'Cosmetic Dentistry',
  'Implantology'
]

export default function DentistForm({ initialData, onSubmit, onCancel, isEdit = false }: DentistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    initialData?.specialization || []
  )

  const { register, handleSubmit, control, formState: { errors } } = useForm<DentistFormData>({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      licenseNumber: initialData?.licenseNumber || '',
      specialization: initialData?.specialization || [],
      experience: initialData?.experience || 0,
      consultationFee: initialData?.consultationFee || 0,
      bio: initialData?.bio || '',
      education: initialData?.education || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education'
  })

  const handleSpecializationToggle = (spec: string) => {
    const newSelected = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter(s => s !== spec)
      : [...selectedSpecializations, spec]
    setSelectedSpecializations(newSelected)
  }

  const onFormSubmit = async (data: DentistFormData) => {
    try {
      setIsSubmitting(true)
      const submitData = {
        ...data,
        specialization: selectedSpecializations
      }
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Edit Dentist Profile' : 'Create New Dentist'}
          </h2>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {!isEdit && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          )}

          {!isEdit && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              {...register('licenseNumber', { required: 'License number is required' })}
              className={errors.licenseNumber ? 'border-red-500' : ''}
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.licenseNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              {...register('experience', { 
                required: 'Experience is required',
                min: {
                  value: 0,
                  message: 'Experience cannot be negative'
                }
              })}
              className={errors.experience ? 'border-red-500' : ''}
            />
            {errors.experience && (
              <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
            <Input
              id="consultationFee"
              type="number"
              min="0"
              step="0.01"
              {...register('consultationFee', { 
                required: 'Consultation fee is required',
                min: {
                  value: 0,
                  message: 'Fee cannot be negative'
                }
              })}
              className={errors.consultationFee ? 'border-red-500' : ''}
            />
            {errors.consultationFee && (
              <p className="text-red-500 text-sm mt-1">{errors.consultationFee.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Specializations</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {SPECIALIZATIONS.map((spec) => (
              <label key={spec} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSpecializations.includes(spec)}
                  onChange={() => handleSpecializationToggle(spec)}
                  className="rounded"
                />
                <span className="text-sm">{spec}</span>
              </label>
            ))}
          </div>
          {selectedSpecializations.length === 0 && (
            <p className="text-red-500 text-sm mt-1">At least one specialization is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            {...register('bio', {
              maxLength: {
                value: 1000,
                message: 'Bio cannot exceed 1000 characters'
              }
            })}
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md"
            placeholder="Brief description of experience and expertise..."
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Education</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ degree: '', university: '', year: new Date().getFullYear() })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
          
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Education {index + 1}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor={`education.${index}.degree`}>Degree</Label>
                  <Input
                    {...register(`education.${index}.degree`)}
                    placeholder="e.g., DDS, DMD"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`education.${index}.university`}>University</Label>
                  <Input
                    {...register(`education.${index}.university`)}
                    placeholder="University name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`education.${index}.year`}>Year</Label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    {...register(`education.${index}.year`, {
                      valueAsNumber: true
                    })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || selectedSpecializations.length === 0}
          >
            {isSubmitting ? 'Saving...' : (isEdit ? 'Update Dentist' : 'Create Dentist')}
          </Button>
        </div>
      </form>
    </Card>
  )
}