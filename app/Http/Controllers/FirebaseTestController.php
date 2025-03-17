<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Inertia\Inertia;

class FirebaseTestController extends Controller
{
    /**
     * Test Firebase connection and return the result
     *
     * @return \Inertia\Response
     */
    public function testConnection()
    {
        try {
            // Utiliser la méthode de connexion directe à Firebase
            $factory = (new Factory)
                ->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')));

            // Récupérer l'ID du projet à partir du fichier de configuration
            $serviceAccount = json_decode(file_get_contents(base_path(env('FIREBASE_CREDENTIALS'))), true);
            // dd($serviceAccount);
            $projectId = $serviceAccount['project_id'] ?? 'unknown';

            // Essayer de se connecter à l'authentification Firebase (ne nécessite pas de base de données)
            $auth = $factory->createAuth();

            return Inertia::render('FirebaseTest', [
                'success' => true,
                'message' => 'Connexion à Firebase réussie!',
                'data' => [
                    'document_id' => 'auth_test',
                    'document_data' => [
                        'project_id' => $projectId,
                        'timestamp' => time(),
                        'message' => 'Connexion réussie à l\'authentification Firebase',
                        'date' => date('Y-m-d H:i:s')
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return Inertia::render('FirebaseTest', [
                'success' => false,
                'message' => 'Erreur de connexion à Firebase',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * List all users from Firebase Auth
     *
     * @return \Inertia\Response
     */
    public function listUsers()
    {
        try {
            // Initialiser la connexion à Firebase
            $factory = (new Factory)
                ->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')));

            // Créer l'instance Auth
            $auth = $factory->createAuth();

            // Récupérer les utilisateurs (par défaut, limité à 1000 utilisateurs)
            $users = [];
            $userRecords = $auth->listUsers();

            // Convertir les objets utilisateur en tableaux pour l'affichage
            foreach ($userRecords as $user) {
                // Formater les dates correctement
                $createdAt = null;
                $lastLoginAt = null;

                // Vérifier et formater la date de création
                if ($user->metadata->createdAt instanceof \DateTimeInterface) {
                    $createdAt = $user->metadata->createdAt->format('Y-m-d H:i:s');
                } elseif (is_string($user->metadata->createdAt) && !empty($user->metadata->createdAt)) {
                    // Si c'est une chaîne de caractères, essayer de la convertir
                    try {
                        $createdAt = (new \DateTime($user->metadata->createdAt))->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        // Si la conversion échoue, utiliser la valeur brute
                        $createdAt = $user->metadata->createdAt;
                    }
                }

                // Vérifier et formater la date de dernière connexion
                if ($user->metadata->lastLoginAt instanceof \DateTimeInterface) {
                    $lastLoginAt = $user->metadata->lastLoginAt->format('Y-m-d H:i:s');
                } elseif (is_string($user->metadata->lastLoginAt) && !empty($user->metadata->lastLoginAt)) {
                    // Si c'est une chaîne de caractères, essayer de la convertir
                    try {
                        $lastLoginAt = (new \DateTime($user->metadata->lastLoginAt))->format('Y-m-d H:i:s');
                    } catch (\Exception $e) {
                        // Si la conversion échoue, utiliser la valeur brute
                        $lastLoginAt = $user->metadata->lastLoginAt;
                    }
                }

                $userData = [
                    'uid' => $user->uid,
                    'email' => $user->email,
                    'displayName' => $user->displayName,
                    'phoneNumber' => $user->phoneNumber,
                    'photoUrl' => $user->photoUrl,
                    'emailVerified' => $user->emailVerified,
                    'disabled' => $user->disabled,
                    'metadata' => [
                        'createdAt' => $createdAt,
                        'lastLoginAt' => $lastLoginAt,
                    ],
                ];

                $users[] = $userData;
            }

            return Inertia::render('FirebaseUsers', [
                'success' => true,
                'message' => 'Liste des utilisateurs récupérée avec succès',
                'users' => $users,
                'totalUsers' => count($users)
            ]);
        } catch (\Exception $e) {
            return Inertia::render('FirebaseUsers', [
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ]);
        }
    }
}
