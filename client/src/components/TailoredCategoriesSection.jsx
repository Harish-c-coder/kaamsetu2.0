import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Wrench,
  Scissors,
  PaintBucket,
  Paintbrush,
  Droplets,
  Wind,
  Bug,
  Armchair,
  Home,
  Bath,
  Utensils,
  Flower2,
  Bed,
  FileText,
  Crown,
  Leaf,
  Hammer,
  Package,
  Columns,
  Layers,
  Refrigerator,
  Snowflake,
  Fan,
} from 'lucide-react';

// Custom 3D-styled SVG Illustrations for the 6 Tailored Categories
const AcApplianceIllustration = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" fill="none">
    <rect x="18" y="22" width="84" height="42" rx="8" fill="url(#ac-grad)" stroke="#60A5FA" strokeWidth="1.5" />
    <rect x="24" y="52" width="72" height="6" rx="3" fill="#1E3A8A" />
    <circle cx="88" cy="32" r="3" fill="#38BDF8" />
    <rect x="76" y="30" width="10" height="5" rx="1.5" fill="#0284C7" />
    <path d="M30 70 C34 76, 38 78, 42 82" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    <path d="M48 70 C52 76, 56 78, 60 82" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    <path d="M66 70 C70 76, 74 78, 78 82" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    <defs>
      <linearGradient id="ac-grad" x1="18" y1="22" x2="102" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
  </svg>
);

const CleaningPestIllustration = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" fill="none">
    <ellipse cx="60" cy="74" rx="42" ry="14" fill="#FDE68A" />
    <ellipse cx="66" cy="50" rx="20" ry="16" fill="url(#vac-grad)" />
    <circle cx="70" cy="52" r="7" fill="#1F2937" stroke="#9CA3AF" strokeWidth="2" />
    <circle cx="70" cy="52" r="3" fill="#E5E7EB" />
    <path d="M50 46 C38 42, 32 30, 46 22 C52 18, 54 26, 44 42" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
    <path d="M44 42 L34 72" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
    <polygon points="26,74 42,74 38,68 30,68" fill="#111827" />
    <defs>
      <linearGradient id="vac-grad" x1="46" y1="34" x2="86" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F87171" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
    </defs>
  </svg>
);

const WomensSalonIllustration = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" fill="none">
    <circle cx="68" cy="22" r="12" fill="#3E2723" />
    <ellipse cx="60" cy="45" rx="20" ry="24" fill="#FBCFE8" />
    <path d="M42 34 C44 22, 70 20, 76 34 C74 44, 76 50, 80 54" stroke="#3E2723" strokeWidth="6" strokeLinecap="round" />
    <path d="M48 38 C54 36, 68 36, 72 40 C75 50, 72 60, 60 64 C48 60, 45 50, 48 38 Z" fill="#8D6E63" opacity="0.9" />
    <ellipse cx="54" cy="45" rx="3.5" ry="2" fill="#FBCFE8" />
    <ellipse cx="66" cy="45" rx="3.5" ry="2" fill="#FBCFE8" />
    <rect x="80" y="58" width="18" height="18" rx="4" fill="url(#pink-grad)" stroke="#EC4899" strokeWidth="1.5" />
    <rect x="78" y="54" width="22" height="6" rx="3" fill="#F472B6" />
    <defs>
      <linearGradient id="pink-grad" x1="80" y1="58" x2="98" y2="76" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F472B6" />
        <stop offset="1" stopColor="#DB2777" />
      </linearGradient>
    </defs>
  </svg>
);

const MensSalonIllustration = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" fill="none">
    <rect x="52" y="66" width="16" height="14" fill="#FED7AA" />
    <ellipse cx="60" cy="44" rx="22" ry="24" fill="#FED7AA" />
    <path d="M38 36 C42 18, 76 18, 82 32 C82 44, 82 50, 84 56" stroke="#292524" strokeWidth="7" strokeLinecap="round" />
    <path d="M42 46 C40 64, 48 74, 60 76 C72 74, 80 64, 78 46 C74 54, 68 58, 60 58 C52 58, 46 54, 42 46 Z" fill="#292524" />
    <path d="M52 52 Q60 55 68 52" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="88" cy="72" rx="14" ry="8" fill="#818CF8" />
    <ellipse cx="88" cy="69" rx="11" ry="5" fill="#FFFFFF" />
  </svg>
);

