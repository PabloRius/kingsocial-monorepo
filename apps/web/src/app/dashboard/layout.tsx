import { Footer } from "@/components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-max flex flex-1 flex-col justify-between">
      {children}
      <Footer />
    </div>
  );
}
