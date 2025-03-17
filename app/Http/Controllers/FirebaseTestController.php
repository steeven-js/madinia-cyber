<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Inertia\Inertia;
use App\Services\FirebaseLogService;

class FirebaseTestController extends Controller
{
    /**
     * Log Firebase operations
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    protected function logFirebaseOperation(string $message, array $context = [])
    {
        FirebaseLogService::log($message, $context);
    }

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

            // Log the successful connection
            $this->logFirebaseOperation('Connexion à Firebase réussie', [
                'project_id' => $projectId,
                'action' => 'testConnection',
                'timestamp' => now()->timestamp
            ]);

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
            // Log the error
            $this->logFirebaseOperation('Erreur de connexion à Firebase', [
                'error' => $e->getMessage(),
                'action' => 'testConnection',
                'timestamp' => now()->timestamp
            ]);

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

            // Convertir l'objet Traversable en tableau pour pouvoir le compter
            $userRecordsArray = iterator_to_array($userRecords);

            // Log the action
            $this->logFirebaseOperation('Récupération de la liste des utilisateurs Firebase', [
                'action' => 'listUsers',
                'user_count' => count($userRecordsArray),
                'timestamp' => now()->timestamp
            ]);

            // Convertir les objets utilisateur en tableaux pour l'affichage
            foreach ($userRecordsArray as $user) {
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

                // Récupérer les custom claims (rôles) de l'utilisateur
                $customClaims = $user->customClaims ?? [];
                $role = isset($customClaims['role']) ? $customClaims['role'] : null;

                $userData = [
                    'uid' => $user->uid,
                    'email' => $user->email,
                    'displayName' => $user->displayName,
                    'phoneNumber' => $user->phoneNumber,
                    'photoUrl' => $user->photoUrl,
                    'emailVerified' => $user->emailVerified,
                    'disabled' => $user->disabled,
                    'role' => $role,
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
                'totalUsers' => count($users),
                'availableRoles' => ['super_admin', 'admin', 'user']
            ]);
        } catch (\Exception $e) {
            // Log the error
            $this->logFirebaseOperation('Erreur lors de la récupération des utilisateurs Firebase', [
                'error' => $e->getMessage(),
                'action' => 'listUsers',
                'timestamp' => now()->timestamp
            ]);

            return Inertia::render('FirebaseUsers', [
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Set role for a Firebase user using custom claims
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setUserRole(Request $request)
    {
        try {
            // Valider les données de la requête
            $validated = $request->validate([
                'uid' => 'required|string',
                'role' => 'required|string|in:super_admin,admin,user'
            ]);

            // Initialiser la connexion à Firebase
            $factory = (new Factory)
                ->withServiceAccount(base_path(env('FIREBASE_CREDENTIALS')));

            // Créer l'instance Auth
            $auth = $factory->createAuth();

            // Définir les custom claims pour l'utilisateur
            $auth->setCustomUserClaims($validated['uid'], ['role' => $validated['role']]);

            // Log the action
            $this->logFirebaseOperation('Attribution d\'un rôle à un utilisateur Firebase', [
                'action' => 'setUserRole',
                'uid' => $validated['uid'],
                'role' => $validated['role'],
                'timestamp' => now()->timestamp
            ]);

            return response()->json([
                'success' => true,
                'message' => "Rôle '{$validated['role']}' attribué avec succès à l'utilisateur",
                'uid' => $validated['uid'],
                'role' => $validated['role']
            ]);
        } catch (\Exception $e) {
            // Log the error
            $this->logFirebaseOperation('Erreur lors de l\'attribution d\'un rôle à un utilisateur Firebase', [
                'error' => $e->getMessage(),
                'uid' => $request->input('uid', 'unknown'),
                'role' => $request->input('role', 'unknown'),
                'action' => 'setUserRole',
                'timestamp' => now()->timestamp
            ]);

            return response()->json([
                'success' => false,
                'message' => "Erreur lors de l'attribution du rôle",
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
