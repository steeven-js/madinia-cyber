import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface UserMetadata {
    createdAt: string | null;
    lastLoginAt: string | null;
}

interface FirebaseUser {
    uid: string;
    email: string;
    displayName: string | null;
    phoneNumber: string | null;
    photoUrl: string | null;
    emailVerified: boolean;
    disabled: boolean;
    metadata: UserMetadata;
}

interface FirebaseUsersProps {
    success: boolean;
    message: string;
    users?: FirebaseUser[];
    totalUsers?: number;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Utilisateurs Firebase',
        href: '/firebase-users',
    },
];

// Fonction utilitaire pour formater les dates
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';

    try {
        const date = new Date(dateString);
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
            return dateString; // Retourner la chaîne originale si la date est invalide
        }
        return date.toLocaleString();
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return dateString || '-';
    }
};

export default function FirebaseUsers({ success, message, users, totalUsers, error }: FirebaseUsersProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Utilisateurs Firebase" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                    <h1 className="text-2xl font-bold mb-4">Utilisateurs Firebase</h1>

                    <div className={`p-4 mb-4 rounded-md ${success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <p className={`text-lg font-semibold ${success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {message}
                        </p>
                        {success && totalUsers !== undefined && (
                            <p className="mt-2 text-gray-700 dark:text-gray-300">
                                Nombre total d'utilisateurs: <span className="font-semibold">{totalUsers}</span>
                            </p>
                        )}
                    </div>

                    {success && users && users.length > 0 ? (
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            UID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Nom
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Créé le
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Dernière connexion
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                    {users.map((user) => (
                                        <tr key={user.uid}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {user.uid.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {user.displayName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.disabled ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                    {user.disabled ? 'Désactivé' : 'Actif'}
                                                </span>
                                                {user.emailVerified && (
                                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                        Email vérifié
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(user.metadata.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(user.metadata.lastLoginAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : success && users && users.length === 0 ? (
                        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
                            <p className="text-yellow-700 dark:text-yellow-300">
                                Aucun utilisateur trouvé dans Firebase Auth.
                            </p>
                        </div>
                    ) : null}

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
