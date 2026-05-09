'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { nigeriaLocations, getLocationBySlug } from '@/lib/nigeriaLocations';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

function getAvatarUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/storage/')) {
    return `${API_URL}${url}`;
  }
  return url;
}

function cleanSocialName(name: string | null | undefined): { cleaned: string; needsUpdate: boolean; reason: string | null } {
  if (!name) return { cleaned: '', needsUpdate: true, reason: 'Name is empty' };
  
  const trimmed = name.trim();
  
  // Check if it's an email
  if (trimmed.includes('@') && trimmed.includes('.')) {
    const emailName = trimmed.split('@')[0];
    // Convert "user.name" or "user.name123" to readable format
    const cleaned = emailName
      .replace(/[._]/g, ' ')
      .replace(/(\d+)/g, '')
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
    
    if (cleaned.length > 0) {
      return { cleaned, needsUpdate: false, reason: null };
    }
    return { cleaned: '', needsUpdate: true, reason: 'Please update your display name' };
  }
  
  // Check if it's a placeholder like "to login" or similar
  const placeholderNames = ['to login', 'login', 'user', 'null', 'undefined', 'a', 'test'];
  if (placeholderNames.includes(trimmed.toLowerCase())) {
    return { cleaned: '', needsUpdate: true, reason: 'Please update your display name' };
  }
  
  // Check if it's just very short (1-2 chars) or numbers
  if (trimmed.length <= 2 || /^\d+$/.test(trimmed)) {
    return { cleaned: trimmed, needsUpdate: true, reason: 'Name is too short' };
  }
  
  return { cleaned: trimmed, needsUpdate: false, reason: null };
}

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  state: string;
  location_id: number | null;
}

