export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Album {
  id: string;
  title: string;
  type: 'album' | 'single' | 'instrumental' | 'video';
  genre: string;
  coverImage: string;
  coverPublicId?: string;
  releaseDate: string;
  description: string;
  mediaType: 'audio' | 'video';
  youtubeUrl?: string;
  /** Cloudinary-delivered video for catalog (preferred over YouTube when set). */
  cloudinaryVideoUrl?: string;
  cloudinaryVideoPublicId?: string;
  audioUrl?: string;
  streamingLinks?: { spotify?: string; apple?: string; deezer?: string; tidal?: string; soundcloud?: string };
  /** Shown in Home “Latest drops” when true (managed in admin catalog). */
  isLatestDrop?: boolean;
}

export interface Track {
  id: number;
  title: string;
  duration: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  imagePublicId?: string;
  badge?: 'new' | 'sale' | 'none';
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail: string;
  urlPublicId?: string;
  urlResourceType?: 'image' | 'video';
}

export interface Event {
  id: string;
  date: string;
  venue: string;
  location: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  path: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/catalog' },
  { label: 'Store', path: '/store' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
  { label: 'Bookings', path: '/bookings' },
  { label: 'About', path: '/about' },
];

// Real images - 39 photos uploaded by user
const GALLERY_IMAGES = Array.from({ length: 39 }, (_, i) => `/images/gallery/gallery${i + 1}.jpg`);

// Use first 6 for album covers
export const ALBUMS: Album[] = [
  { id: '1', title: 'MIDNIGHT ECHO', type: 'album', genre: 'Alternative Rock', coverImage: GALLERY_IMAGES[0], releaseDate: '2025', description: 'The latest masterpiece', mediaType: 'audio', streamingLinks: { spotify: 'https://spotify.com', apple: 'https://music.apple.com', deezer: 'https://deezer.com' } },
  { id: '2', title: 'NEON RITUALS', type: 'album', genre: 'Electronic', coverImage: GALLERY_IMAGES[1], releaseDate: '2023', description: 'Electronic exploration', mediaType: 'audio', streamingLinks: { spotify: 'https://spotify.com', apple: 'https://music.apple.com', soundcloud: 'https://soundcloud.com' } },
  { id: '3', title: 'BLOODLINES', type: 'album', genre: 'Metal Fusion', coverImage: GALLERY_IMAGES[2], releaseDate: '2023', description: 'Heavy and intense', mediaType: 'audio', streamingLinks: { spotify: 'https://spotify.com', apple: 'https://music.apple.com', deezer: 'https://deezer.com', tidal: 'https://tidal.com' } },
  { id: '4', title: 'SOLAR FLARE', type: 'album', genre: 'Progressive', coverImage: GALLERY_IMAGES[3], releaseDate: '2022', description: 'Progressive journey', mediaType: 'video', youtubeUrl: 'https://youtube.com' },
  { id: '5', title: 'VOID WALKER', type: 'album', genre: 'Ambient', coverImage: GALLERY_IMAGES[4], releaseDate: '2022', description: 'Dark ambient', mediaType: 'audio', streamingLinks: { spotify: 'https://spotify.com', apple: 'https://music.apple.com' } },
  { id: '6', title: 'PRISM', type: 'album', genre: 'Debut', coverImage: GALLERY_IMAGES[5], releaseDate: '2021', description: 'The beginning', mediaType: 'video', youtubeUrl: 'https://youtube.com' },
];

export const TRACKS: Track[] = [
  { id: 1, title: 'Echoes of You', duration: '4:32' },
  { id: 2, title: 'Neon Dreams', duration: '3:48' },
  { id: 3, title: 'Burning Bridges', duration: '5:12' },
  { id: 4, title: 'Ghost Light', duration: '4:05' },
  { id: 5, title: 'Crimson Tide', duration: '3:56' },
  { id: 6, title: 'Afterglow', duration: '4:21' },
  { id: 7, title: 'Static', duration: '3:33' },
  { id: 8, title: 'Horizon', duration: '6:01' },
];

export const PRODUCTS: Product[] = [
  { id: '1', name: 'ARA MUZICC LOGO TEE', price: 45, category: 'clothing', image: GALLERY_IMAGES[6], badge: 'new', description: 'Black oversized t-shirt with minimal olive logo' },
  { id: '2', name: 'TOUR HOODIE 2025', price: 85, category: 'clothing', image: GALLERY_IMAGES[7], badge: 'none', description: 'Limited edition tour hoodie' },
  { id: '3', name: 'SIGNATURE CAP', price: 35, category: 'clothing', image: GALLERY_IMAGES[8], badge: 'none', description: 'Embroidered snapback cap' },
  { id: '4', name: 'NEON RITUALS WAV', price: 15, category: 'digital', image: GALLERY_IMAGES[9], badge: 'sale', description: 'Digital download' },
  { id: '5', name: 'GUITAR PRESET PACK', price: 25, category: 'digital', image: GALLERY_IMAGES[10], badge: 'new', description: '50 custom presets' },
  { id: '6', name: 'ESSENTIAL SAMPLE KIT', price: 20, category: 'digital', image: GALLERY_IMAGES[11], badge: 'none', description: '200+ samples' },
  { id: '7', name: 'ENAMEL PIN SET', price: 18, category: 'accessories', image: GALLERY_IMAGES[12], badge: 'new', description: '3-pack collectible pins' },
  { id: '8', name: 'TOUR POSTER BUNDLE', price: 30, category: 'accessories', image: GALLERY_IMAGES[13], badge: 'none', description: '5 limited prints' },
  { id: '9', name: 'VINYL MIDNIGHT ECHO', price: 40, category: 'accessories', image: GALLERY_IMAGES[14], badge: 'sale', description: '180g black vinyl' },
];

// Use first 8 gallery images for gallery page
export const GALLERY_ITEMS: GalleryItem[] = [
  { id: '1', title: 'Studio Session', type: 'photo', url: GALLERY_IMAGES[15], thumbnail: GALLERY_IMAGES[15] },
  { id: '2', title: 'On The Road', type: 'photo', url: GALLERY_IMAGES[16], thumbnail: GALLERY_IMAGES[16] },
  { id: '3', title: 'Fan Meet', type: 'photo', url: GALLERY_IMAGES[17], thumbnail: GALLERY_IMAGES[17] },
  { id: '4', title: 'Pedalboard', type: 'photo', url: GALLERY_IMAGES[18], thumbnail: GALLERY_IMAGES[18] },
  { id: '5', title: 'City Nights', type: 'photo', url: GALLERY_IMAGES[19], thumbnail: GALLERY_IMAGES[19] },
  { id: '6', title: 'Soundcheck', type: 'photo', url: GALLERY_IMAGES[20], thumbnail: GALLERY_IMAGES[20] },
  { id: '7', title: 'Quiet Moment', type: 'photo', url: GALLERY_IMAGES[21], thumbnail: GALLERY_IMAGES[21] },
  { id: '8', title: 'Backstage', type: 'photo', url: GALLERY_IMAGES[22], thumbnail: GALLERY_IMAGES[22] },
];

export const EVENTS: Event[] = [
  { id: '1', date: 'JUN 15', venue: 'MADISON SQUARE GARDEN', location: 'NEW YORK, NY' },
  { id: '2', date: 'JUL 02', venue: 'O2 ARENA', location: 'LONDON, UK' },
  { id: '3', date: 'JUL 18', venue: 'STADE DE FRANCE', location: 'PARIS, FR' },
  { id: '4', date: 'AUG 05', venue: 'TOKYO DOME', location: 'TOKYO, JP' },
];

export const MILESTONES: TimelineMilestone[] = [
  { year: '2018', title: 'First EP Release', description: 'Released "Origins" independently' },
  { year: '2019', title: 'First National Tour', description: '15 cities across the country' },
  { year: '2020', title: 'Viral Hit', description: '"Static" reaches 100M+ streams' },
  { year: '2021', title: 'Debut Album', description: '"PRISM" hits Billboard Top 10' },
  { year: '2022', title: 'Coachella', description: 'Main stage performance' },
  { year: '2023', title: 'Grammy Nomination', description: '"Neon Rituals" nominated' },
  { year: '2024', title: 'World Arena Tour', description: '50+ shows worldwide' },
  { year: '2025', title: 'Midnight Echo', description: 'Critical acclaim' },
];
