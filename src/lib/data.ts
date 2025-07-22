
import type { Asset, Company, Employee, RecentActivity } from './types';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from './firebase';

let companies: Company[] = [];
let employees: Employee[] = [];
let assets: Asset[] = [];
let recentActivity: RecentActivity[] = [];


async function fetchCompanies(): Promise<Company[]> {
  if (companies.length) return companies;
  try {
    const companiesCollection = collection(db, 'companies');
    const companySnapshot = await getDocs(companiesCollection);
    companies = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
    return companies;
  } catch (error) {
    console.error("Error fetching companies: ", error);
    return [];
  }
}

async function fetchEmployees(): Promise<Employee[]> {
  if (employees.length) return employees;
  try {
    const employeesCollection = collection(db, 'employees');
    const employeeSnapshot = await getDocs(employeesCollection);
    employees = employeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    return employees;
  } catch (error) {
    console.error("Error fetching employees: ", error);
    return [];
  }
}

async function fetchAssets(): Promise<Asset[]> {
    if (assets.length) return assets;
    try {
        const assetsCollection = collection(db, 'assets');
        const assetSnapshot = await getDocs(assetsCollection);
        assets = assetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        return assets;
    } catch (error) {
        console.error("Error fetching assets: ", error);
        return [];
    }
}

async function fetchRecentActivity(): Promise<RecentActivity[]> {
    if (recentActivity.length) return recentActivity;
    // In a real app, this would be a query on a dedicated "activity" collection.
    // For now, we'll generate it from asset history.
    const allAssets = await getAssets();
    const allEmployees = await getEmployees();
    const employeeMap = new Map(allEmployees.map(e => [e.id, e]));
    
    const generatedActivity: RecentActivity[] = [];
    allAssets.forEach(asset => {
        asset.history?.forEach(h => {
            const employee = allEmployees.find(e => e.name === h.assignedTo);
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
    });
    
    recentActivity = generatedActivity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,5);
    return recentActivity;
}


export const getAssets = async (): Promise<Asset[]> => fetchAssets();

export const getCompanies = async (): Promise<Company[]> => fetchCompanies();

export const getEmployees = async (): Promise<Employee[]> => fetchEmployees();

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

