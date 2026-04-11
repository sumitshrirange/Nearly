/**
 * Reverse geocode coordinates to a human-readable address
 * Uses OpenStreetMap Nominatim (free, no API key needed)
 */

const cache = new Map();

export const reverseGeocode = async (lat, lng) => {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "NearlyApp/1.0" } },
    );
    if (!res.ok) throw new Error("Geocode failed");
    const data = await res.json();
    const a = data.address || {};

    // Build a concise, human-readable address
    const parts = [
      a.suburb || a.neighbourhood || a.village || a.hamlet,
      a.city || a.town || a.county || a.state_district,
      a.state,
    ].filter(Boolean);

    const address =
      parts.length > 0
        ? parts.join(", ")
        : data.display_name?.split(",").slice(0, 2).join(",").trim();
    const city = a.city || a.town || a.county || a.state_district || "";
    const state = a.state || "";
    const pincode = a.postcode || "";

    const result = { address, city, state, pincode, full: data.display_name };
    cache.set(key, result);
    return result;
  } catch (err) {
    console.warn("[Geocode] Failed:", err.message);
    return {
      address: "Current location",
      city: "",
      state: "",
      pincode: "",
      full: "",
    };
  }
};

/**
 * Get current position as a Promise
 */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });

/**
 * Get coords + full address in one call
 */
export const getLocationWithAddress = async () => {
  const pos = await getCurrentPosition();
  const { latitude: lat, longitude: lng } = pos.coords;
  const geo = await reverseGeocode(lat, lng);
  return { lat, lng, ...geo };
};
