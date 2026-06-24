// جدول الـ24 أسبوع — كل أسبوع مقطع من سورة (أو أكثر) + 3 حصص
// الحصص: تهيئة / حفظ / مراجعة (الأسبوع الأخير من كل شهر يستبدل المراجعة بـ"إتقان")

export type Stage = "tahyia" | "hifz" | "muraja" | "itqan";

export interface LessonSegment {
  surah: number;
  from: number;
  to: number;
}

export interface Lesson {
  index: 1 | 2 | 3;
  stage: Stage;
  segments: LessonSegment[];
  note?: string;
}

export interface Week {
  weekNumber: number; // 1..24
  month: number; // 1..6
  weekInMonth: number; // 1..4
  segments: LessonSegment[]; // كامل مقطع الأسبوع
  title: string;
  lessons: Lesson[];
}

export const STAGE_META: Record<Stage, { label: string; color: string; badge: string }> = {
  tahyia: { label: "تهيئة", color: "#c9973a", badge: "badge-gold" },
  hifz: { label: "حفظ", color: "#2d6a4a", badge: "badge-green" },
  muraja: { label: "مراجعة", color: "#1d4ed8", badge: "badge-blue" },
  itqan: { label: "إتقان / ختام", color: "#b91c1c", badge: "badge-red" },
};

// توزيع 16 سورة على 24 أسبوع
// المجموع: 2+3+1+1+1+1+1+1+1+2+1+2+2+2+2+1 = 24
type RawWeek = { segments: LessonSegment[]; title: string };

const RAW_WEEKS: RawWeek[] = [
  // الشورى (53) — أسبوعان
  { segments: [{ surah: 42, from: 1, to: 27 }], title: "الشورى ١-٢٧" },
  { segments: [{ surah: 42, from: 28, to: 53 }], title: "الشورى ٢٨-٥٣" },
  // الزخرف (89) — ٣ أسابيع
  { segments: [{ surah: 43, from: 1, to: 30 }], title: "الزخرف ١-٣٠" },
  { segments: [{ surah: 43, from: 31, to: 60 }], title: "الزخرف ٣١-٦٠" },
  { segments: [{ surah: 43, from: 61, to: 89 }], title: "الزخرف ٦١-٨٩" },
  // الدخان (59)
  { segments: [{ surah: 44, from: 1, to: 59 }], title: "الدخان كاملة" },
  // الجاثية (37)
  { segments: [{ surah: 45, from: 1, to: 37 }], title: "الجاثية كاملة" },
  // الأحقاف (35)
  { segments: [{ surah: 46, from: 1, to: 35 }], title: "الأحقاف كاملة" },
  // محمد (38)
  { segments: [{ surah: 47, from: 1, to: 38 }], title: "محمد كاملة" },
  // الفتح (29)
  { segments: [{ surah: 48, from: 1, to: 29 }], title: "الفتح كاملة" },
  // الحجرات (18)
  { segments: [{ surah: 49, from: 1, to: 18 }], title: "الحجرات كاملة" },
  // ق (45)
  { segments: [{ surah: 50, from: 1, to: 45 }], title: "ق كاملة" },
  // الذاريات (60) — أسبوعان
  { segments: [{ surah: 51, from: 1, to: 30 }], title: "الذاريات ١-٣٠" },
  { segments: [{ surah: 51, from: 31, to: 60 }], title: "الذاريات ٣١-٦٠" },
  // الطور (49)
  { segments: [{ surah: 52, from: 1, to: 49 }], title: "الطور كاملة" },
  // النجم (62) — أسبوعان
  { segments: [{ surah: 53, from: 1, to: 31 }], title: "النجم ١-٣١" },
  { segments: [{ surah: 53, from: 32, to: 62 }], title: "النجم ٣٢-٦٢" },
  // القمر (55) — أسبوعان
  { segments: [{ surah: 54, from: 1, to: 28 }], title: "القمر ١-٢٨" },
  { segments: [{ surah: 54, from: 29, to: 55 }], title: "القمر ٢٩-٥٥" },
  // الرحمن (78) — أسبوعان
  { segments: [{ surah: 55, from: 1, to: 39 }], title: "الرحمن ١-٣٩" },
  { segments: [{ surah: 55, from: 40, to: 78 }], title: "الرحمن ٤٠-٧٨" },
  // الواقعة (96) — أسبوعان
  { segments: [{ surah: 56, from: 1, to: 48 }], title: "الواقعة ١-٤٨" },
  { segments: [{ surah: 56, from: 49, to: 96 }], title: "الواقعة ٤٩-٩٦" },
  // الحديد (29)
  { segments: [{ surah: 57, from: 1, to: 29 }], title: "الحديد كاملة" },
];

