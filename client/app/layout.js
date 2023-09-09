import SiteLayout from "./components/SiteLayout.js";
import "./globals.css";

export const metadata = {
  title: 'Super Unlockable',
  description: 'Unlock your Superpowers with Superfluid streams!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteLayout>
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
