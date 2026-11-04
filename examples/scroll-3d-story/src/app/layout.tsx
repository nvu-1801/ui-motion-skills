import "@/motion-kit/styles.css";
import "./globals.css";

export const metadata = { title: "Scroll 3D Demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main">Bỏ qua điều hướng</a>
        {children}
      </body>
    </html>
  );
}
