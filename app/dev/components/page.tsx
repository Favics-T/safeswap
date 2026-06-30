'use client';

import React, { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Modal,
  ProgressBar,
  Select,
  Stepper,
  Tabs,
  Textarea,
  Toggle,
  Tooltip,
} from '@/components/ui';
import { Navbar } from '@/components/layout/Navbar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Send, Upload } from 'lucide-react';
import { OrderStatus } from '@/lib/types/order';

export default function ComponentsDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isToggled, setIsToggled] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar activeRoute="Dashboard" />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 w-full">
        <PageHeader 
          title="Component Library" 
          subtitle="A playground to verify the SafeSwap design system."
          action={<Button icon={<Send className="w-4 h-4" />}>Deploy</Button>}
        />

        {/* Buttons */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-left">Buttons</h3>
          <Card className="flex flex-wrap gap-4 items-end">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="primary" icon={<Upload className="w-4 h-4" />}>With Icon</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
          </Card>
        </section>

        {/* Badges */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-left">Badges</h3>
          <Card className="flex flex-wrap gap-4">
            {(['awaiting_payment', 'deposit_paid', 'fully_paid', 'in_production', 'shipped', 'completed', 'disputed', 'cancelled'] as OrderStatus[]).map((status) => (
              <Badge key={status} status={status} />
            ))}
          </Card>
        </section>

        {/* Inputs & Forms */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-left">Inputs & Forms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <Input label="Standard Input" placeholder="Enter text..." />
              <Input label="With Prefix" prefix="₦" placeholder="0.00" type="number" />
              <Input label="With Error" placeholder="Enter email" error="Invalid email address" />
              <Textarea label="Message" placeholder="Type your message here..." />
              <Select 
                label="Status" 
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' }
                ]} 
              />
            </Card>
            
            <Card className="space-y-6">
              <Toggle 
                checked={isToggled} 
                onChange={setIsToggled} 
                label="Email Notifications" 
                description="Receive an email when an order updates."
              />
              <div className="flex gap-4">
                <Avatar name="John Doe" />
                <Avatar name="Sarah Smith" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                <Avatar name="Admin User" size="lg" />
              </div>
              <div className="text-left mt-6">
                <Tooltip content="This is a helpful tooltip!">
                  <span className="text-sm text-blue-600 underline cursor-pointer hover:text-blue-700">Hover me for tooltip</span>
                </Tooltip>
              </div>
            </Card>
          </div>
        </section>

        {/* Progress & Stepper */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-left">Progress & Steppers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-6">
              <ProgressBar value={45} label="Storage Used" showLabel />
              <ProgressBar value={100} color="green" label="Order Completion" showLabel />
              <ProgressBar value={30} color="amber" label="Warning Level" showLabel />
            </Card>
            
            <Card>
              <Stepper 
                steps={[
                  { label: 'Order Placed', status: 'complete', timestamp: 'Oct 12, 10:00 AM' },
                  { label: 'Payment Confirmed', status: 'complete', timestamp: 'Oct 12, 11:30 AM' },
                  { label: 'In Production', status: 'current', timestamp: 'Expected Oct 15' },
                  { label: 'Ready for Dispatch', status: 'upcoming' },
                ]} 
              />
            </Card>
          </div>
        </section>

        {/* Tabs & Modal */}
        <section>
          <h3 className="text-lg font-bold mb-4 text-left">Navigation & Overlays</h3>
          <Card className="space-y-6">
            <Tabs 
              activeTab={activeTab} 
              onChange={setActiveTab}
              tabs={[
                { label: 'All Orders', value: 'all', count: 12 },
                { label: 'Active', value: 'active', count: 3 },
                { label: 'Completed', value: 'completed' },
              ]} 
            />
            
            <div className="text-left mt-6">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
              <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Confirm Action"
                footer={
                  <>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
                  </>
                }
              >
                <p className="text-gray-600">Are you sure you want to perform this action? This cannot be undone.</p>
              </Modal>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
