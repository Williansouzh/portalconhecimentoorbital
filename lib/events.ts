import { query } from "./db";
import { normalize } from "./search";

/** Registra a busca e devolve o id, usado depois para atribuir o clique. */
export async function recordSearch(
  userId: string,
  term: string,
  resultsCount: number
): Promise<number | null> {
  const trimmed = term.trim();
  if (!trimmed) return null;
  const rows = await query<{ id: string }>(
    `INSERT INTO search_events (user_id, term, normalized, results_count)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [userId, trimmed, normalize(trimmed), resultsCount]
  );
  return rows[0] ? Number(rows[0].id) : null;
}

/** Clique num resultado, ligado à busca que o originou. */
export async function recordClick(userId: string, searchEventId: number, articleId: string): Promise<void> {
  await query(
    `INSERT INTO result_clicks (search_event_id, user_id, article_id)
     SELECT $2, $1, $3 WHERE EXISTS (SELECT 1 FROM search_events WHERE id = $2)`,
    [userId, searchEventId, articleId]
  );
}

export async function recordFeedback(input: {
  userId: string;
  articleId: string;
  helpful?: boolean;
  outdatedReport?: boolean;
  comment?: string;
}): Promise<void> {
  await query(
    `INSERT INTO article_feedback (article_id, user_id, helpful, outdated_report, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      input.articleId,
      input.userId,
      input.helpful ?? null,
      input.outdatedReport ?? false,
      input.comment?.trim() || null,
    ]
  );
}