const ElectricianPlumberIllustration = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" fill="none">
    <circle cx="82" cy="72" r="14" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
    <circle cx="82" cy="72" r="6" fill="#F59E0B" />
    <path d="M82 86 L56 86" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
    <rect x="42" y="32" width="46" height="24" rx="6" fill="url(#drill-grad)" stroke="#EA580C" strokeWidth="1.5" />
    <rect x="28" y="39" width="14" height="10" rx="2" fill="#475569" />
    <polygon points="18,44 28,41 28,47" fill="#94A3B8" />
    <rect x="62" y="52" width="16" height="24" rx="4" fill="#1E293B" />
    <rect x="58" y="74" width="24" height="8" rx="3" fill="#EA580C" />
    <defs>
      <linearGradient id="drill-grad" x1="42" y1="32" x2="88" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FB923C" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
    </defs>
  </svg>
);

const PaintingWallIllustration = () => (
  <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-20 drop-shadow-md" fill="none">
    <rect x="28" y="36" width="34" height="42" rx="6" fill="url(#paint-grad)" stroke="#6366F1" strokeWidth="1.5" />
    <ellipse cx="45" cy="36" rx="17" ry="5" fill="#818CF8" />
    <ellipse cx="45" cy="40" rx="14" ry="4" fill="#4338CA" />
    <path d="M28 42 C16 30, 74 30, 62 42" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
    <rect x="66" y="44" width="38" height="16" rx="4" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
    <path d="M85 60 L85 78 C85 82, 88 84, 92 84 L96 84" stroke="#475569" strokeWidth="3" strokeLinecap="round" fill="none" />
    <rect x="94" y="80" width="14" height="8" rx="2" fill="#78350F" />
    <defs>
      <linearGradient id="paint-grad" x1="28" y1="36" x2="62" y2="78" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A5B4FC" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
    </defs>
  </svg>
);

