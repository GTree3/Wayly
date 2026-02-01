
/* Update UserSpeed to include 'comfortable' to match the UI and state initialization in App.tsx */
export type UserSpeed = 'slow' | 'comfortable' | 'fast';

export type MovementNeeds = {
  usesWheels: boolean;        // wheelchair, scooter, stroller
  maxWalkingDistance?: number; // meters before rest needed
  avoidStairs: boolean;
  preferRamps: boolean;
};

export type UserProfile = {
  movement: MovementNeeds;
  speed: UserSpeed;
  needsChangingTable: boolean;
  genderPreference: 'any' | 'men' | 'women' | 'universal';
};

export interface WashroomFeature {
  type: "Feature";
  properties: {
    fid: number;
    name: string;
    women: boolean;
    men: boolean;
    unisex: boolean;
    wheelchair: boolean;
    diaper_change: boolean;
    source: string;
    notes: string;
    addy: string;
    imageUrl: string;
    // Calculated fields for demo UI
    baseDistance?: number; 
    accessibilityScore?: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

export type AppView = 'home' | 'search' | 'routing';

export interface RouteOption {
  type: 'fastest' | 'accessible';
  duration: string;
  distance: string;
  description: string;
  color: string;
  target: WashroomFeature;
}