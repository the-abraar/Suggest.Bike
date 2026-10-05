import React, { useState } from 'react';
import { 
  Settings, Scale, Ruler, Gauge, Info, ChevronDown, Bike, Zap, Activity, 
  Wrench, Users, DollarSign, Map, ShieldCheck, Heart, Search, ExternalLink 
} from 'lucide-react';

const BIKES_DATA = [
  {
    id: "xpulse-200-4v-pro",
    name: "Hero XPulse 200 4V Pro",
    brand: "Hero",
    type: "Dual-Sport / Adventure",
    price: "৳ 3,95,000 (Approx)",
    images: [
      "https://images.unsplash.com/photo-1620038865615-5e6ebfb58572?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1625203309328-98e3b7548d8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1590656606828-56f8f5c35bba?auto=format&fit=crop&q=80&w=800"
    ],
    specs: {
      engine: "199.6 cc, 4-Valve, Oil Cooled",
      power: "19.1 PS @ 8500 rpm",
      torque: "17.35 Nm @ 6500 rpm",
      seatHeight: "850 mm",
      weight: "161 kg",
      mileage: "35-40 kmpl"
    },
    dynamics: {
      feel: "Commanding riding posture with excellent suspension travel. Capable off-road but compromised on fast highways.",
      handlingNote: "The front feels very light. When adding weight to the back with a pillion or luggage, the front end can 'belly dance' with stability issues and wobbles, often requiring two hands on the bars instead of one.",
      braking: "Decent front bite, rear ABS is helpful on loose gravel."
    },
    mechanics: {
      familiarity: "Moderate (6/10). Requires specialized tools for FI systems and the 4-valve head timing. Not every local 'mama' mechanic can tune it perfectly.",
      reliability: "Engine is solid, but electrical gremlins (sensors) are occasionally reported."
    },
    parts: [
      { name: "Front Brake Pads", price: "৳ 1,200", availability: "OEM available at dealers. Aftermarket rare." },
      { name: "Chain Sprocket Set", price: "৳ 3,500", availability: "O-Ring chain, mostly OEM only." },
      { name: "Air Filter", price: "৳ 450", availability: "Easy to find." },
      { name: "Clutch Cable", price: "৳ 250", availability: "Readily available." }
    ],
    community: [
      { name: "XPulse Club Bangladesh (FB)", url: "#" },
      { name: "Hero XPulse Owners BD", url: "#" },
      { name: "Long Term Video Review", url: "#" }
    ]
  },
  {
    id: "cg125",
    name: "Honda CG125",
    brand: "Honda",
    type: "Classic Commuter",
    price: "৳ 1,40,000 (Used/Import)",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1629037233842-8323a7894371?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522817453472-878564f33190?auto=format&fit=crop&q=80&w=800"
    ],
    specs: {
      engine: "124 cc, OHV, Air Cooled",
      power: "11 PS @ 8000 rpm",
      torque: "9.8 Nm @ 6000 rpm",
      seatHeight: "767 mm",
      weight: "113 kg",
      mileage: "45-50 kmpl"
    },
    dynamics: {
      feel: "Raw, mechanical, and purely analog. You feel the engine working beneath you. Extremely nimble in dense Dhaka traffic.",
      handlingNote: "Predictable and simple. Suspension is stiff but handles rough patches fairly well. Vibrates heavily past 70kmph.",
      braking: "Drum brakes front and rear. Requires engine braking and anticipation."
    },
    mechanics: {
      familiarity: "Legendary (10/10). Mechanics kotota porichito ei engine platform e? Literally every mechanic from Teknaf to Tetulia can rebuild this engine blindfolded by the side of the road.",
      reliability: "Bulletproof. Can survive extreme abuse with minimal oil."
    },
    parts: [
      { name: "Front Brake Shoes", price: "৳ 250", availability: "Tons of cheap aftermarket options everywhere." },
      { name: "Chain Sprocket Set", price: "৳ 1,200", availability: "Found in every parts shop." },
      { name: "Air Filter", price: "৳ 150", availability: "Extremely cheap and abundant." },
      { name: "Clutch Cable", price: "৳ 120", availability: "Available everywhere." }
    ],
    community: [
      { name: "CG125 Restorers BD (FB)", url: "#" },
      { name: "Classic Honda Riders BD", url: "#" },
      { name: "Restoration Project Video", url: "#" }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('matchmaker'); // 'matchmaker' | 'compare'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-900/50">
              <Zap size={24} className="text-zinc-50 fill-zinc-50" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">BD Moto<span className="text-emerald-500">Portal</span></h1>
            </div>
          </div>
          
          <nav className="flex space-x-1 bg-zinc-800 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('matchmaker')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${activeTab === 'matchmaker' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`}
            >
              <Search size={16} />
              <span className="hidden sm:inline">Matchmaker</span>
            </button>
            <button 
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${activeTab === 'compare' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`}
            >
              <Scale size={16} />
              <span className="hidden sm:inline">Deep Dive</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'matchmaker' ? <Matchmaker /> : <DeepDiveComparison />}
      </main>

    </div>
  );
}

function Matchmaker() {
  const [formData, setFormData] = useState({
    budget: 300000,
    mileage: '40',
    type: 'new',
    feel: 'adventure',
    height: 'tall'
  });
  const [result, setResult] = useState(null);

  const handleMatch = () => {
    // Mock logic: If budget is high and feel is adventure, return XPulse. Else CG125.
    if (formData.budget > 200000 && formData.feel === 'adventure') {
      setResult(BIKES_DATA[0]); // XPulse
    } else {
      setResult(BIKES_DATA[1]); // CG
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-zinc-100">Find Your Perfect Ride</h2>
        <p className="mt-3 text-zinc-400">Tell us what you need. We'll suggest the best match for Bangladesh roads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-6">
          
          <div>
            <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
              <span>Budget (Max)</span>
              <span className="text-emerald-400">৳ {formData.budget.toLocaleString()}</span>
            </label>
            <input 
              type="range" min="50000" max="600000" step="10000" 
              value={formData.budget} 
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Condition</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-500">
                <option value="new">Brand New</option>
                <option value="used">Used / Reconditioned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Desired Mileage</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-500">
                <option value="30">30+ kmpl (Power focus)</option>
                <option value="40">40+ kmpl (Balanced)</option>
                <option value="50">50+ kmpl (Commuter)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Preferred Riding Feel</label>
            <div className="grid grid-cols-2 gap-3">
              {['cruising', 'adventure', 'street_naked', 'classic'].map((feel) => (
                <button
                  key={feel}
                  onClick={() => setFormData({...formData, feel})}
                  className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${formData.feel === feel ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {feel.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleMatch}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Find My Match
          </button>
        </div>

        {/* Result Area */}
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 border-dashed flex flex-col justify-center items-center relative overflow-hidden">
          {!result ? (
            <div className="text-center text-zinc-500 space-y-4 p-8">
              <Heart size={48} className="mx-auto opacity-20" />
              <p>Adjust your preferences and click search to find your perfect motorcycle match.</p>
            </div>
          ) : (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider mb-4 border border-emerald-500/30">
                Top Match
              </span>
              <img src={result.images[0]} alt={result.name} className="w-full h-48 object-cover rounded-xl mb-6 border border-zinc-800" />
              <h3 className="text-2xl font-bold text-zinc-100">{result.name}</h3>
              <p className="text-zinc-400 mt-2 text-sm">{result.dynamics.feel}</p>
              
              <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-lg font-mono text-emerald-400">{result.price}</span>
                <button 
                  onClick={() => alert('Switching to Deep Dive... (Integration placeholder)')}
                  className="text-sm font-medium text-zinc-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  See deep dive <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeepDiveComparison() {
  const [bike1Id, setBike1Id] = useState("xpulse-200-4v-pro");
  const [bike2Id, setBike2Id] = useState("cg125");

  const bike1 = BIKES_DATA.find(b => b.id === bike1Id);
  const bike2 = BIKES_DATA.find(b => b.id === bike2Id);

  return (
    <div className="space-y-10">
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Exhaustive Comparison</h2>
        <p className="mt-2 max-w-3xl text-zinc-400">Deep dive into specs, real-world riding dynamics, spare parts pricing, and mechanic familiarity.</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-xl sticky top-20 z-40">
        <BikeSelector label="Bike 1" selectedId={bike1Id} onChange={setBike1Id} excludeId={bike2Id} />
        <BikeSelector label="Bike 2" selectedId={bike2Id} onChange={setBike2Id} excludeId={bike1Id} />
      </div>

      <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">
        
        {/* Galleries */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 bg-zinc-950">
          <ImageGallery bike={bike1} />
          <ImageGallery bike={bike2} />
        </div>

        {/* SECTION: Standard Specs */}
        <ComparisonSection title="Standard Specifications" icon={<Gauge />}>
          <ComparisonRow title="Engine" val1={bike1.specs.engine} val2={bike2.specs.engine} />
          <ComparisonRow title="Max Power" val1={bike1.specs.power} val2={bike2.specs.power} />
          <ComparisonRow title="Max Torque" val1={bike1.specs.torque} val2={bike2.specs.torque} />
          <ComparisonRow title="Seat Height" val1={bike1.specs.seatHeight} val2={bike2.specs.seatHeight} />
          <ComparisonRow title="Kerb Weight" val1={bike1.specs.weight} val2={bike2.specs.weight} />
          <ComparisonRow title="Est. Mileage" val1={bike1.specs.mileage} val2={bike2.specs.mileage} />
        </ComparisonSection>

        {/* SECTION: Riding Dynamics */}
        <ComparisonSection title="Riding Flavors & Dynamics" icon={<Activity />}>
          <ComparisonRow title="Overall Feel" val1={bike1.dynamics.feel} val2={bike2.dynamics.feel} isTextHeavy={true} />
          <ComparisonRow title="Handling Quirks" val1={bike1.dynamics.handlingNote} val2={bike2.dynamics.handlingNote} isTextHeavy={true} highlightAlert={true} />
          <ComparisonRow title="Braking" val1={bike1.dynamics.braking} val2={bike2.dynamics.braking} isTextHeavy={true} />
        </ComparisonSection>

        {/* SECTION: Mechanic & Reliability */}
        <ComparisonSection title="Mechanic Familiarity & Reliability" icon={<Wrench />}>
          <ComparisonRow title="Mechanics' Expertise" val1={bike1.mechanics.familiarity} val2={bike2.mechanics.familiarity} isTextHeavy={true} highlightGood={true} />
          <ComparisonRow title="Platform Reliability" val1={bike1.mechanics.reliability} val2={bike2.mechanics.reliability} isTextHeavy={true} />
        </ComparisonSection>

        {/* SECTION: Spare Parts Pricing (Consumables) */}
        <ComparisonSection title="Consumables & Spare Parts (Approx BDT)" icon={<DollarSign />}>
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="flex-1 p-6"><PartsTable parts={bike1.parts} /></div>
            <div className="flex-1 p-6"><PartsTable parts={bike2.parts} /></div>
          </div>
        </ComparisonSection>

        {/* SECTION: Community & Links */}
        <ComparisonSection title="Community & Research" icon={<Users />}>
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="flex-1 p-6"><CommunityLinks links={bike1.community} /></div>
            <div className="flex-1 p-6"><CommunityLinks links={bike2.community} /></div>
          </div>
        </ComparisonSection>

      </div>
    </div>
  );
}

function BikeSelector({ label, selectedId, onChange, excludeId }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap hidden sm:block">{label}</span>
      <div className="relative w-full">
        <select
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2.5 text-base font-semibold border-none bg-zinc-800 text-zinc-100 focus:ring-2 focus:ring-emerald-500 rounded-xl appearance-none cursor-pointer transition-colors"
        >
          {BIKES_DATA.map((bike) => (
            <option key={bike.id} value={bike.id} disabled={bike.id === excludeId}>
              {bike.brand} {bike.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}

function ImageGallery({ bike }) {
  const [mainImg, setMainImg] = useState(0);
  
  if (!bike) return null;

  return (
    <div className="p-6 md:p-8 flex flex-col items-center">
      <h3 className="text-2xl font-black text-zinc-100 mb-6">{bike.name}</h3>
      
      {/* Main Image */}
      <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4 relative group shadow-2xl">
        <img 
          src={bike.images[mainImg]} 
          alt={bike.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-700/50">
          <span className="text-sm font-mono font-bold text-emerald-400">{bike.price}</span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 w-full justify-center">
        {bike.images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setMainImg(idx)}
            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${mainImg === idx ? 'border-emerald-500 opacity-100 scale-110 shadow-lg shadow-emerald-900/50' : 'border-zinc-800 opacity-50 hover:opacity-80'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ComparisonSection({ title, icon, children }) {
  return (
    <div className="border-t border-zinc-800">
      <div className="bg-zinc-800/30 px-6 py-4 flex items-center gap-3 border-b border-zinc-800">
        <div className="p-1.5 bg-zinc-800 rounded-md text-emerald-400">
          {icon}
        </div>
        <h4 className="text-lg font-bold text-zinc-200 tracking-tight">{title}</h4>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {children}
      </div>
    </div>
  );
}

function ComparisonRow({ title, val1, val2, isTextHeavy = false, highlightAlert = false, highlightGood = false }) {
  
  const getTextStyle = () => {
    let base = isTextHeavy ? 'text-sm leading-relaxed' : 'text-base font-medium';
    if (highlightAlert) return `${base} text-amber-200/90`;
    if (highlightGood) return `${base} text-emerald-200/90`;
    return `${base} text-zinc-300`;
  };

  return (
    <div className="flex flex-col md:flex-row hover:bg-zinc-800/20 transition-colors">
      {/* Mobile Title */}
      <div className="md:hidden px-6 py-3 bg-zinc-800/20 text-xs font-bold text-zinc-500 uppercase tracking-wider">
        {title}
      </div>
      
      {/* Left Value */}
      <div className={`flex-1 p-6 border-b border-zinc-800/50 md:border-b-0 ${getTextStyle()}`}>
        {val1 || '-'}
      </div>

      {/* Center Title (Desktop) */}
      <div className="hidden md:flex w-40 bg-zinc-900/50 border-x border-zinc-800/50 items-center justify-center p-4">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center leading-tight">
          {title}
        </span>
      </div>

      {/* Right Value */}
      <div className={`flex-1 p-6 ${getTextStyle()}`}>
        {val2 || '-'}
      </div>
    </div>
  );
}

function PartsTable({ parts }) {
  return (
    <div className="space-y-4">
      {parts.map((p, i) => (
        <div key={i} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 hover:border-zinc-600 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-semibold text-zinc-200">{p.name}</h5>
            <span className="font-mono text-emerald-400 font-bold bg-zinc-900 px-2 py-0.5 rounded text-sm">{p.price}</span>
          </div>
          <p className="text-xs text-zinc-400 flex items-start gap-1.5">
            <Info size={14} className="shrink-0 mt-0.5 text-zinc-500" />
            {p.availability}
          </p>
        </div>
      ))}
    </div>
  );
}

function CommunityLinks({ links }) {
  return (
    <div className="space-y-3">
      {links.map((l, i) => (
        <a 
          key={i} 
          href={l.url}
          className="flex items-center justify-between p-3.5 bg-zinc-800/30 rounded-xl hover:bg-zinc-800 hover:text-emerald-400 transition-all border border-transparent hover:border-zinc-700 group text-sm font-medium text-zinc-300"
        >
          <span className="flex items-center gap-3">
            <ExternalLink size={16} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" />
            {l.name}
          </span>
        </a>
      ))}
    </div>
  );
}