export default function ProfileSettingsPage() {
  const { user, setUser, token } = useAuthStore();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    state: '',
    location_id: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [nameNeedsUpdate, setNameNeedsUpdate] = useState(false);
  const [nameUpdateReason, setNameUpdateReason] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const userLocation = user.location || '';
      const locationData = getLocationBySlug(userLocation);
      
      const { cleaned: cleanedName, needsUpdate, reason } = cleanSocialName(user.name);
      
      setNameNeedsUpdate(needsUpdate);
      setNameUpdateReason(reason);
      
      let formattedPhone = '+234 ';
      if (user.phone) {
        let digits = user.phone.replace(/\D/g, '');
        if (digits.startsWith('234') && digits.length > 3) {
          digits = digits.substring(3);
        } else if (digits.startsWith('0')) {
          digits = digits.substring(1);
        }
        const formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        formattedPhone = '+234 ' + formatted;
      }
      
      setFormData({
        name: cleanedName || user.name || '',
        email: user.email || '',
        phone: formattedPhone,
        state: locationData?.name || userLocation || '',
        location_id: (user as any).location_id || null,
      });
      const avatarUrl = (user as any).avatar_url || user.avatar;
      if (avatarUrl) {
        setAvatarPreview(getAvatarUrl(avatarUrl));
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear name needs update warning when user starts typing a valid name
    if (name === 'name' && value.trim().length > 2) {
      setNameNeedsUpdate(false);
      setNameUpdateReason(null);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPhoneNumber = (value: string): string => {
    let digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('234')) {
      digits = digits.substring(3);
    }
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    const formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    return formatted.trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (value === '+') {
      setFormData(prev => ({ ...prev, phone: '+234 ' }));
      return;
    }
    
    let digits = value.replace(/\D/g, '');
    
    if (digits === '') {
      setFormData(prev => ({ ...prev, phone: '+234 ' }));
      return;
    }
    
    if (digits === '234') {
      setFormData(prev => ({ ...prev, phone: '+234 ' }));
      return;
    }
    
    if (digits.startsWith('234') && digits.length > 3) {
      digits = digits.substring(3);
    } else if (digits.startsWith('0') && !digits.startsWith('234')) {
      digits = digits.substring(1);
    }
    
    const formatted = formatPhoneNumber(digits);
    const finalValue = '+234 ' + formatted;
    
    setFormData(prev => ({ ...prev, phone: finalValue }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateSlug = e.target.value;
    const stateData = getLocationBySlug(stateSlug);
    setFormData(prev => ({ 
      ...prev, 
      state: stateData?.name || stateSlug,
      location_id: null
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 2MB' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSaving) {
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // First upload avatar if there's a new file
      if (avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        
        const avatarResponse = await fetch(`${API_URL}/api/auth/profile/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: avatarFormData,
        });
        
        const avatarData = await avatarResponse.json();
        
        if (!avatarResponse.ok) {
          throw new Error(avatarData.message || 'Failed to upload avatar');
        }
        
        // Update user with avatar data (include full_avatar_url for header display)
        if (avatarData.user) {
          const userWithFullUrl = {
            ...user,
            ...avatarData.user,
            full_avatar_url: avatarData.user.full_avatar_url || 
              (avatarData.user.avatar ? `${API_URL}${avatarData.user.avatar}` : null) ||
              (user?.avatar ? `${API_URL}${user.avatar}` : null) ||
              (user?.google_avatar ? user.google_avatar : null),
            avatar: avatarData.user.avatar || user?.avatar,
            avatar_url: avatarData.user.avatar_url || avatarData.user.avatar || user?.avatar_url || user?.avatar,
          };
          setUser(userWithFullUrl);
          
          // Also update localStorage directly to ensure persistence
          if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                const updatedUser = { ...parsedUser, ...userWithFullUrl };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Update auth-storage as well
                const authStorage = localStorage.getItem('auth-storage');
                if (authStorage) {
                  const parsed = JSON.parse(authStorage);
                  parsed.state.user = updatedUser;
                  localStorage.setItem('auth-storage', JSON.stringify(parsed));
                }
              } catch (e) {
                console.error('Failed to update localStorage user:', e);
              }
            }
          }
          
          const newAvatarUrl = avatarData.user.avatar_url || avatarData.user.avatar;
          setAvatarPreview(getAvatarUrl(newAvatarUrl));
        }
      }

      // Then update other profile fields
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      let phoneToSave = formData.phone || '';
      if (phoneToSave) {
        const digits = phoneToSave.replace(/\D/g, '');
        if (digits.length === 13 && digits.startsWith('234')) {
          phoneToSave = '0' + digits.substring(3);
        }
      }
      formDataToSend.append('phone', phoneToSave);
      formDataToSend.append('location', formData.state);
      
      if (formData.location_id) {
        formDataToSend.append('location_id', formData.location_id.toString());
      }


      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-HTTP-Method-Override': 'PUT',
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to update profile');
      }

      // Update user with avatar_url if available (include full_avatar_url for header display)
      const updatedUser = {
        ...user,
        ...data.user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.state,
        avatar: data.user?.avatar || data.user?.avatar_url || user?.avatar || avatarPreview,
        avatar_url: data.user?.avatar_url || data.user?.avatar || user?.avatar_url || user?.avatar || avatarPreview,
        full_avatar_url: data.user?.full_avatar_url || 
          (data.user?.avatar ? `${API_URL}${data.user.avatar}` : null) ||
          (user?.full_avatar_url ? user.full_avatar_url : null),
      };
      setUser(updatedUser);
      
      // Also update localStorage directly
      if (typeof window !== 'undefined') {
        try {
          const updatedUserStr = JSON.stringify(updatedUser);
          localStorage.setItem('user', updatedUserStr);
          
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            parsed.state.user = updatedUser;
            localStorage.setItem('auth-storage', JSON.stringify(parsed));
          }
          
          // Save phone number for post-ad form auto-fill
          if (phoneToSave) {
            localStorage.setItem('user_phone', phoneToSave);
          }
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }
      
      if (data.user?.avatar_url || data.user?.avatar) {
        setAvatarPreview(getAvatarUrl(data.user?.avatar_url || data.user?.avatar));
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Photo</h3>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" fill className="object-cover" sizes="96px" />
                ) : (
                  <span className="text-primary-700 text-3xl font-bold">
                    {formData.name ? getInitials(formData.name) : 'U'}
                  </span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div>
              <p className="font-medium text-gray-900">Profile Photo</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
              {(avatarPreview || user?.avatar) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-sm text-red-600 hover:text-red-700 mt-2"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
                {nameNeedsUpdate && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                    nameNeedsUpdate ? 'border-amber-400 focus:border-amber-500' : 'border-gray-300 focus:border-primary-500'
                  }`}
                />
              </div>
              {nameNeedsUpdate && nameUpdateReason && (
                <div className="flex items-start gap-2 mt-2 text-amber-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{nameUpdateReason}. Please update your display name.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <div className="relative">
                <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="state"
                  value={nigeriaLocations.find(loc => loc.name === formData.state)?.slug || ''}
                  onChange={handleStateChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 appearance-none cursor-pointer"
                >
                  <option value="">Select State</option>
                  {nigeriaLocations.map((location) => (
                    <option key={location.id} value={location.slug}>
                      {location.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
