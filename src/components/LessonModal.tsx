import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, BookOpen, ScrollText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  type Week,
  type Lesson,
  segmentRangeLabel,
  countAyahs,
  STAGE_META,
} from "@/data/schedule";
import {
  getSegmentAyahs,
  getSegmentTafsir,
  getCachedAudio,
  TAFSIR_LABELS,
  type TafsirId,
} from "@/lib/quran-api";
import { getSurahName } from "@/data/surahs";
import { StageBadge } from "./StageBadge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  week: Week | null;
  lessonIndex: 1 | 2 | 3;
}

function arabicNumeral(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
}

export function LessonModal({ open, onOpenChange, week, lessonIndex }: Props) {
  const [tafsirId, setTafsirId] = useState<TafsirId>("ar.muyassar");
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<{ surah: number; ayah: number }[]>([]);
  const queueIdxRef = useRef(0);

  const lesson: Lesson | undefined = week?.lessons.find((l) => l.index === lessonIndex);

  const ayahsQuery = useQuery({
    queryKey: ["ayahs", lesson?.segments],
    queryFn: () => getSegmentAyahs(lesson!.segments),
    enabled: open && Boolean(lesson),
    staleTime: Infinity,
  });

  const tafsirQuery = useQuery({
    queryKey: ["tafsir", lesson?.segments, tafsirId],
    queryFn: () => getSegmentTafsir(lesson!.segments, tafsirId),
    enabled: open && Boolean(lesson),
    staleTime: Infinity,
  });

  // إيقاف الصوت عند الإغلاق أو تغيير الحصة
  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingKey(null);
      setIsPlayingAll(false);
    }
  }, [open, week, lessonIndex]);

  async function playOne(surah: number, ayah: number) {
    audioRef.current?.pause();
    const key = `${surah}:${ayah}`;
    setPlayingKey(key);
    try {
      const url = await getCachedAudio(surah, ayah);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        if (isPlayingAll) {
          queueIdxRef.current++;
          playNextInQueue();
        } else {
          setPlayingKey(null);
        }
      };
      audio.onerror = () => setPlayingKey(null);
      await audio.play();
    } catch (e) {
      console.error(e);
      setPlayingKey(null);
    }
  }

  function playNextInQueue() {
    const q = queueRef.current;
    if (queueIdxRef.current >= q.length) {
      setIsPlayingAll(false);
      setPlayingKey(null);
      return;
    }
    const { surah, ayah } = q[queueIdxRef.current];
    void playOne(surah, ayah);
  }

  function playAll() {
    if (!ayahsQuery.data || !lesson) return;
    if (isPlayingAll) {
      audioRef.current?.pause();
      setIsPlayingAll(false);
      setPlayingKey(null);
      return;
    }
    const q: { surah: number; ayah: number }[] = [];
    lesson.segments.forEach((s) => {
      for (let a = s.from; a <= s.to; a++) q.push({ surah: s.surah, ayah: a });
    });
    queueRef.current = q;
    queueIdxRef.current = 0;
    setIsPlayingAll(true);
    playNextInQueue();
  }

  if (!week || !lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[calc(100vw-1rem)] max-h-[92vh] p-0 overflow-hidden flex flex-col gap-0"
        dir="rtl"
      >
        <DialogHeader className="bg-[var(--color-primary)] text-white p-5 space-y-2">
          <DialogTitle className="text-white text-base sm:text-lg font-extrabold flex items-center gap-2 flex-wrap">
            <span>
              الأسبوع {arabicNumeral(week.weekNumber)} — حصة{" "}
              {arabicNumeral(lesson.index)}
            </span>
            <StageBadge stage={lesson.stage} />
          </DialogTitle>
          <div className="text-[12.5px] opacity-90">
            {segmentRangeLabel(lesson.segments)}
          </div>
          <div className="inline-flex items-center gap-2 flex-wrap text-[11.5px]">
            <span className="bg-white/15 px-2.5 py-1 rounded">
              {countAyahs(lesson.segments)} آية
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded">
              {STAGE_META[lesson.stage].label}
            </span>
            {lesson.note && (
              <span className="bg-white/15 px-2.5 py-1 rounded">{lesson.note}</span>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="mushaf" className="flex-1 flex flex-col min-h-0">
          <TabsList className="rounded-none border-b bg-[#faf8f3] h-12 p-0 grid grid-cols-2 shrink-0">
            <TabsTrigger
              value="mushaf"
              className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-accent)] h-full font-bold gap-1.5"
            >
              <BookOpen className="w-4 h-4" /> المصحف
            </TabsTrigger>
            <TabsTrigger
              value="tafsir"
              className="rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-accent)] h-full font-bold gap-1.5"
            >
              <ScrollText className="w-4 h-4" /> التفسير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mushaf" className="flex-1 overflow-y-auto p-4 mt-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Button
                onClick={playAll}
                size="sm"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
              >
                {isPlayingAll ? (
                  <>
                    <Pause className="w-4 h-4" /> إيقاف الكل
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> تشغيل الكل
                  </>
                )}
              </Button>
              <span className="text-[11.5px] text-[var(--color-muted-foreground)]">
                اضغط على رقم الآية للاستماع — صوت الشيخ المنشاوي
              </span>
            </div>

            {ayahsQuery.isLoading && <Loader />}
            {ayahsQuery.isError && (
              <ErrorBox onRetry={() => ayahsQuery.refetch()} />
            )}

            {ayahsQuery.data && lesson.segments.map((seg) => {
              const slice = ayahsQuery.data!.filter(
                (a) =>
                  (a as Ayah & { _surah: number })._surah === seg.surah &&
                  a.numberInSurah >= seg.from &&
                  a.numberInSurah <= seg.to,
              );
              return (
                <div key={`${seg.surah}-${seg.from}`} className="mb-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-extrabold text-[var(--color-primary)]">
                      سورة {getSurahName(seg.surah)}
                    </span>
                    <span className="text-[12px] text-[var(--color-accent)] bg-[var(--color-light-gold)] px-2.5 py-0.5 rounded font-bold">
                      الآيات {arabicNumeral(seg.from)}-{arabicNumeral(seg.to)}
                    </span>
                  </div>
                  <div className="bg-[var(--color-light-gold)] border-2 border-[var(--color-accent-light)] rounded-[10px] px-4 py-4 font-quran text-[22px] sm:text-[24px] leading-[2.4] text-justify text-[#1c1c1c]">
                    {slice.map((a) => {
                      const key = `${seg.surah}:${a.numberInSurah}`;
                      return (
                        <span
                          key={key}
                          onClick={() => playOne(seg.surah, a.numberInSurah)}
                          className={`cursor-pointer rounded transition-colors ${playingKey === key ? "bg-[#ffe39e]" : "hover:bg-[#fff3cf]"}`}
                        >
                          {a.text}{" "}
                          <span className="font-amiri text-[18px] text-[var(--color-accent)] font-bold">
                            ﴿{arabicNumeral(a.numberInSurah)}﴾
                          </span>{" "}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="tafsir" className="flex-1 overflow-y-auto p-4 mt-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <label className="text-[13px] font-bold text-[var(--color-primary)]">
                📚 التفسير:
              </label>
              <Select value={tafsirId} onValueChange={(v) => setTafsirId(v as TafsirId)}>
                <SelectTrigger className="w-[230px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TAFSIR_LABELS).map(([id, label]) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tafsirQuery.isLoading && <Loader />}
            {tafsirQuery.isError && (
              <ErrorBox onRetry={() => tafsirQuery.refetch()} />
            )}

            {tafsirQuery.data?.map((a) => (
              <div
                key={`${a._surah}:${a.numberInSurah}`}
                className="border border-[#eee] rounded-lg p-3.5 mb-2.5 bg-white"
              >
                <div className="font-quran text-[19px] leading-[2] text-[var(--color-primary)] mb-2 border-b border-dashed border-[var(--color-border)] pb-2">
                  <span className="font-amiri text-[var(--color-accent)] font-bold ml-2">
                    [{getSurahName(a._surah)}: {arabicNumeral(a.numberInSurah)}]
                  </span>
                </div>
                <div className="text-[13.5px] text-[var(--color-muted-foreground)] leading-[1.9]">
                  {a.text}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Loader() {
  return (
    <div className="text-center py-10 text-[var(--color-muted-foreground)]">
      <div className="w-9 h-9 border-4 border-[#e0d8c4] border-t-[var(--color-accent)] rounded-full mx-auto mb-3 animate-spin" />
      جارٍ التحميل...
    </div>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-8 text-[var(--color-destructive)]">
      تعذّر تحميل البيانات. تأكدي من الاتصال أو حمّلي البيانات للاستخدام بدون
      إنترنت.
      <div className="mt-3">
        <Button onClick={onRetry} size="sm">
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}

// نوع مساعد ضمن نطاق هذا الملف
interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}
