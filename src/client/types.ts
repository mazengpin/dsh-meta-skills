/**
 * dsh-meta-skills — the Client surfaces this half reads, declared STRUCTURALLY.
 *
 * The same rule the Host half follows: no `@deepseek-ai/*` value import, so this
 * bundle is a load-order dependency on nobody. `slots` is the only service the
 * page needs, and `locale` the only other one.
 *
 * @module dsh-meta-skills/client/types
 */

/** Translate a key, with named substitutions. */
export type Translator = (key: string, params?: Record<string, string | number>) => string

/** The Client plugin context slice this plugin consumes. */
export interface ClientContext {
  readonly slots: {
    inject(name: string, callback: () => unknown): void
    register(options: Record<string, unknown>, component: unknown): unknown
  }
  readonly locale: {
    register(namespace: string, language: string, dictionary: Record<string, string>): () => void
    bind(namespace: string): Translator
  }
  effect(callback: () => (() => void) | void, label?: string): void
  readonly logger: { info(...args: unknown[]): void; warn(...args: unknown[]): void }
}
