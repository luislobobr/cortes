import * as admin from 'firebase-admin'

let initError = '';

const initializeFirebase = () => {
  if (!admin.apps.length) {
    let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      try {
        console.log('[Firebase] Iniciando inicialização...');
        
        let decodedStr = serviceAccountKey;

        // Verifica se é Base64 (não começa com '{') e decodifica
        if (!decodedStr.trim().startsWith('{')) {
          decodedStr = Buffer.from(decodedStr, 'base64').toString('utf-8');
        }

        // Sanitiza caracteres de controle (como quebras de linha reais) que quebram o JSON.parse
        decodedStr = decodedStr.replace(/\n/g, '\\n').replace(/\r/g, '');

        const serviceAccount = JSON.parse(decodedStr);
        
        // Se a chave privada veio com as barras duplas, volta para quebra de linha real
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
