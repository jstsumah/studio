import type { Asset, Employee, RecentActivity } from './types';

const employees: Employee[] = [
  { id: 'E001', name: 'Alice Johnson', department: 'Engineering', jobTitle: 'Software Engineer', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=E001' },
  { id: 'E002', name: 'Bob Williams', department: 'Marketing', jobTitle: 'Marketing Manager', email: 'bob@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=E002' },
  { id: 'E003', name: 'Charlie Brown', department: 'Sales', jobTitle: 'Sales Representative', email: 'charlie@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=E003' },
  { id: 'E004', name: 'Diana Miller', department: 'Engineering', jobTitle: 'QA Tester', email: 'diana@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=E004' },
  { id: 'E005', name: 'Ethan Davis', department: 'Human Resources', jobTitle: 'HR Specialist', email: 'ethan@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=E005' },
];

const assets: Asset[] = [
  {
    id: 'A001',
    serialNumber: 'SN-LAP-001',
    category: 'Laptop',
    brand: 'Dell',
    model: 'XPS 15',
    purchaseDate: '2022-01-15',
    warrantyExpiry: '2025-01-14',
    status: 'In Use',
    assignedTo: 'E001',
    photoUrl: 'https://placehold.co/600x400',
    history: [
      { date: '2022-01-20', assignedTo: 'Alice Johnson', status: 'In Use', notes: 'New assignment' },
    ],
  },
  {
    id: 'A002',
    serialNumber: 'SN-PHN-001',
    category: 'Phone',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    purchaseDate: '2023-09-20',
    warrantyExpiry: '2025-09-19',
    status: 'In Use',
    assignedTo: 'E002',
    photoUrl: 'https://placehold.co/600x400',
    history: [
      { date: '2023-09-25', assignedTo: 'Bob Williams', status: 'In Use', notes: 'New company phone' },
    ],
  },
  {
    id: 'A003',
    serialNumber: 'SN-DESK-001',
    category: 'Desktop',
    brand: 'HP',
    model: 'Pavilion Gaming',
    purchaseDate: '2021-05-10',
    warrantyExpiry: '2024-05-09',
    status: 'Available',
    photoUrl: 'https://placehold.co/600x400',
    history: [
      { date: '2021-05-12', assignedTo: 'Unassigned', status: 'Available', notes: 'Initial registration' },
    ],
  },
  {
    id: 'A004',
    serialNumber: 'SN-TAB-001',
    category: 'Tablet',
    brand: 'Samsung',
    model: 'Galaxy Tab S8',
    purchaseDate: '2023-03-01',
    warrantyExpiry: '2025-02-28',
    status: 'In Repair',
    assignedTo: 'E003',
    photoUrl: 'https://placehold.co/600x400',
    history: [
      { date: '2023-11-10', assignedTo: 'Charlie Brown', status: 'In Repair', notes: 'Screen cracked' },
      { date: '2023-03-05', assignedTo: 'Charlie Brown', status: 'In Use', notes: 'Assigned for sales demos' },
    ],
  },
  {
    id: 'A005',
    serialNumber: 'SN-LAP-002',
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 16',
    purchaseDate: '2023-06-12',
    warrantyExpiry: '2026-06-11',
    status: 'In Use',
    assignedTo: 'E004',
    photoUrl: 'https://placehold.co/600x400',
    history: [{ date: '2023-06-15', assignedTo: 'Diana Miller', status: 'In Use' }],
  },
  {
    id: 'A006',
    serialNumber: 'SN-LAP-003',
    category: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    purchaseDate: '2020-02-20',
    warrantyExpiry: '2023-02-19',
    status: 'Decommissioned',
    photoUrl: 'https://placehold.co/600x400',
    history: [
        { date: '2023-03-01', assignedTo: 'N/A', status: 'Decommissioned', notes: 'End of life' },
        { date: '2020-02-22', assignedTo: 'Ethan Davis', status: 'In Use' },
    ],
  },
  {
    id: 'A007',
    serialNumber: 'SN-OTH-001',
    category: 'Other',
    brand: 'Logitech',
    model: 'MX Master 3',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2025-01-14',
    status: 'Available',
    photoUrl: 'https://placehold.co/600x400',
    history: [{ date: '2023-01-15', assignedTo: 'Unassigned', status: 'Available' }],
  },
   {
    id: 'A008',
    serialNumber: 'SN-PHN-002',
    category: 'Phone',
    brand: 'Google',
    model: 'Pixel 8',
    purchaseDate: '2023-10-15',
    warrantyExpiry: '2025-10-14',
    status: 'In Use',
    assignedTo: 'E005',
    photoUrl: 'https://placehold.co/600x400',
    history: [{ date: '2023-10-20', assignedTo: 'Ethan Davis', status: 'In Use' }],
  },
  {
    id: 'A009',
    serialNumber: 'SN-DESK-002',
    category: 'Desktop',
    brand: 'Apple',
    model: 'iMac 24',
    purchaseDate: '2023-08-01',
    warrantyExpiry: '2026-07-31',
    status: 'Available',
    photoUrl: 'https://placehold.co/600x400',
    history: [{ date: '2023-08-01', assignedTo: 'Unassigned', status: 'Available' }],
  },
  {
    id: 'A010',
    serialNumber: 'SN-LAP-004',
    category: 'Laptop',
    brand: 'Microsoft',
    model: 'Surface Laptop 5',
    purchaseDate: '2023-11-01',
    warrantyExpiry: '2026-10-31',
    status: 'Available',
    photoUrl: 'https://placehold.co/600x400',
    history: [{ date: '2023-11-01', assignedTo: 'Unassigned', status: 'Available' }],
  },
];

const recentActivity: RecentActivity[] = [
    { assetId: 'A001', assetSerial: 'SN-LAP-001', employeeId: 'E001', employeeName: 'Alice Johnson', date: '2022-01-20', action: 'Assigned' },
    { assetId: 'A002', assetSerial: 'SN-PHN-001', employeeId: 'E002', employeeName: 'Bob Williams', date: '2023-09-25', action: 'Assigned' },
    { assetId: 'A004', assetSerial: 'SN-TAB-001', employeeId: 'E003', employeeName: 'Charlie Brown', date: '2023-03-05', action: 'Assigned' },
    { assetId: 'A006', assetSerial: 'SN-LAP-003', employeeId: 'E005', employeeName: 'Ethan Davis', date: '2023-03-01', action: 'Returned' },
    { assetId: 'A005', assetSerial: 'SN-LAP-002', employeeId: 'E004', employeeName: 'Diana Miller', date: '2023-06-15', action: 'Assigned' },
];

export const getAssets = (): Asset[] => assets;
export const getEmployees = (): Employee[] => employees;
export const getRecentActivity = (): RecentActivity[] => recentActivity;

export const getEmployeeById = (id: string): Employee | undefined => employees.find(e => e.id === id);
export const getAssetById = (id: string): Asset | undefined => assets.find(a => a.id === id);
