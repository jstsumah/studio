
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Company, Employee, Asset } from './types';

// IMPORTANT: The employee IDs below are placeholders. 
// For the app to work correctly after seeding, you MUST sign up with the emails used below.
// The signup process will create users in Firebase Authentication with new UIDs,
// and you will need to replace the placeholder IDs in the 'assets' collection in Firestore
// with the new UIDs for assignments to work.
const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: 'user1_placeholder_id',
    name: 'Admin User',
    email: 'admin@example.com',
    department: 'IT',
    jobTitle: 'System Administrator',
    avatarUrl: 'https://placehold.co/256x256.png',
  },
  {
    id: 'user2_placeholder_id',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    avatarUrl: 'https://placehold.co/256x256.png',
  },
];

const DUMMY_COMPANIES: Company[] = [
  { id: 'comp1', name: 'Innovate Inc.' },
  { id: 'comp2', name: 'Synergy Corp' },
];

const DUMMY_ASSETS: Omit<Asset, 'id'>[] = [
  {
    serialNumber: 'SN-LAP-001',
    category: 'Laptop',
    brand: 'Dell',
    model: 'XPS 15',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-14',
    status: 'In Use',
    assignedTo: 'user1_placeholder_id', // Admin User
    companyId: 'comp1',
    history: [
      {
        date: '2023-01-20',
        assignedTo: 'user1_placeholder_id',
        status: 'In Use',
        notes: 'Initial assignment.',
      },
    ],
  },
  {
    serialNumber: 'SN-PHN-002',
    category: 'Phone',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    purchaseDate: '2023-09-22',
    warrantyExpiry: '2025-09-21',
    status: 'In Use',
    assignedTo: 'user2_placeholder_id', // Jane Doe
    companyId: 'comp1',
    history: [
       {
        date: '2023-09-25',
        assignedTo: 'user2_placeholder_id',
        status: 'In Use',
        notes: 'New phone for new hire.',
      },
    ]
  },
  {
    serialNumber: 'SN-DSK-003',
    category: 'Desktop',
    brand: 'HP',
    model: 'Pavilion Gaming',
    purchaseDate: '2022-08-10',
    warrantyExpiry: '2025-08-09',
    status: 'Available',
    companyId: 'comp2',
    history: [],
  },
   {
    serialNumber: 'SN-TAB-004',
    category: 'Tablet',
    brand: 'Samsung',
    model: 'Galaxy Tab S9',
    purchaseDate: '2024-02-01',
    warrantyExpiry: '2026-02-01',
    status: 'In Repair',
    companyId: 'comp1',
    history: [],
  },
];

async function seedDatabase() {
  console.log('Starting to seed the database...');

  const batch = writeBatch(db);

  // Seed Companies
  console.log('Seeding companies...');
  const companiesCollection = collection(db, 'companies');
  DUMMY_COMPANIES.forEach((company) => {
    const docRef = doc(companiesCollection, company.id);
    batch.set(docRef, company);
  });
  console.log(`${DUMMY_COMPANIES.length} companies queued.`);
  
  // Seed Employees
  console.log('Seeding employees...');
  const employeesCollection = collection(db, 'employees');
  DUMMY_EMPLOYEES.forEach((employee) => {
    // NOTE: This creates employee docs with placeholder IDs.
    // The real documents will be created with correct Firebase Auth UIDs on user signup.
    const docRef = doc(employeesCollection, employee.id);
    batch.set(docRef, employee);
  });
  console.log(`${DUMMY_EMPLOYEES.length} employees queued with placeholder IDs.`);

  // Seed Assets
  console.log('Seeding assets...');
  const assetsCollection = collection(db, 'assets');
  DUMMY_ASSETS.forEach((asset) => {
    const docRef = doc(assetsCollection); // Auto-generate ID
    batch.set(docRef, asset);
  });
  console.log(`${DUMMY_ASSETS.length} assets queued.`);
  
  try {
    await batch.commit();
    console.log('------------------------------------------');
    console.log('✅ Database seeding completed successfully!');
    console.log('------------------------------------------');
    console.log('⚠️ IMPORTANT ACTION REQUIRED:');
    console.log("1. Please sign up in the application using the emails from the script (e.g., admin@example.com).");
    console.log("2. This will create users in Firebase Authentication with real UIDs.");
    console.log("3. You must then go to your Firestore 'assets' collection and manually update the 'assignedTo' fields with the new UIDs to make the assignments work correctly.");
    console.log('------------------------------------------');

  } catch (error) {
    console.error('🔥 Error seeding database:', error);
  }
}

seedDatabase();
