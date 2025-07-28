
'use client';

import * as React from 'react';
import { format } from 'date-fns';

export function PurchaseDate({ date }: { date: string }) {
    const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!date) {
            setFormattedDate(null);
            return;
        }
        try {
            setFormattedDate(format(new Date(date), 'MM/dd/yyyy'));
        } catch (e) {
            setFormattedDate("Invalid Date");
        }
    }, [date]);

    return <>{formattedDate}</>;
}
