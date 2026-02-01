
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { 
  Search, Mic, Home, Utensils, 
  MapPin, Navigation, Info, X, User, 
  Accessibility, Baby, Clock, Settings2, Move, AlertCircle
} from 'lucide-react';
import { AppView, UserProfile, WashroomFeature, RouteOption, UserSpeed, MovementNeeds } from './types';
import { MOCK_WASHROOMS, INITIAL_LAT_LNG } from './constants';
import { getAccessibilityInsights } from './services/gemini';

// --- Components ---

const IPhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-2 sm:p-4">
    <div className="relative w-full max-w-[375px] h-[812px] bg-white rounded-[20px] shadow-[0_0_60px_rgba(0,0,0,0.1)] border-[10px] border-black overflow-hidden flex flex-col ring-1 ring-black/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-[100]"></div>
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/20 rounded-full z-[100]"></div>
    </div>
  </div>
);

const SearchBar: React.FC<{ onFocus: () => void; value?: string; onClear?: () => void; view: AppView }> = ({ onFocus, value, onClear, view }) => (
  <div className="absolute top-12 left-4 right-4 z-[50] flex items-center bg-white rounded-full shadow-lg px-4 py-2.5 gap-3 border border-gray-100 transition-all">
    <Search className="w-5 h-5 text-gray-400" />
    <input 
      type="text" 
      placeholder="Search here" 
      className="flex-1 outline-none text-[15px] font-normal"
      value={value}
      readOnly
      onClick={onFocus}
    />
    <div className="flex items-center gap-3 text-gray-500">
      {value && view !== 'home' ? <X className="w-5 h-5 cursor-pointer" onClick={onClear} /> : <Mic className="w-5 h-5" />}
      <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center overflow-hidden bg-blue-50">
        <User className="w-5 h-5 text-blue-400" />
      </div>
    </div>
  </div>
);

const SettingsModal: React.FC<{ profile: UserProfile; setProfile: (p: UserProfile) => void; onClose: () => void }> = ({ profile, setProfile, onClose }) => {
  const toggleMovement = (key: keyof MovementNeeds) => {
    setProfile({
      ...profile,
      movement: {
        ...profile.movement,
        [key]: !profile.movement[key]
      }
    });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      movement: {
        ...profile.movement,
        maxWalkingDistance: parseInt(e.target.value) || undefined
      }
    });
  };

  return (
    <div className="absolute inset-0 z-[200] bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-[32px] p-6 animate-in slide-in-from-bottom duration-300 max-h-[90%] overflow-y-auto custom-scrollbar">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-6">Movement Needs</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">FUNCTIONAL REQUIREMENTS</label>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Move className="w-5 h-5" /></div>
                <div>
                  <span className="text-[15px] font-bold text-gray-700">Uses wheels</span>
                  <p className="text-[11px] text-gray-500">Wheelchair, scooter, or stroller</p>
                </div>
              </div>
              <button 
                onClick={() => toggleMovement('usesWheels')}
                className={`w-12 h-6 rounded-full relative transition-colors ${profile.movement.usesWheels ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.movement.usesWheels ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600"><AlertCircle className="w-5 h-5" /></div>
                <div>
                  <span className="text-[15px] font-bold text-gray-700">Avoid stairs</span>
                  <p className="text-[11px] text-gray-500">Requires step-free access</p>
                </div>
              </div>
              <button 
                onClick={() => toggleMovement('avoidStairs')}
                className={`w-12 h-6 rounded-full relative transition-colors ${profile.movement.avoidStairs ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.movement.avoidStairs ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-green-100 rounded-xl text-green-600"><Accessibility className="w-5 h-5" /></div>
                <div>
                  <span className="text-[15px] font-bold text-gray-700">Prefer ramps</span>
                  <p className="text-[11px] text-gray-500">Gradual inclines only</p>
                </div>
              </div>
              <button 
                onClick={() => toggleMovement('preferRamps')}
                className={`w-12 h-6 rounded-full relative transition-colors ${profile.movement.preferRamps ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.movement.preferRamps ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">MAX TRAVEL DISTANCE</label>
              <span className="text-xs font-bold text-blue-600">{profile.movement.maxWalkingDistance || 0}m</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              step="50"
              value={profile.movement.maxWalkingDistance || 1000}
              onChange={handleDistanceChange}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">100m</span>
              <span className="text-[10px] text-gray-400">2km</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">MOVEMENT SPEED</label>
            <div className="grid grid-cols-3 gap-2">
              {['slow', 'comfortable', 'fast'].map(s => (
                <button 
                  key={s}
                  onClick={() => setProfile({ ...profile, speed: s as UserSpeed })}
                  className={`py-2 rounded-xl border text-sm capitalize transition-all ${profile.speed === s ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
          >
            Apply Movements
          </button>
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
};

// --- Map Controllers ---

const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView(center, zoom, { animate: false });
    }, 0);
  }, [center, zoom, map]);
  return null;
};

