// KaamSetu Hyperlocal Geolocation & Hyderabad Locality Mapping

export const HYDERABAD_LOCALITIES = [
  { name: 'Koti', lat: 17.3871, lng: 78.4827, zone: 'Central (Koti / Sultan Bazar)' },
  { name: 'Abids', lat: 17.3920, lng: 78.4739, zone: 'Central' },
  { name: 'Kukatpally', lat: 17.4849, lng: 78.4138, zone: 'North-West' },
  { name: 'Hitec City', lat: 17.4435, lng: 78.3772, zone: 'West (IT Corridor)' },
  { name: 'Madhapur', lat: 17.4483, lng: 78.3915, zone: 'West' },
  { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, zone: 'West' },
  { name: 'Banjara Hills', lat: 17.4156, lng: 78.4350, zone: 'Central-West' },
  { name: 'Jubilee Hills', lat: 17.4319, lng: 78.4073, zone: 'West' },
  { name: 'Ameerpet', lat: 17.4375, lng: 78.4482, zone: 'Central' },
  { name: 'Begumpet', lat: 17.4447, lng: 78.4664, zone: 'Central' },
  { name: 'Secunderabad', lat: 17.4399, lng: 78.4983, zone: 'North' },
  { name: 'Mehdipatnam', lat: 17.3916, lng: 78.4400, zone: 'South-West' },
  { name: 'Charminar', lat: 17.3616, lng: 78.4747, zone: 'Old City / South' },
  { name: 'Malakpet', lat: 17.3756, lng: 78.5028, zone: 'East' },
  { name: 'Dilsukhnagar', lat: 17.3688, lng: 78.5247, zone: 'East' },
  { name: 'Kondapur', lat: 17.4699, lng: 78.3578, zone: 'West' },
  { name: 'Miyapur', lat: 17.4968, lng: 78.3614, zone: 'North-West' },
  { name: 'LB Nagar', lat: 17.3457, lng: 78.5522, zone: 'South-East' },
  { name: 'Uppal', lat: 17.4018, lng: 78.5602, zone: 'East' },
  { name: 'Toli Chowki', lat: 17.3995, lng: 78.4116, zone: 'West' },
  { name: 'Somajiguda', lat: 17.4262, lng: 78.4593, zone: 'Central' },
  { name: 'Panjagutta', lat: 17.4278, lng: 78.4502, zone: 'Central' },
  { name: 'Manikonda', lat: 17.3995, lng: 78.3845, zone: 'West' },
  { name: 'Tarnaka', lat: 17.4275, lng: 78.5372, zone: 'North-East' },
  { name: 'Malkajgiri', lat: 17.4528, lng: 78.5320, zone: 'North' },
];

/**
 * Calculates straight line distance in km between two lat/lng coordinates (Haversine Formula)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Maps GPS latitude and longitude to the nearest Hyderabad neighborhood locality
 */
export function findClosestHyderabadLocality(lat, lng) {
  if (!lat || !lng) return { ...HYDERABAD_LOCALITIES[0], isWithinHyderabad: true, distanceKm: 0 };

  let closest = HYDERABAD_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of HYDERABAD_LOCALITIES) {
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  // Greater Hyderabad Metropolitan Region is ~35-40 km across
  const isWithinHyderabad = minDistance <= 40;

  return {
    ...closest,
    distanceKm: minDistance,
    isWithinHyderabad,
  };
}

/**
 * Requests browser device GPS location with fast fallback to network IP location
 */
export async function requestCurrentLocation() {
  // Step 1: Check if browser Geolocation is available
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => {
            // If permission was denied or insecure context, fail fast to IP fallback
            if (err.code === 1 /* PERMISSION_DENIED */) {
              return reject(err);
            }
            // For timeout or unavailable, retry with low accuracy (WiFi/cell tower)
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 60000,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10s gives user time to tap Allow on mobile
            maximumAge: 30000,
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const closest = findClosestHyderabadLocality(latitude, longitude);

      return {
        success: true,
        isGps: true,
        source: 'gps',
        lat: latitude,
        lng: longitude,
        localityName: closest.name,
        zone: closest.zone,
        distanceKm: closest.distanceKm,
        isWithinHyderabad: closest.isWithinHyderabad,
        label: closest.isWithinHyderabad
          ? `📍 ${closest.name} (${closest.distanceKm} km away)`
          : `📍 Outside Hyderabad (~${closest.distanceKm} km)`,
      };
    } catch (gpsError) {
      console.warn('Browser GPS unavailable or denied. Trying network location fallback...', gpsError);
    }
  }

  // Step 2: Try Backend Geo Detection Endpoint
  try {
    const bRes = await fetch('/api/geo/detect', { signal: AbortSignal.timeout(3500) });
    if (bRes.ok) {
      const bData = await bRes.json();
      if (bData.success && bData.lat && bData.lng) {
        const closest = findClosestHyderabadLocality(bData.lat, bData.lng);
        return {
          success: true,
          isGps: false,
          source: 'network_ip',
          lat: bData.lat,
          lng: bData.lng,
          localityName: closest.name,
          zone: closest.zone,
          distanceKm: closest.distanceKm,
          isWithinHyderabad: closest.isWithinHyderabad,
          city: bData.city || 'Hyderabad',
          label: closest.isWithinHyderabad
            ? `📍 ${closest.name} (Network Detected)`
            : `📍 Network Carrier (${bData.city || 'AP/TS'})`,
        };
      }
    }
  } catch (backendErr) {
    // continue to public IP providers
  }

  // Step 3: Try Public Fast IP Geolocation Provider (ipwho.is)
  try {
    const ipRes = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3500) });
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.success && ipData.latitude && ipData.longitude) {
        const closest = findClosestHyderabadLocality(ipData.latitude, ipData.longitude);
        return {
          success: true,
          isGps: false,
          source: 'network_ip',
          lat: ipData.latitude,
          lng: ipData.longitude,
          localityName: closest.name,
          zone: closest.zone,
          distanceKm: closest.distanceKm,
          isWithinHyderabad: closest.isWithinHyderabad,
          city: ipData.city || 'Hyderabad',
          label: closest.isWithinHyderabad
            ? `📍 ${closest.name} (Network Detected)`
            : `📍 Network Carrier (${ipData.city || 'AP/TS'})`,
        };
      }
    }
  } catch (ipErr) {
    // continue
  }

  // Step 4: Default safe fallback to central Hyderabad (Kukatpally / Hitec City)
  const defaultLoc = HYDERABAD_LOCALITIES[0]; // Kukatpally
  return {
    success: true,
    isGps: false,
    source: 'fallback',
    isFallback: true,
    lat: defaultLoc.lat,
    lng: defaultLoc.lng,
    localityName: defaultLoc.name,
    zone: defaultLoc.zone,
    distanceKm: 0,
    isWithinHyderabad: true,
    label: `📍 ${defaultLoc.name}, Hyderabad`,
  };
}
