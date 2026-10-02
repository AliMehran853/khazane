// ============================================================
// Export Service — PDF generation (locale & calendar aware)
// ============================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import i18n from '../../i18n';
import { formatNumber } from '../utils/formatting';
import { formatTransactionDate, getTodayShort } from '../utils/dates';

const t = (key, opts = {}) => i18n.t(key, opts);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildReportHTML({
  transactions,
  categoriesMap,
  title,
  periodLabel,
  totalIncome,
  totalExpense,
  currencyLabel,
  showSummary,
}) {
  const lang = i18n.language || 'fa';
  const dir = lang === 'fa' ? 'rtl' : 'ltr';
  const textAlign = lang === 'fa' ? 'right' : 'left';
  const fontFamily =
    lang === 'fa'
      ? "'Vazirmatn', Tahoma, sans-serif"
      : "-apple-system, 'Segoe UI', Roboto, sans-serif";

  const rowsHtml = transactions.length
    ? transactions
        .map((tr) => {
          const cat = categoriesMap[tr.categoryId];
          const typeLabel =
            tr.type === 'income' ? t('transaction.income') : t('transaction.expense');
          const color = tr.type === 'income' ? '#009d81' : '#be123c';
          const sign = tr.type === 'income' ? '+' : '-';
          return `
            <tr>
              <td>${escapeHtml(cat?.name || t('transaction.uncategorized'))}</td>
              <td>${escapeHtml(tr.note || '-')}</td>
              <td>${escapeHtml(typeLabel)}</td>
              <td style="color:${color};font-weight:700;direction:ltr;text-align:center;">
                ${sign}${formatNumber(tr.amount)}
              </td>
              <td>${escapeHtml(formatTransactionDate(tr.date))}</td>
            </tr>
          `;
        })
        .join('')
    : `<tr><td colspan="5" style="text-align:center;padding:30px;color:#888;">
        ${escapeHtml(t('pdf.noTransactions'))}
      </td></tr>`;

  const summaryHtml = showSummary
    ? `
      <div class="summary">
        <div class="summary-card">
          <div class="label">${escapeHtml(t('summary.totalIncome'))}</div>
          <div class="value income-value" style="direction:ltr;">
            ${formatNumber(totalIncome)} ${escapeHtml(currencyLabel)}
          </div>
        </div>
        <div class="summary-card">
          <div class="label">${escapeHtml(t('summary.totalExpense'))}</div>
          <div class="value expense-value" style="direction:ltr;">
            ${formatNumber(totalExpense)} ${escapeHtml(currencyLabel)}
          </div>
        </div>
      </div>`
    : '';

  return `
    <div class="page" dir="${dir}" style="font-family:${fontFamily};">
      <div class="header">
        <div class="brand">${escapeHtml(t('app.name'))}</div>
        <div class="date">${escapeHtml(getTodayShort())}</div>
      </div>
      <h1>${escapeHtml(title)}</h1>
      ${periodLabel ? `<div class="period">${escapeHtml(periodLabel)}</div>` : ''}
      ${summaryHtml}
      <table>
        <thead>
          <tr>
            <th style="width:18%;text-align:${textAlign};">${escapeHtml(t('pdf.category'))}</th>
            <th style="width:32%;text-align:${textAlign};">${escapeHtml(t('pdf.note'))}</th>
            <th style="width:12%;text-align:${textAlign};">${escapeHtml(t('pdf.type'))}</th>
            <th style="width:18%;text-align:center;">${escapeHtml(t('pdf.amount'))} (${escapeHtml(currencyLabel)})</th>
            <th style="width:20%;text-align:${textAlign};">${escapeHtml(t('pdf.date'))}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="footer">
        ${escapeHtml(t('pdf.footer'))}
      </div>
    </div>
  `;
}

