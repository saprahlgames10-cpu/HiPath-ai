import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, User, Bell, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-heading font-semibold">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <p className="font-medium">{user.email}</p>
            </div>
            {/* Add more fields here */}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-heading font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Notification settings coming soon.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-heading font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
             <p className="text-sm text-muted-foreground">Security settings coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
