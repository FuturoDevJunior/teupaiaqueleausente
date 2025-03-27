// Advanced Service Worker for TeuPai Application
// Provides offline support, caching, and background sync

const APP_VERSION = '1.0.0';
const CACHE_NAME = 'teupai-cache-v1';

// Cache groups for different strategies
const CACHE_GROUPS = {
  STATIC: 'static-v1',
  DYNAMIC: 'dynamic-v1',
  EMAILS: 'emails-v1',
  API: 'api-v1'
};

// Assets to cache on install (critical application files)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js',
  '/offline.html' // Fallback offline page
];

// API routes that should be handled with network-first strategy
const API_ROUTES = [
  '/api/emails',
  '/api/user'
];

// URLs that should never be cached
const NEVER_CACHE = [
  '/api/analytics',
  '/api/log'
];

// Background sync operations
const SYNC_OPERATIONS = {
  SEND_EMAIL: 'send-email',
  UPDATE_PROFILE: 'update-profile'
};

/**
 * Install Event - Cache Critical Assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing new version');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_GROUPS.STATIC).then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache a special offline page
      caches.open(CACHE_GROUPS.STATIC).then((cache) => {
        return fetch('/offline.html')
          .then(response => {
            return cache.put('/offline.html', response);
          })
          .catch(() => {
            console.log('[Service Worker] Failed to cache offline page');
          });
      })
    ])
    .then(() => {
      // Skip waiting to activate the worker immediately
      console.log('[Service Worker] Successfully installed new version');
      return self.skipWaiting();
    })
  );
});

/**
 * Activate Event - Clean Old Caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new version');
  
  // List of valid caches to keep
  const validCaches = Object.values(CACHE_GROUPS);
  
  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !validCaches.includes(cacheName))
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      // Claim clients so service worker is in control without reload
      console.log('[Service Worker] Now ready to handle fetches');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch Event - Handle Network Requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip URLs that should never be cached
  if (NEVER_CACHE.some(pattern => request.url.includes(pattern))) {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (isApiRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Default: network-first for HTML, cache-first for everything else
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
  } else {
    event.respondWith(cacheFirstStrategy(request));
  }
});

/**
 * Sync Event - Handle Background Sync
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  
  if (event.tag === SYNC_OPERATIONS.SEND_EMAIL) {
    event.waitUntil(syncSendEmails());
  } else if (event.tag === SYNC_OPERATIONS.UPDATE_PROFILE) {
    event.waitUntil(syncUpdateProfile());
  }
});

/**
 * Push Event - Handle Notifications
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.title || 'TeuPai';
    const options = {
      body: data.body || 'Você tem um novo email!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[Service Worker] Error showing notification:', error);
  }
});

/**
 * Notification Click Event - Handle Notification Interaction
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { notification } = event;
  const { data } = notification;
  const url = data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

/**
 * Network-first caching strategy
 */
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_GROUPS.DYNAMIC);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    
    // Try cache as fallback
    const cachedResponse = await cache.match(request);
    
    // Return cached response or offline fallback
    return cachedResponse || getOfflineFallback(request);
  }
}

/**
 * Cache-first caching strategy
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached response and update cache in background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  try {
    const response = await fetch(request);
    
    // Cache valid responses
    if (response.ok) {
      const cache = await caches.open(CACHE_GROUPS.DYNAMIC);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

/**
 * Update cache in background without blocking response
 */
async function updateCacheInBackground(request) {
  const cache = await caches.open(CACHE_GROUPS.DYNAMIC);
  
  fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    })
    .catch(error => {
      console.log('[Service Worker] Background cache update failed:', error);
    });
}

/**
 * Get offline fallback content based on request type
 */
async function getOfflineFallback(request) {
  // If it's an HTML request, return offline page
  if (request.headers.get('Accept')?.includes('text/html')) {
    return caches.match('/offline.html');
  }
  
  // If it's an image, return offline image
  if (request.headers.get('Accept')?.includes('image')) {
    return caches.match('/images/offline.svg');
  }
  
  // For API requests, return empty data with offline status
  if (isApiRequest(request)) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline and this data is not cached.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Default fallback
  return new Response('Offline content not available', { status: 503 });
}

/**
 * Check if request is for API
 */
function isApiRequest(request) {
  return API_ROUTES.some(route => request.url.includes(route));
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // Check file extensions
  const fileExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf'];
  if (fileExtensions.some(ext => url.pathname.endsWith(ext))) {
    return true;
  }
  
  // Check asset paths
  return url.pathname.startsWith('/assets/') || 
         url.pathname.startsWith('/images/') ||
         url.pathname.startsWith('/icons/');
}

/**
 * Background sync for sending emails
 */
async function syncSendEmails() {
  try {
    // Get all pending emails from IndexedDB
    const db = await openDatabase();
    const pendingEmails = await getPendingEmails(db);
    
    if (pendingEmails.length === 0) return;
    
    console.log('[Service Worker] Syncing pending emails:', pendingEmails.length);
    
    // Process each pending email
    const results = await Promise.allSettled(
      pendingEmails.map(async (email) => {
        try {
          const response = await fetch('/api/emails/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(email.data)
          });
          
          if (!response.ok) throw new Error(`Server responded with ${response.status}`);
          
          // Remove successfully sent email
          await removeEmailFromQueue(db, email.id);
          return { success: true, id: email.id };
        } catch (error) {
          console.error('[Service Worker] Failed to sync email:', email.id, error);
          return { success: false, id: email.id, error };
        }
      })
    );
    
    // Notify user about results
    notifyAboutSyncResults(results);
  } catch (error) {
    console.error('[Service Worker] Email sync operation failed:', error);
  }
}

/**
 * Background sync for updating profile
 */
async function syncUpdateProfile() {
  // Similar implementation as syncSendEmails
  console.log('[Service Worker] Profile update sync not fully implemented yet');
}

/**
 * Helpers for IndexedDB operations
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('teupai-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-emails')) {
        db.createObjectStore('pending-emails', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-profile-updates')) {
        db.createObjectStore('pending-profile-updates', { keyPath: 'id' });
      }
    };
  });
}

function getPendingEmails(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-emails', 'readonly');
    const store = transaction.objectStore('pending-emails');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeEmailFromQueue(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-emails', 'readwrite');
    const store = transaction.objectStore('pending-emails');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function notifyAboutSyncResults(results) {
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  if (successful > 0) {
    self.registration.showNotification('Emails enviados', {
      body: `${successful} email(s) enviado(s) com sucesso.${failed > 0 ? ` ${failed} falhou.` : ''}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png'
    });
  }
}

// Log activation to the console
console.log('[Service Worker] Service Worker registered, version:', APP_VERSION); 