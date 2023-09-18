import SiteLayout from "./components/SiteLayout";
import Web3Provider from "./components/Web3Provider";
import "./globals.css";

export const metadata = {
  title: 'Super Unlockable',
  description: 'Unlock your Superpowers with Superfluid streams!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <SiteLayout>
            {children}
          </SiteLayout>
        </Web3Provider>
      </body>
    </html>
  );
}
