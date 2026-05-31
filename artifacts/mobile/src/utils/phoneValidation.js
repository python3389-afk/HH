/**
 * Nepal phone number validation
 * Valid formats:
 *   9841234567   (10 digits, starts with 97/98)
 *   +9779841234567  (with +977 country code)
 *   9779841234567   (with 977 country code)
 *   09841234567     (with leading 0)
 *
 * Valid mobile prefixes (NTC, Ncell, Smart Cell, UTL):
 * 980, 981, 982, 984, 985, 986, 988 (NTC)
 * 980, 981, 982, 983 (Ncell)
 * 961, 962, 963 (Smart Cell)
 * 972 (UTL)
 */
export function isValidNepalPhone(raw) {
  if (!raw) return false;
  const clean = raw.replace(/[\s\-\(\)\.]/g, '');
  const noPlus = clean.startsWith('+') ? clean.slice(1) : clean;
  const local = noPlus.startsWith('977')
    ? noPlus.slice(3)
    : noPlus.startsWith('0')
    ? noPlus.slice(1)
    : noPlus;
  return local.length === 10 && /^(97|98)\d{8}$/.test(local);
}

export function formatNepalPhone(raw) {
  if (!raw) return '';
  const clean = raw.replace(/[\s\-\(\)\.]/g, '');
  const noPlus = clean.startsWith('+') ? clean.slice(1) : clean;
  const local = noPlus.startsWith('977')
    ? noPlus.slice(3)
    : noPlus.startsWith('0')
    ? noPlus.slice(1)
    : noPlus;
  return local;
}

export const NEPAL_PHONE_PLACEHOLDER = '+977 98XXXXXXXX';
export const NEPAL_PHONE_ERROR = 'Enter a valid Nepal mobile number (e.g. 9841234567)';
