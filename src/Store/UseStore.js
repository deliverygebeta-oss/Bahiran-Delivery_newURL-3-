import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      restaurant: null,

      // Boolean to track if user is logged in
      isLoggedIn: false,

      // Notification state
      notifications: [],
      newOrderAlert: false,
      latestOrderId: null,

      // Orders state
      orders: [],
      ordersLoading: false,
      ordersError: null,

      // Menus state - Cached persistently in sessionStorage
      // Cache is only refreshed on manual refresh or data modifications
      menus: [],
      menusLoading: false,
      menusError: null,

      // Foods state (organized by menuId) - Cached persistently in sessionStorage
      // Structure: { menuId: { foods: [] } }
      // Each menu's foods are cached separately and persist in sessionStorage
      foodsByMenu: {}, // { menuId: { foods: [] } }
      foodsLoading: false,
      foodsError: null,

      setUser: (userData) => set({ user: userData, isLoggedIn: !!userData }),
      clearUser: () => set({ user: null, isLoggedIn: false }),

      // Update only the firstLogin flag inside the user object
      setUserFirstLogin: (firstLogin) =>
        set((state) => ({
          user: state.user ? { ...state.user, firstLogin } : state.user,
        })),
          
      setRestaurant: (restaurantData) => set({ restaurant: restaurantData }),
      clearRestaurant: () => set({ restaurant: null }),

      // Notification actions
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { ...notification, id: Date.now(), timestamp: new Date() }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      setNewOrderAlert: (alert) => set({ newOrderAlert: alert }),
      setLatestOrderId: (id) => set({ latestOrderId: id }),
      
      // Orders actions
      setOrders: (orders) => set({ orders }),
      setOrdersLoading: (loading) => set({ ordersLoading: loading }),
      setOrdersError: (error) => set({ ordersError: error }),
      
      updateOrderStatus: (orderId, newStatus) => set((state) => ({
        orders: state.orders.map(order => 
          order.orderId === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        )
      })),
      
      // Auto-remove old notifications (keep only last 10)
      cleanupNotifications: () => set((state) => ({
        notifications: state.notifications.slice(-10)
      })),

      // Menus actions
      setMenus: (menus) => set({ 
        menus,
        menusError: null 
      }),
      
      setMenusLoading: (loading) => set({ menusLoading: loading }),
      
      setMenusError: (error) => set({ menusError: error }),
      
      addMenu: (menu) => set((state) => ({
        menus: [...state.menus, menu]
      })),
      
      updateMenu: (menuId, updatedData) => set((state) => ({
        menus: state.menus.map(menu => 
          menu._id === menuId 
            ? { ...menu, ...updatedData }
            : menu
        )
      })),
      
      deleteMenu: (menuId) => set((state) => ({
        menus: state.menus.filter(menu => menu._id !== menuId)
      })),

      // Fetch menus from API
      fetchMenus: async (restaurantId, force = false) => {
        const state = get();
        
        // Skip if we have cached data and not forcing refresh
        if (!force && state.menus.length > 0) {
          return state.menus;
        }

        set({ menusLoading: true, menusError: null });
        
        try {
          const res = await fetch(
            `https://api.bahirandelivery.cloud/api/v1/food-menus?restaurantId=${restaurantId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          const data = await res.json();
          
          if (res.ok) {
            state.setMenus(data.data);
            return data.data;
          } else {
            throw new Error(data.message || "Failed to fetch menus");
          }
        } catch (error) {
          console.error("Error fetching menus:", error);
          set({ menusError: error.message });
          return null;
        } finally {
          set({ menusLoading: false });
        }
      },

      // Foods actions
      setFoodsByMenu: (menuId, foods) => set((state) => ({
        foodsByMenu: {
          ...state.foodsByMenu,
          [menuId]: { foods }
        },
        foodsError: null
      })),
      
      setFoodsLoading: (loading) => set({ foodsLoading: loading }),
      
      setFoodsError: (error) => set({ foodsError: error }),
      
      addFood: (menuId, food) => set((state) => {
        const menuFoods = state.foodsByMenu[menuId];
        if (!menuFoods) return state;
        
        return {
          foodsByMenu: {
            ...state.foodsByMenu,
            [menuId]: {
              foods: [...menuFoods.foods, food]
            }
          }
        };
      }),
      
      updateFood: (menuId, foodId, updatedData) => set((state) => {
        const menuFoods = state.foodsByMenu[menuId];
        if (!menuFoods) return state;
        
        return {
          foodsByMenu: {
            ...state.foodsByMenu,
            [menuId]: {
              foods: menuFoods.foods.map(food => 
                food._id === foodId 
                  ? { ...food, ...updatedData }
                  : food
              )
            }
          }
        };
      }),
      
      deleteFood: (menuId, foodId) => set((state) => {
        const menuFoods = state.foodsByMenu[menuId];
        if (!menuFoods) return state;
        
        return {
          foodsByMenu: {
            ...state.foodsByMenu,
            [menuId]: {
              foods: menuFoods.foods.filter(food => food._id !== foodId)
            }
          }
        };
      }),

      // Fetch foods for a specific menu
      fetchFoodsByMenu: async (menuId, force = false) => {
        const state = get();
        
        // Skip if we have cached data and not forcing refresh
        if (!force && state.foodsByMenu[menuId]) {
          return state.foodsByMenu[menuId].foods;
        }

        set({ foodsLoading: true, foodsError: null });
        
        try {
          const res = await fetch(
            `https://api.bahirandelivery.cloud/api/v1/foods/by-menu/${menuId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          
          const data = await res.json();
          
          if (res.ok) {
            const foods = data.data.foods || [];
            state.setFoodsByMenu(menuId, foods);
            return foods;
          } else {
            throw new Error(data.message || "Failed to fetch foods");
          }
        } catch (error) {
          console.error("Error fetching foods:", error);
          set({ foodsError: error.message });
          return [];
        } finally {
          set({ foodsLoading: false });
        }
      },

      // Clear all menu and food cache
      clearMenusCache: () => set({
        menus: [],
        foodsByMenu: {},
      }),
    }),
    {
      name: "user-data", // key in sessionStorage
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
      // Only persist data, not loading/error states
      partialize: (state) => ({
        user: state.user,
        restaurant: state.restaurant,
        isLoggedIn: state.isLoggedIn,
        notifications: state.notifications,
        newOrderAlert: state.newOrderAlert,
        latestOrderId: state.latestOrderId,
        orders: state.orders,
        menus: state.menus,
        foodsByMenu: state.foodsByMenu,
        // Loading and error states are NOT persisted - they always start fresh
      }),
    }
  )
);

export default useUserStore;
