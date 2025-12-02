import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownToDot } from 'lucide-react';

const AllFoods = () => {
    const URL = "https://api.bahirandelivery.cloud//api/v1/foods";
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchFoods = async () => {
            try {
                const response = await fetch(URL);
                const data = await response.json();
                setFoods(data.data || []);
                console.log(data.data);
            } catch (error) {
                console.error('Error fetching foods:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);
// console.log(foods);
    // Center the scroll on the middle list once foods load
    useEffect(() => {
        if (!scrollRef.current || foods.length === 0) return;
        const el = scrollRef.current;
        el.scrollLeft = 0;
    }, [foods.length]);

    // Update Selected Dot on Scroll and handle circular jump
    useEffect(() => {
        if (!scrollRef.current || foods.length === 0) return;

        const handleScroll = () => {
            const el = scrollRef.current;
            const { scrollLeft } = el;
            const cardSize = 280 + 24;
            const index = Math.round(scrollLeft / cardSize) % foods.length;
            setSelectedIndex(Math.min(Math.max(index, 0), foods.length - 1));
        };

        const el = scrollRef.current;
        el.addEventListener('scroll', handleScroll);

        return () => el.removeEventListener('scroll', handleScroll);
    }, [foods.length]);

    // Auto-scroll effect with seamless infinite loop
    useEffect(() => {
        if (!scrollRef.current || foods.length === 0) return;

        const el = scrollRef.current;
        let rafId;
        const speed = 0.6;
        const cardWidth = 280;
        const gap = 24;
        const cycleWidth = foods.length * cardWidth + (foods.length - 1) * gap * 20;

        const step = () => {
            if (!isPaused) {
                el.scrollLeft += speed;
                if (el.scrollLeft >= cycleWidth) {
                    el.scrollLeft -= cycleWidth;
                }
            }
            rafId = requestAnimationFrame(step);
        };

        rafId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(rafId);
    }, [foods.length, isPaused]);

    const goToIndex = (index) => {
        if (!scrollRef.current) return;

        const cardSize = 280 + 24;
        scrollRef.current.scrollTo({
            left: index * cardSize,
            behavior: 'smooth'
        });
    };

    const renderRating = (rating) => {
        const full = Math.floor(rating);
        const half = rating % 1 !== 0;
        const empty = 5 - full - (half ? 1 : 0);

        return (
            <div className="flex items-center">
                {[...Array(full)].map((_, i) => (
                    <span key={`f-${i}`} className="text-yellow-400">★</span>
                ))}
                {half && <span className="text-yellow-400">½</span>}
                {[...Array(empty)].map((_, i) => (
                    <span key={`e-${i}`} className="text-gray-300">★</span>
                ))}

                <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
            </div>
        );
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading foods...</div>;
    if (foods.length === 0) return <div className="flex justify-center items-center h-64 text-gray-500">No foods available.</div>;

    // Duplicate foods for seamless infinite loop
    const duplicatedFoods = [...foods, ...foods];

    return (
        <>
            <div className="w-full mx-auto z-0 scrollbar-hide">
                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide space-x-6 p-5"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {duplicatedFoods.map((food, i) => {
                        const realIndex = i % foods.length;
                        return (
                            <div key={`${food._id}-${realIndex}`} className="flex-shrink-0 w-[280px]">
                                <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-[#e0cda9] to-[#f1d59b]  hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="bg-white rounded-2xl overflow-hidden h-full flex flex-col">

                                        <img
                                            src={food.imageCover}
                                            alt={food.foodName}
                                            className="w-full h-40 object-cover group-hover:scale-[1.02] transition duration-500"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/280x160?text=Food+Image';
                                            }}
                                        />

                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#905618] to-[#b8691e] text-white flex items-center justify-center">
                                                    <ArrowDownToDot size={16} />
                                                </div>
                                                <h3 className="font-semibold text-base truncate text-[#3d2e22]">
                                                    {food.foodName}
                                                </h3>
                                            </div>

                                            <p className="text-xs text-[#6b5b4b] mb-2 flex items-center">
                                                <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 2a6 6 0 00-6 6c0 4.477 4.5 9 6 9s6-4.523 6-9a6 6 0 00-6-6zm0 11a3 3 0 110-6 3 3 0 010 6z" />
                                                </svg>
                                                {food.restaurantId?.name || 'Unknown Restaurant'}
                                            </p>

                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-lg font-bold text-green-600">
                                                    ${food.price}
                                                </p>
                                                <p className="text-xs text-[#6b5b4b] flex items-center">
                                                    <svg className="w-3 h-3 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {food.cookingTimeMinutes || '--'} min
                                                </p>
                                            </div>

                                            {renderRating(food.rating || 0)}

                                            <p className="text-xs text-[#6b5b4b] line-clamp-2 italic flex-1">
                                                {food.ingredients}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Dots */}
                <div className="flex justify-center space-x-2 mt-16">
                    {foods.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === selectedIndex ? 'bg-red-500' : 'bg-gray-300 hover:bg-red-300'
                            }`}
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