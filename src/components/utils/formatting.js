const FA_NUMBER = new Intl.NumberFormat('fa-AF');

export function formatNumber(value) {
  const num = Number(value) || 0;
  return FA_NUMBER.format(Math.round(num));
}

export function formatCurrency(value) {
  return `${formatNumber(value)} افغانی`;
}

export function formatPercent(value, decimals = 0) {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}٪`;
}

export function parseNumberInput(value) {
  if (!value && value !== 0) return '';
  const str = String(value).replace(/[^\d.]/g, '');
  return str;
}

export function toEnglishDigits(str) {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}