import { Machine, MachineMode, MarketplaceItem } from './types';

export const THEME_COLORS = {
  cream: '#EFECE3',
  lightBlue: '#8FABD4',
  darkBlue: '#4A70A9',
  black: '#000000',
  eco: '#10B981',
  power: '#F59E0B',
  auto: '#3B82F6',
  idle: '#9CA3AF',
};

export const MODE_CONFIG = {
  [MachineMode.ECO]: {
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    tint: 'bg-emerald-500/10 dark:bg-emerald-900/20',
    label: 'Eco Mode',
    hex: THEME_COLORS.eco
  },
  [MachineMode.POWER]: {
    color: 'text-amber-500',
    bg: 'bg-amber-500',
    border: 'border-amber-500',
    tint: 'bg-amber-500/10 dark:bg-amber-900/20',
    label: 'Power Mode',
    hex: THEME_COLORS.power
  },
  [MachineMode.AUTO]: {
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    tint: 'bg-blue-500/10 dark:bg-blue-900/20',
    label: 'Auto Mode',
    hex: THEME_COLORS.auto
  },
  [MachineMode.IDLE]: {
    color: 'text-gray-500',
    bg: 'bg-gray-500',
    border: 'border-gray-500',
    tint: 'bg-gray-200/50 dark:bg-gray-800/50',
    label: 'Idle',
    hex: THEME_COLORS.idle
  }
};

export const SAMPLE_MACHINES: Machine[] = [
  {
    id: 'JRM350',
    name: 'JRM 350',
    model: 'Ribbon Pro 2024',
    status: 'STOPPED',
    currentMode: MachineMode.ECO,
    telemetry: {
      rpm: 0,
      motorTemp: 24,
      runtime: 120,
      jams: 0,
      lastAntiJam: null,
      efficiency: 95,
      speed: 0,
      current: 0,
      connectionStatus: 'LIVE',
      lastSeen: Date.now()
    }
  },
  {
    id: 'm2',
    name: 'Field Runner 3000',
    model: 'Ribbon Lite',
    status: 'MAINTENANCE',
    currentMode: MachineMode.IDLE,
    telemetry: {
      rpm: 0,
      motorTemp: 22,
      runtime: 0,
      jams: 0,
      lastAntiJam: null,
      efficiency: 100,
      speed: 0,
      current: 0,
      connectionStatus: 'OFFLINE',
      lastSeen: Date.now() - 3600000
    }
  },
  {
    id: 'm3',
    name: 'Community Share #1',
    model: 'Ribbon Eco 200 (Rented)',
    status: 'RUNNING',
    currentMode: MachineMode.AUTO,
    telemetry: {
      rpm: 1850,
      motorTemp: 42,
      runtime: 2450,
      jams: 0,
      lastAntiJam: null,
      efficiency: 88,
      speed: 55,
      current: 3.8,
      connectionStatus: 'LIVE',
      lastSeen: Date.now()
    },
    rentalSession: {
      startTime: Date.now() - (1000 * 60 * 45), // Started 45 mins ago
      duration: 4,
      durationUnit: 'HOURS',
      renterId: 'borrower-123'
    }
  }
];

export const MOCK_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  { id: '1', name: 'Premium Jute Seeds (1kg)', price: 450, category: 'SEED', images: ['/images/sunn-hemp-jute-seeds-.jpg', '/images/Shahidul-Islam-3-Main-Image-1200x900.jpg'], thumbnail: '/images/sunn-hemp-jute-seeds-.jpg', isGovPriceCompliant: true },
  { id: '2', name: 'Organic Pesticide', price: 1200, category: 'PESTICIDE', images: ['/images/fertilizers1.jpg', '/images/fertilizer2.jpg'], isGovPriceCompliant: true },
  { id: '4', name: 'Sell Raw Jute (Batch A)', price: 6000, category: 'JUTE_SALE', images: ['/images/jute raw1.jpg', '/images/jute  raw 2.jpg', '/images/jute raw 3.jpg'], isGovPriceCompliant: false },
];