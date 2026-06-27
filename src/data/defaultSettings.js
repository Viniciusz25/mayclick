import { businessInfo } from './business';
import { pricingData } from './pricing';

export const defaultSettings = {
  ...businessInfo,
  pricing: pricingData
};
