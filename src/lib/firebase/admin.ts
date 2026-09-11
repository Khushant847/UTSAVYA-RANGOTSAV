import { initializeApp, cert, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const hasServiceAccount =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!getApps().length) {
  try {
    initializeApp({
      credential: hasServiceAccount
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
          })
        : applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || "utsavya-rangotsav-dev",
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export function getAdminDb() {
  if (!getApps().length) {
    throw new Error(
      "Firebase Admin SDK is not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to your environment."
    );
  }
  return getFirestore();
}

export const adminDb = getAdminDb();