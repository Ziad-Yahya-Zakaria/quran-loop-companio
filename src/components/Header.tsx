export function Header() {
  return (
    <header className="bg-[var(--color-primary)] text-white text-center px-6 py-9">
      <div className="font-quran text-2xl text-[var(--color-accent-light)] mb-2">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </div>
      <h1 className="text-[22px] sm:text-[25px] font-extrabold mb-1.5">
        التطبيق التفاعلي لحلقة القرآن الكريم
      </h1>
      <p className="text-sm opacity-85 font-light">
        من سورة الشورى (٤٢) حتى سورة الحديد (٥٧) — اضغط أي حصة لعرض منهجها مع
        المصحف والتفسير
      </p>
      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        {[
          { val: "٦", lbl: "أشهر" },
          { val: "٢٤", lbl: "أسبوعاً" },
          { val: "٧٢", lbl: "حصة" },
          { val: "١٦", lbl: "سورة" },
        ].map((m) => (
          <div
            key={m.lbl}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2"
          >
            <div className="text-base font-bold text-[var(--color-accent-light)]">
              {m.val}
            </div>
            <div className="text-[10px] opacity-75">{m.lbl}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
