module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,ico,json,woff,woff2,ttf,eot}'
  ],
  swDest: 'dist/service-worker.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: new RegExp('^https://xjnkevojcbmlrdytsnth.supabase.co/'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10,
        backgroundSync: {
          name: 'api-queue',
          options: {
            maxRetentionTime: 24 * 60 // Retry for up to 24 hours
          }
        }
      }
    },
    {
      urlPattern: new RegExp('^https://fonts.(googleapis|gstatic).com/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: new RegExp('/icons/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'icon-cache',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    }
  ]
};
