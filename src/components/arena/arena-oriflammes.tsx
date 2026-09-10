import Image from 'next/image';

/** Raster banners recreated from the client's lobby reference. Only the season
 * stays in HTML so the decoration follows the actual tournament dates. */
export function ArenaOriflammes({ season }: { season: string | null }) {
  return (
    <div className="arena-oriflammes" aria-hidden="true">
      <div className="arena-oriflamme arena-oriflamme-left">
        <Image src="/arena/lobby-banner-evc-2026.png" alt="" width={756} height={2079} sizes="(min-width: 1100px) 180px, 1px" />
      </div>
      <div className="arena-oriflamme arena-oriflamme-right">
        <Image src="/arena/lobby-banner-season-2026.png" alt="" width={756} height={2079} sizes="(min-width: 1100px) 180px, 1px" />
        {season && <p className="arena-oriflamme-season"><span>Saison</span><strong>{season}</strong></p>}
      </div>
    </div>
  );
}
