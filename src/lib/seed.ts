
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

async function seedDatabase() {
  console.log('\n✅ The application is ready for live data.');
  console.log('You can now add companies, employees, and assets directly through the UI.');
}

seedDatabase();
