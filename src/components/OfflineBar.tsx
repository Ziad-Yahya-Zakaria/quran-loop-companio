import { useEffect, useState } from "react";
import { Download, Mic } from "lucide-react";
import {
  downloadAll,
  downloadAudio,
  getStorageStatus,
  type DownloadProgress,
} from "@/lib/offline-download";
import { SURAHS } from "@/data/surahs";

export function OfflineBar() {
  const [status, setStatus] = useState<{
    textsCached: number;
    tafsirsCached: number;
    audiosCached: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const totalAyahs = SURAHS.reduce((s, x) => s + x.ayahCount, 0);
  const totalTextItems = SURAHS.length * 4;

  async function refresh() {
    setStatus(await getStorageStatus());
  }
  useEffect(() => {
    void refresh();
  }, []);

  async function handleAll() {
    setBusy(true);
    try {
      await downloadAll(setProgress);
      await refresh();
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 1500);
    }
  }
  async function handleAudio() {
    setBusy(true);
    try {
      await downloadAudio(setProgress);
      await refresh();
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 1500);
    }
  }

  const pct = progress ? Math.round((progress.current / progress.total) * 100) : 0;

  const allCached =
    status &&
    status.textsCached >= SURAHS.length &&
    status.tafsirsCached >= SURAHS.length * 3 &&
    status.audiosCached >= totalAyahs * 0.95;

  return (
    <div className="bg-[#fff3cd] border-2 border-[#ffc107] rounded-xl p-4 my-4 flex flex-wrap items-center gap-3 justify-between">
      <div className="font-bold text-[13px] text-[#856404] flex-1 min-w-[200px]">
        📡 حالة التخزين المحلي:{" "}
        {status
          ? allCached
            ? "جاهز للعمل بدون إنترنت ✓"
            : `${status.textsCached}/${SURAHS.length} نص • ${status.tafsirsCached}/${SURAHS.length * 3} تفسير • ${status.audiosCached}/${totalAyahs} آية صوتية`
          : "يتم الفحص..."}
      </div>

      {progress && (
        <div className="flex-1 min-w-[200px] h-[22px] bg-[#e9ecef] rounded-[11px] overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-[width] duration-300 text-[11px] text-white text-center font-bold leading-[22px]"
            style={{ width: `${pct}%` }}
          >
            {pct}% — {progress.label}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleAll}
          disabled={busy}
          className="bg-[#28a745] text-white font-bold text-[12.5px] px-4 py-2 rounded-lg disabled:bg-[#94d3a2] disabled:cursor-not-allowed hover:bg-[#1e7e34] transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> تحميل الكل
        </button>
        <button
          onClick={handleAudio}
          disabled={busy}
          className="bg-[var(--color-primary)] text-white font-bold text-[12.5px] px-4 py-2 rounded-lg disabled:opacity-60 hover:bg-[var(--color-primary-light)] transition-colors flex items-center gap-1.5"
        >
          <Mic className="w-4 h-4" /> الصوتيات فقط
        </button>
      </div>
    </div>
  );
}
