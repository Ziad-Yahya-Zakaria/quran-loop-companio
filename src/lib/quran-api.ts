import { get, set } from "idb-keyval";
import type { LessonSegment } from "@/data/schedule";

const API_BASE = "https://api.alquran.cloud/v1";

export type TafsirId = "ar.muyassar" | "ar.jalalayn" | "ar.miqbas";

export const TAFSIR_LABELS: Record<TafsirId, string> = {
  "ar.muyassar": "التفسير الميسّر",
  "ar.jalalayn": "تفسير الجلالين",
  "ar.miqbas": "تنوير المقباس (ابن عباس)",
};

export interface Ayah {
  number: number; // الترقيم العام (1..6236)
  numberInSurah: number;
  text: string;
}

interface CloudResponse<T> {
  code: number;
  status: string;
  data: T;
}

async function fetchWithCache<T>(cacheKey: string, url: string): Promise<T> {
  const cached = await get<T>(cacheKey);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} لـ ${url}`);
  const json: CloudResponse<T> = await res.json();
  await set(cacheKey, json.data);
  return json.data;
}

interface SurahPayload {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export async function getSurahText(surahNumber: number): Promise<SurahPayload> {
  return fetchWithCache<SurahPayload>(
    `quran:uthmani:${surahNumber}`,
    `${API_BASE}/surah/${surahNumber}/quran-uthmani`,
  );
}

export async function getSurahTafsir(
  surahNumber: number,
  tafsir: TafsirId,
): Promise<SurahPayload> {
  return fetchWithCache<SurahPayload>(
    `tafsir:${tafsir}:${surahNumber}`,
    `${API_BASE}/surah/${surahNumber}/${tafsir}`,
  );
}

export async function getSegmentAyahs(segments: LessonSegment[]): Promise<Ayah[]> {
  const out: Ayah[] = [];
  for (const seg of segments) {
    const data = await getSurahText(seg.surah);
    const slice = data.ayahs.filter(
      (a) => a.numberInSurah >= seg.from && a.numberInSurah <= seg.to,
    );
    out.push(...slice.map((a) => ({ ...a, _surah: seg.surah } as Ayah & { _surah: number })));
  }
  return out;
}

export async function getSegmentTafsir(
  segments: LessonSegment[],
  tafsir: TafsirId,
): Promise<(Ayah & { _surah: number })[]> {
  const out: (Ayah & { _surah: number })[] = [];
  for (const seg of segments) {
    const data = await getSurahTafsir(seg.surah, tafsir);
    const slice = data.ayahs.filter(
      (a) => a.numberInSurah >= seg.from && a.numberInSurah <= seg.to,
    );
    out.push(...slice.map((a) => ({ ...a, _surah: seg.surah })));
  }
  return out;
}

// رابط صوت آية بصوت المنشاوي مرتل
export function audioUrl(surah: number, ayah: number): string {
  const s = String(surah).padStart(3, "0");
  const a = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/Minshawy_Murattal_128kbps/${s}${a}.mp3`;
}

// تخزين Blob صوتي في IDB
export async function getCachedAudio(surah: number, ayah: number): Promise<string> {
  const key = `audio:${surah}:${ayah}`;
  const cached = await get<Blob>(key);
  if (cached) return URL.createObjectURL(cached);
  const res = await fetch(audioUrl(surah, ayah));
  if (!res.ok) throw new Error(`صوت غير متاح ${surah}:${ayah}`);
  const blob = await res.blob();
  await set(key, blob);
  return URL.createObjectURL(blob);
}

export async function hasAudioCached(surah: number, ayah: number): Promise<boolean> {
  const key = `audio:${surah}:${ayah}`;
  return Boolean(await get<Blob>(key));
}
