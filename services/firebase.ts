import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, where, deleteDoc, updateDoc, doc, getDoc as getFirestoreDoc, setDoc } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { SAMPLE_MACHINES } from "../constants";
import { Machine, UserRole, RunLog, MachineMode } from "../types"; // Import Machine, UserRole, RunLog, MachineMode

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrKGVTZkFyPslyrayJOHxYTUTO0POp360",
  authDomain: "juteexx-7862e.firebaseapp.com",
  projectId: "juteexx-7862e",
  storageBucket: "juteexx-7862e.firebasestorage.app",
  messagingSenderId: "76526186492",
  appId: "1:76526186492:web:f32d5985b82fc8a64a0c79",
  measurementId: "G-H2NRRG19Z1"
};

let app;
let analytics;
let auth;
let db;
let rtdb;
let firebaseInitialized = false; // Keep this false

console.log("firebase.ts: Attempting Firebase initialization...");
try {
  console.log("firebase.ts: Calling initializeApp with config:", firebaseConfig);
  app = initializeApp(firebaseConfig);
  console.log("firebase.ts: initializeApp successful. App instance:", app);

  console.log("firebase.ts: Calling getAnalytics...");
  analytics = getAnalytics(app);
  console.log("firebase.ts: getAnalytics successful.");

  console.log("firebase.ts: Calling getAuth...");
  auth = getAuth(app);
  console.log("firebase.ts: getAuth successful.");

  console.log("firebase.ts: Calling getFirestore...");
  db = getFirestore(app);
  console.log("firebase.ts: getFirestore successful.");

  console.log("firebase.ts: Calling getDatabase...");
  rtdb = getDatabase(app);
  console.log("firebase.ts: getDatabase successful.");

  firebaseInitialized = true; // This will now remain false
  console.log("Firebase.ts: Firebase successfully initialized. firebaseInitialized =", firebaseInitialized);
} catch (error) {
  console.error("Firebase.ts: FATAL ERROR during Firebase initialization:", error);
  firebaseInitialized = false; // Ensure this is false on error
}

// Function to initialize machines in Firestore
const initializeMachines = async () => {
  if (!firebaseInitialized || !db) {
    console.error("Firestore not initialized. Cannot initialize machines.");
    return;
  }
  console.log("initializeMachines: checking machines collection...");
  const machinesCol = collection(db, 'machines');
  const machineSnapshot = await getDocs(machinesCol);

  if (machineSnapshot.empty) {
    console.log("initializeMachines: machines collection is empty. Initializing sample machines...");
    for (const machine of SAMPLE_MACHINES) {
      // Ensure machine ID is used as doc ID
      const { id, ...machineData } = machine;
      // You'll need `setDoc` here, which needs to be imported or defined
      // For now, I'll assume setDoc is available or will be added
      // await setDoc(doc(machinesCol, id), {
      //   ...machineData,
      //   createdAt: serverTimestamp(),
      //   updatedAt: serverTimestamp(),
      // });
      await setDoc(doc(machinesCol, id), {
        ...machineData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("initializeMachines: Sample machines initialized.");
  } else {
    console.log("initializeMachines: machines collection already contains data.");
  }
};

const generatePinFirebase = async (machineId: string): Promise<{ pin: string; expiry: number }> => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  await addDoc(collection(db, 'activePins'), {
    machineId,
    pin,
    expiry,
    createdAt: serverTimestamp(),
  });

  return { pin, expiry };
};

const validateAndActivateFirebase = async (
  machineId: string,
  pin: string,
  duration: number,
  unit: 'HOURS' | 'DAYS',
  borrowerId: string
): Promise<boolean> => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  // Query for the PIN
  const q = query(collection(db, 'activePins'), where('machineId', '==', machineId), where('pin', '==', pin));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return false;
  }

  const pinDoc = querySnapshot.docs[0];
  const pinData = pinDoc.data();

    // Check expiry
  if (pinData.expiry < Date.now()) {
    await deleteDoc(pinDoc.ref); // Delete expired PIN
    return false;
  }

  // PIN is valid, delete it
  await deleteDoc(pinDoc.ref);

  // Update machine rental status
  const machineRef = doc(db, 'machines', machineId);
  await updateDoc(machineRef, {
    rentalStatus: 'RENTED',
    rentalSession: {
      startTime: Date.now(),
      duration,
      durationUnit: unit,
      borrowerId,
    },
    updatedAt: serverTimestamp(),
  });

  return true;
};

const addRunLogFirebase = async (runLog: Omit<RunLog, 'id'>) => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  await addDoc(collection(db, 'runLogs'), {
    ...runLog,
    createdAt: serverTimestamp(),
  });
};

const toggleMachineStateFirebase = async (machineId: string) => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  const machineRef = doc(db, 'machines', machineId);
  const machineSnap = await getFirestoreDoc(machineRef);

  if (!machineSnap.exists()) {
    throw new Error("Machine not found!");
  }

  const machine = machineSnap.data() as Machine;

  if (machine.status === 'RUNNING') {
    // Stop machine and create run log
    const endTime = Date.now();
    const startTime = endTime - (machine.telemetry.runtime * 1000); // Assuming runtime is in seconds
    const log: Omit<RunLog, 'id'> = {
      machineId: machine.id,
      machineName: machine.name,
      startTime: startTime,
      endTime: endTime,
      duration: machine.telemetry.runtime,
      mode: machine.currentMode,
      jams: machine.telemetry.jams,
      avgSpeed: machine.telemetry.speed,
      avgEfficiency: machine.telemetry.efficiency,
      date: new Date().toISOString(),
    };
    await addRunLogFirebase(log);

    await updateDoc(machineRef, {
      status: 'STOPPED',
      'telemetry.runtime': 0,
      'telemetry.rpm': 0,
      'telemetry.speed': 0,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Start machine
    await updateDoc(machineRef, {
      status: 'RUNNING',
      'telemetry.runtime': 0, // Reset runtime on start
      'telemetry.speed': 20, // Initial speed
      'telemetry.rpm': 500, // Initial RPM
      updatedAt: serverTimestamp(),
    });
  }
};

const setModeFirebase = async (machineId: string, mode: MachineMode) => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  const machineRef = doc(db, 'machines', machineId);
  await updateDoc(machineRef, {
    currentMode: mode,
    updatedAt: serverTimestamp(),
  });
};

const setSpeedFirebase = async (machineId: string, speed: number) => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  const machineRef = doc(db, 'machines', machineId);
  await updateDoc(machineRef, {
    'telemetry.speed': speed,
    updatedAt: serverTimestamp(),
  });
};

const triggerAntiJamFirebase = async (machineId: string) => {
  if (!firebaseInitialized || !db) throw new Error("Firebase not initialized.");
  const machineRef = doc(db, 'machines', machineId);
  const machineSnap = await getFirestoreDoc(machineRef);

  if (!machineSnap.exists()) {
    throw new Error("Machine not found!");
  }

  const machine = machineSnap.data() as Machine;

  await updateDoc(machineRef, {
    'telemetry.jams': machine.telemetry.jams + 1,
    'telemetry.lastAntiJam': Date.now(),
    updatedAt: serverTimestamp(),
  });
};

export { app, analytics, auth, db, rtdb, firebaseInitialized, initializeMachines, generatePinFirebase, validateAndActivateFirebase, addRunLogFirebase, toggleMachineStateFirebase, setModeFirebase, setSpeedFirebase, triggerAntiJamFirebase };

