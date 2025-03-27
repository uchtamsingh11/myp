'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }) {
        useEffect(() => {
                // Set page title
                document.title = 'Authentication | AlgoZ';
        }, []);

        return (
                <div className="min-h-screen bg-black">
                        {children}
                </div>
        );
} 