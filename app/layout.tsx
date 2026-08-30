import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "君君的 To签生成器",
  description: "选一个模板，收到一封君君给你的 To签。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
