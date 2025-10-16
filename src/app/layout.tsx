import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import classNames from "classnames";
import Style from "./layout.module.scss";
import Heading from "@/components/heading";

const roboto = Roboto({
  subsets: ["cyrillic", "latin"],
  style: 'normal'
});

export const metadata: Metadata = {
  title: "Smart Support",
  description: "Smart Support: поддержка нового поколения",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={classNames(roboto.className, Style.Layout)}>
        <Heading/>
        {children}
      </body>
    </html>
  );
}
