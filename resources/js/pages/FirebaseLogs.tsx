import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface LogEntry {
    timestamp: number;
    datetime: string;
    level: string;
    message: string;
    context: Record<string, any>;
    date: string;
    raw: string;
}

interface FirebaseLogsProps {
    logs: LogEntry[];
    days: number;
    totalLogs: number;
}

export default function FirebaseLogs({ logs, days, totalLogs }: FirebaseLogsProps) {
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [filter, setFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Firebase', href: '#' },
        { title: 'Logs', href: '/firebase-logs' },
    ];

    // Filtrer les logs en fonction des critères
    const filteredLogs = logs.filter(log => {
        const matchesSearch = filter === '' ||
            log.message.toLowerCase().includes(filter.toLowerCase()) ||
            log.raw.toLowerCase().includes(filter.toLowerCase());

        const matchesLevel = levelFilter === 'all' || log.level === levelFilter.toLowerCase();

        return matchesSearch && matchesLevel;
    });

    // Obtenir les niveaux de log uniques
    const logLevels = Array.from(new Set(logs.map(log => log.level)));

    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Firebase Logs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    Firebase Logs
                                </h1>
                                <div className="flex space-x-2">
                                    <Link
                                        href={`/firebase-logs?days=1`}
                                        className={`px-3 py-1 rounded-md ${days === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        1 jour
                                    </Link>
                                    <Link
                                        href={`/firebase-logs?days=7`}
                                        className={`px-3 py-1 rounded-md ${days === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        7 jours
                                    </Link>
                                    <Link
                                        href={`/firebase-logs?days=30`}
                                        className={`px-3 py-1 rounded-md ${days === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        30 jours
                                    </Link>
                                    <Link
                                        href="/firebase-logs/test"
                                        className="px-3 py-1 rounded-md bg-green-600 text-white"
                                    >
                                        Ajouter un log test
                                    </Link>
                                </div>
                            </div>

                            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Filtrer les logs..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700 dark:text-gray-300">Niveau:</span>
                                    <select
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                        value={levelFilter}
                                        onChange={(e) => setLevelFilter(e.target.value)}
                                    >
                                        <option value="all">Tous</option>
                                        {logLevels.map(level => (
                                            <option key={level} value={level}>
                                                {level.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                {filteredLogs.length} logs affichés sur {totalLogs} au total
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Date/Heure
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Niveau
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Message
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredLogs.length > 0 ? (
                                            filteredLogs.map((log, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        {log.datetime}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                            ${log.level === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                            log.level === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                                            {log.level.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="truncate max-w-md" title={log.message}>
                                                            {log.message}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => setSelectedLog(log)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        >
                                                            Détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Aucun log trouvé
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal pour afficher les détails du log */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Détails du log
                            </h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <span className="sr-only">Fermer</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date/Heure</h4>
                                <p className="text-gray-900 dark:text-white">{selectedLog.datetime}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Niveau</h4>
                                <p className="text-gray-900 dark:text-white">{selectedLog.level.toUpperCase()}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Message</h4>
                                <p className="text-gray-900 dark:text-white">{selectedLog.message}</p>
                            </div>
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contexte</h4>
                                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm text-gray-900 dark:text-white">
                                    {JSON.stringify(selectedLog.context, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Log brut</h4>
                                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm text-gray-900 dark:text-white">
                                    {selectedLog.raw}
                                </pre>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
