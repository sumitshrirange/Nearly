import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "../utils/api";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { getLocationWithAddress } from "../utils/geocode";

const AuthContext = createContext(null);

// Detect location and save it to the server
async function detectAndSaveLocation(userId) {
  try {
    const loc = await getLocationWithAddress();
    if (!loc?.lat || !loc?.lng) return null;

    // Save to server
    await api.put("/users/settings", {
      location: {
        coordinates: [loc.lng, loc.lat],
        address: loc.address || "Current location",
        city: loc.city || "",
        state: loc.state || "",
      },
    });

    // Cache locally for feed queries
    localStorage.setItem("nearly_lat", String(loc.lat));
    localStorage.setItem("nearly_lng", String(loc.lng));
    localStorage.setItem(
      "nearly_loc_label",
      loc.city || loc.address || "My Location",
    );

    return loc;
  } catch (err) {
    console.warn("[Auth] Location detection failed:", err.message);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nearly_user"));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const locationSaved = useRef(false);

  // On mount: refresh user data from server
  useEffect(() => {
    const token = localStorage.getItem("nearly_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("nearly_user", JSON.stringify(data.user));
        connectSocket(data.user._id);
        // Refresh location in background (non-blocking)
        if (!locationSaved.current) {
          locationSaved.current = true;
          detectAndSaveLocation(data.user._id).then((loc) => {
            if (loc) {
              setUser((prev) => ({
                ...prev,
                location: {
                  type: "Point",
                  coordinates: [loc.lng, loc.lat],
                  address: loc.address,
                  city: loc.city,
                  state: loc.state,
                },
              }));
            }
          });
        }
      })
      .catch(() => {
        localStorage.removeItem("nearly_token");
        localStorage.removeItem("nearly_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier, password) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    localStorage.setItem("nearly_token", data.token);
    localStorage.setItem("nearly_user", JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.user._id);

    // Detect location right after login (non-blocking)
    locationSaved.current = true;
    detectAndSaveLocation(data.user._id).then((loc) => {
      if (loc) {
        setUser((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: [loc.lng, loc.lat],
            address: loc.address,
            city: loc.city,
            state: loc.state,
          },
        }));
        // Persist updated user with new location
        localStorage.setItem(
          "nearly_user",
          JSON.stringify({
            ...data.user,
            location: {
              type: "Point",
              coordinates: [loc.lng, loc.lat],
              address: loc.address,
              city: loc.city,
              state: loc.state,
            },
          }),
        );
      }
    });

    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    // Detect location before registering so we can include it
    let locationPayload = null;
    try {
      const loc = await getLocationWithAddress();
      if (loc?.lat && loc?.lng) {
        locationPayload = {
          coordinates: [loc.lng, loc.lat],
          address: loc.address || "Current location",
          city: loc.city || "",
          state: loc.state || "",
        };
        localStorage.setItem("nearly_lat", String(loc.lat));
        localStorage.setItem("nearly_lng", String(loc.lng));
        localStorage.setItem(
          "nearly_loc_label",
          loc.city || loc.address || "My Location",
        );
      }
    } catch {
      /* location optional */
    }

    const { data } = await api.post("/auth/register", {
      ...payload,
      ...(locationPayload
        ? { location: { type: "Point", ...locationPayload } }
        : {}),
    });

    localStorage.setItem("nearly_token", data.token);
    localStorage.setItem("nearly_user", JSON.stringify(data.user));
    setUser(data.user);
    connectSocket(data.user._id);
    locationSaved.current = true;

    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nearly_token");
    localStorage.removeItem("nearly_user");
    localStorage.removeItem("nearly_lat");
    localStorage.removeItem("nearly_lng");
    localStorage.removeItem("nearly_loc_label");
    locationSaved.current = false;
    disconnectSocket();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("nearly_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
