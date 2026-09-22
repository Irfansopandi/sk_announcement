import { Metadata } from 'next';
import PublicHeader from '../../components/public/Header';

export const metadata: Metadata = {
  title: "Pengumuman Surat Keputusan | PA Karawang",
  description: "Daftar Surat Keputusan yang telah dipublikasikan.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col">
      <PublicHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
