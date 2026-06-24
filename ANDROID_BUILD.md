# بناء تطبيق Android (APK)

التطبيق جاهز للعمل كـ **PWA** (يمكن تثبيته من المتصفح مباشرة على الهاتف عبر "إضافة إلى الشاشة الرئيسية").

لبناء ملف **APK حقيقي**، اتبعي الخطوات التالية على جهازك المحلي (تحتاجين Android Studio + JDK 17):

```bash
# 1. تصدير المشروع من Lovable إلى GitHub، ثم على جهازك:
git clone <your-repo>
cd <your-repo>
bun install

# 2. تثبيت Capacitor
bun add @capacitor/core @capacitor/cli @capacitor/android

# 3. بناء التطبيق
bun run build

# 4. إضافة منصة Android
bunx cap add android

# 5. مزامنة الملفات
bunx cap sync android

# 6. فتح المشروع في Android Studio
bunx cap open android
```

داخل Android Studio:
- **Build → Build Bundle(s)/APK(s) → Build APK(s)**
- ستجدين الملف في `android/app/build/outputs/apk/debug/app-debug.apk`

لتوقيع نسخة Release جاهزة للنشر:
- **Build → Generate Signed Bundle/APK**

## ملاحظات

- `appId` في `capacitor.config.ts` هو `com.halaqa.quran` — غيّريه إذا أردتِ.
- يستخدم التطبيق IndexedDB للتخزين المحلي — كل المحتوى محمّل يبقى بعد التثبيت.
- التحميل الأول يحتاج إنترنت لجلب النصوص والصوتيات من APIs مجانية:
  - نص + تفاسير: AlQuran.cloud
  - صوت المنشاوي: EveryAyah.com
