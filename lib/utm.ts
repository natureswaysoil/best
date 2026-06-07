export const UTM_MEDIUM = {
  ORGANIC_SOCIAL: 'organic_social',
  PAID_SOCIAL: 'paid_social',
  PAID_SEARCH: 'paid_search',
  EMAIL: 'email',
  BLOG: 'blog',
  QR_PRINT: 'qr_print',
  REFERRAL: 'referral',
} as const;

type UTMParams = {
  source: string;
  medium: (typeof UTM_MEDIUM)[keyof typeof UTM_MEDIUM];
  campaign: string;
  content?: string;
  term?: string;
};

export function buildTrackedUrl(path: string, params: UTMParams): string {
  const base = path.startsWith('/') ? `https://natureswaysoil.com${path}` : path;
  const url = new URL(base);

  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  url.searchParams.set('utm_campaign', params.campaign);

  if (params.content) {
    url.searchParams.set('utm_content', params.content);
  }

  if (params.term) {
    url.searchParams.set('utm_term', params.term);
  }

  return url.toString();
}

export function buildTrackedPath(path: string, params: UTMParams): string {
  const url = new URL(buildTrackedUrl(path, params));
  return `${url.pathname}${url.search}`;
}
