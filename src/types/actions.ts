// Tipo existente — usado por el ecommerce base
export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: any;
}

// Tipo LMS genérico — SPEC-LMS-CORE-001 v3.0
export type LmsActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
