import { useState } from "react";
import { ImagePlus } from "lucide-react";
import useUserStore from "../../Store/UseStore";

const AddFood = ({ menuId }) => {
  const { addFood } = useUserStore();
  const [formData, setFormData] = useState({
    foodName: "",
    price: "",
    menuId: menuId,
    ingredients: "",
    instructions: "",
    cookingTimeMinutes: "",
    imageCover: "",
    isFeatured: false,
    status: "Available",
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError("Please select an image file");
          return;
        }
        
        // Validate file size (max 5MB)
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

    if (!formData.foodName || !formData.price || !formData.menuId) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("foodName", formData.foodName);
      payload.append("price", parseFloat(formData.price));
      payload.append("menuId", formData.menuId);
      
      if (formData.ingredients) payload.append("ingredients", formData.ingredients);
      if (formData.instructions) payload.append("instructions", formData.instructions);
      if (formData.cookingTimeMinutes) payload.append("cookingTimeMinutes", parseInt(formData.cookingTimeMinutes));
      if (formData.imageCover) payload.append("imageCover", formData.imageCover);
      
      payload.append("isFeatured", formData.isFeatured);
      payload.append("status", formData.status);

      const response = await fetch("https://api.bahirandelivery.cloud/api/v1/foods", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new food to the store
        addFood(menuId, data.data);
        
        setFormData({
          foodName: "",
          price: "",
          menuId: menuId,
          ingredients: "",
          cookingTimeMinutes: "",
          imageCover: "",
          isFeatured: false,
          status: "Available",
        });
        setImagePreview("");
        alert("Food item added successfully!");
      } else {
        setError(data.message || "Failed to add food item");
      }
    } catch (error) {
      console.error("Error adding food item:", error);
      setError("Error adding food item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto p-1">
      <form onSubmit={handleSubmit} className="space-y-1 font-noto flex-1">
        
        
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
              Cooking Time (minutes)
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

        {/* <div>
          <label className="block text-sm font-medium text-[#4b382a] mb-1">
            Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
            placeholder="Cooking instructions"
          />
        </div> */}

        {/* <div className=" p-2 flex items-end justify-end">
          {/* <label className="block text-sm font-medium text-[#4b382a] mb-1">
            Image Cover
          </label> 
          <input
            id="imageCover"
            type="file"
            accept="image/*"
            name="imageCover"
            onChange={handleInputChange}
            className="sr-only"
          />
          <label
            htmlFor="imageCover"
            className="inline-flex  items-center justify-center w-20 h-10 rounded-md text-white bg-[#905618]  hover:bg-[#5f3716] cursor-pointer transition-colors"
            title="Upload image"
            aria-label="Upload image"
          >
            <ImagePlus size={18} />
          </label>
        </div> */}

        {/* <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#4b382a] mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4b382a]"
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          {/* <div className="flex items-center mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  formData.isFeatured ? "bg-[#4b382a]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                    formData.isFeatured ? "translate-x-5" : "translate-x-0"
                  } mt-0.5 ml-0.5`}
                ></div>
              </div>
              <span className="ml-3 text-sm text-[#4b382a]">Featured Item</span>
            </label>
          </div> 
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#905618] text-white py-2 px-4 rounded-md hover:bg-[#3d2e22] focus:outline-none focus:ring-2 focus:ring-[#4b382a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
        >
          {loading ? "Adding..." : "Add Food Item"}
        </button>
      </form>

      <div className="flex flex-col items-center justify-center mt-4 md:mt-0">
        <h3 className="text-sm font-medium text-[#4b382a] mb-2">Image Preview</h3>
        {imagePreview ? (
          <div className="border-2 border-gray-300 rounded-md p-2">
            <img
              src={imagePreview}
              alt="Food Preview"
              className="h-48 w-48 object-cover rounded-md shadow-md"
            />
          </div>
        ) : (
          <div className="relative h-48 w-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-center text-gray-400">
           
              <span className="text-lg text-center"> Recommended image size is 1:1 (100x100)</span>
          </div>
        )}
        <div className=" p-2 flex items-end justify-end">
          {/* <label className="block text-sm font-medium text-[#4b382a] mb-1">
            Image Cover
          </label> */}
          <input
            id="imageCover"
            type="file"
            accept="image/*"
            name="imageCover"
            onChange={handleInputChange}
            className="sr-only"
          />
          <label
            htmlFor="imageCover"
            className="inline-flex  items-center justify-center w-20 h-10 rounded-md text-white bg-[#905618]  hover:bg-[#5f3716] cursor-pointer transition-colors"
            title="Upload image"
            aria-label="Upload image"
          >
            <ImagePlus size={18} />
          </label>
        </div>
      </div>
    </div>
    <div className="flex justify-center items-center gap-4 h-[50px] pt-2">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        </div>
        </>
  );
};

export default AddFood;