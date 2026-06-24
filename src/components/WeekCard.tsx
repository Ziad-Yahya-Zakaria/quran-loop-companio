import { BookOpen, Play } from "lucide-react";
import { type Week, segmentRangeLabel, countAyahs } from "@/data/schedule";
import { StageBadge } from "./StageBadge";

interface Props {
  week: Week;
  onOpen: (week: Week, lessonIndex: 1 | 2 | 3) => void;
}

export function WeekCard({ week, onOpen }: Props) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="px-3.5 py-3 flex items-center gap-2.5 border-b border-[#eee]">
        <div className="bg-[var(--color-primary)] text-white w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-[15px] shrink-0">
          {week.weekNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[var(--color-primary)] text-sm truncate">
            {week.title}
          </div>
          <div className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
            {countAyahs(week.segments)} آية
          </div>
        </div>
      </div>
      <div className="px-3.5 py-3 flex flex-col gap-2">
        {week.lessons.map((lesson) => (
          <button
            key={lesson.index}
            onClick={() => onOpen(week, lesson.index)}
            className="text-right border border-[#e2dccb] hover:border-[var(--color-accent)] bg-[var(--color-light-gold)]/40 hover:bg-[var(--color-light-gold)] rounded-lg px-3 py-2 transition-colors flex items-center gap-2"
          >
            {lesson.stage === "tahyia" ? (
              <BookOpen className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
            ) : (
              <Play className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[12px] font-bold text-[var(--color-primary)]">
                  حصة {lesson.index}
                </span>
                <StageBadge stage={lesson.stage} />
              </div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                {segmentRangeLabel(lesson.segments)} · {countAyahs(lesson.segments)} آية
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
