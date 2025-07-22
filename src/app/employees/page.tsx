import { getEmployees } from '@/lib/data';
import { EmployeeTableClient } from '@/components/employee-table-client';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const employees: Employee[] = getEmployees();
  
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold font-headline mb-4">Employee Management</h1>
      <EmployeeTableClient employees={employees} />
    </div>
  );
}
