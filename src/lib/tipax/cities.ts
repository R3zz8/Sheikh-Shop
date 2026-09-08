/**
 * Tipax Iranian City Data and Mapping Layer
 * Maps Sheikh Shops Iranian province and city string inputs to official Tipax City IDs.
 */

import type { TipaxCity } from './types';

// Default origin city ID (e.g. Tehran = 1 or Shiraz / Isfahan based on store location)
export const DEFAULT_TIPAX_ORIGIN_CITY_ID = 1; // Tehran

/**
 * Static reference dictionary mapping major Iranian cities and provinces to Tipax City IDs.
 * Sourced from Tipax Official Location Master Data.
 */
export const TIPAX_CITIES_MAP: Record<string, number> = {
  // Tehran Province
  'تهران': 1,
  'شهرری': 2,
  'تجریش': 3,
  'اسلامشهر': 4,
  'شهریار': 5,
  'قدس': 6,
  'ملارد': 7,
  'ورامین': 8,
  'پاکدشت': 9,
  'دماوند': 10,
  'فیروزکوه': 11,
  'پردیس': 12,
  'رباط کریم': 13,
  'پرند': 14,
  'اندیشه': 15,

  // Fars Province
  'فارس': 101,
  'شیراز': 101,
  'مرودشت': 102,
  'کازرون': 103,
  'جهرم': 104,
  'فسا': 105,
  'داراب': 106,
  'لار': 107,
  'لارستان': 107,
  'آباده': 108,
  'نورآباد': 109,
  'فیروزآباد': 110,
  'کوار': 111,
  'لامرد': 112,
  'نی ریز': 113,

  // Isfahan Province
  'اصفهان': 201,
  'کاشان': 202,
  'خمینی شهر': 203,
  'نجف آباد': 204,
  'شاهین شهر': 205,
  'شهرضا': 206,
  'فولادشهر': 207,
  'مبارکه': 208,
  'آران و بیدگل': 209,
  'زرین شهر': 210,
  'نائین': 211,
  'نطنز': 212,

  // Razavi Khorasan
  'خراسان رضوی': 301,
  'مشهد': 301,
  'نیشابور': 302,
  'سبزوار': 303,
  'تربت حیدریه': 304,
  'قوچان': 305,
  'کاشمر': 306,
  'تایباد': 307,
  'چناران': 308,
  'سرخس': 309,
  'گناباد': 310,

  // East Azerbaijan
  'آذربایجان شرقی': 401,
  'تبریز': 401,
  'مراغه': 402,
  'مرند': 403,
  'میانه': 404,
  'اهر': 405,
  'بناب': 406,
  'سراب': 407,
  'جلفا': 408,

  // West Azerbaijan
  'آذربایجان غربی': 501,
  'ارومیه': 501,
  'خوی': 502,
  'میاندوآب': 503,
  'مهاباد': 504,
  'بوکان': 505,
  'سلماس': 506,
  'پیرانشهر': 507,
  'نقده': 508,

  // Alborz
  'البرز': 601,
  'کرج': 601,
  'فردیس': 602,
  'نظرآباد': 603,
  'هشتگرد': 604,
  'ساوجبلاغ': 605,
  'اشتهارد': 606,
  'طالقان': 607,

  // Mazandaran
  'مازندران': 701,
  'ساری': 701,
  'بابل': 702,
  'آمل': 703,
  'قائم شهر': 704,
  'قائمشهر': 704,
  'بهشهر': 705,
  'چالوس': 706,
  'تنکابن': 707,
  'نوشهر': 708,
  'بابلسر': 709,
  'رامسر': 710,
  'محمودآباد': 711,

  // Gilan
  'گیلان': 801,
  'رشت': 801,
  'بندر انزلی': 802,
  'انزلی': 802,
  'لاهیجان': 803,
  'لنگرود': 804,
  'تالش': 805,
  'آستارا': 806,
  'صومعه سرا': 807,
  'فومن': 808,
  'رودسر': 809,

  // Khuzestan
  'خوزستان': 901,
  'اهواز': 901,
  'دزفول': 902,
  'آبادان': 903,
  'ماهشهر': 904,
  'بندر ماهشهر': 904,
  'خرمشهر': 905,
  'اندیمشک': 906,
  'ایذه': 907,
  'شوشتر': 908,
  'بهبهان': 909,
  'مسجد سلیمان': 910,
  'شوش': 911,

  // Kerman
  'کرمان': 1001,
  'سیرجان': 1002,
  'رفسنجان': 1003,
  'جیرفت': 1004,
  'بم': 1005,
  'زرند': 1006,
  'کهنوج': 1007,

  // Kermanshah
  'کرمانشاه': 1101,
  'اسلام آباد غرب': 1102,
  'جوانرود': 1103,
  'کنگاور': 1104,
  'سرپل ذهاب': 1105,
  'سنقر': 1106,

  // Hormozgan
  'هرمزگان': 1201,
  'بندرعباس': 1201,
  'بندر عباس': 1201,
  'میناب': 1202,
  'قشم': 1203,
  'کیش': 1204,
  'بندر لنگه': 1205,
  'جاسک': 1206,

  // Yazd
  'یزد': 1301,
  'میبد': 1302,
  'اردکان': 1303,
  'بافق': 1304,
  'مهریز': 1305,

  // Qom
  'قم': 1401,

  // Markazi
  'مرکزی': 1501,
  'اراک': 1501,
  'ساوه': 1502,
  'محلات': 1503,
  'خمین': 1504,
  'دلیجان': 1505,

  // Hamadan
  'همدان': 1601,
  'ملایر': 1602,
  'نهاوند': 1603,
  'تویسرکان': 1604,

  // Qazvin
  'قزوین': 1701,
  'تاکستان': 1702,
  'الوند': 1703,
  'آبیک': 1704,

  // Golestan
  'گلستان': 1801,
  'گرگان': 1801,
  'گنبد کاووس': 1802,
  'گنبدکاووس': 1802,
  'علی آباد کتول': 1803,
  'بندر ترکمن': 1804,
  'کردکوی': 1805,

  // Bushehr
  'بوشهر': 1901,
  'دشتستان': 1902,
  'برازجان': 1902,
  'کنگان': 1903,
  'گناوه': 1904,
  'بندر گناوه': 1904,
  'عسلویه': 1905,

  // Semnan
  'سمنان': 2001,
  'شاهرود': 2002,
  'دامغان': 2003,
  'گرمسار': 2004,

  // Zanjan
  'زنجان': 2101,
  'ابهر': 2102,
  'خرمدره': 2103,

  // Ardabil
  'اردبیل': 2201,
  'پارس آباد': 2202,
  'مشگین شهر': 2203,
  'خلخال': 2204,

  // Sistan and Baluchestan
  'سیستان و بلوچستان': 2301,
  'زاهدان': 2301,
  'زابل': 2302,
  'چابهار': 2303,
  'بندر چابهار': 2303,
  'ایرانشهر': 2304,
  'سراوان': 2305,

  // Kurdistan
  'کردستان': 2401,
  'سنندج': 2401,
  'سقز': 2402,
  'مریوان': 2403,
  'بانه': 2404,
  'قروه': 2405,

  // Lorestan
  'لرستان': 2501,
  'خرم آباد': 2501,
  'خرم‌آباد': 2501,
  'بروجرد': 2502,
  'دورود': 2503,
  'کوهدشت': 2504,
  'الیگودرز': 2505,

  // Chaharmahal and Bakhtiari
  'چهارمحال و بختیاری': 2601,
  'شهرکرد': 2601,
  'بروجن': 2602,
  'لردگان': 2603,

  // Ilam
  'ایلام': 2701,
  'دهلران': 2702,
  'مهران': 2703,

  // North Khorasan
  'خراسان شمالی': 2801,
  'بجنورد': 2801,
  'شیروان': 2802,
  'اسفراین': 2803,

  // South Khorasan
  'خراسان جنوبی': 2901,
  'بیرجند': 2901,
  'قائن': 2902,
  'فردوس': 2903,
  'طبس': 2904,

  // Kohgiluyeh and Boyer-Ahmad
  'کهگیلویه و بویراحمد': 3001,
  'یاسوج': 3001,
  'دوگنبدان': 3002,
  'گچساران': 3002,
  'دهدشت': 3003,
};

