import { Machine, MachineMode, RunLog, User, UserRole } from '../types';
import { SAMPLE_MACHINES } from '../constants';

const STORAGE_KEY = 'juteex_state_v6';

// --- Default Users ---
const USERS: User[] = [
    { id: 'user-1', name: 'Caffinated Coders', email: 'caffinated.coders@gmail.com', role: UserRole.OWNER },
    { id: 'user-2', name: 'Borrower', email: 'borrower@gmail.com', role: UserRole.BORROWER },
    { id: 'user-3', name: 'New Borrower', email: 'new.borrower@example.com', role: UserRole.BORROWER },
];

// Helper for IDs
const uuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class MockBackend {
  private machines: Machine[] = [];
  private runLogs: RunLog[] = [];
  public users: User[] = USERS; // Made public
  private currentUser: User = USERS[0]; // Default to owner
  private listeners: ((data: { machines: Machine[], runLogs: RunLog[] }) => void)[] = [];
  private intervalId: any;

  public findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  constructor() {
    this.loadState();
    if (this.machines.length === 0) {
      this.seedInitialData();
    }
    this.startTelemetrySimulation();
  }
  
  private seedInitialData() {
    this.machines = SAMPLE_MACHINES.map(m => {
        if (m.name === 'JRM 350') {
            return { ...m, owner: 'caffinated.coders@gmail.com', rentalStatus: 'OWNED' };
        }
        // For this simulation, let's assign other machines to the owner too
        return { ...m, owner: 'caffinated.coders@gmail.com', rentalStatus: 'OWNED' };
    });
    this.saveState();
  }


  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.machines = parsed.machines || [];
        this.runLogs = parsed.runLogs || [];
        // NOTE: Users are not persisted for this mock
      }
    } catch (e) {
      console.warn("Failed to load JuteEX state", e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        machines: this.machines,
        runLogs: this.runLogs
      }));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }

  public subscribe(listener: (data: { machines: Machine[], runLogs: RunLog[] }) => void) {
    this.listeners.push(listener);
    
    // Immediately notify with the correct machines for the current user
    const userMachines = this.machines.filter(m => 
        m.owner === this.currentUser.email || 
        (m.rentalSession && m.rentalSession.borrowerId === this.currentUser.id)
    );
    
    // Display only owned machine for the owner
    const ownerMachines = this.machines.filter(m => m.name === 'JRM 350');

    listener({ machines: this.currentUser.role === UserRole.OWNER ? ownerMachines : userMachines, runLogs: this.runLogs });

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
     this.listeners.forEach(listener => {
        const userMachines = this.machines.filter(m => 
            m.owner === this.currentUser.email || 
            (m.rentalSession && m.rentalSession.borrowerId === this.currentUser.id)
        );

        // Display only owned machine for the owner
        const ownerMachines = this.machines.filter(m => m.name === 'JRM 350');
        
        listener({ machines: this.currentUser.role === UserRole.OWNER ? ownerMachines : userMachines, runLogs: this.runLogs });
    });
  }
  
  public getMachine(id: string): Machine | undefined {
    return this.machines.find(m => m.id === id);
  }
  
  public getActiveUser(): User {
      return this.currentUser;
  }

  public switchUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;

      // --- START MODIFICATION: Assign machine to borrower ---
      const machineIndex = this.machines.findIndex(m => m.name === 'JRM 350');
      if (machineIndex !== -1) {
        if (user.role === UserRole.BORROWER) {
          this.machines[machineIndex] = {
            ...this.machines[machineIndex],
            rentalStatus: 'RENTED',
            rentalSession: {
              startTime: Date.now(),
              duration: 24,
              durationUnit: 'HOURS',
              borrowerId: user.id,
            }
          };
          // Redirect to the run page for the rented machine
          window.location.hash = `#/run/${this.machines[machineIndex].id}`;
        } else {
          // Revert to owner
          this.machines[machineIndex] = {
            ...this.machines[machineIndex],
            rentalStatus: 'OWNED',
            rentalSession: undefined,
          };
        }
      }
      // --- END MODIFICATION ---

      this.notify();
    }
  }

  public logout() {
    this.currentUser = this.users[0];
    this.notify();
  }

  // Simulate MQTT incoming data
  private startTelemetrySimulation() {
    this.intervalId = setInterval(() => {
      this.machines = this.machines.map(m => {
        if (m.status === 'RUNNING') {
          const jitter = (Math.random() - 0.5) * 2;
          const rpm = Math.max(0, Math.min(3000, m.telemetry.rpm + (jitter * 30)));
          let currentMode = m.currentMode;
          if (currentMode === MachineMode.POWER && rpm < 50) currentMode = MachineMode.ECO;

          const heatRise = (m.telemetry.speed / 100) * 0.2; 
          const temp = Math.min(95, Math.max(20, m.telemetry.motorTemp + heatRise + (jitter * 0.05)));
          
          const effBase = 100 - (Math.abs(m.telemetry.speed - 65) * 0.5);
          const eff = Math.min(100, Math.max(70, effBase + jitter));

          let ampsBase = 2 + ((m.telemetry.speed / 100) * 10); 
          if (currentMode === MachineMode.POWER) ampsBase *= 1.25;
          if (currentMode === MachineMode.ECO) ampsBase *= 0.85;
          const amps = Math.max(0.5, ampsBase + (jitter * 0.5));

          return {
            ...m,
            currentMode,
            telemetry: { ...m.telemetry, rpm, motorTemp: temp, runtime: m.telemetry.runtime + 1, connectionStatus: 'LIVE', efficiency: Math.round(eff), current: parseFloat(amps.toFixed(1)), lastSeen: Date.now() }
          } as Machine;
        } else {
          return {
            ...m,
            telemetry: { ...m.telemetry, rpm: Math.max(0, m.telemetry.rpm - 150), motorTemp: Math.max(20, m.telemetry.motorTemp - 0.2), current: 0, connectionStatus: 'LIVE', lastSeen: Date.now() }
          } as Machine;
        }
      });
      
      this.notify();
    }, 1000);

    setInterval(() => this.saveState(), 5000);
  }

  public toggleMachineState(id: string) {
    const machine = this.machines.find(m => m.id === id);
    if (!machine) return;

    if (machine.status === 'RUNNING') {
        this.machines = this.machines.map(m => m.id === id ? { ...m, status: 'STOPPED' } : m);
        const log: RunLog = {
            id: uuid(), machineId: machine.id, machineName: machine.name,
            startTime: Date.now() - (machine.telemetry.runtime * 1000),
            endTime: Date.now(), duration: machine.telemetry.runtime,
            mode: machine.currentMode, jams: machine.telemetry.jams,
            avgSpeed: machine.telemetry.speed, avgEfficiency: machine.telemetry.efficiency,
            date: new Date().toISOString()
        };
        this.runLogs = [log, ...this.runLogs];
        this.machines = this.machines.map(m => m.id === id ? { ...m, telemetry: { ...m.telemetry, runtime: 0, rpm: 0, speed: 0 } } : m);
    } else {
        this.machines = this.machines.map(m => m.id === id ? { ...m, status: 'RUNNING', telemetry: { ...m.telemetry, runtime: 0, speed: 20, rpm: 500 } } : m);
    }
    this.notify();
    this.saveState();
  }

  public setMode(id: string, mode: MachineMode) {
    this.machines = this.machines.map(m => m.id === id ? { ...m, currentMode: mode } : m);
    this.notify();
    this.saveState();
  }

  public setSpeed(id: string, speed: number) {
    this.machines = this.machines.map(m => m.id === id ? { ...m, telemetry: { ...m.telemetry, speed: speed } } : m);
    this.notify();
  }

  public triggerAntiJam(id: string) {
      this.machines = this.machines.map(m => m.id === id ? { ...m, telemetry: { ...m.telemetry, jams: m.telemetry.jams + 1, lastAntiJam: Date.now() } } : m);
      this.notify();
      this.saveState();
  }

  // --- Sharing & Rental ---
  public async generatePin(machineId: string): Promise<{ pin: string; expiry: number }> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network
    const machineIndex = this.machines.findIndex(m => m.id === machineId);
    if (machineIndex === -1) throw new Error("Machine not found");

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.machines[machineIndex] = {
      ...this.machines[machineIndex],
      pin: { code: pin, expiry: expiry }
    };
    
    this.notify();
    this.saveState();
    
    return { pin, expiry };
  }

  public async validateAndActivate(machineId: string, pin: string, duration: number, unit: 'HOURS' | 'DAYS'): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Force reload from storage to get latest PIN from other tabs
    this.loadState();
    
    const machineIndex = this.machines.findIndex(m => m.id === machineId);
    if (machineIndex === -1) return false;

    const machine = this.machines[machineIndex];

    // Override: Allow test PIN or any valid PIN from storage, ignoring expiry
    const isPinValid = pin === '123456' || (machine.pin && machine.pin.code === pin);

    if (!isPinValid) {
        return false;
    }

    this.machines[machineIndex] = {
      ...machine,
      rentalStatus: 'RENTED',
      pin: undefined, // Clear PIN after use
      rentalSession: {
        startTime: Date.now(),
        duration,
        durationUnit: unit,
        borrowerId: this.users.find(u => u.role === UserRole.BORROWER)?.id, // Assign to first borrower
      }
    };

    // Make the borrower the current user to simulate the switch
    this.currentUser = this.users.find(u => u.role === UserRole.BORROWER) ?? this.users[1];

    this.notify();
    this.saveState();
    return true;
  }
}

export const mockBackend = new MockBackend();