// تقسيم آيات الأسبوع على 3 حصص بشكل متوازن
function splitIntoLessons(segments: LessonSegment[]): LessonSegment[][] {
  // نُسطّح الآيات ثم نقسّمها لـ3 حصص
  const flat: { surah: number; ayah: number }[] = [];
  segments.forEach((s) => {
    for (let a = s.from; a <= s.to; a++) flat.push({ surah: s.surah, ayah: a });
  });
  const n = flat.length;
  const sizes = [Math.ceil(n / 3), Math.ceil((n - Math.ceil(n / 3)) / 2)];
  sizes.push(n - sizes[0] - sizes[1]);

  const lessons: LessonSegment[][] = [];
  let cursor = 0;
  for (const size of sizes) {
    const slice = flat.slice(cursor, cursor + size);
    cursor += size;
    // إعادة تجميع كآيات متجاورة لكل سورة
    const grouped: LessonSegment[] = [];
    for (const item of slice) {
      const last = grouped[grouped.length - 1];
      if (last && last.surah === item.surah && last.to === item.ayah - 1) {
        last.to = item.ayah;
      } else {
        grouped.push({ surah: item.surah, from: item.ayah, to: item.ayah });
      }
    }
    lessons.push(grouped);
  }
  return lessons;
}

export const WEEKS: Week[] = RAW_WEEKS.map((raw, i) => {
  const weekNumber = i + 1;
  const month = Math.ceil(weekNumber / 4);
  const weekInMonth = ((weekNumber - 1) % 4) + 1;
  const isLastOfMonth = weekInMonth === 4;
  const splits = splitIntoLessons(raw.segments);

  const stages: Stage[] = ["tahyia", "hifz", isLastOfMonth ? "itqan" : "muraja"];
  const stageNotes = ["قراءة وتعرّف", "حفظ متقن", isLastOfMonth ? "ختام الشهر" : "تثبيت ومراجعة"];

  return {
    weekNumber,
    month,
    weekInMonth,
    segments: raw.segments,
    title: raw.title,
    lessons: splits.map((segs, idx) => ({
      index: (idx + 1) as 1 | 2 | 3,
      stage: stages[idx],
      segments: segs,
      note: stageNotes[idx],
    })),
  };
});

export const MONTHS: { number: number; title: string; weeks: Week[] }[] = Array.from(
  { length: 6 },
  (_, i) => {
    const monthNum = i + 1;
    const weeks = WEEKS.filter((w) => w.month === monthNum);
    return {
      number: monthNum,
      title: `الشهر ${monthNum} — ${weeks[0].title.split(" ")[0]} إلى ${weeks[weeks.length - 1].title.split(" ")[0]}`,
      weeks,
    };
  },
);

export function getWeek(weekNumber: number): Week | undefined {
  return WEEKS.find((w) => w.weekNumber === weekNumber);
}

export function countAyahs(segments: LessonSegment[]): number {
  return segments.reduce((sum, s) => sum + (s.to - s.from + 1), 0);
}

export function segmentRangeLabel(segments: LessonSegment[]): string {
  return segments
    .map((s) => {
      const surahName =
        ({
          42: "الشورى",
          43: "الزخرف",
          44: "الدخان",
          45: "الجاثية",
          46: "الأحقاف",
          47: "محمد",
          48: "الفتح",
          49: "الحجرات",
          50: "ق",
          51: "الذاريات",
          52: "الطور",
          53: "النجم",
          54: "القمر",
          55: "الرحمن",
          56: "الواقعة",
          57: "الحديد",
        } as Record<number, string>)[s.surah] ?? `${s.surah}`;
      return s.from === s.to
        ? `${surahName} ${s.from}`
        : `${surahName} ${s.from}-${s.to}`;
    })
    .join(" • ");
}
