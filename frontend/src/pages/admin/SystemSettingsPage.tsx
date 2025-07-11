import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Save, Loader2, AlertTriangle } from 'lucide-react';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { useOfflineStatus } from '@/lib/offline';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface SystemSettings {
  registrationOpen: boolean;
  emailNotificationsEnabled: boolean;
  dataRetentionDays: number;
  enableTwoFactorAuth: boolean;
  maxFileUploadSizeMB: number;
  allowedFileTypes: string;
  maintenanceMode: boolean;
  contactEmail: string;
  welcomeBannerMessage: string;
  mapProviderApiKey: string;
}

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const isOnline = useOfflineStatus();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/settings/admin/settings');
        setSettings(response.data.data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'administrator' && isOnline) {
      fetchSettings();
    }
  }, [user, isOnline]);

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.put('/settings/admin/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  return (
      <div className="">
        <OfflineIndicator isOnline={isOnline} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="h-8 w-8 text-indigo-600" />
            Settings
          </h1>
          <p className="text-gray-600">
            Manage global application settings and configurations.
          </p>
        </div>

        {loading && <p>Loading settings...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {saveSuccess && <p className="text-emerald-500">Settings saved successfully!</p>}

        {!loading && !error && settings && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure core application behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="registration-open" className="text-base">Allow New User Registrations</Label>
                <Switch
                  id="registration-open"
                  checked={settings.registrationOpen}
                  onCheckedChange={(checked) => handleSettingChange('registrationOpen', checked)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-base">Enable Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('emailNotificationsEnabled', checked)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="data-retention" className="text-base">Data Retention Period (Days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                  className="w-32"
                  min={30}
                  disabled={isSaving}
                />
              </div>

              {/* New Settings */}
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor-auth" className="text-base">Enable Two-Factor Authentication</Label>
                <Switch
                  id="two-factor-auth"
                  checked={settings.enableTwoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('enableTwoFactorAuth', checked)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="max-upload-size" className="text-base">Max File Upload Size (MB)</Label>
                <Input
                  id="max-upload-size"
                  type="number"
                  value={settings.maxFileUploadSizeMB}
                  onChange={(e) => handleSettingChange('maxFileUploadSizeMB', parseInt(e.target.value))}
                  className="w-32"
                  min={1}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowed-file-types" className="text-base">Allowed File Types (comma-separated)</Label>
                <Input
                  id="allowed-file-types"
                  type="text"
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                  className="flex-1 ml-4"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode" className="text-base">Enable Maintenance Mode</Label>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="contact-email" className="text-base">Contact Email for Support</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  className="flex-1 ml-4"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="welcome-banner-message" className="text-base">Welcome Banner Message</Label>
                <Input
                  id="welcome-banner-message"
                  type="text"
                  value={settings.welcomeBannerMessage}
                  onChange={(e) => handleSettingChange('welcomeBannerMessage', e.target.value)}
                  className="flex-1 ml-4"
                  disabled={isSaving}
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
  );
} 