import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { OfflineBar } from "@/components/OfflineBar";
import { WeekCard } from "@/components/WeekCard";
import { LessonModal } from "@/components/LessonModal";
import { MONTHS, type Week } from "@/data/schedule";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حلقة القرآن الكريم — من الشورى إلى الحديد" },
      {
        name: "description",
        content:
          "تطبيق تفاعلي لحلقة تحفيظ القرآن من سورة الشورى (٤٢) إلى الحديد (٥٧) — مصحف عثماني، 3 تفاسير، صوت المنشاوي، يعمل بدون إنترنت.",
      },
    ],
  }),
  component: HalaqaPage,
});

function HalaqaPage() {
  const [openWeek, setOpenWeek] = useState<Week | null>(null);
  const [lessonIndex, setLessonIndex] = useState<1 | 2 | 3>(1);
  const [modalOpen, setModalOpen] = useState(false);

  function handleOpen(week: Week, lesson: 1 | 2 | 3) {
    setOpenWeek(week);
    setLessonIndex(lesson);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-5">
        <OfflineBar />

        {/* مفتاح ألوان المراحل */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 mb-5 flex flex-wrap gap-3 items-center justify-center text-[12px]">
          <span className="font-bold text-[var(--color-primary)]">المراحل:</span>
          <Legend color="#c9973a" label="تهيئة" />
          <Legend color="#2d6a4a" label="حفظ" />
          <Legend color="#1d4ed8" label="مراجعة" />
          <Legend color="#b91c1c" label="إتقان / ختام" />
        </div>

        {MONTHS.map((month) => (
          <section key={month.number} className="mb-8">
            <h2 className="bg-[var(--color-light-gold)] text-[var(--color-gold)] font-extrabold text-[15px] rounded-lg px-4 py-2.5 mb-3.5 border-r-[5px] border-[var(--color-accent)]">
              الشهر {toArabic(month.number)} — أسابيع {toArabic((month.number - 1) * 4 + 1)}–{toArabic(month.number * 4)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {month.weeks.map((w) => (
                <WeekCard key={w.weekNumber} week={w} onOpen={handleOpen} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="bg-[var(--color-primary)] text-white/70 text-center p-5 text-[12px]">
        <div className="font-quran text-[17px] text-[var(--color-accent-light)] mb-1.5">
          ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
        </div>
        تطبيق تفاعلي لحلقات حفظ القرآن — صوت الشيخ محمد صديق المنشاوي
      </footer>

      <LessonModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        week={openWeek}
        lessonIndex={lessonIndex}
      />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function toArabic(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}
