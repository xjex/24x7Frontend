'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Mail, Lock, User, Phone, Calendar, MapPin, UserCheck } from 'lucide-react'

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('')
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        emergencyContact: data.emergencyContact
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen page-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="pretty-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">Join DentalCare+</h1>
            <p className="text-lg text-muted-foreground">
              Create your account to start booking appointments and managing your dental care
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      className="pl-10"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters'
                        }
                      })}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      className="pl-10"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters'
                        }
                      })}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Please enter a valid email'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="pl-10"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                    {...register('dateOfBirth', {
                      required: 'Date of birth is required',
                      validate: value => {
                        const today = new Date()
                        const birthDate = new Date(value)
                        const age = today.getFullYear() - birthDate.getFullYear()
                        return age >= 0 && age <= 150 || 'Please provide a valid date of birth'
                      }
                    })}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-dental-500" />
                  Address Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address.street">Street Address</Label>
                  <Input
                    id="address.street"
                    type="text"
                    placeholder="123 Main Street"
                    {...register('address.street', {
                      required: 'Street address is required'
                    })}
                  />
                  {errors.address?.street && (
                    <p className="text-sm text-red-600">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address.city">City</Label>
                    <Input
                      id="address.city"
                      type="text"
                      placeholder="City"
                      {...register('address.city', {
                        required: 'City is required'
                      })}
                    />
                    {errors.address?.city && (
                      <p className="text-sm text-red-600">{errors.address.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address.state">State</Label>
                    <Input
                      id="address.state"
                      type="text"
                      placeholder="State"
                      {...register('address.state', {
                        required: 'State is required'
                      })}
                    />
                    {errors.address?.state && (
                      <p className="text-sm text-red-600">{errors.address.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.zipCode">ZIP Code</Label>
                  <Input
                    id="address.zipCode"
                    type="text"
                    placeholder="12345"
                    {...register('address.zipCode', {
                      required: 'ZIP code is required',
                      pattern: {
                        value: /^\d{5}(-\d{4})?$/,
                        message: 'Please enter a valid ZIP code'
                      }
                    })}
                  />
                  {errors.address?.zipCode && (
                    <p className="text-sm text-red-600">{errors.address.zipCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-dental-500" />
                  Emergency Contact
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.name">Full Name</Label>
                  <Input
                    id="emergencyContact.name"
                    type="text"
                    placeholder="Emergency contact name"
                    {...register('emergencyContact.name', {
                      required: 'Emergency contact name is required'
                    })}
                  />
                  {errors.emergencyContact?.name && (
                    <p className="text-sm text-red-600">{errors.emergencyContact.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.phone">Phone Number</Label>
                  <Input
                    id="emergencyContact.phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('emergencyContact.phone', {
                      required: 'Emergency contact phone is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Please provide a valid emergency contact phone number'
                      }
                    })}
                  />
                  {errors.emergencyContact?.phone && (
                    <p className="text-sm text-red-600">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                  <Input
                    id="emergencyContact.relationship"
                    type="text"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    {...register('emergencyContact.relationship', {
                      required: 'Emergency contact relationship is required'
                    })}
                  />
                  {errors.emergencyContact?.relationship && (
                    <p className="text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                      }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-10"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </div>

              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-semibold" 
                variant="dental"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

          </form>

          <div className="mt-8 text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-dental-600 hover:text-dental-700 font-medium">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 