export type Block =
  | { t: 'hero'; src: string; alt: string }
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; html: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'img'; src: string; alt: string; caption?: string }
  | { t: 'table'; headers: string[]; rows: string[][] }
  | { t: 'note'; text: string }
  | { t: 'quote'; author: string; role?: string; text: string }
  | { t: 'callout'; tone: 'warning' | 'tip' | 'key' | 'source'; html: string }
  | { t: 'related'; items: { label: string; href: string }[] };
