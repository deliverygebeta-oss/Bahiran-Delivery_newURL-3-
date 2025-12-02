import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  X,
  Save,
  ChefHat,
  ArrowLeft,
  Salad,
  RefreshCcw,
} from "lucide-react";
import AddFood from "../../components/UserForms/M-addFood";
import PopupCard from "../../components/Cards/PopupCard";
import MEditFood from "../../components/UserForms/M-EditFood";
import useUserStore from "../../Store/UseStore";
import { Loading, InlineLoadingDots } from "../../components/Loading/Loading";

const Menus = () => {
  // Zustand store
  const {
    menus,
    menusLoading,
    foodsByMenu,
    foodsLoading,
    fetchMenus,
    fetchFoodsByMenu,
    updateMenu,
    addMenu: addMenuToStore
  } = useUserStore();

  const [loading, setLoading] = useState({
    editMenu: false,
    menuItems: false,

  });
  const [editingMenu, setEditingMenu] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showEditFood, setShowEditFood] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [refreshFoods, setRefreshFoods] = useState(false);

  const [menuForm, setMenuForm] = useState({
    menuType: "",
    active: true,
  });

  const restaurantId = JSON.parse(sessionStorage.getItem("user-data")).state
    .restaurant?.id;
  const restaurantName = JSON.parse(sessionStorage.getItem("user-data")).state
    .restaurant?.name;

  // Get foods for selected menu from store
  const menuFoods = selectedMenu && foodsByMenu[selectedMenu._id]
    ? foodsByMenu[selectedMenu._id].foods
    : [];

  useEffect(() => {
    if (restaurantId) {
      // Fetch menus from store (will use cache if available)
      fetchMenus(restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (refreshFoods && selectedMenu) {
      // Force refresh of foods
      fetchFoodsByMenu(selectedMenu._id, true);
      setRefreshFoods(false);
    }
  }, [refreshFoods, selectedMenu?._id]);

  const handleMenuClick = async (menu) => {
    setSelectedMenu(menu);
    // Fetch foods from store (will use cache if available)
    await fetchFoodsByMenu(menu._id);
  };

  const handleEditMenu = async () => {
    if (!menuForm.menuType) return alert("Menu type is required");

    try {
      setMenuLoading(true);
      const payload = {
        menuType: menuForm.menuType.trim(),
        active: menuForm.active,
      };

      const res = await fetch(
        `https://api.bahirandelivery.cloud/api/v1/food-menus/${editingMenu}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }

      );


      const data = await res.json();
      if (res.ok) {
        // Update menu in store
        updateMenu(editingMenu, payload);
        setMenuForm({ menuType: "", active: true });
        setEditingMenu(null);
        alert("Menu item updated successfully!");
      } else {
        alert(data.message || "Failed to update menu item");
      }
      setMenuLoading(false);

    } catch (error) {
      console.error("Error editing menu:", error);
      alert("Error updating menu item. Please try again.");
    }
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!menuForm.menuType.trim()) return alert("Menu type is required");

    try {
      const payload = {
        restaurantId: restaurantId,
        menuType: menuForm.menuType.trim(),
        active: menuForm.active,
      };
      console.log(restaurantId)

      const res = await fetch(
        "https://api.bahirandelivery.cloud/api/v1/food-menus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Add new menu to store
        addMenuToStore(data.data);
        setMenuForm({ menuType: "", active: true });
        setShowAddMenu(false);
        alert("Menu created successfully!");
      } else {
        alert(data.message || "Failed to create menu");
      }
    } catch (error) {
      console.error("Error creating menu:", error);
      alert("Error creating menu. Please try again.");
    }
  };

  // const handleDeleteMenu = async (menuId) => {
  //   console.log(menuId);
  //   if (window.confirm("Are you sure you want to delete this menu?")) {
  //     try {
  //       const res = await fetch(
  //         `https://gebeta-delivery1.onrender.com/api/v1/food-menus/${menuId}`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       if (res.ok) {
  //         await fetchMenus();
  //         // alert("Menu deleted successfully!");
  //       } else {
  //         const data = await res.json();
  //         alert(data.message || "Failed to delete menu");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting menu:", error);
  //       alert("Error deleting menu. Please try again.");
  //     }
  //   }
  // };

  // const handleDeleteFood = async (foodId) => {
  //   if (window.confirm("Are you sure you want to delete this food item?")) {
  //     try {
  //       const res = await fetch(
  //         `https://gebeta-delivery1.onrender.com/api/v1/foods/${foodId}`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );
  //       if (res.ok) {
  //         await fetchMenuFoods(selectedMenu._id);
  //         alert("Food item deleted successfully!");
  //       } else {
  //         const data = await res.json();
  //         alert(data.message || "Failed to delete food item");
  //       }
  //     } catch (error) {
  //       console.error("Error deleting food:", error);
  //       alert("Error deleting food. Please try again.");
  //     }
  //   }
  // };
  const handleEditFood = (foodId) => {
    console.log(foodId);
    setShowEditFood(true);
    setSelectedFood(foodId);
  };

  return (
    <>
      {showEditFood && (
        <PopupCard>
          <div>
            <div className="flex justify-between items-center">

              <h3>Edit Food</h3>
              <button onClick={() => setShowEditFood(false)}><X size={28} color="red" className="absolute top-4 right-4" /></button>
            </div>
            <div>
              <MEditFood foodId={selectedFood} />
            </div>
          </div>
        </PopupCard>
      )}
      {showAddMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 motion-scale-in-[0.31] motion-translate-x-in-[65%] motion-translate-y-in-[-41%]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#4b382a]">Add Menu</h3>
              <button
                className="rounded-full hover:bg-red-50 transform transition-all duration-300"
                onClick={() => setShowAddMenu(false)}
              >
                <X size={28} color="red" />
              </button>
            </div>

            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4b382a] mb-1">
                  Menu Type *
                </label>
                <input
                  type="text"
                  value={menuForm.menuType}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, menuType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
                  placeholder="e.g., Lunch, Dinner, Breakfast"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#905618] text-white py-2 px-4 rounded-md hover:bg-[#3d2e22] transition-colors"
                >
                  Create Menu
                </button>
              </div>
            </form>
          </div>

        </div>

      )}
      {showAddFood && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50  ">
            <div className="bg-white rounded-lg p-6 max-w-[700px] motion-scale-in-[0.31] motion-translate-x-in-[65%] motion-translate-y-in-[-41%]">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#4b382a]">
                  Add Food Item
                </h3>
                <button
                  className="rounded-full hover:bg-red-50 transform transition-all duration-300"
                  onClick={() => setShowAddFood(false)}
                >
                  <X size={28} color="red" />
                </button>
              </div>
              <AddFood menuId={selectedMenu?._id} />
            </div>
          </div>
        </>
      )}
      <div className="p-6 bg-[#f4f1e9] min-h-[calc(100vh-65px)] overflow-y-auto">
        <div className="flex items-center justify-between mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-[#e0cda9]">
          <div className="flex items-center gap-6">
            {selectedMenu && (
              <button
                onClick={() => {
                  setSelectedMenu(null);
                  setMenuFoods([]);
                }}
                className="text-[#4b382a] hover:text-[#3d2e22] p-3 rounded-full bg-[#f8f6f0] hover:bg-[#e0cda9] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <div className="flex flex-col">
              <h2 className="text-4xl font-bold text-[#4b382a] tracking-tight">
                {selectedMenu ? `${selectedMenu.menuType}` : `${restaurantName}'s Menu `}
              </h2>
              {selectedMenu && (
                <p className="text-lg text-[#8b7355] font-medium mt-1">
                  Manage food items
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              className={`bg-gradient-to-r from-[#905618] to-[#b8691e] text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-[#3d2e22] hover:to-[#4b382a] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 motion-preset-focus font-semibold ${selectedMenu ? "" : "hidden"
                }`}
              onClick={() => setShowAddFood(true)}
            >
              <Salad size={20} />
              Add Food Item
            </button>
            <button
              className={`bg-gradient-to-r from-[#905618] to-[#b8691e] text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-[#3d2e22] hover:to-[#4b382a] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 motion-preset-focus font-semibold ${!selectedMenu ? "" : "hidden"
                }`}
              onClick={() => setShowAddMenu(true)}
            >
              <ChefHat size={20} />
              Add Menu
            </button>
          </div>
        </div>

        {editingMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#4b382a]">Edit Menu</h3>
                <button
                  onClick={() => {
                    setEditingMenu(null);
                    setMenuForm({ menuType: "", active: true });
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={26} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4b382a] mb-2">
                    Menu Type
                  </label>
                  <input
                    type="text"
                    value={menuForm.menuType}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, menuType: e.target.value })
                    }
                    className="w-full p-3 border border-[#e0cda9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
                    placeholder="Enter menu type (e.g., Breakfast, Lunch, Dinner)"
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="block text-sm font-medium text-[#4b382a]">
                    Active Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setMenuForm({ ...menuForm, active: !menuForm.active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b382a] focus:ring-offset-2 ${menuForm.active ? 'bg-[#2aa541]' : 'bg-gray-400'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${menuForm.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditMenu}
                  className={`flex-1 bg-[#4b382a] text-white py-2 px-4 rounded-lg hover:bg-[#3d2e22] transition-colors flex items-center justify-center gap-2 ${menuLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={menuLoading}
                >
                  <Save size={18} />
                  {menuLoading ? "saving... " : "Save"
                  }
                </button>

              </div>
            </div>
          </div>
        )}

        {selectedMenu ? (
          <div>
            <div className="flex items-center gap-16 mb-4">

              <h3 className="text-2xl font-semibold text-[#4b382a] mb- flex items-center gap-2">
                <ChefHat size={24} />
                Foods ({menuFoods.length})
              </h3>
              <button
                onClick={() => setRefreshFoods(true)}
                className="bg-[#e0cda9] p-2 rounded-md transition-transform duration-500 "
              >
                <span
                  className={`flex justify-center items-center ${foodsLoading ? "animate-spin" : ""
                    }`}
                >
                  <RefreshCcw size={24} color="#4b382a" />
                </span>

              </button>
            </div>
            {foodsLoading ? (
              <Loading />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {menuFoods.length > 0 ? (
                  menuFoods.map((food) => (
                    <div
                      key={food._id}
                      className="bg-white rounded-lg shadow-md border border-[#e0cda9] relative overflow-hidden"
                      style={{
                        backgroundImage: `url(${food.imageCover})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '280px'
                      }}
                    >
                      {/* Overlay for better text readability */}
                      <div className="absolute inset-0 bg-black bg-opacity-25 rounded-lg"></div>

                      {/* Content overlay */}
                      <div className="relative z-10 p-4 h-full flex flex-col justify-betweenx">
                        <div className="  flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-lg font-bold text-white drop-shadow-lg">
                              {food.foodName}
                            </p>
                            {food.ingredients && (
                              <p className="text-gray-200 text-sm mt-1 drop-shadow-md">
                                {food.ingredients}
                              </p>
                            )}
                            <p className="text-white font-bold text-lg mt-2 drop-shadow-lg">
                              {food.price} ETB
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${food.status === "Available"
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                                  }`}
                              >
                                {food.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 self-end absolute bottom-5 right-5">
                            <button
                              onClick={() => handleEditFood(food._id)}
                              className="text-white hover:text-blue-300 p-2 bg-blue-600 bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all duration-200"
                            >
                              <Edit size={16} />
                            </button>
                            {/* <button
                              onClick={() => handleDeleteFood(food._id)}
                              className="text-white hover:text-white hover:bg-red-500 p-1 text-xs bg-red-400 w-[90px] rounded-md px-2 py-1 transition-colors duration-200 font-medium shadow-sm"
                            >
                              Set to Unavailable
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No foods found in this menu</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-16 mb-4">
              <h3 className="text-2xl font-semibold text-[#4b382a] flex items-center gap-2">
                <ChefHat size={24} />
                Menu Items ({menus.length})
              </h3>
              <button
                onClick={() => fetchMenus(restaurantId, true)}
                className="bg-[#e0cda9] p-2 rounded-md transition-transform duration-500"
                title="Refresh menus"
              >
                <span
                  className={`flex justify-center items-center ${menusLoading ? "animate-spin" : ""
                    }`}
                >
                  <RefreshCcw size={24} color="#4b382a" />
                </span>
              </button>
            </div>
            {menusLoading ? (
              <Loading />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {menus
                  .sort((a, b) => {
                    // Sort active menus first, then inactive menus
                    if (a.active && !b.active) return -1;
                    if (!a.active && b.active) return 1;
                    return 0;
                  })
                  .map((menu) => (
                    <div
                      key={menu._id}
                      className="bg-white rounded-lg p-4 shadow-md border border-[#e0cda9] cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleMenuClick(menu)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-lg font-bold text-[#a95b23]">
                            {menu.menuType}
                          </p>
                          {menu.description && (
                            <p className="text-gray-600 text-sm mt-1">
                              {menu.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${menu.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {menu.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuForm({
                                menuType: menu.menuType || "",
                                active: menu.active || false,
                              });
                              setEditingMenu(menu._id);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit size={16} />
                          </button>

                        </div>
                      </div>
                      {menu.image && (
                        <div className="mt-3">
                          <img
                            src={menu.image}
                            alt={menu.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Menus;