import type { Stage } from "@/data/schedule";

const STAGE_STYLES: Record<Stage, { bg: string; text: string; label: string }> = {
  tahyia: { bg: "bg-[#c9973a]", text: "text-white", label: "تهيئة" },
  hifz: { bg: "bg-[#2d6a4a]", text: "text-white", label: "حفظ" },
  muraja: { bg: "bg-[#1d4ed8]", text: "text-white", label: "مراجعة" },
  itqan: { bg: "bg-[#b91c1c]", text: "text-white", label: "إتقان" },
};

export function StageBadge({ stage }: { stage: Stage }) {
  const s = STAGE_STYLES[stage];
  return (
    <span
      className={`${s.bg} ${s.text} text-[11px] px-2.5 py-0.5 rounded-full inline-block font-bold`}
    >
      {s.label}
    </span>
  );
}
