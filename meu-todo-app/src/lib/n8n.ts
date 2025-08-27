// lib/n8n.ts
export const N8N_WEBHOOK_URL = "https://thalesfiscus.app.n8n.cloud/webhook-test/todo-webhook";

export type N8nResponse = {
  id?: number;
  title?: string | null;
  description?: string | null;
  processing_status?: string | null;
  [key: string]: any;
} | null;

/**
 * Chama o webhook do N8N e retorna a task otimizada.
 */
export async function enhanceTask(taskId: number, timeoutMs = 15000): Promise<N8nResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: taskId }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return json ?? null;
  } catch (err) {
    clearTimeout(timeout);
    console.warn("Error calling N8N webhook:", err);
    return null;
  }
}
