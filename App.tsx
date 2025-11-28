import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { DashboardIcon, ShareIcon, MarketIcon, ProfileIcon, HelpIcon } from './components/Icons';
import Dashboard from './pages/Dashboard';
import RunningControl from './pages/RunningControl';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import ShareAccess from './pages/ShareAccess';
import AccessRequest from './pages/AccessRequest';
import Profile from './pages/Profile';
import Help from './pages/Help';
import RunLogDetails from './pages/RunLogDetails';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import DynamicStatusWidget from './components/DynamicStatusWidget';
import { Machine, RunLog, MarketplaceItem, CartItem, WishlistItem, User, UserRole } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, initializeMachines, firebaseInitialized, toggleMachineStateFirebase } from './services/firebase'; // Import db, initializeMachines, and firebaseInitialized
import { doc, getDoc, setDoc, collection, query, onSnapshot } from 'firebase/firestore'; // Import Firestore functions

// --- Context ---
type ThemeMode = 'light' | 'dark' | 'system';

interface AppContextType {
  machines: Machine[];
  runLogs: RunLog[];
  activeMachineId: string | null;
  setActiveMachineId: (id: string | null) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  cart: CartItem[];
  addToCart: (item: MarketplaceItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  wishlist: WishlistItem[];
  addToWishlist: (item: MarketplaceItem) => void;
  removeFromWishlist: (itemId: string) => void;
  user: User | null;
  loading: boolean;
  initialLoadError: boolean; // Add initialLoadError to context
  toggleMachineState: (machineId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Layout Components ---
const Navbar: React.FC = () => {
  const { isDark } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: DashboardIcon, label: 'Home' },
    { path: '/market', icon: MarketIcon, label: 'Marketplace' },
    { path: '/share/JRM350', icon: ShareIcon, label: 'Share' },
    { path: '/profile', icon: ProfileIcon, label: 'Profile' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:py-4 lg:top-0 lg:bottom-auto lg:px-8 transition-colors duration-300 border-t lg:border-t-0 lg:border-b ${isDark ? 'bg-jute-darkPaper/90 border-white/10' : 'bg-jute-paper/90 border-black/5'} backdrop-blur-lg`}>
      <div className="flex items-center justify-center lg:justify-between max-w-5xl mx-auto">
        <div className="flex items-center justify-between w-full lg:w-auto lg:gap-8 lg:mx-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`py-1.5 px-2 rounded-xl transition-all duration-300 flex flex-col lg:flex-row items-center justify-center gap-0.5 lg:gap-1 ${
                location.pathname === item.path 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-jute-black') 
                  : (isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black')
              }`}
            >
              <item.icon size={20} />
              <span className="text-[9px] lg:hidden font-medium leading-none mt-0.5">{item.label}</span>
              <span className="sr-only lg:not-sr-only lg:text-sm lg:font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// --- Main App Shell ---
const AppContent: React.FC = () => {
  const { isDark, machines } = useApp();
  
  return (
    <div className={`min-h-screen pb-24 lg:pb-24 transition-colors duration-300 ${isDark ? 'dark bg-black text-gray-100' : 'bg-jute-cream text-gray-900'}`}>
      
      <Navbar />
      
      <div className="relative">
         <div className="max-w-5xl mx-auto px-4 md:px-8 pt-0 pb-2">
           <Routes>
             <Route path="/login" element={<Login />} />
             <Route element={<PrivateRoute />}>
               <Route path="/" element={<Dashboard />} />
               <Route path="/run/:machineId" element={<RunningControl />} />
               <Route path="/log/:logId" element={<RunLogDetails />} />
               <Route path="/market" element={<Marketplace />} />
               <Route path="/cart" element={<Cart />} />
               <Route path="/share/:machineId" element={<ShareAccess />} />
               <Route path="/borrower-access/:machineId" element={<AccessRequest />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/help" element={<Help />} />
             </Route>
           </Routes>
         </div>
      </div>

      <DynamicStatusWidget machines={machines} />
    </div>
  );
};

const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [runLogs, setRunLogs] = useState<RunLog[]>([]); // runLogs will still come from RTDB or a separate Firestore collection
  const [user, setUser] = useState<User | null>(null);
  const [activeMachineId, setActiveMachineId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [initialLoadError, setInitialLoadError] = useState(false); // New state for initial load error
  
  // Theme state with persistence
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('juteex_theme');
      return (saved as ThemeMode) || 'system';
    } catch {
      return 'system';
    }
  });
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    console.log("App.tsx useEffect: Starting application setup.");

    if (!firebaseInitialized) {
      console.error("App.tsx useEffect: Firebase was NOT initialized (firebaseInitialized is false). Proceeding without Firebase.");
      setLoading(false);
      return () => {
        console.log("App.tsx useEffect cleanup (early exit due to no Firebase).");
      };
    }
    console.log("App.tsx useEffect: Firebase is initialized. Continuing application setup.");

    // Initialize machines in Firestore (runs only once if collection is empty)
    console.log("App.tsx useEffect: Calling initializeMachines...");
    const initMachinesPromise = initializeMachines();

    // Now, await this promise within an async IIFE or separate async function if needed for sequence,
    // or just let it run in parallel with other listeners and handle its errors.
    // For now, we'll let it run and handle its own completion/errors via the .then/.catch.
    initMachinesPromise.then(() => {
        console.log("initializeMachines call in App.tsx's useEffect has completed.");
    }).catch(e => {
        console.error("initializeMachines call in App.tsx's useEffect encountered an error:", e);
    });

    // Firestore listener for machines
    const machinesColRef = collection(db, 'machines');
    const machinesQuery = query(machinesColRef);
    const unsubscribeMachines = onSnapshot(machinesQuery, (snapshot) => {
      console.log("machines onSnapshot fired. Number of machines:", snapshot.docs.length);
      const fetchedMachines: Machine[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Machine[];
      setMachines(fetchedMachines);
    }, (error) => {
      console.error("machines onSnapshot failed:", error);
    });

    // Firestore listener for runLogs
    const runLogsColRef = collection(db, 'runLogs');
    const runLogsQuery = query(runLogsColRef);
    const unsubscribeRunLogs = onSnapshot(runLogsQuery, (snapshot) => {
      console.log("runLogs onSnapshot fired. Number of runLogs:", snapshot.docs.length);
      const fetchedRunLogs: RunLog[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RunLog[];
      setRunLogs(fetchedRunLogs);
    }, (error) => {
      console.error("runLogs onSnapshot failed:", error);
    });

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged fired. firebaseUser:", firebaseUser);

      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            console.log("User exists in Firestore:", docSnap.data());
            setUser(docSnap.data() as User);
          } else {
            console.log("New user, creating profile in Firestore for:", firebaseUser.email);
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
              email: firebaseUser.email || 'unknown@example.com',
              role: UserRole.BORROWER, // Default role for new users
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } else {
          console.log("No Firebase user logged in.");
          setUser(null);
        }
      } catch (error) {
        console.error("Error during user data handling in onAuthStateChanged:", error);
        // Do not set initialLoadError to true, just log the error and proceed.
      } finally {
        setLoading(false); // Ensure loading is false after auth state and user data are processed
        console.log("setLoading(false) called.");
      }
    }, (error) => {
      console.error("onAuthStateChanged failed:", error);
      setInitialLoadError(true); // Set error on auth state failure
      setLoading(false); // Ensure loading is false even on auth error
    });

    return () => {
      console.log("App useEffect cleanup.");
      unsubscribeMachines();
      unsubscribeRunLogs();
      authUnsubscribe();
    };
  }, []);

  // Theme Logic
  useEffect(() => {
    localStorage.setItem('juteex_theme', themeMode);
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let shouldBeDark = false;
      if (themeMode === 'dark') {
        shouldBeDark = true;
      } else if (themeMode === 'light') {
        shouldBeDark = false;
      } else {
        shouldBeDark = mediaQuery.matches;
      }

      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  const addToCart = (item: MarketplaceItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const addToWishlist = (item: MarketplaceItem) => {
    setWishlist(prev => {
        if (prev.some(i => i.id === item.id)) return prev;
        return [...prev, { ...item, addedAt: Date.now() }];
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlist(prev => prev.filter(i => i.id !== itemId));
  };

  const toggleMachineState = async (machineId: string) => {
    try {
      await toggleMachineStateFirebase(machineId);
    } catch (error) {
      console.error("Error toggling machine state:", error);
      // Optionally, set some error state to show in the UI
    }
  };

  return (
    <AppContext.Provider value={{ 
        machines, 
        runLogs, 
        activeMachineId, 
        setActiveMachineId, 
        themeMode, 
        setThemeMode, 
        isDark, 
        cart, 
        addToCart, 
        removeFromCart,
        updateCartQuantity,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        user,
        loading, // Pass loading state to context
        initialLoadError, // Pass initialLoadError to context
        toggleMachineState
    }}>
      <Router>
        {loading ? (
          <div className="flex justify-center items-center min-h-screen text-jute-darkGreen dark:text-jute-white">
            Loading application...
          </div>
        ) : initialLoadError ? (
          <div className="flex flex-col justify-center items-center min-h-screen text-red-600 dark:text-red-400 p-4 text-center">
            <h2 className="text-xl font-bold mb-2">Application Failed to Load</h2>
            <p>We're sorry, but the application encountered an error during startup. Please try again later.</p>
            <p>If the problem persists, please contact support.</p>
          </div>
        ) : (
          <AppContent />
        )}
      </Router>
    </AppContext.Provider>
  );
};

export default App;
