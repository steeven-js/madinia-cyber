import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import axios from 'axios';

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
    role: string | null;
    metadata: UserMetadata;
}

interface FirebaseUsersProps {
    success: boolean;
    message: string;
    users?: FirebaseUser[];
    totalUsers?: number;
    availableRoles?: string[];
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

export default function FirebaseUsers({ success, message, users = [], totalUsers, availableRoles = [], error }: FirebaseUsersProps) {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [userRoles, setUserRoles] = useState<Record<string, string | null>>({});
    const [notifications, setNotifications] = useState<{message: string, type: 'success' | 'error'}[]>([]);

    // Initialiser les rôles des utilisateurs
    React.useEffect(() => {
        const initialRoles: Record<string, string | null> = {};
        users.forEach(user => {
            initialRoles[user.uid] = user.role;
        });
        setUserRoles(initialRoles);
    }, [users]);

    const handleRoleChange = (uid: string, role: string) => {
        setUserRoles(prev => ({
            ...prev,
            [uid]: role
        }));
    };

    const saveRole = async (uid: string, role: string | null) => {
        if (!role) return;

        setLoading(prev => ({
            ...prev,
            [uid]: true
        }));

        try {
            const response = await axios.post('/firebase-users/set-role', {
                uid,
                role
            });

            if (response.data.success) {
                addNotification(response.data.message, 'success');
            } else {
                addNotification(response.data.message || 'Une erreur est survenue', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du rôle:', error);
            addNotification('Erreur lors de la mise à jour du rôle', 'error');
        } finally {
            setLoading(prev => ({
                ...prev,
                [uid]: false
            }));
        }
    };

    const addNotification = (message: string, type: 'success' | 'error') => {
        setNotifications(prev => [...prev, { message, type }]);

        // Supprimer la notification après 5 secondes
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.message !== message));
        }, 5000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Utilisateurs Firebase" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                    <h1 className="text-2xl font-bold mb-4">Utilisateurs Firebase</h1>

                    {/* Notifications */}
                    <div className="fixed top-4 right-4 z-50 space-y-2">
                        {notifications.map((notification, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-md shadow-md ${
                                    notification.type === 'success'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                }`}
                            >
                                {notification.message}
                            </div>
                        ))}
                    </div>

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
                                            Rôle
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        value={userRoles[user.uid] || ''}
                                                        onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                        className="text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                                    >
                                                        <option value="">Non défini</option>
                                                        {availableRoles.map((role) => (
                                                            <option key={role} value={role}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => saveRole(user.uid, userRoles[user.uid])}
                                                        disabled={loading[user.uid] || userRoles[user.uid] === user.role}
                                                        className={`px-3 py-1 text-xs rounded-md ${
                                                            loading[user.uid]
                                                                ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                                                : userRoles[user.uid] === user.role
                                                                ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
                                                        }`}
                                                    >
                                                        {loading[user.uid] ? 'Enregistrement...' : 'Enregistrer'}
                                                    </button>
                                                </div>
                                                {user.role && (
                                                    <div className="mt-1">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            user.role === 'super_admin'
                                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                                : user.role === 'admin'
                                                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </div>
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
