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
import { ArrowLeft, Mail, Lock, User, Phone, Calendar, MapPin, UserCheck, Check } from 'lucide-react'

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
  const [step, setStep] = useState(1)
  
  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<RegisterForm>()
  const password = watch('password')
  const formValues = watch()

  const validateStep1 = async () => {
    return await trigger(['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'])
  }

  const validateStep2 = async () => {
    return await trigger(['address.street', 'address.city', 'address.state', 'address.zipCode', 'emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship'])
  }

  const handleStepContinue = async (nextStep: number) => {
    if (nextStep === 2) {
      const isValid = await validateStep1()
      if (isValid) setStep(nextStep)
    } else if (nextStep === 3) {
      const isValid = await validateStep2()
      if (isValid) setStep(nextStep)
    }
  }

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('')
      await registerUser({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        phone: data.phone,
        birthdate: data.dateOfBirth,
        gender: 'not-specified',
        address: `${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zipCode}`
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      setError((err as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  const canProceedToStep2 = formValues.firstName && formValues.lastName && formValues.email && formValues.phone && formValues.dateOfBirth
  const canProceedToStep3 = canProceedToStep2 && formValues.address?.street && formValues.address?.city && formValues.address?.state && formValues.address?.zipCode && formValues.emergencyContact?.name && formValues.emergencyContact?.phone && formValues.emergencyContact?.relationship
  const canSubmit = canProceedToStep3 && formValues.password && formValues.confirmPassword

  return (
    <div className="min-h-screen page-background">
      <header className="gradient-bg-primary shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-gray-900 text-sm px-3 py-2">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-xl sm:text-2xl font-bold text-white">DentalCare+</div>
                <span className="text-white/70 hidden sm:inline">|</span>
                <span className="text-white/90 font-medium text-sm sm:text-base hidden sm:inline">Create Account</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">Join DentalCare+</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Create your account to start booking appointments and managing your dental care
            </p>
          </div>

          <div className="flex items-center justify-center mb-8 sm:mb-12">
            <div className="pretty-card p-4 sm:p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between sm:justify-center sm:space-x-6">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 ${step >= 1 ? 'gradient-bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 1 ? <Check className="h-3 w-3 sm:h-5 sm:w-5" /> : '1'}
                </div>
                <div className={`h-1 sm:h-2 flex-1 sm:w-12 lg:w-20 rounded-full transition-all duration-300 ${step >= 2 ? 'gradient-bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 ${step >= 2 ? 'gradient-bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 2 ? <Check className="h-3 w-3 sm:h-5 sm:w-5" /> : '2'}
                </div>
                <div className={`h-1 sm:h-2 flex-1 sm:w-12 lg:w-20 rounded-full transition-all duration-300 ${step >= 3 ? 'gradient-bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 ${step >= 3 ? 'gradient-bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 3 ? <Check className="h-3 w-3 sm:h-5 sm:w-5" /> : '3'}
                </div>
              </div>
              <div className="flex justify-between mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-muted-foreground">
                <span className="text-center">Personal<br className="sm:hidden"/> Info</span>
                <span className="text-center">Address &<br className="sm:hidden"/> Contact</span>
                <span className="text-center">Security &<br className="sm:hidden"/> Review</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="pretty-card p-6 sm:p-8">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Step 1: Personal Information</h2>
                    <p className="text-base sm:text-lg text-muted-foreground">Tell us about yourself to get started</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              minLength: { value: 2, message: 'First name must be at least 2 characters' }
                            })}
                          />
                        </div>
                        {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
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
                              minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                            })}
                          />
                        </div>
                        {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
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
                            pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email' }
                          })}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
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
                            pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
                          })}
                        />
                      </div>
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
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
                      {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 sm:pt-6">
                  <Button
                    type="button"
                    onClick={() => handleStepContinue(2)}
                    disabled={!canProceedToStep2}
                    variant="default"
                    className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                  >
                    Continue to Address & Contact
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="pretty-card p-6 sm:p-8">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Step 2: Address & Emergency Contact</h2>
                    <p className="text-base sm:text-lg text-muted-foreground">Provide your address and emergency contact details</p>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-dental-500" />
                        Address Information
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="address.street">Street Address</Label>
                          <Input
                            id="address.street"
                            placeholder="123 Main Street"
                            {...register('address.street', { required: 'Street address is required' })}
                          />
                          {errors.address?.street && <p className="text-sm text-red-600">{errors.address.street.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address.city">City</Label>
                            <Input
                              id="address.city"
                              placeholder="City"
                              {...register('address.city', { required: 'City is required' })}
                            />
                            {errors.address?.city && <p className="text-sm text-red-600">{errors.address.city.message}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address.state">State</Label>
                            <Input
                              id="address.state"
                              placeholder="State"
                              {...register('address.state', { required: 'State is required' })}
                            />
                            {errors.address?.state && <p className="text-sm text-red-600">{errors.address.state.message}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address.zipCode">ZIP Code</Label>
                          <Input
                            id="address.zipCode"
                            placeholder="12345"
                            {...register('address.zipCode', {
                              required: 'ZIP code is required',
                              pattern: { value: /^\d{5}(-\d{4})?$/, message: 'Please enter a valid ZIP code' }
                            })}
                          />
                          {errors.address?.zipCode && <p className="text-sm text-red-600">{errors.address.zipCode.message}</p>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-dental-500" />
                        Emergency Contact
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact.name">Full Name</Label>
                          <Input
                            id="emergencyContact.name"
                            placeholder="Emergency contact name"
                            {...register('emergencyContact.name', { required: 'Emergency contact name is required' })}
                          />
                          {errors.emergencyContact?.name && <p className="text-sm text-red-600">{errors.emergencyContact.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact.phone">Phone Number</Label>
                          <Input
                            id="emergencyContact.phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            {...register('emergencyContact.phone', {
                              required: 'Emergency contact phone is required',
                              pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please provide a valid phone number' }
                            })}
                          />
                          {errors.emergencyContact?.phone && <p className="text-sm text-red-600">{errors.emergencyContact.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                          <Input
                            id="emergencyContact.relationship"
                            placeholder="e.g., Spouse, Parent, Sibling"
                            {...register('emergencyContact.relationship', { required: 'Emergency contact relationship is required' })}
                          />
                          {errors.emergencyContact?.relationship && <p className="text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 sm:pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="px-6 py-3 text-base">
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleStepContinue(3)}
                    disabled={!canProceedToStep3}
                    variant="default"
                    className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                  >
                    Continue to Security
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="pretty-card p-6 sm:p-8">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Step 3: Security & Review</h2>
                    <p className="text-base sm:text-lg text-muted-foreground">Create a secure password and review your information</p>
                  </div>

                  <div className="space-y-6">
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
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                            }
                          })}
                        />
                      </div>
                      {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
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
                            validate: value => value === password || 'Passwords do not match'
                          })}
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="text-xs text-gray-600 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      By creating an account, you agree to our Terms of Service and Privacy Policy.
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 sm:pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="px-6 py-3 text-base">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isLoading}
                    variant="default"
                    className="min-w-[180px] px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-dental-600 hover:text-dental-700 font-medium">
              Sign in here
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}