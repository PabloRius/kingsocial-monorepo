import { Footer } from "@/components/Footer";

export default function MarketplaceLayout({
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
