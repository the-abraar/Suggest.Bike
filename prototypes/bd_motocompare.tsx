import React, { useState } from 'react';
import { Settings, Scale, Ruler, Gauge, Info, ChevronDown, Bike } from 'lucide-react';

const BIKES_DATA = [
  {
    id: "xpulse-200-4v-pro",
    name: "Hero XPulse 200 4V Pro",
    brand: "Hero",
    engine: "199.6 cc",
    seatHeight: "850 mm",
    weight: "161 kg",
    notes: "Excellent off-road capability with long-travel suspension. However, the front feels quite light, which can lead to 'belly dancing' stability issues or wobbles when loaded with a pillion or heavy luggage.",
    image: "https://images.unsplash.com/photo-1620038865615-5e6ebfb58572?auto=format&fit=crop&q=80&w=800" // Generic dual-sport placeholder
  },
  {
    id: "rx100",
    name: "Yamaha RX100",
    brand: "Yamaha",
    engine: "98 cc",
    seatHeight: "765 mm",
    weight: "103 kg",
    notes: "A legendary 2-stroke commuter with an exceptional power-to-weight ratio. Highly sought after by enthusiasts and collectors in BD for its raw acceleration and iconic exhaust note.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800" // Generic classic bike placeholder
  },
  {
    id: "cg125",
    name: "Honda CG125",
    brand: "Honda",
    engine: "124 cc",
    seatHeight: "767 mm",
    weight: "113 kg",
    notes: "Bulletproof reliability, simple OHV engine architecture, and a staple for classic commuting globally. Known for lasting decades with minimal maintenance.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800" // Generic classic commuter placeholder
  },
  {
    id: "rxs115",
    name: "Yamaha RXS115",
    brand: "Yamaha",
    engine: "115 cc",
    seatHeight: "780 mm",
    weight: "106 kg",
    notes: "A logical step up from the RX100, offering more torque and slightly larger displacement while retaining the classic lightweight 2-stroke charm.",
    image: "https://images.unsplash.com/photo-1449426468159-d96a18cb00f0?auto=format&fit=crop&q=80&w=800" // Generic retro bike placeholder
  },
  {
    id: "tenere-700",
    name: "Yamaha Tenere 700",
    brand: "Yamaha",
    engine: "689 cc",
    seatHeight: "875 mm",
    weight: "205 kg",
    notes: "A heavyweight adventure king (relative to standard BD bikes). Features minimalist electronics, highly capable off-road geometry, and the incredibly durable CP2 engine.",
    image: "https://images.unsplash.com/photo-1596703565017-d64e8e811c0f?auto=format&fit=crop&q=80&w=800" // Generic adventure bike placeholder
  }
];

export default function App() {
  const [bike1Id, setBike1Id] = useState("xpulse-200-4v-pro");
  const [bike2Id, setBike2Id] = useState("rx100");

  const bike1 = BIKES_DATA.find(b => b.id === bike1Id);
  const bike2 = BIKES_DATA.find(b => b.id === bike2Id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Bike size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BD MotoCompare</h1>
              <p className="text-xs text-slate-300 font-medium">Bangladesh Motorcycle Analytics</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Compare Motorcycles Side-by-Side
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-slate-500">
            Select two models below to compare their specifications, dimensions, and unique riding dynamics tailored for Bangladeshi road conditions.
          </p>
        </div>

        {/* Selection Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <BikeSelector 
            label="Select Bike 1" 
            selectedId={bike1Id} 
            onChange={setBike1Id} 
            excludeId={bike2Id} 
          />
          <BikeSelector 
            label="Select Bike 2" 
            selectedId={bike2Id} 
            onChange={setBike2Id} 
            excludeId={bike1Id} 
          />
        </div>

        {/* Comparison Board */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Visual Headers */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-100/50">
            <BikeHeader bike={bike1} />
            <BikeHeader bike={bike2} />
          </div>

          {}
          {/* Specs Table */}
          <div className="divide-y divide-slate-200">
            
            {/* Engine */}
            <ComparisonRow 
              icon={<Gauge size={20} className="text-blue-500" />}
              title="Engine Capacity"
              val1={bike1?.engine}
              val2={bike2?.engine}
            />

            {/* Seat Height */}
            <ComparisonRow 
              icon={<Ruler size={20} className="text-emerald-500" />}
              title="Seat Height"
              val1={bike1?.seatHeight}
              val2={bike2?.seatHeight}
            />

            {/* Kerb Weight */}
            <ComparisonRow 
              icon={<Scale size={20} className="text-amber-500" />}
              title="Kerb Weight"
              val1={bike1?.weight}
              val2={bike2?.weight}
            />

            {/* Notes / Dynamics */}
            <ComparisonRow 
              icon={<Info size={20} className="text-indigo-500" />}
              title="Riding Dynamics & Notes"
              val1={bike1?.notes}
              val2={bike2?.notes}
              isTextHeavy={true}
            />

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© {new Date().getFullYear()} BD MotoCompare. Data tailored for the Bangladesh riding community.</p>
        </div>
      </footer>
    </div>
  );
}

function BikeSelector({ label, selectedId, onChange, excludeId }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-3 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-lg appearance-none bg-slate-50 cursor-pointer"
        >
          {BIKES_DATA.map((bike) => (
            <option key={bike.id} value={bike.id} disabled={bike.id === excludeId}>
              {bike.brand} {bike.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

function BikeHeader({ bike }) {
  if (!bike) return <div className="p-6 text-center text-slate-400">Select a bike</div>;
  
  return (
    <div className="p-6 flex flex-col items-center text-center">
      <div className="w-full max-w-[200px] aspect-[4/3] rounded-lg overflow-hidden bg-slate-200 mb-4 shadow-inner relative group">
         {/* Using a subtle overlay to make it look nicer */}
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-10" />
         <img 
           src={bike.image} 
           alt={bike.name} 
           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
         />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
        {bike.brand}
      </span>
      <h3 className="text-xl font-bold text-slate-900 leading-tight">
        {bike.name}
      </h3>
    </div>
  );
}

function ComparisonRow({ icon, title, val1, val2, isTextHeavy = false }) {
  return (
    <div className="flex flex-col md:flex-row hover:bg-slate-50 transition-colors">
      {/* Mobile Title */}
      <div className="md:hidden flex items-center gap-2 p-4 pb-2 bg-slate-100/50 font-semibold text-slate-700">
        {icon} <span>{title}</span>
      </div>
      
      {/* Desktop Layout - Left Side (val1) */}
      <div className="flex-1 p-4 md:p-6 text-slate-800">
        <div className={`text-sm md:text-base ${isTextHeavy ? 'leading-relaxed text-slate-600 text-justify' : 'font-medium text-center md:text-right'}`}>
          {val1 || '-'}
        </div>
      </div>

      {/* Desktop Title (Center Divider) */}
      <div className="hidden md:flex flex-col items-center justify-center w-48 py-6 bg-slate-50 border-x border-slate-200 shadow-sm relative z-10">
        <div className="p-2 bg-white rounded-full shadow-sm mb-2">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 text-center px-2">
          {title}
        </span>
      </div>

      {/* Desktop Layout - Right Side (val2) */}
      <div className="flex-1 p-4 md:p-6 text-slate-800 border-t border-slate-100 md:border-t-0">
        <div className={`text-sm md:text-base ${isTextHeavy ? 'leading-relaxed text-slate-600 text-justify' : 'font-medium text-center md:text-left'}`}>
          {val2 || '-'}
        </div>
      </div>
    </div>
  );
}