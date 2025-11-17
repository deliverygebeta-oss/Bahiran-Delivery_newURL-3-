import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDownToDot, Search, Star, } from "lucide-react";
import { useViewport } from "../components/VPLocation/ViewPort";
import { ParallaxBackground } from "../components/VPLocation/OffsetView";
import WaveDivider from "../components/VPLocation/WaveDivider";
import AnimatedCircles from "../components/VPLocation/circles";
import AllFoods from "../components/VPLocation/allFoods";
// import { Facebook, Instagram, Linkedin, Tiktok, Twitter } from 'lucide-react'; // Add this import if Lucide React is available

// import CL from "../components/VPLocation/CL";

// Constants for scroll thresholds (abstracted from hardcoded values)
const NAV_SCROLL_THRESHOLD = 100;
const CARDS_SCROLL_THRESHOLD = 400;
const CARDS_APPEARANCE_THRESHOLD = 430;

// Animation configurations for restaurant cards
const CARD_ANIMATIONS = [
  {
    scale: 0.37,
    translateX: -69,
    translateY: -57,
    opacity: 0,
    duration: "0.87s",
  },
  {
    scale: 0.29,
    translateX: 0,
    translateY: -36,
  },
  {
    scale: 0.37,
    translateX: 69,
    translateY: -55,
    opacity: 0,
    duration: "0.87s",
  },
];

