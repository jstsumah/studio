
export type AssetCategory = 'Laptop' | 'Desktop' | 'Phone' | 'Tablet' | 'Other';
export type AssetStatus = 'Available' | 'In Use' | 'In Repair' | 'Decommissioned';

export type Company = {
  id: string;
  name: string;
};

export type Asset = {
  id: string;
  serialNumber: string;
  category: AssetCategory;
  brand: string;
  model: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: AssetStatus;
  assignedTo: string; // Employee ID
  photoUrl?: string;
  history: Assignment[];
  companyId: string;
};

export type Employee = {
  id:string;
  name: string;
  department: string;
  jobTitle: string;
  email: string;
  avatarUrl: string;
};

export type Assignment = {
  date: string;
  assignedTo: string; // Employee name or 'Unassigned'
  status: AssetStatus;
  notes?: string;
};

export type RecentActivity = {
  assetId: string;
  assetSerial: string;
  employeeId: string;
  employeeName: string;
  date: string;
  action: 'Assigned' | 'Returned';
}
