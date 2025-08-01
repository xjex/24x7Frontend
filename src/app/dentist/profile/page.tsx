'use client'

import { useEffect, useState } from 'react'
import { useDentistStore, type UpdateProfileData, type ChangePasswordData } from '@/stores/dentistStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  GraduationCap,
  Award,
  DollarSign,
  FileText,
  Plus,
  X
} from 'lucide-react'

export default function DentistProfilePage() {
  const { 
    profile, 
    isLoading, 
    fetchProfile, 
    updateProfile,
    changePassword 
  } = useDentistStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile form state
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    licenseNumber: '',
    specialization: [],
    experience: 0,
    consultationFee: 0,
    bio: '',
    education: []
  })

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: ''
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  // Specialization and education input states
  const [newSpecialization, setNewSpecialization] = useState('')
  const [newEducation, setNewEducation] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      setProfileData({
        licenseNumber: profile.licenseNumber || '',
        specialization: profile.specialization || [],
        experience: profile.experience || 0,
        consultationFee: profile.consultationFee || 0,
        bio: profile.bio || '',
        education: Array.isArray(profile.education) 
      ? profile.education.map((edu: string | { degree: string; university: string; year: number }) => typeof edu === 'string' ? edu : `${edu.degree} from ${edu.university} (${edu.year})`)
      : []
      })
    }
  }, [profile])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      setMessage(null)
      await updateProfile(profileData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long.' })
      return
    }

    try {
      setIsUpdating(true)
      setMessage(null)
      await changePassword(passwordData)
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '' })
      setConfirmPassword('')
    } catch {
      setMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' })
    } finally {
      setIsUpdating(false)
    }
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !profileData.specialization?.includes(newSpecialization.trim())) {
      setProfileData(prev => ({
        ...prev,
        specialization: [...(prev.specialization || []), newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      specialization: prev.specialization?.filter((_, i) => i !== index) || []
    }))
  }

  const addEducation = () => {
    if (newEducation.trim() && !profileData.education?.includes(newEducation.trim())) {
      setProfileData(prev => ({
        ...prev,
        education: [...(prev.education || []), newEducation.trim()]
      }))
      setNewEducation('')
    }
  }

  const removeEducation = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index) || []
    }))
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your professional profile and account settings</p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <User className="h-4 w-4" />
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'password'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Lock className="h-4 w-4" />
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Update your professional details and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    License Number
                  </Label>
                  <Input
                    id="licenseNumber"
                    value={profileData.licenseNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    placeholder="Enter your license number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={profileData.experience}
                    onChange={(e) => setProfileData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    placeholder="Years of experience"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Consultation Fee ($)
                  </Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={profileData.consultationFee}
                    onChange={(e) => setProfileData(prev => ({ ...prev, consultationFee: parseFloat(e.target.value) || 0 }))}
                    placeholder="Consultation fee"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Specializations
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add a specialization"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  />
                  <Button type="button" onClick={addSpecialization} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.specialization?.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newEducation}
                    onChange={(e) => setNewEducation(e.target.value)}
                    placeholder="Add education qualification"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEducation())}
                  />
                  <Button type="button" onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {profileData.education?.map((edu, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                    >
                      <span className="text-sm">{edu}</span>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Professional Bio
                </Label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Write a brief professional biography..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {isUpdating ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}