export default function TailoredCategoriesSection() {
  const navigate = useNavigate();

  // The 6 Primary Tailored Category Cards (Direct 1:1 match with Image 1)
  const tailoredCategories = [
    {
      id: 'ac_appliance',
      title: 'AC & Appliance Repair',
      categoryQuery: 'AC Repair & Appliance',
      Illustration: AcApplianceIllustration,
    },
    {
      id: 'cleaning_pest',
      title: 'Cleaning & Pest Control',
      categoryQuery: 'Cleaning & Maid',
      Illustration: CleaningPestIllustration,
    },
    {
      id: 'womens_salon',
      title: "Women's Salon, Spa & Laser Clinic",
      categoryQuery: 'Salon & Beautician',
      Illustration: WomensSalonIllustration,
    },
    {
      id: 'mens_salon',
      title: "Men's Salon & Massage",
      categoryQuery: 'Salon & Beautician',
      Illustration: MensSalonIllustration,
    },
    {
      id: 'electrician_plumber',
      title: 'Electrician, Plumber & Carpenter',
      categoryQuery: 'Electrician',
      Illustration: ElectricianPlumberIllustration,
    },
    {
      id: 'painting_waterproofing',
      title: 'Painting, Waterproofing & Wall Panels',
      categoryQuery: 'Painter',
      Illustration: PaintingWallIllustration,
    },
  ];

  // Detailed Explore Catalog Data with Distinct Icons (Direct 1:1 match with Images 2, 3, 5)
  const exploreDirectories = [
    {
      id: 'ac_explore',
      title: 'Explore AC Appliance & Repair',
      desc: "When it comes to AC & Appliance Repair, KaamSetu is the name you can rely on. Whether you're dealing with a water purifier that's not dispensing clean water, a refrigerator that's not cooling efficiently, or any other appliance issue, our skilled technicians are here to help. From AC repair to washing machine repair, air cooler repair to geyser repair, we offer comprehensive solutions to keep your home appliances running smoothly. Schedule your repair service today!",
      items: [
        { name: 'Refrigerator Video Consult Near Me', search: 'Refrigerator Repair', icon: Refrigerator, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
        { name: 'AC Service And Repair Near Me', search: 'AC Service and Repair', icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
        { name: 'Native Water Purifier Near Me', search: 'Water Purifier', icon: Droplets, color: 'text-teal-400', bg: 'bg-teal-500/15 border-teal-500/30', badge: 'New' },
        { name: 'Water Purifier Service & Installation Near Me', search: 'Water Purifier Installation', icon: Wrench, color: 'text-sky-400', bg: 'bg-sky-500/15 border-sky-500/30' },
        { name: 'Air Cooler Service & Repair Near Me', search: 'Air Cooler Repair', icon: Fan, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' },
      ],
    },
    {
      id: 'cleaning_explore',
      title: 'Explore Cleaning, Pest Control',
      desc: 'KaamSetu is your trusted partner for comprehensive cleaning and pest control solutions. Safeguard your home with our effective pest control services near me, including specialized termite control. Also, elevate the cleanliness of your living spaces with our professional sofa cleaning services, ensuring a fresh and hygienic environment for your family. With our full house cleaning services, we ensure every corner of your home is clean and hygienic.',
      items: [
        { name: 'Ants & Bed Bugs Control Near Me', search: 'Bed Bugs Pest Control', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
        { name: 'Sofa & Carpet Cleaning Near Me', search: 'Sofa Carpet Cleaning', icon: Armchair, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
        { name: 'Full Home/ By Room Cleaning Near Me', search: 'Full Home Cleaning', icon: Home, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
        { name: 'Bathroom & Kitchen Cleaning Near Me', search: 'Kitchen Cleaning', icon: Utensils, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
        { name: 'Bathroom Cleaning Near Me', search: 'Bathroom Cleaning', icon: Bath, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
      ],
    },
    {
      id: 'womens_explore',
      title: "Explore Women's Salon, Spa & Laser Clinic",
      desc: "Experience the epitome of luxury at KaamSetu's Women's Salon, Spa, and Laser Clinic. Let our skilled aestheticians and stylists enhance your natural beauty with meticulous waxing services, revitalizing facials, and impeccable nail art. Rejuvenate your mind and body with a soothing massage or invigorating spa treatment. Treat yourself to the ultimate indulgence at KaamSetu's Women's Salon, Spa, and Laser Clinic.",
      items: [
        { name: 'Spa Prime & Ayurveda Near Me', search: 'Spa Ayurveda', icon: Flower2, color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/30' },
        { name: 'Spa Ayurveda Near Me', search: 'Ayurveda Spa', icon: Bed, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' },
        { name: 'Hydraderma Facials & Treatments Near Me', search: 'Hydraderma Facial', icon: FileText, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/15 border-fuchsia-500/30' },
        { name: 'Spa Luxe Near Me', search: 'Spa Luxe', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
        { name: 'Salon Prime Near Me', search: 'Salon Prime', icon: Scissors, color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/30' },
        { name: 'Hair Studio For Women Near Me', search: 'Hair Studio', icon: Wind, color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30' },
        { name: 'Salon Luxe Near Me', search: 'Salon Luxe', icon: Crown, color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/30' },
      ],
    },
    {
      id: 'mens_explore',
      title: "Explore Men's Salon & Massage",
      desc: "Discover the ultimate sanctuary for men's grooming and relaxation at KaamSetu's Men's Salon and Massage. Treat yourself to a blissful body massage near me, expertly performed to release tension and promote deep relaxation. Whether you're in need of a stylish haircut or a quick touch-up, our experienced barbers are here to deliver exceptional results. Experience the epitome of masculine luxury at KaamSetu's Men's Salon and Massage.",
      items: [
        { name: 'Salon Royale Near Me', search: 'Salon Royale', icon: Scissors, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
        { name: 'Massage For Men Near Me', search: 'Massage For Men', icon: Bed, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' },
        { name: 'Massage For Men Royale Near Me', search: 'Massage Royale', icon: Crown, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
        { name: 'Massage For Men Ayurveda Near Me', search: 'Ayurveda Massage Men', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
      ],
    },
    {
      id: 'trades_explore',
      title: 'Explore Electricians, Plumbers, Carpenters',
      desc: 'KaamSetu offers a range of household services, including Electrician, Plumber, and Carpenter solutions. Whether you’re seeking an electrician near you for electrical repairs or installations, the best plumbers near you for plumbing solutions, or carpenters for furniture assembly, we have you covered. Our skilled professionals are committed to delivering top-class services to our customers.',
      items: [
        { name: 'Electrician Near Me', search: 'Electrician', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
        { name: 'Carpenter Near Me', search: 'Carpenter', icon: Hammer, color: 'text-yellow-500', bg: 'bg-yellow-500/15 border-yellow-500/30' },
        { name: 'Plumber Near Me', search: 'Plumber', icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
        { name: 'Furniture Assembly Near Me', search: 'Furniture Assembly', icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
        { name: 'Carpenters Amazon Near Me', search: 'Carpenter', icon: Hammer, color: 'text-amber-500', bg: 'bg-amber-500/15 border-amber-500/30' },
      ],
    },
    {
      id: 'painting_explore',
      title: 'Explore Painting, Waterproofing, & Wallpanels',
      desc: 'Elevate your home’s aesthetic appeal with KaamSetu’s comprehensive painting, waterproofing, and wall panels services. From full home painting to partial home painting, our skilled painters deliver best results tailored to your preferences. Enhance the protection of your walls with our professional waterproofing solutions. Also, explore our stylish and versatile wall panels to add a touch of elegance.',
      items: [
        { name: 'Wall Panels By Revamp Near Me', search: 'Wall Panels', icon: Columns, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
        { name: 'Wall Panels Installation Near Me', search: 'Wall Panels Installation', icon: Layers, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
        { name: 'Full Home Painting Near Me', search: 'Full Home Painting', icon: PaintBucket, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' },
        { name: 'Rooms/ Walls Painting Near Me', search: 'Wall Painting', icon: Paintbrush, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
      ],
    },
  ];

  // Trending & Most Frequently Searched (Image 4)
  const trendingSearches = [
    { name: 'Laptop Repair Near Me', search: 'Laptop Repair', icon: '💻' },
    { name: 'Stove Service & Repair Near Me', search: 'Stove Service', icon: '🔥' },
    { name: 'Refrigerator Near Me', search: 'Refrigerator Repair', icon: '❄️' },
    { name: 'Air Purifier Near Me', search: 'Air Purifier', icon: '🍃' },
    { name: 'Television Repair Near Me', search: 'Television Repair', icon: '📺' },
    { name: 'Expert Counseling - Facials & Peels Near Me', search: 'Facials Peels', icon: '💆' },
    { name: 'Laser Doctor Consultation Near Me', search: 'Laser Clinic', icon: '🩺' },
    { name: 'Makeup, Saree & Styling Near Me', search: 'Bridal Styling', icon: '💄' },
  ];

  const mostFrequentlySearched = [
    { name: 'Microwave Repair Near Me', search: 'Microwave Repair', icon: '📻' },
    { name: 'Cockroach Control Near Me', search: 'Cockroach Pest Control', icon: '🪳' },
    { name: 'Weekly Bathroom Cleaning Near Me', search: 'Bathroom Cleaning', icon: '🚿' },
    { name: 'Washing Machine Repair Near Me', search: 'Washing Machine Repair', icon: '🧺' },
    { name: 'Kitchen Cleaning Near Me', search: 'Kitchen Cleaning', icon: '🍳' },
    { name: 'Chimney Repair Near Me', search: 'Chimney Repair', icon: '💨' },
    { name: 'Termite Control Near Me', search: 'Termite Control', icon: '🐜' },
    { name: 'Geyser Service & Repair Near Me', search: 'Geyser Repair', icon: '♨️' },
  ];

  const handleItemClick = (searchQuery, categoryQuery) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (categoryQuery) params.set('category', categoryQuery);
    navigate(`/customer/home?${params.toString()}`);
  };

  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-24">
      {/* ========================================================================= */}
      {/* 1. TAILORED SERVICES TO MEET YOUR NEEDS (Exact card matching Image 1)       */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#13191C] border border-white/[0.12] p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-[#F59E0B] text-xs font-mono font-bold mb-2 border border-amber-500/25">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Peer-to-Peer Booking</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#E0EBE9] tracking-tight">
              Tailored Services To Meet Your Needs
            </h2>
            <p className="text-xs sm:text-sm text-[#8E9EA2] mt-1">
              Select any category to explore verified local specialists in your neighborhood
            </p>
          </div>

          <Link
            to="/customer/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-[#E4ECEC] transition-all self-start sm:self-auto cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
          </Link>
        </div>

        {/* 6 Grid Cards Matching Image 1 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {tailoredCategories.map((cat) => {
            const IllustrationComp = cat.Illustration;
            return (
              <div
                key={cat.id}
                onClick={() => handleItemClick('', cat.categoryQuery)}
                className="group rounded-3xl p-5 sm:p-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-lg hover:shadow-2xl flex flex-col items-center text-center justify-between min-h-[170px] sm:min-h-[210px] transform hover:-translate-y-1"
              >
                {/* 3D Illustration Graphic */}
                <div className="w-full flex items-center justify-center p-2 rounded-2xl bg-white/[0.02] group-hover:scale-105 transition-transform duration-300">
                  <IllustrationComp />
                </div>

                {/* Category Title */}
                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#E0EBE9] group-hover:text-white transition-colors mt-3">
                  {cat.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPLORE DETAILED DIRECTORIES (Direct match with Images 2, 3, 5)          */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#E0EBE9]">
              Explore Services In-Depth
            </h3>
            <p className="text-xs sm:text-sm text-[#8E9EA2] mt-0.5">
              Transparent direct hourly and fixed rates for every home service
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exploreDirectories.map((dir) => (
            <div
              key={dir.id}
              className="p-6 rounded-3xl bg-[#13191C]/70 border border-white/[0.08] space-y-4 hover:border-white/[0.14] transition-colors"
            >
              <h4 className="text-lg font-heading font-bold text-[#E0EBE9]">
                {dir.title}
              </h4>
              <p className="text-xs text-[#8E9EA2] leading-relaxed line-clamp-3">
                {dir.desc}
              </p>

              {/* Sub-items List with Distinct Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-white/[0.06]">
                {dir.items.map((item, idx) => {
                  const ItemIcon = item.icon || Sparkles;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleItemClick(item.search, '')}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/[0.04] hover:border-white/15 transition-all text-left group cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg ${item.bg} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                        <ItemIcon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#E0EBE9] group-hover:text-white transition-colors truncate">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRENDING CATEGORIES & MOST FREQUENTLY SEARCHED (Direct match Image 4)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Trending Categories */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#13191C]/80 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h4 className="text-lg font-heading font-bold text-[#E0EBE9] flex items-center gap-2">
              <span>🔥 Trending Categories</span>
            </h4>
            <span className="text-[10px] font-mono text-amber-400 font-bold">Hyderabad Hits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {trendingSearches.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleItemClick(item.search, '')}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 transition-all text-left text-xs text-slate-300 hover:text-white group cursor-pointer"
              >
                <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="truncate font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Most Frequently Searched */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#13191C]/80 border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h4 className="text-lg font-heading font-bold text-[#E0EBE9] flex items-center gap-2">
              <span>⚡ Most Frequently Searched</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">15-Min Response</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {mostFrequentlySearched.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleItemClick(item.search, '')}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 transition-all text-left text-xs text-slate-300 hover:text-white group cursor-pointer"
              >
                <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="truncate font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