// Main Landing page component
const Landing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [rotate, setRotate] = useState(45);
  const { width, height, scrollY } = useViewport(); // Removed unused scrollX
  console.log(scrollY)
  // Rotation effect: Increment angle every 5 seconds
  useEffect(() => {
    let currentAngle = 45;
    const interval = setInterval(() => {
      currentAngle += 90;
      setRotate(currentAngle);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Generate animation classes for cards
  const getCardClasses = (index) => {
    // Use static, pre-defined motion classes so Tailwind can statically extract them
    const baseClasses = `
      m-2 group px-10 py-5
      bg-white/10 rounded-lg
      flex flex-col items-center justify-center gap-2
      relative overflow-hidden cursor-pointer
      shadow-lg z-20
      after:absolute after:h-full after:w-full after:inset-0 after:rounded-lg
      after:bg-[#d2b48c] after:-z-20
      after:-translate-y-full after:transition-all after:duration-500
      after:hover:translate-y-0
      transition-all duration-300 hover:duration-300
      [&_p]:delay-200 [&_p]:transition-all
    `;

    // Motion classes per card index (no dynamic template values)
    const motionClassesByIndex = [
      // index 0 -> scale 0.37, x -69%, y -57%, opacity 0, duration 0.87s
      "motion-scale-in-[0.37] motion-translate-x-in-[-69%] motion-translate-y-in-[-57%] motion-opacity-in-[0] motion-duration-[0.87s]/opacity",
      // index 1 -> scale 0.29, x 0%, y -36%
      "motion-scale-in-[0.29] motion-translate-x-in-[0%] motion-translate-y-in-[-36%]",
      // index 2 -> scale 0.37, x 69%, y -55%, opacity 0, duration 0.87s
      "motion-scale-in-[0.37] motion-translate-x-in-[69%] motion-translate-y-in-[-55%] motion-opacity-in-[0] motion-duration-[0.87s]/opacity",
    ];

    const motionBase =
      motionClassesByIndex[index] ??
      "motion-scale-in-[0.29] motion-translate-x-in-[0%] motion-translate-y-in-[-36%]";

    const conditionalClasses =
      scrollY >= CARDS_APPEARANCE_THRESHOLD ? `${motionBase}` : "hidden";

    const scaleClasses =
      scrollY >= CARDS_SCROLL_THRESHOLD
        ? "scale-105 transition-all duration-300"
        : "";

    return `${baseClasses} ${conditionalClasses} ${scaleClasses}`.trim();
  };

  // Restaurant card data
  const restaurants = [
    {
      image: "https://placehold.co/600x400/FFF/000?text=Restaurant+1",
      name: "Gourmet Grills",
      description: "A modern twist on classic comfort food.",
      rating: 4.8,
      reviews: "2,500 ratings",
      index: 0,
    },
    {
      image: "https://placehold.co/600x400/FFF/000?text=Restaurant+2",
      name: "Spicy Spoon",
      description: "Authentic and fiery international cuisine.",
      rating: 4.5,
      reviews: "1,800 ratings",
      index: 1,
    },
    {
      image: "https://placehold.co/600x400/FFF/000?text=Restaurant+3",
      name: "The Vegan Corner",
      description: "Fresh, plant-based meals crafted with care.",
      rating: 4.9,
      reviews: "3,100 ratings",
      index: 2,
    },
  ];

  // Image sources for rotating section (reused to avoid duplication)
  const foodImages = [
    "https://res.cloudinary.com/drinuph9d/image/upload/v1761891464/food_images/food_1761891463855_Cheese_Burger.png",
    "https://res.cloudinary.com/drinuph9d/image/upload/v1761912096/food_images/food_1761912094928_food_2.png",
    "https://res.cloudinary.com/drinuph9d/image/upload/v1761913788/food_images/food_1761913787869_food_3.png",
    "https://res.cloudinary.com/drinuph9d/image/upload/v1761914500/food_images/food_1761914499863_food_3.png",
  ];

  return (
    <>

      <div className="relative min-h-screen bg-cover font-sans text-gray-900 bg-landing">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/20 z-0" />

        {/* Fixed Header */}
        <header>
          <nav className={`flex justify-between items-center px-6 md:px-8 md:py-1 w-full top-0 left-0 mt-0 rounded-b-3xl fixed z-50 motion-translate-x-in-[0%] motion-translate-y-in-[-124%] motion-duration-1500 ${scrollY >= NAV_SCROLL_THRESHOLD ? "bg-black/10 backdrop-blur-sm" : ""
            }`}>
            <Link
              to="/"
              className="flex items-center gap-2 p-2 font-logo text-3xl md:text-2xl text-white border-2 border-white rounded-lg hover:border-yellow-400 transition-colors duration-300 transform hover:scale-105"
            >
              <img
                src="https://res.cloudinary.com/drinuph9d/image/upload/v1761897257/food_images/food_1761897256388_logo.png"
                alt="Logo"
                className="w-10 h-10 object-cover rounded"
              />
              Gebeታ
            </Link>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-white z-30 text-gray-900 px-5 py-2 md:px-6 md:py-3 rounded-full shadow-lg font-semibold transition-all duration-300 hover:bg-yellow-400 hover:text-white cursor-pointer"
              >
                Login
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-start pl-10 justify-center h-[630px]">
          <h1 className="text-white text-4xl md:text-7xl font-bold tracking-tight drop-shadow-xl animate-fade-in-down mb-6">
            <span className="block mb-2 md:mb-4 text-start  motion-translate-x-in-[-20%] motion-translate-y-in-[0%] motion-opacity-in-[0%] motion-duration-1500">Craving?</span>
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent  motion-translate-x-in-[98%] motion-translate-y-in-[-1%] motion-opacity-in-[0%]">
              Tap. Eat. Repeat.
            </span>
          </h1>
          <p className="text-white text-lg md:text-xl font-medium mb-8 drop-shadow-lg">
            Discover your next favorite meal from trending restaurants and hidden gems near you.
          </p>
          {/* <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full max-w-xl p-2 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl">
            <div className="relative w-full">
              <label htmlFor="search-input" className="sr-only">
                Search by restaurant or cuisine
              </label>
              <input
                id="search-input"
                className="p-3 pl-12 rounded-full border border-gray-300 bg-white/95 text-gray-800 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                type="text"
                placeholder="Search for 'pizza', 'sushi', or a restaurant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 text-white px-8 py-3 rounded-full hover:bg-yellow-600 transition-colors duration-300 font-bold w-full sm:w-auto transform hover:scale-105"
            >
              Search
            </button>
          </form> */}
        </section>

        {/* Scroll Indicator */}
        {/* <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <Link to="#explore" aria-label="Explore restaurants">
          <ArrowDownToDot color="white" size={50} className="animate-bounce" />
        </Link>
      </div> */}

        <WaveDivider />

        {/* Explore Section */}
        <section id="explore" className="relative pt-20 pb-20 min-h-[700px] bg-[#f4f1e9] backdrop-blur-lg rounded-t-xl  ">
          <div className="max-w-6xl mx-auto overflow-hidden flex flex-col items-center justify-center ">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
              Featured Restaurants
            </h2>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 ${scrollY >= CARDS_APPEARANCE_THRESHOLD ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
              <div className={getCardClasses(0) + `${scrollY >= CARDS_APPEARANCE_THRESHOLD ? "motion-translate-x-in-[121%] motion-translate-y-in-[-47%]" : "opacity-0"} transition-opacity duration-300`}>
                <img
                  src="https://placehold.co/600x400/FFF/000?text=Restaurant+1"
                  alt="Placeholder for Gourmet Grills"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Gourmet Grills</h3>
                  <p className="text-gray-600 mb-4">A modern twist on classic comfort food.</p>
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} fill="currentColor" stroke="none" />
                    <span className="ml-1 font-semibold text-gray-800">4.8</span>
                    <span className="text-sm text-gray-500 ml-2">(2,500 ratings)</span>
                  </div>
                </div>
              </div>
              <div className={getCardClasses(1) + `${scrollY >= CARDS_APPEARANCE_THRESHOLD ? "motion-translate-x-in-[128%] motion-translate-y-in-[139%]" : "opacity-0"} transition-opacity duration-300`}>
                <img
                  src="https://placehold.co/600x400/FFF/000?text=Restaurant+2"
                  alt="Placeholder for Spicy Spoon"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Spicy Spoon</h3>
                  <p className="text-gray-600 mb-4">Authentic and fiery international cuisine.</p>
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} fill="currentColor" stroke="none" />
                    <span className="ml-1 font-semibold text-gray-800">4.5</span>
                    <span className="text-sm text-gray-500 ml-2">(1,800 ratings)</span>
                  </div>
                </div>
              </div>
              <div className={getCardClasses(2) + `${scrollY >= CARDS_APPEARANCE_THRESHOLD ? "motion-translate-x-in-[121%] motion-translate-y-in-[-47%]" : "opacity-0"} transition-opacity duration-300`}>
                <img
                  src="https://placehold.co/600x400/FFF/000?text=Restaurant+3"
                  alt="Placeholder for The Vegan Corner"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">The Vegan Corner</h3>
                  <p className="text-gray-600 mb-4">Fresh, plant-based meals crafted with care.</p>
                  <div className="flex items-center text-yellow-500">
                    <Star size={16} fill="currentColor" stroke="none" />
                    <span className="ml-1 font-semibold text-gray-800">4.9</span>
                    <span className="text-sm text-gray-500 ml-2">(3,100 ratings)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AnimatedCircles />

        </section>

        {/* Parallax Section */}
        <ParallaxBackground backgroundImage="src/assets/images/p.png" />

        {/* Rotating Images Container */}
        <div className={`overflow-hidden border-2 h-[800px] bg-[#f4f1e9] relative bg-cover bg-center hidden md:block w-${width} z-0`} >
          {/* First Rotating Wheel */}
          <div
            className=" border-separate border-2  p-5 m-5 gap-44 flex flex-col origin-center transition-transform duration-1000 bg-[#d2b48c]  absolute md:-left-[595px] md:-top-[55px] rounded-full z-10"
            style={{ transform: `rotate(${rotate}deg)` }}
          >
            <div className="flex justify-between gap-x-44 z-50">
              <img
                src={foodImages[0]}
                alt="Food Image 1"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
              <img
                src={foodImages[1]}
                alt="Food Image 2"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
            </div>
            <div className="flex justify-between gap-44 z-50">
              <img
                src={foodImages[2]}
                alt="Food Image 3"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
              <img
                src={foodImages[3]}
                alt="Food Image 4"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
            </div>
          </div>
          <div className="flex self-center justify-self-center md:translate-y-20 p-14 -z-500 ">

            <AllFoods />
          </div>
          {/* Second Rotating Wheel (reversed order for effect) */}
          <div
            className="z-0 border-separate p-5 m-5 gap-44 flex flex-col origin-center transition-transform duration-1000 bg-[#d2b48c] absolute md:-right-[595px] md:-top-[55px] rounded-full"
            style={{ transform: `rotate(${rotate}deg)` }}
          >
            <div className="flex justify-between gap-44">
              <img
                src={foodImages[3]}
                alt="Food Image 4"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3z  "
              />
              <img
                src={foodImages[2]}
                alt="Food Image 3"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
            </div>
            <div className="flex justify-between gap-x-44">
              <img
                src={foodImages[1]}
                alt="Food Image 2"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
              <img
                src={foodImages[0]}
                alt="Food Image 1"
                className="rotate-180 h-[300px] w-[300px] object-cover transition-all duration-530 m-3"
              />
            </div>
          </div>

        </div>
        <ParallaxBackground backgroundImage="src/assets/images/p.png" />

        {/* About / Why Gebeታ Section */}
        <section id="about" className="relative py-16 bg-[#f4f1e9] overflow-hidden z-50">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#f4f1e9] to-[#f8f6f0] blur-3xl opacity-70" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-gradient-to-br from-[#f1d59b] to-[#e0cda9] blur-3xl opacity-60" />

          <div className="relative max-w-6xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                <span className="bg-gradient-to-r from-[#905618] via-[#b8691e] to-[#905618] bg-clip-text text-transparent">
                  Why order with Gebeታ?
                </span>
              </h2>
              <p className="mt-4 text-[#6b5b4b] text-lg leading-relaxed">
                From the first tap to the last bite, we make food discovery simple and delightful.
                Explore top-rated spots, search your cravings, and reorder your favorites in seconds.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3d2e22]/90 px-5 py-2 text-white text-sm shadow-md">
                Curated picks daily
                <span className="inline-block h-2 w-2 rounded-full bg-[#2aa541]" />
                <span className="text-white/80">Fast & easy</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {/* Card 1 */}
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-[#e0cda9] to-[#f1d59b] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-white rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#905618] to-[#b8691e] flex items-center justify-center text-white shadow-md">
                      <Search size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-[#3d2e22]">Search your cravings</h3>
                  </div>
                  <p className="mt-3 text-[#6b5b4b]">
                    Find dishes, cuisines, or restaurants near you with a quick search.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-[#e0cda9] to-[#f1d59b] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-white rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#905618] to-[#b8691e] flex items-center justify-center text-white shadow-md">
                      <Star size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-[#3d2e22]">Top-rated picks</h3>
                  </div>
                  <p className="mt-3 text-[#6b5b4b]">
                    Browse the community’s favorites and discover trending restaurants.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-[#e0cda9] to-[#f1d59b] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="bg-white rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#905618] to-[#b8691e] flex items-center justify-center text-white shadow-md">
                      <ArrowDownToDot size={20} />
                    </div>
                    <h3 className="font-semibold text-lg text-[#3d2e22]">Tap. Eat. Repeat.</h3>
                  </div>
                  <p className="mt-3 text-[#6b5b4b]">
                    Reorder your favorites effortlessly and keep meals as easy as a tap.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#905618] to-[#b8691e] px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Explore Restaurants
              </Link>
            </div>
          </div>

        </section>

        {/* Footer */}

        <footer className="bg-[#1b1b1b] text-gray-300">
          {/* Accent bar */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#905618] via-[#b8691e] to-[#905618] opacity-60" />
          <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
            {/* Newsletter / CTA */}
           
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Link to="/" className="flex items-center gap-2">
                  <img
                    src="https://res.cloudinary.com/drinuph9d/image/upload/v1761897257/food_images/food_1761897256388_logo.png"
                    alt="Gebeታ logo"
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="font-logo text-2xl text-white">Gebeታ</span>
                </Link>
                <p className="mt-4 text-sm text-gray-400">
                  Discover local flavors, top-rated restaurants, and quick reorders — all in one place.
                </p>
                {/* Contact Info */}
                <div className="mt-6">
                  <h5 className="text-white font-medium mb-2 text-sm">Contact Info</h5>
                  <p className="text-xs text-gray-400 mb-1">Addis Ababa, Ethiopia<br />Kera, Bulgaira</p>
                  <p className="text-xs text-gray-400 mb-1">+251 919 444 499</p>
                  <p className="text-xs text-gray-400">
                    <a href="mailto:info@gebeta-tech.com" className="hover:text-white transition-colors">
                      info@gebeta-tech.com
                    </a>
                  </p>
                </div>
                {/* Social Media Links */}
                <div className="mt-6">
                  <h5 className="text-white font-medium mb-3 text-sm">Follow Us</h5>
                  <div className="flex space-x-3">
                    <a href="https://www.instagram.com/gebeta" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors">
                      {/* <Instagram size={18} /> */}
                    </a>
                    <a href="https://www.linkedin.com/company/gebeta" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077B5] transition-colors">
                      {/* <Linkedin size={18} /> */}
                    </a>
                    <a href="https://www.tiktok.com/@gebeta" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#000000] transition-colors">
                      {/* <Tiktok size={18} /> */}
                    </a>
                    <a href="https://twitter.com/gebeta" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2] transition-colors">
                      {/* <Twitter size={18} /> */}
                    </a>
                    <a href="https://www.facebook.com/gebeta" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2] transition-colors">
                      {/* <Facebook size={18} /> */}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Explore</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#explore" className="hover:text-white transition-colors">Featured Restaurants</a>
                  </li>
                  <li>
                    <Link to="/restaurants" className="hover:text-white transition-colors">All Restaurants</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#about" className="hover:text-white transition-colors">About</a>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-white transition-colors">Partner Login</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Get Started</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="hover:text-white transition-colors"
                    >
                      Back to top
                    </button>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-white transition-colors">Login</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Gebeታ. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;