const REPORT_STYLES = `
  * { box-sizing: border-box; }
  .page {
    width: 800px;
    padding: 32px 28px;
    background: #ffffff;
    color: #0f172a;
  }
  .header {
    border-bottom: 2px solid #00D1A7;
    padding-bottom: 14px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand { font-size: 22px; font-weight: 800; color: #00a88a; }
  .date { font-size: 12px; color: #666; }
  h1 { font-size: 20px; font-weight: 800; margin: 0 0 6px; color: #111; }
  .period { font-size: 12px; color: #888; margin-bottom: 20px; }
  .summary { display: flex; gap: 16px; margin-bottom: 24px; }
  .summary-card {
    flex: 1;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 14px 18px;
    background: #fafafa;
  }
  .summary-card .label { font-size: 11px; color: #888; margin-bottom: 6px; }
  .summary-card .value { font-size: 20px; font-weight: 800; }
  .income-value { color: #00a88a; }
  .expense-value { color: #be123c; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead { background: #f7faf9; }
  th, td { padding: 10px 12px; border-bottom: 1px solid #eee; }
  th { font-weight: 700; font-size: 12px; color: #555; }
  tbody tr:last-child td { border-bottom: none; }
  .footer { margin-top: 30px; font-size: 10px; color: #aaa; text-align: center; }
`;

function sliceCanvas(sourceCanvas, yOffset, height) {
  const slice = document.createElement('canvas');
  slice.width = sourceCanvas.width;
  slice.height = height;

  const ctx = slice.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, slice.width, slice.height);
  ctx.drawImage(
    sourceCanvas,
    0,
    yOffset,
    sourceCanvas.width,
    height,
    0,
    0,
    sourceCanvas.width,
    height,
  );

  return slice;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1500);
}

export async function exportTransactionsToPDF({
  transactions = [],
  categoriesMap = {},
  title,
  periodLabel = '',
  totalIncome = 0,
  totalExpense = 0,
  currencyLabel,
  showSummary = true,
  fileName,
}) {
  const finalTitle = title || t('pdf.reportTitle');
  const finalCurrency = currencyLabel || t('currencies.AFN.label');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.style.pointerEvents = 'none';

  const styleEl = document.createElement('style');
  styleEl.textContent = REPORT_STYLES;

  const inner = document.createElement('div');
  inner.innerHTML = buildReportHTML({
    transactions,
    categoriesMap,
    title: finalTitle,
    periodLabel,
    totalIncome,
    totalExpense,
    currencyLabel: finalCurrency,
    showSummary,
  });

  container.appendChild(styleEl);
  container.appendChild(inner);
  document.body.appendChild(container);

  try {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    const target = inner.querySelector('.page');
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: 800,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    const pxPerMm = canvas.width / contentWidth;
    const totalContentHeightMm = canvas.height / pxPerMm;

    let remainingMm = totalContentHeightMm;
    let yOffsetPx = 0;

    while (remainingMm > 0) {
      const sliceMm = Math.min(remainingMm, contentHeight);
      const slicePx = Math.floor(sliceMm * pxPerMm);
      const maxPx = canvas.height - yOffsetPx;
      const actualSlicePx = Math.min(slicePx, maxPx);

      const pageCanvas = sliceCanvas(canvas, yOffsetPx, actualSlicePx);
      const pageImg = pageCanvas.toDataURL('image/jpeg', 0.92);
      const drawHeightMm = actualSlicePx / pxPerMm;

      pdf.addImage(
        pageImg,
        'JPEG',
        margin,
        margin,
        contentWidth,
        drawHeightMm,
        undefined,
        'FAST',
      );

      yOffsetPx += actualSlicePx;
      remainingMm -= sliceMm;

      if (remainingMm > 0) pdf.addPage();
    }

    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const finalName = fileName || `khazane-report-${ts}.pdf`;

    const pdfBlob = pdf.output('blob');
    downloadBlob(pdfBlob, finalName);

    return true;
  } finally {
    document.body.removeChild(container);
  }
}