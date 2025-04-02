'use client';

import { useEffect } from 'react';
import BrokerAuthPage from '../../../components/dashboard/common/BrokerAuth';

export default function BrokerAuth() {
        useEffect(() => {
                document.title = 'Broker Authentication | AlgoZ';
        }, []);

        return (
                <div className="p-4">
                        <h1 className="text-2xl font-bold mb-6">Broker Authentication</h1>
                        <BrokerAuthPage />
                </div>
        );
}
