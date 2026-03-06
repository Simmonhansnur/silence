import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Silence',
    short_name: 'Silence',
    description: 'A daily stillness practice',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#F5F0E8',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
