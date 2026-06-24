import { get, set, keys } from "idb-keyval";
import { SURAHS } from "@/data/surahs";
import { getSurahText, getSurahTafsir, audioUrl, type TafsirId } from "@/lib/quran-api";

const TAFSIRS: TafsirId[] = ["ar.muyassar", "ar.jalalayn", "ar.miqbas"];

export interface DownloadProgress {
  current: number;
  total: number;
  label: string;
}

export type ProgressFn = (p: DownloadProgress) => void;

export async function downloadTextAndTafsir(onProgress: ProgressFn): Promise<void> {
  const total = SURAHS.length * (1 + TAFSIRS.length);
  let current = 0;
  for (const s of SURAHS) {
    onProgress({ current, total, label: `نص: ${s.name}` });
    await getSurahText(s.number);
    current++;
    for (const t of TAFSIRS) {
      onProgress({ current, total, label: `تفسير ${s.name}` });
      await getSurahTafsir(s.number, t);
      current++;
    }
  }
  onProgress({ current: total, total, label: "اكتمل تحميل النصوص والتفاسير" });
}

export async function downloadAudio(onProgress: ProgressFn): Promise<void> {
  const total = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
  let current = 0;
  for (const s of SURAHS) {
    for (let a = 1; a <= s.ayahCount; a++) {
      const key = `audio:${s.number}:${a}`;
      const cached = await get<Blob>(key);
      if (!cached) {
        try {
          const res = await fetch(audioUrl(s.number, a));
          if (res.ok) {
            const blob = await res.blob();
            await set(key, blob);
          }
        } catch {
          /* تجاهُل وتكملة */
        }
      }
      current++;
      if (current % 5 === 0 || current === total) {
        onProgress({
          current,
          total,
          label: `صوت ${s.name} (${a}/${s.ayahCount})`,
        });
      }
    }
  }
  onProgress({ current: total, total, label: "اكتمل تحميل الصوتيات" });
}

export async function downloadAll(onProgress: ProgressFn): Promise<void> {
  await downloadTextAndTafsir((p) =>
    onProgress({
      current: p.current,
      total: p.total * 2,
      label: p.label,
    }),
  );
  await downloadAudio((p) =>
    onProgress({
      current: p.current + p.total,
      total: p.total * 2,
      label: p.label,
    }),
  );
}

export async function getStorageStatus(): Promise<{
  textsCached: number;
  tafsirsCached: number;
  audiosCached: number;
}> {
  const allKeys = await keys();
  let textsCached = 0;
  let tafsirsCached = 0;
  let audiosCached = 0;
  for (const k of allKeys) {
    const key = String(k);
    if (key.startsWith("quran:uthmani:")) textsCached++;
    else if (key.startsWith("tafsir:")) tafsirsCached++;
    else if (key.startsWith("audio:")) audiosCached++;
  }
  return { textsCached, tafsirsCached, audiosCached };
}
