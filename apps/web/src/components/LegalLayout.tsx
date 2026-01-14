"use client";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalLayout = ({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-sm border border-slate-200 rounded-xl p-8 sm:p-12">
        <header className="mb-10 border-b border-slate-100 pb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-sm text-slate-500 italic">
            Last Updated: {lastUpdated}
          </p>
        </header>
        <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900">
          {children}
        </div>
      </div>
    </div>
  );
};
