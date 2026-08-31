import "./globals.css";

export const metadata = {
  title: "MedTranscript",
  description: "Medical consultation and transcription platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
