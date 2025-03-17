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
}