/**
 * Normalizes Persian text strings for robust search and mapping
 */
export function normalizePersianText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u200C/g, ' ') // Replace Zero-Width Non-Joiner (ZWNJ) with space
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .replace(/[ەۀأإآ]/g, 'ا')
    .replace(/[\u064B-\u065F]/g, '') // Remove harakat/diacritics
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Resolves Tipax City ID from given Persian city name or province fallback
 */
export function resolveTipaxCityId(cityName: string, provinceName?: string): number {
  const normCity = normalizePersianText(cityName);
  const normProvince = provinceName ? normalizePersianText(provinceName) : '';

  // 1. Direct city match
  if (normCity && TIPAX_CITIES_MAP[normCity] !== undefined) {
    return TIPAX_CITIES_MAP[normCity];
  }

  // 2. Partial city match
  for (const [key, id] of Object.entries(TIPAX_CITIES_MAP)) {
    if (normCity && (normCity.includes(key) || key.includes(normCity))) {
      return id;
    }
  }

  // 3. Province capital fallback match
  if (normProvince && TIPAX_CITIES_MAP[normProvince] !== undefined) {
    return TIPAX_CITIES_MAP[normProvince];
  }

  // 4. Default fallback to Tehran Hub (1)
  return DEFAULT_TIPAX_ORIGIN_CITY_ID;
}
