import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "GymaX | آموزش ورزش و برنامه تمرینی",
  description: "آموزش حرکات ورزشی، محاسبه BMI، برنامه تمرینی شخصی و جایزه با امتیاز",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-page font-sans text-fg antialiased">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-line py-8 text-center text-xs text-muted">
            GymaX · نسخه‌ی آزمایشی (پرداخت‌ها واقعی نیستن)
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
