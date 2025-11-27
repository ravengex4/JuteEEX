export enum MachineMode {
  ECO = 'ECO',
  POWER = 'POWER',
  AUTO = 'AUTO',
  IDLE = 'IDLE'
}

export enum UserRole {
  OWNER = 'OWNER',
  BORROWER = 'BORROWER',
  ADMIN = 'ADMIN'
}

export interface TelemetryData {
  rpm: number;
  motorTemp: number; // Celsius
  runtime: number; // seconds
  jams: number;
  lastAntiJam: number | null; // timestamp
  efficiency: number; // percentage
  speed: number; // 0-100 percentage
  current: number; // Amps
  connectionStatus: 'LIVE' | 'CACHED' | 'OFFLINE';
  lastSeen: number;
}

export interface RentalSession {
  startTime: number;
  duration: number;
  durationUnit: 'HOURS' | 'DAYS';
  renterId?: string;
  borrowerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR' | 'MAINTENANCE';
  currentMode: MachineMode;
  telemetry: TelemetryData;
  thumbnailUrl?: string;
  rentalSession?: RentalSession;
  rentalStatus?: 'OWNED' | 'RENTED';
  owner?: string; // email of the owner
  pin?: {
    code: string;
    expiry: number;
  };
}

export interface RunLog {
  id: string;
  machineId: string;
  machineName: string;
  startTime: number;
  endTime: number;
  duration: number; // seconds
  mode: MachineMode;
  jams: number;
  avgSpeed: number;
  avgEfficiency: number;
  date: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  price: number;
  category: 'SEED' | 'PESTICIDE' | 'TOOL' | 'JUTE_SALE';
  thumbnail: string;
  images: string[];
  isGovPriceCompliant?: boolean;
  description?: string;
}

export interface CartItem extends MarketplaceItem {
  quantity: number;
}

export interface WishlistItem extends MarketplaceItem {
  addedAt: number;
}