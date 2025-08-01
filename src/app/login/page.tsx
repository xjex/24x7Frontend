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
import { ArrowLeft, Mail, Lock } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('')
      const { redirectTo } = await login(data.email, data.password)
      router.push(redirectTo)
    } catch (err: unknown) {
      setError((err as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Login failed. Please try again.')
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
            <h1 className="text-3xl font-bold text-foreground mb-3">Welcome Back</h1>
            <p className="text-lg text-muted-foreground">
              Sign in to your DentalCare+ account to manage your appointments
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-medium text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-dental-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-12 py-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-dental-500"
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
                <p className="text-sm text-red-600 mt-2">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-dental-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-12 py-3 text-base border-2 rounded-xl focus:ring-2 focus:ring-dental-500"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-2">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-semibold" 
              variant="default"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

          </form>

          <div className="mt-8 text-center">
                            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/register" className="text-dental-600 hover:text-dental-700 font-medium">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 