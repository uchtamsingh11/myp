'use client';

import { useEffect } from 'react';
import BrokerAuthPage from '../../../components/dashboard/BrokerAuthPage';

export default function BrokerAuth() {
        useEffect(() => {
                document.title = 'Broker Authentication | AlgoZ';
        }, []);

        return (
                <div className="mt-[-3rem]">
                        <h1 className="text-2xl font-bold mb-1">Broker Authentication</h1>
                        <BrokerAuthPage />
                </div>
        );
}
