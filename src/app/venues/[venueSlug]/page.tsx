import { redirect } from "next/navigation";

/**
 * 旧・会場個別ページ。
 * 会場は /venues の1ページ（タブ切り替え）に集約したため、
 * 旧URL（/venues/上町 など）は /venues?v=slug へリダイレクトする。
 */
export default async function LegacyVenueRedirect({
  params,
}: {
  params: Promise<{ venueSlug: string }>;
}) {
  const { venueSlug } = await params;
  redirect(`/venues?v=${venueSlug}`);
}
