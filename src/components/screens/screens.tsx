import { Suspense } from "react";
import { preload } from "react-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { VenueExplorer } from "@/components/venues/VenueExplorer";
import { SentoMapClient } from "@/components/tourism/SentoMapClient";
import { LaundryMapClient } from "@/components/tourism/LaundryMapClient";
import { TaxiListClient } from "@/components/tourism/TaxiListClient";
import { MerGallery } from "@/components/mer/MerGallery";
import { fetchFacilitiesByVenue } from "@/lib/facilities";
import { fetchSento, fetchLaundry, fetchTaxi } from "@/lib/tourism";
import { getMerImages } from "@/lib/merImages";
import type { Audience } from "@/config/navigation";

/**
 * 各ページの中身。ユーザー用（"/"）とサポーター用（"/supporter"）の
 * 両方から同じものを呼ぶので、見た目・機能は常に完全に一致する。
 * 違うのは audience（＝読み書きするデータの系統）だけ。
 */

/** 全ページ共通の外枠。ページ全体はスクロールさせずタブバーを固定する */
function Shell({
  audience,
  children,
}: {
  audience: Audience;
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-dvh flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomNav audience={audience} />
    </main>
  );
}

/** 本文の共通余白＋見出し */
function Body({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in-up p-4">
      {title && <h1 className="mb-4 text-xl font-bold">{title}</h1>}
      {children}
    </div>
  );
}

export async function VenuesScreen({ audience }: { audience: Audience }) {
  const initialFacilities = await fetchFacilitiesByVenue(audience);
  return (
    <Shell audience={audience}>
      <Suspense>
        <VenueExplorer
          initialFacilities={initialFacilities}
          audience={audience}
        />
      </Suspense>
    </Shell>
  );
}

export async function SentoScreen({ audience }: { audience: Audience }) {
  const initialSpots = await fetchSento(audience);
  return (
    <Shell audience={audience}>
      <Body title="高知市内 銭湯マップ">
        <SentoMapClient initialSpots={initialSpots} audience={audience} />
      </Body>
    </Shell>
  );
}

export async function LaundryScreen({ audience }: { audience: Audience }) {
  const initialSpots = await fetchLaundry(audience);
  return (
    <Shell audience={audience}>
      <Body title="高知市内 コインランドリーマップ">
        <LaundryMapClient initialSpots={initialSpots} audience={audience} />
      </Body>
    </Shell>
  );
}

export async function TaxiScreen({ audience }: { audience: Audience }) {
  const initialCompanies = await fetchTaxi(audience);
  return (
    <Shell audience={audience}>
      <Body title="タクシー会社一覧（24時間受付）">
        <TaxiListClient
          initialCompanies={initialCompanies}
          audience={audience}
        />
      </Body>
    </Shell>
  );
}

export function MerScreen({ audience }: { audience: Audience }) {
  const images = getMerImages();
  // 1枚目だけ先読みして、開いた瞬間に見えるようにする
  if (images[0]) preload(images[0].src, { as: "image", fetchPriority: "high" });
  return (
    <Shell audience={audience}>
      <Body title="🏥 MER">
        <MerGallery images={images} />
      </Body>
    </Shell>
  );
}
