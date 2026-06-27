import { pricingData } from '../data/pricing';
import { getPackages, getPublicPackages } from './apiClient';

export const DEFAULT_PACKAGE_CATEGORIES = ['infantil', 'debutante', 'casamento'];

export const safeText = (value) => (
  value == null ? '' : String(value)
);

export const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const safeArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item != null);
      }
    } catch {
      // Plain multiline strings are valid input for legacy package data.
    }

    return trimmed
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value == null) {
    return [];
  }

  return [value];
};

export const normalizePackageFeature = (feature) => {
  if (feature && typeof feature === 'object' && !Array.isArray(feature)) {
    const label = safeText(feature.label || feature.name || feature.value || feature.detail).trim();
    if (!label) return null;

    const rawValue = feature.value ?? feature.detail ?? '';
    const type = ['boolean', 'text'].includes(feature.type) ? feature.type : (rawValue ? 'text' : 'boolean');

    return {
      label,
      type,
      included: feature.included === undefined ? true : Boolean(feature.included),
      value: safeText(rawValue),
    };
  }

  const label = safeText(feature).trim();
  return label ? { label, type: 'boolean', included: true, value: '' } : null;
};

export const featureToText = (feature) => {
  if (typeof feature === 'string') {
    return feature;
  }

  const normalized = normalizePackageFeature(feature);
  return normalized?.label || '';
};

export const textToFeature = (text, previousFeature = null) => {
  const label = safeText(text).trim();
  const previous = normalizePackageFeature(previousFeature);

  return {
    ...(previous || {}),
    label,
    type: previous?.type || 'boolean',
    included: previous?.included ?? true,
    value: previous?.value || '',
  };
};

export const featureToDisplayText = (feature) => {
  const normalized = normalizePackageFeature(feature);
  if (!normalized) return '';
  if (normalized.type === 'text' && normalized.value) {
    return `${normalized.label}: ${normalized.value}`;
  }
  return normalized.included ? normalized.label : `${normalized.label}: não incluso`;
};

export const normalizePackageFeatures = (features) => {
  return safeArray(features).map(normalizePackageFeature).filter(Boolean);
};

export const normalizePackage = (pkg = {}, fallbackSortOrder = 0) => {
  const source = pkg && typeof pkg === 'object' ? pkg : {};
  const rawId = source.id ?? source.package_id ?? source.name ?? '';
  const price = safeNumber(source.price);
  const sortOrder = safeNumber(source.sort_order ?? source.sortOrder ?? fallbackSortOrder);

  return {
    ...source,
    id: safeText(rawId),
    category: safeText(source.category).trim().toLowerCase(),
    name: safeText(source.name || source.label || 'Pacote').trim(),
    label: safeText(source.label),
    package_number: safeText(source.package_number ?? source.packageNumber),
    installment_text: safeText(source.installment_text ?? source.installmentText),
    price,
    description: safeText(source.description),
    features: normalizePackageFeatures(source.features),
    comparison_items: normalizePackageFeatures(source.comparison_items ?? source.comparisonItems),
    coverage_time: safeText(source.coverage_time ?? source.coverageTime),
    team: safeText(source.team),
    deliveries: safeText(source.deliveries),
    observations: safeText(source.observations ?? source.notes),
    differential: safeText(source.differential),
    active: source.active === undefined ? true : Boolean(source.active),
    sort_order: sortOrder,
  };
};

export const getLocalPackagesFallback = () => (
  (pricingData.packages || []).map((pkg, index) => normalizePackage(pkg, (index + 1) * 10))
);

export const sortPackages = (packages = []) => (
  [...packages].sort((a, b) => (
    Number(a.sort_order || 0) - Number(b.sort_order || 0)
    || safeText(a.category).localeCompare(safeText(b.category))
    || safeText(a.name).localeCompare(safeText(b.name))
  ))
);

export const fetchPublicPackagesWithFallback = async () => {
  try {
    const packages = await getPublicPackages();
    return {
      packages: sortPackages((Array.isArray(packages) ? packages : []).map((pkg) => normalizePackage(pkg))),
      source: 'api',
      notice: '',
    };
  } catch (error) {
    return {
      packages: sortPackages(getLocalPackagesFallback().filter((pkg) => pkg.active)),
      source: 'fallback',
      notice: 'Pacotes carregados em modo temporario. Confirme valores com a equipe.',
      error,
    };
  }
};

export const fetchAdminPackagesWithFallback = async () => {
  try {
    const packages = await getPackages();
    return {
      packages: sortPackages((Array.isArray(packages) ? packages : []).map((pkg) => normalizePackage(pkg))),
      source: 'api',
      notice: '',
    };
  } catch (error) {
    return {
      packages: sortPackages(getLocalPackagesFallback()),
      source: 'fallback',
      notice: 'Dados locais temporários. Não é possível salvar até reconectar ao servidor.',
      error,
    };
  }
};