// --- App Root ---

export default function WaylyApp() {
  const [view, setView] = useState<AppView>('home');
  const [selectedRestroom, setSelectedRestroom] = useState<WashroomFeature | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  // Cache for insights to avoid 429 errors
  const [insightsCache, setInsightsCache] = useState<Record<string, string>>({});
  
  const [profile, setProfile] = useState<UserProfile>({
    movement: {
      usesWheels: false,
      maxWalkingDistance: 1000,
      avoidStairs: false,
      preferRamps: false
    },
    speed: 'comfortable',
    needsChangingTable: false,
    genderPreference: 'any'
  });

  const userLocation: [number, number] = [43.7360, -79.2485];

  // Filtering Logic
  const filteredWashrooms = useMemo(() => {
    return MOCK_WASHROOMS.features.filter(wr => {
      if (activeFilters.includes('women') && !wr.properties.women) return false;
      if (activeFilters.includes('men') && !wr.properties.men) return false;
      if (activeFilters.includes('universal') && !wr.properties.unisex) return false;
      if (activeFilters.includes('baby') && !wr.properties.diaper_change) return false;
      if (activeFilters.includes('accessible') && !wr.properties.wheelchair) return false;
      return true;
    });
  }, [activeFilters]);

  // Routing Logic
  const routes = useMemo((): RouteOption[] => {
    if (view !== 'routing') return [];
    
    const speedFactor = profile.speed === 'slow' ? 0.6 : (profile.speed === 'fast' ? 1.4 : 1.0);
    const movementMultiplier = profile.movement.usesWheels ? 0.75 : 1.0;
    
    const calculateTime = (dist: number) => Math.max(1, Math.round(dist / (60 * speedFactor * movementMultiplier)));

    const sortedByDistance = [...MOCK_WASHROOMS.features].sort((a, b) => (a.properties.baseDistance || 0) - (b.properties.baseDistance || 0));
    const fastestDest = sortedByDistance[0];
    
    const sortedByAccessibility = [...MOCK_WASHROOMS.features].sort((a, b) => {
      if (profile.movement.avoidStairs) {
        if (a.properties.wheelchair !== b.properties.wheelchair) {
          return a.properties.wheelchair ? -1 : 1;
        }
      }
      return (b.properties.accessibilityScore || 0) - (a.properties.accessibilityScore || 0);
    });
    
    const accessibleDest = sortedByAccessibility[0] || fastestDest;

    return [
      {
        type: 'fastest',
        duration: `${calculateTime(fastestDest.properties.baseDistance || 0)} min`,
        distance: `${fastestDest.properties.baseDistance}m`,
        description: 'Direct path',
        color: '#2563eb',
        target: fastestDest
      },
      {
        type: 'accessible',
        duration: `${calculateTime((accessibleDest.properties.baseDistance || 0) * (profile.movement.avoidStairs ? 1.2 : 1.1))} min`,
        distance: `${Math.round((accessibleDest.properties.baseDistance || 0) * 1.1)}m`,
        description: 'Optimized access',
        color: '#16a34a',
        target: accessibleDest
      }
    ];
  }, [profile, view]);

  const activeTarget = selectedRestroom || (routes.length > 0 ? routes[0].target : null);

  const generateInsights = useCallback(async () => {
    if (!activeTarget) return;

    // Create a cache key based on the target and profile movement needs
    const cacheKey = `${activeTarget.properties.fid}-${JSON.stringify(profile.movement)}-${profile.speed}`;
    
    if (insightsCache[cacheKey]) {
      setInsights(insightsCache[cacheKey]);
      return;
    }

    setLoadingInsights(true);
    const text = await getAccessibilityInsights(profile, activeTarget, routes);
    
    // Store in cache
    setInsightsCache(prev => ({ ...prev, [cacheKey]: text }));
    setInsights(text);
    setLoadingInsights(false);
  }, [profile, activeTarget, routes, insightsCache]);

  useEffect(() => {
    if (view === 'routing' && activeTarget) {
      // Small debounce to prevent rapid fire calls if user clicks markers quickly
      const timer = setTimeout(() => {
        generateInsights();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTarget, view, generateInsights]);

  const washroomIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  const activeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854866.png',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    className: 'filter hue-rotate-[180deg]'
  });

  return (
    <IPhoneFrame>
      {/* Overlay UI */}
      <SearchBar 
        view={view}
        onFocus={() => view === 'home' && setView('search')} 
        value={view === 'home' ? '' : 'Washrooms'}
        onClear={() => { setView('home'); setSelectedRestroom(null); }}
      />

      {view === 'home' && (
        <div className="absolute top-28 left-4 right-0 z-[50] overflow-x-auto whitespace-nowrap no-scrollbar pb-2 pr-4">
          <div className="flex gap-2">
            <button onClick={() => setView('search')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-md text-sm font-semibold">
              <MapPin className="w-4 h-4" /> Washrooms
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-md text-sm font-medium border border-gray-50">
              <Utensils className="w-4 h-4" /> Restaurants
            </button>
          </div>
        </div>
      )}

      {view === 'search' && (
        <div
          className="absolute top-28 left-4 right-0 z-[50] overflow-x-auto whitespace-nowrap pb-2 flex items-center gap-2 pr-4 select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={(e) => {
            const el = e.currentTarget;
            const startX = e.pageX;
            const startScroll = el.scrollLeft;

            const onMove = (ev: MouseEvent) => {
              el.scrollLeft = startScroll - (ev.pageX - startX);
            };

            const onUp = () => {
              document.removeEventListener('mousemove', onMove);
              document.removeEventListener('mouseup', onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
          }}
        >
          <button onClick={() => setShowSettings(true)} className="flex items-center justify-center p-2.5 bg-white rounded-full shadow-md text-gray-700 border border-gray-100">
            <Settings2 className="w-5 h-5" />
          </button>
          {[
            { id: 'women', label: 'Women' },
            { id: 'men', label: 'Men' },
            { id: 'universal', label: 'Universal' }, 
            { id: 'baby', label: 'Diaper Changing' },
            { id: 'accessible', label: 'Wheelchair Accessible' }
          ].map(f => (
            <button 
              key={f.id}
              onClick={() => setActiveFilters(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm text-xs font-semibold border transition-all ${activeFilters.includes(f.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-100'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 w-full bg-[#f8f9fa] z-0">
        <MapContainer center={userLocation} zoom={16} scrollWheelZoom={true} zoomControl={false} className="grayscale-[0.1]">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png" />
          <ChangeView center={activeTarget ? [activeTarget.geometry.coordinates[1], activeTarget.geometry.coordinates[0]] : userLocation} zoom={16} />
          
          <Marker position={userLocation} icon={new L.DivIcon({
            className: 'bg-transparent',
            html: `<div class="relative flex items-center justify-center"><div class="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div><div class="w-6 h-6 bg-blue-600 rounded-full border-[3px] border-white shadow-lg"></div></div>`
          })} />

          {(view === 'search' || view === 'routing') && filteredWashrooms.map(wr => (
            <Marker 
              key={wr.properties.fid} 
              position={[wr.geometry.coordinates[1], wr.geometry.coordinates[0]]}
              icon={activeTarget?.properties.fid === wr.properties.fid ? activeIcon : washroomIcon}
              opacity={activeTarget && activeTarget.properties.fid !== wr.properties.fid ? 0.4 : 1}
              eventHandlers={{ click: () => { setSelectedRestroom(wr); setView('routing'); } }}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-sm">{wr.properties.name}</h3>
                  <div className="text-[10px] text-gray-500 mt-1 line-clamp-2">{wr.properties.notes}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {view === 'routing' && routes.map((r, idx) => (
            <Polyline 
              key={r.type}
              positions={[userLocation, idx === 1 ? [userLocation[0]+0.0005, userLocation[1]-0.0005] : userLocation, [r.target.geometry.coordinates[1], r.target.geometry.coordinates[0]]]} 
              color={r.color} weight={7} opacity={0.7} dashArray={r.type === 'fastest' ? "10, 10" : "0"}
            />
          ))}
        </MapContainer>
      </div>

      {/* Action Buttons Right */}
      <div className="absolute right-4 bottom-44 z-[50] flex flex-col gap-3">
        <button className="p-3 bg-white rounded-full shadow-lg text-blue-600 border border-gray-50"><Navigation className="w-6 h-6" /></button>
        <button className="p-3 bg-white rounded-full shadow-lg text-gray-700 border border-gray-50" onClick={() => setView('home')}><Home className="w-6 h-6" /></button>
      </div>

      {/* Bottom Interface */}
      <div className={`absolute left-0 right-0 bottom-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[36px] z-[100] transition-all duration-500 ${view === 'home' ? 'h-[160px]' : (view === 'routing' ? 'h-[480px]' : 'h-[360px]')}`}>
        <div className="w-full flex justify-center py-3"><div className="w-10 h-1.5 bg-gray-200 rounded-full" /></div>

        {view === 'home' && (
          <div className="px-6">
            <h3 className="text-xl font-bold text-gray-900">Wayly - Accessibility Demos</h3>
            <p className="text-xs text-gray-400 mt-1">Scarborough, ON</p>
            <div className="flex justify-around items-center border-t border-gray-100 mt-6 pt-4">
              <div className="flex flex-col items-center gap-1"><div className="p-1.5 text-blue-600 bg-blue-50 rounded-full"><MapPin className="w-6 h-6" /></div><span className="text-[10px] font-bold text-blue-600">Explore</span></div>
              <div className="flex flex-col items-center gap-1 opacity-40"><div className="p-1.5 text-gray-400"><Navigation className="w-6 h-6" /></div><span className="text-[10px] font-bold text-gray-400">Go</span></div>
            </div>
          </div>
        )}

        {view === 'search' && (
          <div className="h-full flex flex-col">
            <div className="px-6 pb-2 flex justify-between items-center">
              <h3 className="text-lg font-bold">Washrooms Nearby</h3>
              <button onClick={() => setView('home')} className="p-2 rounded-full bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {filteredWashrooms.map(wr => (
                <div key={wr.properties.fid} className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-50" onClick={() => { setSelectedRestroom(wr); setView('routing'); }}>
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl shrink-0 overflow-hidden"><img src={wr.properties.imageUrl || `https://picsum.photos/seed/wr-${wr.properties.fid}/200/200`} className="w-full h-full object-cover" alt="Washroom" /></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{wr.properties.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 italic">{wr.properties.addy}</p>
                    <div className="flex gap-2 mt-2">
                      {wr.properties.wheelchair && <span className="p-1 bg-blue-50 rounded-lg"><Accessibility className="w-3.5 h-3.5 text-blue-600" /></span>}
                      {wr.properties.diaper_change && <span className="p-1 bg-pink-50 rounded-lg"><Baby className="w-3.5 h-3.5 text-pink-600" /></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'routing' && activeTarget && (
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight">{activeTarget.properties.name}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Source: {activeTarget.properties.source}</p>
              </div>
              <button onClick={() => setView('search')} className="p-2.5 bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              <div className="mb-5 bg-blue-600 rounded-[24px] p-4 flex gap-4 shadow-xl shadow-blue-50 relative">
                <div className="shrink-0 p-2.5 bg-white/20 text-white rounded-2xl h-fit"><Info className="w-5 h-5" /></div>
                <div>
                    <h4 className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Wayly Insight</h4>
                    <div className="text-[13px] text-white font-medium leading-tight min-h-[3em]">
                      {loadingInsights ? (
                        <span className="flex items-center gap-2 animate-pulse">
                          Thinking...
                        </span>
                      ) : insights}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {routes.map(r => (
                  <div 
                    key={r.type}
                    onClick={() => setSelectedRestroom(r.target)}
                    className={`flex flex-col p-4 rounded-3xl border-2 transition-all cursor-pointer ${activeTarget.properties.fid === r.target.properties.fid && (r.type === 'fastest' ? 'bg-blue-50 border-blue-600' : 'bg-green-50 border-green-600') || 'bg-white border-gray-100 opacity-60'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${r.type === 'fastest' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      {r.type === 'fastest' ? <Clock className="w-4 h-4" /> : <Accessibility className="w-4 h-4" />}
                    </div>
                    <div className="text-xl font-black text-gray-900">{r.duration}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{r.type === 'fastest' ? 'FASTEST' : 'ACCESSIBLE'}</div>
                    <p className="text-[10px] font-bold text-gray-700 mt-2 line-clamp-1">{r.target.properties.name}</p>
                  </div>
                ))}
              </div>

              {profile.movement.maxWalkingDistance && activeTarget.properties.baseDistance && activeTarget.properties.baseDistance > profile.movement.maxWalkingDistance && (
                <div className="bg-red-50 p-3 rounded-2xl border border-red-100 mb-4 flex gap-3 items-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-[11px] text-red-700 font-bold">Exceeds your preferred distance limit.</p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Local Knowledge</h4>
                <p className="text-xs text-gray-700 leading-tight">"{activeTarget.properties.notes}"</p>
              </div>

              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
                <Navigation className="w-5 h-5 fill-current" /> START
              </button>
            </div>
          </div>
        )}
      </div>

      {showSettings && <SettingsModal profile={profile} setProfile={setProfile} onClose={() => setShowSettings(false)} />}
    </IPhoneFrame>
  );
}
