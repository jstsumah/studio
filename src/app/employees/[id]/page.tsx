
import * as React from 'react';
import { EmployeeProfile } from '@/components/employee-profile';

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
    return <EmployeeProfile employeeId={params.id} />;
}
