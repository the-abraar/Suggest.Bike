import React, { useState } from 'react';
import { Scale, Ruler, Gauge, Info, ChevronDown, Bike, Zap, Activity } from 'lucide-react';

const BIKES_DATA = [
  {
    id: "xpulse-200-4v-pro",
    name: "Hero XPulse 200 4V Pro",
    brand: "Hero",
    engine: "199.6 cc",
    type: "Dual-Sport / Adventure",
    seatHeight: "850 mm",
    weight: "161 kg",
    notes: "The front feels very light. When adding weight to the back with a pillion or luggage, the front end can 'belly dance' with stability issues and wobbles, often requiring two hands on the bars instead of one.",
    image: "https://images.unsplash.com/photo-1620038865615-5e6ebfb58572?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "rx100",
    name: "Yamaha RX100",
    brand: "Yamaha",
    engine: "98 cc",
    type: "Classic 2-Stroke Commuter",
    seatHeight: "765 mm",
    weight: "103 kg",
    notes: "Classic two-stroke commuter, known for quick acceleration and rebuilt engines. A legendary machine in the BD market with a cult following.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "rxs115",
    name: "Yamaha RXS115",
    brand: "Yamaha",
    engine: "115 cc",
    type: "Classic 2-Stroke Commuter",
    seatHeight: "780 mm",
    weight: "106 kg",
    notes: "Classic two-stroke workhorse. Offers slightly more displacement and torque compared to the RX100, maintaining that signature raw power delivery.",
    image: "https://images.unsplash.com/photo-1449426468159-d96a18cb00f0?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "cg125",
    name: "Honda CG125",
    brand: "Honda",
    engine: "124 cc",
    type: "Standard Commuter",
    seatHeight: "767 mm",
    weight: "113 kg",
    notes: "Reliable, classic workhorse. Bulletproof simple OHV engine architecture, and a staple for classic commuting globally. Known for lasting decades with minimal maintenance.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800"
  }
];

export default function App() {
  const [bike1Id, setBike1Id] = useState("xpulse-200-4v-pro");
  const [bike2Id, setBike2Id] = useState("rx100");

  const bike1 = BIKES_DATA.find(b => b.id === bike1Id);
  const bike2 = BIKES_DATA.find(b => b.id === bike2Id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-emerald-500/30">
      
      {}
      <header className="bg-zinc-900 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-900/50">
              <Zap size={24} className="text-zinc-50 fill-zinc-50" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">BD Moto<span className="text-emerald-500">Compare</span></h1>
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Bangladesh Edition</p>
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight sm:text-4xl">
            Head-to-Head Comparison
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Select two models below to compare specs, dimensions, and real-world riding dynamics tailored for BD roads.
          </p>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <BikeSelector 
            label="Select First Bike" 
            selectedId={bike1Id} 
            onChange={setBike1Id} 
            excludeId={bike2Id} 
          />
          <BikeSelector 
            label="Select Second Bike" 
            selectedId={bike2Id} 
            onChange={setBike2Id} 
            excludeId={bike1Id} 
          />
        </div>

        {}
        <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
          
          {/* Visual Headers */}
          <div className="grid grid-cols-2 divide-x divide-zinc-800 bg-zinc-900/50">
            <BikeHeader bike={bike1} />
            <BikeHeader bike={bike2} />
          </div>

          {/* Specs Table */}
          <div className="divide-y divide-zinc-800 border-t border-zinc-800">
            
            <ComparisonRow 
              icon={<Gauge size={20} className="text-emerald-400" />}
              title="Engine"
              val1={bike1?.engine}
              val2={bike2?.engine}
            />

            <ComparisonRow 
              icon={<Bike size={20} className="text-blue-400" />}
              title="Type"
              val1={bike1?.type}
              val2={bike2?.type}
            />

            <ComparisonRow 
              icon={<Ruler size={20} className="text-amber-400" />}
              title="Seat Height"
              val1={bike1?.seatHeight}
              val2={bike2?.seatHeight}
            />

            <ComparisonRow 
              icon={<Scale size={20} className="text-rose-400" />}
              title="Weight"
              val1={bike1?.weight}
              val2={bike2?.weight}
            />

            <ComparisonRow 
              icon={<Activity size={20} className="text-indigo-400" />}
              title="Riding Dynamics"
              val1={bike1?.notes}
              val2={bike2?.notes}
              isTextHeavy={true}
            />

          </div>
        </div>

      </main>

      {}
      <footer className="bg-zinc-900 mt-16 py-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-500">
          <p>© {new Date().getFullYear()} BD MotoCompare. Precision data for riders.</p>
        </div>
      </footer>
    </div>
  );
}

function BikeSelector({ label, selectedId, onChange, excludeId }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-xl shadow-lg border border-zinc-800">
      <label className="block text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-4 pr-10 py-3 text-base font-medium border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-lg appearance-none cursor-pointer transition-colors hover:bg-zinc-700"
        >
          {BIKES_DATA.map((bike) => (
            <option key={bike.id} value={bike.id} disabled={bike.id === excludeId} className="bg-zinc-800">
              {bike.brand} {bike.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-500">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}

function BikeHeader({ bike }) {
  if (!bike) return <div className="p-6 text-center text-zinc-600">Select a bike</div>;
  
  return (
    <div className="p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-transparent pointer-events-none" />
      <div className="w-full max-w-[240px] aspect-[4/3] rounded-xl overflow-hidden bg-zinc-800 mb-6 shadow-2xl relative group border border-zinc-700/50">
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10" />
         <img 
           src={bike.image} 
           alt={bike.name} 
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100"
         />
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">
        {bike.brand}
      </span>
      <h3 className="text-xl md:text-2xl font-bold text-zinc-100 leading-tight">
        {bike.name}
      </h3>
    </div>
  );
}

function ComparisonRow({ icon, title, val1, val2, isTextHeavy = false }) {
  return (
    <div className="flex flex-col md:flex-row hover:bg-zinc-800/50 transition-colors group">
      {/* Mobile Title */}
      <div className="md:hidden flex items-center gap-3 p-4 pb-2 bg-zinc-800/30 font-semibold text-zinc-300 border-b border-zinc-800/50">
        <div className="p-1.5 bg-zinc-800 rounded-md">
          {icon}
        </div>
        <span>{title}</span>
      </div>
      
      {/* Left Side (val1) */}
      <div className="flex-1 p-5 md:p-6 text-zinc-300">
        <div className={`text-sm md:text-base ${isTextHeavy ? 'leading-relaxed text-zinc-400 text-left' : 'font-medium text-left md:text-right text-zinc-200'}`}>
          {val1 || '-'}
        </div>
      </div>

      {/* Desktop Title (Center Divider) */}
      <div className="hidden md:flex flex-col items-center justify-center w-40 py-6 bg-zinc-900 border-x border-zinc-800 relative z-10">
        <div className="p-3 bg-zinc-800 rounded-xl shadow-inner border border-zinc-700/50 mb-3 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center px-2">
          {title}
        </span>
      </div>

      {/* Right Side (val2) */}
      <div className="flex-1 p-5 md:p-6 text-zinc-300 border-t border-zinc-800 md:border-t-0">
        <div className={`text-sm md:text-base ${isTextHeavy ? 'leading-relaxed text-zinc-400 text-left' : 'font-medium text-left md:text-left text-zinc-200'}`}>
          {val2 || '-'}
        </div>
      </div>
    </div>
  );
}