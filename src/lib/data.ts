
import type { Asset, Company, Employee, RecentActivity } from './types';
import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase';

// Caching layer to prevent re-fetching data on every navigation
let companies: Company[] | null = null;
let employees: Employee[] | null = null;
let assets: Asset[] | null = null;

async function fetchCollection<T>(collectionName: string, cache: T[] | null, setCache: (data: T[]) => void): Promise<T[]> {
  if (cache) {
    return cache;
  }
  try {
    const dataCollection = collection(db, collectionName);
    const dataSnapshot = await getDocs(dataCollection);
    const data = dataSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    setCache(data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}: `, error);
    // In case of error, return empty array and don't cache
    return [];
  }
}

export const getCompanies = async (): Promise<Company[]> => fetchCollection('companies', companies, (data) => companies = data);
export const getEmployees = async (): Promise<Employee[]> => fetchCollection('employees', employees, (data) => employees = data);
export const getAssets = async (): Promise<Asset[]> => fetchCollection('assets', assets, (data) => assets = data);


async function fetchRecentActivity(): Promise<RecentActivity[]> {
    // In a real app, this would be a query on a dedicated "activity" collection.
    // For now, we'll generate it from asset history.
    const allAssets = await getAssets();
    const allEmployees = await getEmployees();
    
    const generatedActivity: RecentActivity[] = [];
    allAssets.forEach(asset => {
        // Ensure history exists and is an array
        if (Array.isArray(asset.history)) {
            asset.history.forEach(h => {
                const employee = allEmployees.find(e => e.id === h.assignedTo);
                if (employee) {
                     generatedActivity.push({
                        assetId: asset.id,
                        assetSerial: asset.serialNumber,
                        employeeId: employee.id,
                        employeeName: employee.name,
                        date: h.date,
                        action: h.status === 'In Use' ? 'Assigned' : 'Returned' // Simplified logic
                    });
                }
            })
        }
    });
    
    return generatedActivity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,5);
}


export const getRecentActivity = async (): Promise<RecentActivity[]> => fetchRecentActivity();

export const getCompanyById = async (id: string): Promise<Company | undefined> => {
    const allCompanies = await getCompanies();
    return allCompanies.find(c => c.id === id);
}

export const getEmployeeById = async (id: string): Promise<Employee | undefined> => {
    const allEmployees = await getEmployees();
    return allEmployees.find(e => e.id === id);
}
export const getAssetById = async (id: string): Promise<Asset | undefined> => {
    const allAssets = await getAssets();
    return allAssets.find(a => a.id === id);
}
