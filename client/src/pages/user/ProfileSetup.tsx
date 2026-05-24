import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { apiFetch, apiFetchForm, apiUrl } from '../../api/http';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

type Profile = {
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
  homeAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  nativeLanguage?: string | null;
  otherLanguages?: string | null;
  accentDialect?: string | null;
  workAvailability?: string | null;
  notes?: string | null;
  preferredPaymentMethod: string;
  paymentAccountDetails: string;
  profilePhotoPath?: string | null;
  consentVoiceTraining: boolean;
  consentAccurateInfo: boolean;
};

const empty: Profile = {
  firstName: '',
  lastName: '',
  birthday: '',
  gender: '',
  homeAddress: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  email: '',
  phone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  nativeLanguage: '',
  otherLanguages: '',
  accentDialect: '',
  workAvailability: '',
  notes: '',
  preferredPaymentMethod: '',
  paymentAccountDetails: '',
  profilePhotoPath: null,
  consentVoiceTraining: false,
  consentAccurateInfo: false
};

export function ProfileSetup() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();

  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const photoUrl = useMemo(() => {
    if (!user) return null;
    return `${apiUrl()}/api/files/photos/${user.id}`;
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ profile: any }>('/api/profile/me');
        if (data.profile) {
          setProfile({
            ...empty,
            ...data.profile,
            birthday: data.profile.birthday ? String(data.profile.birthday).slice(0, 10) : ''
          });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  async function uploadPhoto(file: File) {
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      await apiFetchForm('/api/profile/photo', form);
      toast.success('Photo uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Photo upload failed');
    } finally {
      setPhotoUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/profile/me', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      await refresh();
      toast.success('Profile saved');
      nav('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete your AutoBidGo profile</CardTitle>
          <CardDescription>
            Your profile is required before you can start recording. Please provide accurate information and agree to the
            contributor terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-16 w-16 rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
              {photoUrl ? <img src={photoUrl} className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <div className="text-sm font-medium">Profile photo</div>
              <div className="text-xs text-slate-400">JPG, PNG, or WebP up to 5MB.</div>
            </div>
            <div className="ml-auto">
              <label className="inline-flex items-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPhoto(f);
                  }}
                />
                <span>
                  <Button type="button" variant="secondary" disabled={photoUploading}>
                    {photoUploading ? 'Uploading…' : 'Upload photo'}
                  </Button>
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <form className="space-y-6" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">First Name *</label>
              <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Last Name *</label>
              <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Birthday *</label>
              <Input
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Gender *</label>
              <Input value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Email *</label>
              <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Phone Number *</label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Emergency Contact Name *</label>
              <Input
                value={profile.emergencyContactName}
                onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Emergency Contact Phone *</label>
              <Input
                value={profile.emergencyContactPhone}
                onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Home Address *</label>
              <Input value={profile.homeAddress} onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">City *</label>
              <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">State or Province *</label>
              <Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Country *</label>
              <Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Postal Code *</label>
              <Input value={profile.postalCode} onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice and Language Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Native Language (optional)</label>
              <Input
                value={profile.nativeLanguage ?? ''}
                onChange={(e) => setProfile({ ...profile, nativeLanguage: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Other Languages (optional)</label>
              <Input
                value={profile.otherLanguages ?? ''}
                onChange={(e) => setProfile({ ...profile, otherLanguages: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Accent or Dialect (optional)</label>
              <Input
                value={profile.accentDialect ?? ''}
                onChange={(e) => setProfile({ ...profile, accentDialect: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Work Availability (optional)</label>
              <Input
                value={profile.workAvailability ?? ''}
                onChange={(e) => setProfile({ ...profile, workAvailability: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Notes (optional)</label>
              <Textarea value={profile.notes ?? ''} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>AutoBidGo uses this information to coordinate payment after approvals.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Preferred Payment Method *</label>
              <Input
                value={profile.preferredPaymentMethod}
                onChange={(e) => setProfile({ ...profile, preferredPaymentMethod: e.target.value })}
                placeholder="Bank transfer, PayPal, etc."
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Payment Account Details *</label>
              <Input
                value={profile.paymentAccountDetails}
                onChange={(e) => setProfile({ ...profile, paymentAccountDetails: e.target.value })}
                placeholder="Account / handle / routing details"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consent and Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                className="mt-1"
                checked={profile.consentAccurateInfo}
                onChange={(e) => setProfile({ ...profile, consentAccurateInfo: e.target.checked })}
              />
              <span>I confirm that the information provided is accurate.</span>
            </label>
            <label className="flex items-start gap-3 text-sm text-slate-300">
              <input
                type="checkbox"
                className="mt-1"
                checked={profile.consentVoiceTraining}
                onChange={(e) => setProfile({ ...profile, consentVoiceTraining: e.target.checked })}
              />
              <span>I agree that my voice recordings may be used for AI training and quality evaluation.</span>
            </label>

            <div className="pt-2">
              <Button disabled={loading}>{loading ? 'Saving…' : 'Save profile'}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
