import * as admin from 'firebase-admin'

const initializeFirebase = () => {
  if (!admin.apps.length) {
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      try {
        // Verifica se é Base64 (não começa com '{') e decodifica se necessário
        if (!serviceAccountKey.trim().startsWith('{')) {
          serviceAccountKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
        }

        const serviceAccount = JSON.parse(serviceAccountKey);
        
        // Trata quebras de linha na chave privada
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (error) {
        console.error('Erro ao inicializar Firebase Admin:', error);
      }
    }
  }
};

/**
 * Exporta o Firestore admin usando um Proxy para inicialização preguiçosa (Lazy).
 * Suporta chaves em JSON puro ou Base64.
 */
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop) {
    initializeFirebase();
    if (!admin.apps.length) return undefined;
    const db = admin.firestore();
    return (db as any)[prop];
  },
});
