"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Filter,
  X,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { staggerContainer, riseItem, springSoft } from "./motion";

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  rating: number;
  image: string;
  desc: string;
};

const categories = [
  "All",
  "Supplements",
  "Nutrition",
  "Performance Gear",
  "Accessories",
  "Digital Blueprints",
];

// A complete, highly relevant health & fitness product ecosystem
const products: Product[] = [
  // --- SUPPLEMENTS ---
  {
    id: "sup_1",
    name: "Bio-Available Whey Isolate",
    category: "Supplements",
    price: "₹3,499",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600&auto=format&fit=crop",
    desc: "Pure micro-filtered protein isolate optimized for rapid metabolic absorption and lean muscle tissue restoration loops.",
  },
  {
    id: "sup_2",
    name: "Omega-3 Ultra Refined Matrix",
    category: "Supplements",
    price: "₹1,249",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=600&auto=format&fit=crop",
    desc: "High-density EPA/DHA molecularly distilled neural support capsules engineered to minimize cellular inflammation.",
  },
  {
    id: "sup_3",
    name: "Micronized Creatine Pure",
    category: "Supplements",
    price: "₹1,199",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=600&auto=format&fit=crop",
    desc: "100% pure micronized creatine monohydrate to optimize ATP recycling dynamics and high-intensity cellular power output.",
  },

  // --- NUTRITION ---
  {
    id: "nut_1",
    name: "Organic Micronutrient Greens Mix",
    category: "Nutrition",
    price: "₹1,899",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1515023115689-589c33041d3c?q=80&w=600&auto=format&fit=crop",
    desc: "Cold-pressed whole food matrix delivering raw phytonutrients to stabilize glycemic health and counter oxidative stress.",
  },
  {
    id: "nut_2",
    name: "Advanced Electrolyte Hydration",
    category: "Nutrition",
    price: "₹799",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=600&auto=format&fit=crop",
    desc: "Zero-sugar hypotonic hydration mineral blend packed with chelated magnesium, sodium, and potassium blocks.",
  },
  {
    id: "nut_3",
    name: "Premium Raw Superfood Seed Mix",
    category: "Nutrition",
    price: "₹549",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1511117496863-70929a4f88e3?q=80&w=600&auto=format&fit=crop",
    desc: "Raw organic chia, flax, and pumpkin seed blend optimized for healthy essential fatty acid intake and digestive fiber tracks.",
  },

  // --- PERFORMANCE GEAR ---
  {
    id: "gear_1",
    name: "Advanced Kinetic Smart Band",
    category: "Performance Gear",
    price: "₹5,999",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=600&auto=format&fit=crop",
    desc: "High-precision telemetry band equipped with automated step-count trackers, continuous heart variability maps, and sleep syncing.",
  },
  {
    id: "gear_2",
    name: "Heavy-Duty Resistance Bands Stack",
    category: "Performance Gear",
    price: "₹1,499",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    desc: "Anti-snap premium latex resistance vectors with modular steel clipping joints for home-based hypertrophy training.",
  },
  {
    id: "gear_3",
    name: "High-Density Grid Foam Roller",
    category: "Performance Gear",
    price: "₹999",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?q=80&w=600&auto=format&fit=crop",
    desc: "Multi-density targeted surface patterns designed to clear myofascial restrictions and maximize target deep tissue blood circulation.",
  },

  // --- ACCESSORIES ---
  {
    id: "acc_1",
    name: "NutriFit Smart Shaker Pro",
    category: "Accessories",
    price: "₹849",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?q=80&w=600&auto=format&fit=crop",
    desc: "BPA-free leak-proof kinetic shaker with integrated pill anchors and auxiliary powder alignment compartments.",
  },
  {
    id: "acc_2",
    name: "Ultra-Grip Eco-Rubber Mat",
    category: "Accessories",
    price: "₹2,199",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1592417817098-8f3d6eb18865?q=80&w=600&auto=format&fit=crop",
    desc: "6mm high-density non-slip natural rubber cushioning base engineered for joint support during anti-rotation core sequences.",
  },
  {
    id: "acc_3",
    name: "Ergonomic Weightlifting Gloves",
    category: "Accessories",
    price: "₹699",
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
    desc: "Reinforced leather palms with integrated elastic hook-and-loop wrist straps for structural safety under heavy loads.",
  },

  // --- DIGITAL BLUEPRINTS ---
  {
    id: "blue_1",
    name: "60-Day Muscle Hypertrophy Matrix",
    category: "Digital Blueprints",
    price: "₹1,499",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
    desc: "A progressive volume load architecture blueprint focusing on mechanical tension pathways and athletic hypertrophy adaptation.",
  },
  {
    id: "blue_2",
    name: "Metabolic Control Optimization Guide",
    category: "Digital Blueprints",
    price: "₹999",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop",
    desc: "Advanced nutrition and insulin-stabilization programming tailored directly for low-glycemic management and metabolic resets.",
  },
];

