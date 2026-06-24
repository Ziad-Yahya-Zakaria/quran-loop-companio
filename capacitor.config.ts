import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.halaqa.quran",
  appName: "حلقة القرآن",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#1a3d2b",
  },
};

export default config;
