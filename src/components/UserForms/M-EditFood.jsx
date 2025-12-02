import { useState, useEffect } from "react";
import useUserStore from "../../Store/UseStore";
import { Loading } from "../Loading/Loading";

const MEditFood = ({ foodId }) => {
  const { updateFood, foodsByMenu } = useUserStore();
    const [formData, setFormData] = useState({
        foodName: "",
        price: "",
        ingredients: "",
        instructions: "",
        cookingTimeMinutes: "",
        image: "",
        isFeatured: false,
        status: "Available",
    });
    console.log(foodId);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch existing food data
    useEffect(() => {
        const fetchFoodData = async () => {
            if (!foodId) {
                setError("Food ID is required");
                setFetchLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `https://api.bahirandelivery.cloud/api/v1/foods/${foodId}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                // console.log(response)

                const data = await response.json();
                console.log(data)
                if (response.ok) {
                    setFormData({
                        foodName: data.data.foodName || "",
                        price: data.data.price || "",
                        ingredients: data.data.ingredients || "",
                        instructions: data.data.instructions || "",
                        cookingTimeMinutes: data.data.cookingTimeMinutes || "",
                        image: data.data.imageCover || "",
                        isFeatured: data.data.isFeatured || false,
                        status: data.data.status || "Available",
                    });

                    if (data.data.imageCover) {
                        setImagePreview(data.data.imageCover);
                    }
                } else {
                    setError(data.message || "Failed to fetch food data");
                }
            } catch (error) {
                console.error("Error fetching food data:", error);
                setError("Error fetching food data. Please try again.");
            } finally {
                setFetchLoading(false);
            }
        };

        fetchFoodData();
    }, [foodId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            const file = files[0];
            if (file) {
                if (!file.type.startsWith("image/")) {
                    setError("Please select an image file");
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    setError("Image size should be less than 5MB");
                    return;
                }

                setError("");
                const imageUrl = URL.createObjectURL(file);
                setImagePreview(imageUrl);
                setFormData((prev) => ({
                    ...prev,
                    [name]: file,
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.foodName || !formData.price) {
            setError("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const payload = new FormData();
            payload.append("foodName", formData.foodName);
            payload.append("price", parseFloat(formData.price));

            if (formData.ingredients)
                payload.append("ingredients", formData.ingredients);
            if (formData.cookingTimeMinutes)
                payload.append(
                    "cookingTimeMinutes",
                    parseInt(formData.cookingTimeMinutes)
                );
            if (formData.image) payload.append("imageCover", formData.image);

            // payload.append("isFeatured", String(formData.isFeatured));
            payload.append("status", formData.status);

            const response = await fetch(
                `https://api.bahirandelivery.cloud/api/v1/foods/${foodId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: payload,
                }
            );
            console.log(response)

            const data = await response.json();

            if (response.ok) {
                // Find which menu this food belongs to and update it in the store
                let menuIdForFood = null;
                Object.entries(foodsByMenu).forEach(([menuId, menuData]) => {
                    if (menuData.foods.some(food => food._id === foodId)) {
                        menuIdForFood = menuId;
                    }
                });
                
                if (menuIdForFood) {
                    updateFood(menuIdForFood, foodId, data.data);
                }
                
                setSuccess("Food item updated successfully!");
                // if (formData.image) {
                //     const imageUrl = URL.createObjectURL(formData.image);
                //     setImagePreview(imageUrl);
                // }
                setFormData((prev) => ({ ...prev, image: "" }));
            } else {
                setError(data.message || "Failed to update food item");
            }
        } catch (error) {
            console.error("Error updating food item:", error);
            setSuccess('')
            setError("Error updating food item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return <Loading/>
    }

    if (error && !formData.foodName) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col md:flex-row gap-6 mx-auto p-2 py-4">
                <form onSubmit={handleSubmit} className="space-y-1 font-noto flex-1 p-2">
                    <div>
                        <label className="block text-sm font-medium text-[#4b382a] mb-1">
                            Food Name *
                        </label>
                        <input
                            type="text"
                            name="foodName"
                            value={formData.foodName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
                            required
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[#4b382a] mb-1">
                                Price *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-[#4b382a] mb-1">
                                Cooking Time (minutes)*
                            </label>
                            <input
                                type="number"
                                name="cookingTimeMinutes"
                                value={formData.cookingTimeMinutes}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#4b382a] mb-1">
                            Ingredients
                        </label>
                        <textarea
                            name="ingredients"
                            value={formData.ingredients}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
                            placeholder="List ingredients (comma-separated)"
                        />
                    </div>

                    

                    <div className="flex flex-col sm:flex-row gap-4 items-center  ">
                        <div className="flex items-center mt-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <span className="mr-3 text-sm text-[#4b382a]">
                                    Available
                                </span>
                                <input
                                    type="checkbox"
                                    name="status"
                                    checked={formData.status === "Available"}
                                    onChange={(e) => handleInputChange({
                                        target: {
                                            name: "status",
                                            value: e.target.checked ? "Available" : "Unavailable"
                                        }
                                    })}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-11 h-6 rounded-full transition-colors duration-200 ${formData.status === "Available" ? "bg-[#4b382a]" : "bg-gray-200"
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${formData.status === "Available" ? "translate-x-5" : "translate-x-0"
                                            } mt-0.5 ml-0.5`}
                                    ></div>
                                </div>

                            </label>
                        </div>

                        
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#905618] text-white  py-2 px-4 rounded-md hover:bg-[#3d2e22] focus:outline-none focus:ring-2 focus:ring-[#4b382a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors m-2"
                    >
                        {loading ? "Updating..." : "Update Food Item"}
                    </button>
                </form>

                <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
                    <h3 className="text-sm font-medium text-[#4b382a] mb-2">
                        Image Preview
                    </h3>
                    {imagePreview ? (
                        <div className="border-2 border-gray-300 rounded-md p-2">
                            <img
                                src={imagePreview}
                                alt="Food Preview"
                                className="h-48 w-48 rounded-md shadow-md object-cover"
                            />
                            
                        </div>
                    ) : (
                        <div className="relative h-48 w-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-center text-gray-400">
                          <span className="text-lg text-center"> Recommended image size is 1:1 (100x100)</span>
                        </div>
                    )}
                    <div>
                        {/* <label className="block text-sm font-medium text-[#4b382a] mb-1">
                            Image Cover
                        </label> */}
                        <label className="flex mt-4 items-center justify-center w-full p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                            <svg 
                                className="w-5 h-5 mr-2 text-[#4b382a]" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                            </svg>
                            <span className="text-sm font-medium text-[#4b382a]">Upload Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                name="image"
                                onChange={handleInputChange}
                                className="hidden"
                            />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            Leave empty to keep current image
                        </p>
                    </div>
                </div>
                
            </div>

            <div className="flex justify-center items-center gap-4 absolute bottom-3 left-0 right-0 h-[50px] pt-2">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
            </div>
        </>
    );
};

export default MEditFood;
