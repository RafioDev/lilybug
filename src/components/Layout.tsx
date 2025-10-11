import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 pb-24">
      {title && (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>
        </header>
      )}
      <main className="px-4 py-5">{children}</main>
    </div>
  );
};
