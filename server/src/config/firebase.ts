import * as admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../utils/logger';

let firestore: admin.firestore.Firestore;

function initializeFirebase(): void {
  try {
    if (admin.apps.length > 0) {
      firestore = admin.firestore();
      return;
    }

    if (env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = env.FIRESTORE_EMULATOR_HOST;
      admin.initializeApp({ projectId: env.FIREBASE_PROJECT_ID || 'demo-chatapp' });
      logger.info('Firebase initialized with emulator', {
        host: env.FIRESTORE_EMULATOR_HOST,
      });
    } else if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
      logger.info('Firebase initialized with service account');
    } else {
      logger.warn(
        'Firebase credentials not configured. Firestore operations will fail. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY, ' +
        'or set FIRESTORE_EMULATOR_HOST for local development.'
      );
      // Initialize with minimal config so the app still starts
      admin.initializeApp({ projectId: 'demo-chatapp' });
    }

    firestore = admin.firestore();
  } catch (error) {
    logger.error('Failed to initialize Firebase', { error });
    throw error;
  }
}

initializeFirebase();

export { firestore, admin };

