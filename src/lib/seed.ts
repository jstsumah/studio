
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Company, Employee, Asset } from './types';

// Sample Data has been removed for production use.
// You can add new data directly through the application's UI.
const companies: Company[] = [];

const employees: Omit<Employee, 'id'>[] = [];

const employeeIdMap: Record<string, string> = {}

const assets: Omit<Asset, 'id'>[] = [];

async function seedDatabase() {
  console.log('Checking for seed data...');

  if (companies.length === 0 && employees.length === 0 && assets.length === 0) {
    console.log('\n✅ No seed data found. The application is ready for live data.');
    console.log('You can now add companies, employees, and assets directly through the UI.');
    console.log('To re-populate with sample data, you would need to restore the contents of this file.');
    return;
  }

  console.log('Starting to seed database...');
  const batch = writeBatch(db);

  // Seed Companies
  if (companies.length > 0) {
    console.log('Preparing companies...');
    const companiesCollection = collection(db, 'companies');
    companies.forEach(company => {
      const docRef = doc(companiesCollection, company.id);
      batch.set(docRef, { name: company.name });
    });
    console.log(`${companies.length} companies prepared.`);
  }


  // Seed Employees
  if (employees.length > 0) {
    console.log('Preparing employees...');
    const employeesCollection = collection(db, 'employees');
    employees.forEach(employee => {
      const employeeId = employeeIdMap[employee.email];
      if (employeeId) {
          const docRef = doc(employeesCollection, employeeId);
          batch.set(docRef, employee);
      }
    });
    console.log(`${employees.length} employees prepared.`);
  }


  // Seed Assets
  if (assets.length > 0) {
    console.log('Preparing assets...');
    const assetsCollection = collection(db, 'assets');
    let i = 1;
    assets.forEach(asset => {
      const assetId = `asset-${i++}`;
      const docRef = doc(assetsCollection, assetId);
      batch.set(docRef, asset);
    });
    console.log(`${assets.length} assets prepared.`);
  }


  try {
    console.log('Committing batch write to Firestore...');
    await batch.commit();
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database: ', error);
  }
}

seedDatabase();
