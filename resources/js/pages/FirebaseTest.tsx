import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface FirebaseTestProps {
    success: boolean;
    message: string;
    data?: {
        document_id: string;
        document_data: {
            timestamp: number;
            message: string;
            date: string;
        };
    };
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Test Firebase',
        href: '/firebase-test',
    },
];

export default function FirebaseTest({ success, message, data, error }: FirebaseTestProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Test Firebase" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                    <h1 className="text-2xl font-bold mb-4">Test de connexion Firebase</h1>

                    <div className={`p-4 mb-4 rounded-md ${success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <p className={`text-lg font-semibold ${success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {message}
                        </p>
                    </div>

                    {success && data && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-2">Détails du document créé</h2>
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                                <p className="mb-2"><span className="font-semibold">ID du document:</span> {data.document_id}</p>
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Données:</h3>
                                    <pre className="bg-gray-200 dark:bg-gray-700 p-3 rounded overflow-auto">
                                        {JSON.stringify(data.document_data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {!success && error && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-2">Détails de l'erreur</h2>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
                                <pre className="text-red-700 dark:text-red-300 whitespace-pre-wrap">
                                    {error}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
