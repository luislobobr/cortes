import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { processVideo } from "@/inngest/functions";

// Servir o endpoint HTTP para que o Inngest chame a função de processamento
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processVideo, // Adicionar a função ao servidor do Inngest
  ],
});
