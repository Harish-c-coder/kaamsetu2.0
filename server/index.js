const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const Worker = require('./models/Worker');
const { seedDB } = require('./scripts/seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Request logger for clean debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api/workers', require('./routes/workerRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'HyperLocal-Connect Backend',
    timestamp: new Date().toISOString(),
  });
});

// In-memory store for accurate location synchronized across local network devices
let lastAccurateLocation = {
  lat: 17.3871,
  lng: 78.4827,
  locality: 'Koti',
  localityName: 'Koti',
  zone: 'Central (Koti / Sultan Bazar)',
  city: 'Hyderabad',
  updatedAt: new Date().toISOString(),
};

// Sync accurate location from laptop / GPS client
app.post('/api/geo/sync', (req, res) => {
  const { lat, lng, localityName, locality, zone } = req.body || {};
  if (localityName || locality) {
    lastAccurateLocation = {
      lat: lat || 17.3871,
      lng: lng || 78.4827,
      locality: localityName || locality || 'Koti',
      localityName: localityName || locality || 'Koti',
      zone: zone || 'Central (Koti / Sultan Bazar)',
      city: 'Hyderabad',
      updatedAt: new Date().toISOString(),
    };
    console.log(`[Geo Sync] Location synchronized across devices to: ${lastAccurateLocation.localityName}`);
  }
  res.json({ success: true, data: lastAccurateLocation });
});

// Hyperlocal Geo Location Detection endpoint
app.get('/api/geo/detect', async (req, res) => {
  // If an accurate location is synchronized on this local server, serve it to all network devices (e.g. phones on Wi-Fi)
  if (lastAccurateLocation && lastAccurateLocation.localityName) {
    return res.json({
      success: true,
      source: 'local_network_sync',
      lat: lastAccurateLocation.lat,
      lng: lastAccurateLocation.lng,
      locality: lastAccurateLocation.localityName,
      localityName: lastAccurateLocation.localityName,
      zone: lastAccurateLocation.zone,
      city: 'Hyderabad',
      region: 'Telangana',
    });
  }

  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

    // Use fast IP geolocation lookup
    let geoUrl = 'https://ipwho.is/';
    if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      geoUrl += encodeURIComponent(ip);
    }
    const response = await fetch(geoUrl, { signal: AbortSignal.timeout(3500) });
    const data = await response.json();
    if (data.success && data.latitude && data.longitude) {
      return res.json({
        success: true,
        source: 'network_ip',
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || 'Hyderabad',
        region: data.region || 'Telangana',
        ip: data.ip,
      });
    }
  } catch (err) {
    // ignore
  }

  // Safe fallback to Koti, central Hyderabad
  res.json({
    success: true,
    source: 'fallback',
    lat: 17.3871,
    lng: 78.4827,
    city: 'Hyderabad',
    locality: 'Koti',
    localityName: 'Koti',
  });
});

// Serve frontend static build in production (All-in-one deployment)
const path = require('path');
const fs = require('fs');
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const count = await Worker.countDocuments();
    console.log(`[Startup] Clean database ready with ${count} registered worker profiles.`);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] HyperLocal-Connect API running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });

    // Ensure event loop remains active
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error('[Startup] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
