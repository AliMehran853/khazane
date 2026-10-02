// ============================================================
// Calendar abstraction layer (روتر تقویم)
// ============================================================

import { afghanCalendar } from './afghan';
import { iranianCalendar } from './iranian';
import { gregorianCalendar } from './gregorian';

const CALENDARS = {
  afghan: afghanCalendar,
  iranian: iranianCalendar,
  gregorian: gregorianCalendar,
};

let _currentId = 'afghan';

/**
 * تنظیم تقویم فعلی (از settingsService صدا زده می‌شود)
 */
export function setCalendar(id) {
  if (CALENDARS[id]) _currentId = id;
}

/**
 * دریافت شناسه تقویم فعلی
 */
export function getCalendarId() {
  return _currentId;
}

/**
 * دریافت آبجکت تقویم فعلی
 */
export function getCalendar() {
  return CALENDARS[_currentId] || afghanCalendar;
}

/**
 * آیا تقویم فعلی شمسی است؟ (افغانی یا ایرانی)
 */
export function isSolarCalendar() {
  return _currentId === 'afghan' || _currentId === 'iranian';
}

export { afghanCalendar, iranianCalendar, gregorianCalendar };
export const CALENDAR_IDS = ['afghan', 'iranian', 'gregorian'];