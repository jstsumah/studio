
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// This page is now a client-side redirect to the dynamic employee profile page.
// This simplifies the logic and avoids code duplication.
export default function ProfilePageRedirect() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        // Don't redirect until we know who the user is.
        if (isLoading || !user) {
            return;
        }
        router.replace(`/employees/${user.id}`);
    }, [user, isLoading, router]);

    // Show a loading state while redirecting
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-lg">Redirecting to your profile...</div>
        </div>
    );
}
