import { create } from 'zustand';
import { getSetting, setSetting } from '../db/database';
import type { LicenseClass } from '../constants/theme';

interface SettingsState {
  licenseClass: LicenseClass | null;
  isPremium: boolean;
  onboardingDone: boolean;
  loaded: boolean;
  setLicenseClass: (cls: LicenseClass) => Promise<void>;
  setPremium: (val: boolean) => Promise<void>;
  setOnboardingDone: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettings = create<SettingsState>((set) => ({
  licenseClass: null,
  isPremium: false,
  onboardingDone: false,
  loaded: false,

  loadSettings: async () => {
    const cls = await getSetting('license_class', '');
    const premium = await getSetting('is_premium', '0');
    const onboarding = await getSetting('onboarding_done', '0');
    set({
      licenseClass: (cls as LicenseClass) || null,
      isPremium: premium === '1',
      onboardingDone: onboarding === '1',
      loaded: true,
    });
  },

  setLicenseClass: async (cls) => {
    await setSetting('license_class', cls);
    set({ licenseClass: cls });
  },

  setPremium: async (val) => {
    await setSetting('is_premium', val ? '1' : '0');
    set({ isPremium: val });
  },

  setOnboardingDone: async () => {
    await setSetting('onboarding_done', '1');
    set({ onboardingDone: true });
  },
}));
