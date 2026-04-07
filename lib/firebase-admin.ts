import * as admin from 'firebase-admin'

let initError = '';

const initializeFirebase = () => {
  if (!admin.apps.length) {
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      try {
        console.log('[Firebase] Iniciando inicialização...');
        
        // Verifica se é Base64 (não começa com '{') e decodifica se necessário
        if (!serviceAccountKey.trim().startsWith('{')) {
          console.log('[Firebase] Detectado formato Base64.');
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
        console.log('[Firebase] Firebase Admin inicializado com sucesso.');
      } catch (error: any) {
        initError = 'Erro ao fazer parse da chave do Firebase: ' + error.message;
        console.error('[Firebase] Erro ao inicializar Firebase Admin:', error.message);
      }
    } else {
      initError = 'A variável FIREBASE_SERVICE_ACCOUNT_KEY não foi encontrada na Vercel.';
      console.warn('[Firebase] Aviso: FIREBASE_SERVICE_ACCOUNT_KEY não encontrada.');
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
    if (!admin.apps.length) {
      if (prop === 'collection' || prop === 'doc') {
        throw new Error(initError || 'Firebase não inicializou.');
      }
      return (target as any)[prop];
    }
    const db = admin.firestore();
    return (db as any)[prop];
  },
});
