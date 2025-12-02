import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAdminDataStore = create(
  persist(
    (set, get) => ({
      // Users state
      users: [],
      usersLoading: false,
      usersError: null,

      // Restaurants state
      restaurants: [],
      restaurantsLoading: false,
      restaurantsError: null,

      // ===== Users actions =====
      setUsers: (users) => set({ users, usersError: null }),
      setUsersLoading: (loading) => set({ usersLoading: loading }),
      setUsersError: (error) => set({ usersError: error }),

      fetchUsers: async (force = false) => {
        const state = get();
        if (!force && state.users.length > 0) {
          return state.users;
        }

        set({ usersLoading: true, usersError: null });
        try {
          const response = await fetch(
            "https://api.bahirandelivery.cloud/api/v1/users",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || "Failed to fetch users");
          }

          const result = await response.json();
          const users = Array.isArray(result?.data?.users) ? result.data.users : [];
          state.setUsers(users);
          return users;
        } catch (error) {
          set({ usersError: error.message });
          return [];
        } finally {
          set({ usersLoading: false });
        }
      },

      // ===== Restaurants actions =====
      setRestaurants: (restaurants) => set({ restaurants, restaurantsError: null }),
      setRestaurantsLoading: (loading) => set({ restaurantsLoading: loading }),
      setRestaurantsError: (error) => set({ restaurantsError: error }),

      fetchRestaurants: async (force = false) => {
        const state = get();
        if (!force && state.restaurants.length > 0) {
          return state.restaurants;
        }

        set({ restaurantsLoading: true, restaurantsError: null });
        try {
          const res = await fetch(
            "https://api.bahirandelivery.cloud/api/v1/restaurants/admin/list",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const data = await res.json();
          if (res.ok && data.status === "success") {
            const list = Array.isArray(data.data) ? data.data : [];
            state.setRestaurants(list);
            return list;
          } else {
            throw new Error(data.message || "Failed to load restaurants.");
          }
        } catch (error) {
          set({ restaurantsError: error.message });
          return [];
        } finally {
          set({ restaurantsLoading: false });
        }
      },

      updateRestaurantStatus: async (id, newStatus) => {
        try {
          const res = await fetch(
            `https://api.bahirandelivery.cloud/api/v1/restaurants/${id}`,
            {
              method: newStatus === "Active" ? "POST" : "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Failed to update status");
          }

          // Optimistically update local state
          set((state) => ({
            restaurants: state.restaurants.map((restaurant) =>
              restaurant.id === id
                ? { ...restaurant, isActive: newStatus === "Active" }
                : restaurant
            ),
          }));
          return { ok: true, message: `Status updated to ${newStatus} successfully!` };
        } catch (error) {
          return { ok: false, message: error.message };
        }
      },

      assignRestaurantManager: async (restaurantId, phone) => {
        try {
          const res = await fetch(
            "https://api.bahirandelivery.cloud/api/v1/restaurants/assign-manager",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                phone,
                restaurantId,
              }),
            }
          );

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.message || "Failed to assign manager");
          }

          // Best effort refetch to sync manager info
          await get().fetchRestaurants(true);
          return { ok: true, message: "Successfully assigned manager" };
        } catch (error) {
          return { ok: false, message: error.message };
        }
      },

      // Utilities
      clearAdminData: () =>
        set({
          users: [],
          usersError: null,
          usersLoading: false,
          restaurants: [],
          restaurantsError: null,
          restaurantsLoading: false,
        }),
    }),
    {
      name: "admin-data",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      // Persist data lists only
      partialize: (state) => ({
        users: state.users,
        restaurants: state.restaurants,
      }),
    }
  )
);

export default useAdminDataStore;


