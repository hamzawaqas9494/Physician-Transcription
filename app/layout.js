// import "./globals.css";

// export const metadata = {
//   title: "MedTranscript",
//   description: "Medical consultation and transcription platform",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }

import "./globals.css";

import Script from "next/script";

export const metadata = {
  title: "MedTranscript",
  description: "Medical consultation and transcription platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}

        <Script
          src="https://js.puter.com/v2/"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}