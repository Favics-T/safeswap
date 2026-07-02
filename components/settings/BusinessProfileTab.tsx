'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Input, Button, Avatar } from '@/components/ui';
import { Camera } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { NIGERIAN_PHONE_REGEX } from '@/lib/format';

interface ProfileFormValues {
  businessName: string;
  name: string;
  phone: string;
}

export const BusinessProfileTab = () => {
  const { vendor, updateVendorProfile } = useVendor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(vendor.logoUrl);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      businessName: vendor.businessName,
      name: vendor.name,
      phone: vendor.phone,
    },
  });

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    updateVendorProfile({ logoUrl: url });
  };

  const onSubmit = (data: ProfileFormValues) => {
    setSaveState('saving');
    // Simulated async save — swap for real PATCH /api/vendor call once backend is ready
    setTimeout(() => {
      updateVendorProfile(data);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    }, 600);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogoClick}
            className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Avatar name={vendor.businessName} src={logoPreview} size="lg" />
            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </span>
          </button>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Business Profile</p>
            <p className="text-sm text-gray-500">Update your business information and logo</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            required
            placeholder="Adaeze Creations"
            error={errors.businessName?.message}
            {...register('businessName', {
              required: 'Business name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
            })}
          />
          <Input
            label="Vendor Full Name"
            required
            placeholder="Adaeze Okonkwo"
            error={errors.name?.message}
            {...register('name', {
              required: 'Your name is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
            })}
          />
          <Input
            label="Email Address"
            value={vendor.email}
            disabled
            className="bg-gray-50 cursor-not-allowed"
          />
          <Input
            label="Phone Number"
            required
            placeholder="08012345678"
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: NIGERIAN_PHONE_REGEX,
                message: 'Enter a valid Nigerian phone number',
              },
            })}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={saveState === 'saving'}>
            {saveState === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};