// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "IC-Library-gecg28",
//   description: "This the the Library specially made for instrumentation and control engineering students of GECG28",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "IC-Library-gecg28",
  description:
    "This is the Library specially made for Instrumentation and Control Engineering students of GECG28",
};

export default function RootLayout({ children }) {
  const isDisabled =
    process.env.NEXT_PUBLIC_SITE_DISABLED === "true";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isDisabled ? (
          <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Library Webiste is comming Soon
              </h1>
              <p className="opacity-80">
                We are working hard to bring you the best experience. Stay tuned!
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

//Something was broke, lets hope it gets fixed by this one.