export default function WellnessStoreTab() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-8 text-slate-800">
      {/* 1. TOP MARKETPLACE MARKETING BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="nf-premium rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        {/* Aurora wash overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" />

        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            transition={springSoft}
            className="p-3.5 bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/10"
          >
            <ShoppingBag size={26} />
          </motion.div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">
              <span className="nf-text-aurora">Wellness Store Marketplace</span>
            </h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">
              Premium Biometric Enhancers & Fueling Pipelines
            </p>
          </div>
        </div>

        {/* Real-time Shopping Cart Count Badge */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={springSoft}
          className="relative flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 nf-ring-glow"
        >
          <ShoppingCart size={16} className="text-teal-400" />
          <span>
            Cart Manifest:{" "}
            <AnimatedNumber
              value={cartCount}
              className="font-mono font-black text-emerald-400"
            />{" "}
            items
          </span>
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springSoft}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-[10px] font-black text-white flex items-center justify-center shadow-md shadow-emerald-500/40"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* 2. CATEGORY SEGMENTATION FILTERS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 border-b border-slate-200/60 pb-5"
      >
        <div className="text-slate-400 p-1.5 shrink-0 flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
          <Filter size={14} /> Segment:
        </div>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={springSoft}
              className={`relative px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide cursor-pointer border transition-colors ${
                isActive
                  ? "text-white border-transparent"
                  : "bg-white/60 backdrop-blur-md border-slate-200/80 text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeStoreCategory"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-teal-500/30 nf-ring-glow"
                />
              )}
              <span className="relative z-10">{cat}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* 3. DYNAMIC PRODUCTS ARCHITECTURE GRID */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={riseItem}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            transition={springSoft}
            onClick={() => setSelectedProduct(product)}
            className="nf-premium rounded-3xl overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            {/* Image Wrap */}
            <div className="relative h-52 overflow-hidden bg-slate-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* gradient veil for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
              <span className="absolute top-3 left-3 bg-white/85 backdrop-blur-md border border-white/60 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-slate-600 shadow-sm">
                {product.category}
              </span>
            </div>

            {/* Product Meta */}
            <div className="p-6 space-y-3 flex-1">
              <div className="flex justify-between items-start gap-3">
                <h4 className="text-lg font-black text-slate-800 tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-100/60 px-2 py-0.5 rounded-md shrink-0">
                  <Star size={12} className="fill-amber-500" />
                  <span className="text-xs font-mono font-black">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-3">
                {product.desc}
              </p>
            </div>

            {/* Price & Checkout Action Strip */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4 bg-gradient-to-t from-slate-50/50 to-transparent">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Pricing Matrix
                </span>
                <span className="text-lg font-mono font-black text-slate-900">
                  {product.price}
                </span>
              </div>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setCartCount((prev) => prev + 1);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springSoft}
                className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 hover:from-cyan-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-slate-900/20 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Deploy to Cart</span>
                <ArrowRight size={12} />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 4. PRODUCT DETAILS LIGHTBOX EXPANSION OVERLAY */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="nf-premium rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              <motion.button
                onClick={() => setSelectedProduct(null)}
                whileHover={{ rotate: 90, scale: 1.05 }}
                transition={springSoft}
                className="absolute top-4 right-4 bg-white/85 backdrop-blur-md text-slate-500 hover:text-slate-800 p-2 rounded-full border border-white/60 shadow-md z-10 cursor-pointer"
              >
                <X size={16} />
              </motion.button>

              <div className="h-56 bg-slate-100 overflow-hidden">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100/50">
                    {selectedProduct.category}
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
                    {selectedProduct.name}
                  </h4>
                </div>

                <p className="text-base text-slate-500 leading-relaxed font-medium">
                  {selectedProduct.desc}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Total cost
                    </span>
                    <span className="text-2xl font-mono font-black text-slate-900">
                      {selectedProduct.price}
                    </span>
                  </div>

                  <motion.button
                    onClick={() => {
                      setCartCount((prev) => prev + 1);
                      setSelectedProduct(null);
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springSoft}
                    className="nf-btn-gradient px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-teal-500/10 cursor-pointer"
                  >
                    Add To Basket
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
