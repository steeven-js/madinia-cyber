<?php

use Illuminate\Support\Env;

return [
    /*
     * ------------------------------------------------------------------------
     * Default Firebase project
     * ------------------------------------------------------------------------
     */
    'default' => Env::get('FIREBASE_PROJECT', 'app'),

    /*
     * ------------------------------------------------------------------------
     * Firebase project configurations
     * ------------------------------------------------------------------------
     */
    'projects' => [
        'app' => [
            /*
             * ------------------------------------------------------------------------
             * Credentials / Service Account
             * ------------------------------------------------------------------------
             *
             * In order to access a Firebase project and its related services using a
             * server SDK, requests must be authenticated. For server-to-server
             * communication this is done with a Service Account.
             *
             * If you don't already have generated a Service Account, you can do so by
             * following the instructions from the official documentation pages at
             *
             * https://firebase.google.com/docs/admin/setup#initialize_the_sdk
             *
             * Once you have downloaded the Service Account JSON file, you can use it
             * to configure the package.
             *
             * If you don't provide credentials, the Firebase Admin SDK will try to
             * autodiscover them
             *
             * - by checking the environment variable FIREBASE_CREDENTIALS
             * - by checking the environment variable GOOGLE_APPLICATION_CREDENTIALS
             * - by trying to find Google's well known file
             * - by checking if the application is running on GCE/GCP
             *
             * In most cases, you can leave the credentials as null and the Admin SDK
             * will take care of it.
             *
             */
            'credentials' => Env::get('FIREBASE_CREDENTIALS'),

            /*
             * ------------------------------------------------------------------------
             * Firebase Database
             * ------------------------------------------------------------------------
             */
            'database' => [
                'url' => Env::get('FIREBASE_DATABASE_URL', null),
            ],

            /*
             * ------------------------------------------------------------------------
             * Firebase Storage
             * ------------------------------------------------------------------------
             */
            'storage' => [
                'default_bucket' => Env::get('FIREBASE_STORAGE_DEFAULT_BUCKET', null),
            ],

            /*
             * ------------------------------------------------------------------------
             * Verify SSL
             * ------------------------------------------------------------------------
             */
            'ssl' => [
                'verify' => Env::get('FIREBASE_S
L_VERIFY', true),
            ],
        ],
    ],
];
