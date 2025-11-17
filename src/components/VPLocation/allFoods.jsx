import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownToDot } from 'lucide-react'; // Assuming Lucide React is installed; remove if not needed or replace icon

const AllFoods = () => {
    const URL = "https://gebeta-delivery1.onrender.com/api/v1/foods";
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Initial Data Fetch
    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const response = await fetch(URL);
                const data = await response.json();
                console.log(data);
                // Ensure data is treated as an array
                setFoods(data.data); 
            } catch (error) {
                console.error('Error fetching foods:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);

    // Handle Scroll for Dot Index Update
    useEffect(() => {
        if (!scrollRef.current || foods.length === 0) return;

        const handleScroll = () => {
            const { scrollLeft } = scrollRef.current;
            // Card width (280px) + space-x-6 (24px) = 304px
            const cardSize = 280 + 24; 
            const index = Math.round(scrollLeft / cardSize);
            setSelectedIndex(Math.min(Math.max(index, 0), foods.length - 1));
        };

        const ref = scrollRef.current;
        ref.addEventListener('scroll', handleScroll);
        return () => ref.removeEventListener('scroll', handleScroll);
    }, [foods.length]);

    // Scroll to specific index
    const goToIndex = (index) => {
        if (!scrollRef.current) return;
        const cardSize = 280 + 24; // Card width + gap
        scrollRef.current.scrollTo({
            left: index * cardSize,
            behavior: 'smooth'
        });
    };
    
    // Star Rating Helper (for display)
    const renderRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400">★</span>
                ))}
                {hasHalfStar && <span className="text-yellow-400">½</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300">★</span>
                ))}
                <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading foods...</div>;
    }
    
    if (foods.length === 0) {
        return <div className="flex justify-center items-center h-64 text-gray-500">No foods available.</div>;
    }

    return (
        <>
            <div className="max-w-6xl mx-auto p-10 z-0">
                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-6 pb-14 px-48 snap-x snap-mandatory scrollbar-hide p-12 "
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {foods.map((food) => (
                        <div
                            key={food._id}
                            className="flex-shrink-0 w-[280px] snap-center"
                        >
                            {/* Gradient Border Wrapper */}
                            <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-[#e0cda9] to-[#f1d59b] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                {/* Inner Card */}
                                <div className="bg-white rounded-2xl overflow-hidden h-full flex flex-col">
                                    {/* Food Image */}
                                    <img
                                        src={food.imageCover}
                                        alt={food.foodName}
                                        className="w-full h-40 object-cover group-hover:scale-[1.02] transition duration-500"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/280x160?text=Food+Image+Missing'; // Fallback placeholder
                                        }}
                                    />
                                    
                                    {/* Card Content */}
                                    <div className="p-4 flex flex-col flex-1">
                                        {/* Food Name with Icon */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#905618] to-[#b8691e] flex items-center justify-center text-white shadow-sm">
                                                <ArrowDownToDot size={16} />
                                            </div>
                                            <h3 className="font-semibold text-base text-[#3d2e22] truncate">
                                                {food.foodName}
                                            </h3>
                                        </div>

                                        {/* Restaurant Name */}
                                        <p className="text-xs text-[#6b5b4b] mb-2 flex items-center">
                                            <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6c0 4.477 4.5 9 6 9s6-4.523 6-9a6 6 0 00-6-6zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
                                            {food.restaurantId?.name || 'Unknown Restaurant'}
                                        </p>
                                        
                                        {/* Price and Cooking Time */}
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-lg font-bold text-green-600">
                                                ${food.price}
                                            </p>
                                            <p className="text-xs text-[#6b5b4b] flex items-center">
                                                <svg className="w-3 h-3 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                {food.cookingTimeMinutes || '--'} min
                                            </p>
                                        </div>
                                        
                                        {/* Rating */}
                                        <div className="mb-2">
                                            {renderRating(food.rating || 0)}
                                        </div>

                                        {/* Ingredients (truncated) */}
                                        <p className="text-xs text-[#6b5b4b] line-clamp-2 italic flex-1">
                                            {food.ingredients}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selection Dots at the Bottom */}
                <div className="flex justify-center space-x-2 mt-16">
                    {foods.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                index === selectedIndex
                                    ? 'bg-red-500 shadow-sm'
                                    : 'bg-gray-300 hover:bg-red-300'
                            }`}
                            aria-label={`Go to food ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
};

export default AllFoods;