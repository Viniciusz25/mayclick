import { useState, useEffect } from 'react';
import { defaultSettings } from '../data/defaultSettings';
import { getBusinessSettings, updateBusinessSettings } from '../lib/apiClient';

const safeObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const normalizeBusinessSettings = (value) => {
  const parsed = safeObject(value);
  const defaults = safeObject(defaultSettings);

  return {
    ...defaults,
    ...parsed,
    contact: {
      ...safeObject(defaults.contact),
      ...safeObject(parsed.contact),
    },
    pdf: {
      ...safeObject(defaults.pdf),
      ...safeObject(parsed.pdf),
    },
    pricing: {
      ...safeObject(defaults.pricing),
      ...safeObject(parsed.pricing),
      packages: Array.isArray(parsed.pricing?.packages)
        ? parsed.pricing.packages
        : Array.isArray(defaults.pricing?.packages)
          ? defaults.pricing.packages
          : [],
      modalities: Array.isArray(parsed.pricing?.modalities)
        ? parsed.pricing.modalities
        : Array.isArray(defaults.pricing?.modalities)
          ? defaults.pricing.modalities
          : [],
      transport: Array.isArray(parsed.pricing?.transport)
        ? parsed.pricing.transport
        : Array.isArray(defaults.pricing?.transport)
          ? defaults.pricing.transport
          : [],
    },
  };
};

const useSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Main Business Settings (Info + Pricing)
  const [businessSettings, setBusinessSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('mayclick_business_settings');
      if (saved) {
        return normalizeBusinessSettings(JSON.parse(saved));
      }
      return normalizeBusinessSettings(defaultSettings);
    } catch (e) {
      return normalizeBusinessSettings(defaultSettings);
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getBusinessSettings();
        if (data && Object.keys(data).length > 0) {
          const normalized = normalizeBusinessSettings(data);
          setBusinessSettings(normalized);
          localStorage.setItem('mayclick_business_settings', JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("[useSettings] Failed to fetch settings from API:", err);
        setError("Não foi possível carregar as configurações do servidor. Usando dados locais.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const [accountSettings, setAccountSettings] = useState(() => {
    const defaultAccount = {
      name: "Proprietário Mayclick",
      email: "admin@mayclick.com.br"
    };
    try {
      const saved = localStorage.getItem('mayclick_account_settings');
      const parsed = saved ? JSON.parse(saved) : defaultAccount;
      return {
        ...defaultAccount,
        ...safeObject(parsed),
      };
    } catch (e) {
      return defaultAccount;
    }
  });

  const saveBusinessSettings = async (newSettings) => {
    const normalized = normalizeBusinessSettings(newSettings);

    try {
      const savedSettings = await updateBusinessSettings(normalized);
      const finalSettings = normalizeBusinessSettings(savedSettings && Object.keys(savedSettings).length > 0 ? savedSettings : normalized);
      setBusinessSettings(finalSettings);
      localStorage.setItem('mayclick_business_settings', JSON.stringify(finalSettings));
      return true;
    } catch (err) {
      console.error("[useSettings] Failed to save settings to API:", err);
      throw err;
    }
  };

  const saveAccountSettings = (newSettings) => {
    setAccountSettings(newSettings);
    try {
      localStorage.setItem('mayclick_account_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save account settings");
    }
  };

  const restoreDefaults = async () => {
    const normalizedDefaults = normalizeBusinessSettings(defaultSettings);
    await saveBusinessSettings(normalizedDefaults);
    return normalizedDefaults;
  };

  return {
    businessSettings,
    accountSettings,
    loading,
    error,
    saveBusinessSettings,
    saveAccountSettings,
    restoreDefaults
  };
};

export default useSettings;
