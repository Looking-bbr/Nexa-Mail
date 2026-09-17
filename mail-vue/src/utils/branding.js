const LEGACY_DEFAULT_TITLE = 'Cloud Mail';
const BRAND_TITLE = 'Nexa Mail';

// Presentation-only compatibility for installations created before rebranding.
// Do not mutate the response, write to D1/KV, or replace custom titles/content.
export function withBrandDefaults(settings) {
    const branded = {...settings};
    for (const key of ['title', 'noticeTitle']) {
        if (branded[key] === LEGACY_DEFAULT_TITLE) {
            branded[key] = BRAND_TITLE;
        }
    }
    return branded;
}
