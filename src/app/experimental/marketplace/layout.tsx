import { ShopBar, ShopProvider } from "./shop";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <ShopBar />
      {children}
    </ShopProvider>
  );
}
