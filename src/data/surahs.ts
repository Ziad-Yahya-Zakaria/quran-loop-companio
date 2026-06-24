// السور من 42 إلى 57 — الشورى إلى الحديد
export interface SurahMeta {
  number: number;
  name: string;
  nameLatin: string;
  ayahCount: number;
  revelation: "مكية" | "مدنية";
}

export const SURAHS: SurahMeta[] = [
  { number: 42, name: "الشورى", nameLatin: "Ash-Shura", ayahCount: 53, revelation: "مكية" },
  { number: 43, name: "الزخرف", nameLatin: "Az-Zukhruf", ayahCount: 89, revelation: "مكية" },
  { number: 44, name: "الدخان", nameLatin: "Ad-Dukhan", ayahCount: 59, revelation: "مكية" },
  { number: 45, name: "الجاثية", nameLatin: "Al-Jathiya", ayahCount: 37, revelation: "مكية" },
  { number: 46, name: "الأحقاف", nameLatin: "Al-Ahqaf", ayahCount: 35, revelation: "مكية" },
  { number: 47, name: "محمد", nameLatin: "Muhammad", ayahCount: 38, revelation: "مدنية" },
  { number: 48, name: "الفتح", nameLatin: "Al-Fath", ayahCount: 29, revelation: "مدنية" },
  { number: 49, name: "الحجرات", nameLatin: "Al-Hujurat", ayahCount: 18, revelation: "مدنية" },
  { number: 50, name: "ق", nameLatin: "Qaf", ayahCount: 45, revelation: "مكية" },
  { number: 51, name: "الذاريات", nameLatin: "Adh-Dhariyat", ayahCount: 60, revelation: "مكية" },
  { number: 52, name: "الطور", nameLatin: "At-Tur", ayahCount: 49, revelation: "مكية" },
  { number: 53, name: "النجم", nameLatin: "An-Najm", ayahCount: 62, revelation: "مكية" },
  { number: 54, name: "القمر", nameLatin: "Al-Qamar", ayahCount: 55, revelation: "مكية" },
  { number: 55, name: "الرحمن", nameLatin: "Ar-Rahman", ayahCount: 78, revelation: "مدنية" },
  { number: 56, name: "الواقعة", nameLatin: "Al-Waqi'a", ayahCount: 96, revelation: "مكية" },
  { number: 57, name: "الحديد", nameLatin: "Al-Hadid", ayahCount: 29, revelation: "مدنية" },
];

export const SURAH_BY_NUMBER = new Map(SURAHS.map((s) => [s.number, s]));

export function getSurahName(n: number): string {
  return SURAH_BY_NUMBER.get(n)?.name ?? `سورة ${n}`;
}
