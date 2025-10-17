import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from './ChatWidget';
import ExitIntentPopup from './ExitIntentPopup';

interface LayoutProps {
  children: ReactNode;
  transparentHeader?: boolean;
}

export default function Layout({ children, transparentHeader = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header transparent={transparentHeader} />
      <main className={`flex-1 ${transparentHeader ? '' : 'pt-24'}`}>
        {children}
      </main>
      <Footer />
      <ChatWidget />
      <ExitIntentPopup />
    </div>
  );
}