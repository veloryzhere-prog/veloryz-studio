# R49 Studio Intelligence 3.0

The four knowledge roles continue to share the existing public knowledge API; named character assistants retain their separate identities and adviser endpoint. Both proxy and edge enforce request size limits and conversation order. Explicit reference-only configuration must never silently call another model. The edge returns safe provider status categories, not credentials or raw vendor errors. The Creator can opt in to sharing category, page count and selected features, never automatically attaching its contact data or full brief. Support and Creator can cancel their current client request or reset conversation state. No server-side transcript persistence is added. Retrieval incorporates the previous user question and Unicode tokens. Existing rate limits, encryption, owner authentication and source boundaries remain.

Not yet implemented: genuine token streaming, private document attachments, a unified persona and knowledge provider profile, persistent account conversation history. Cancellation stops the browser request; provider processing may still finish. Provider availability and actual inference require authorized integration checks.

## Streaming completion

The configured Gemini/OpenAI providers can emit actual server-sent text deltas. The public protocol forwards text only, ignores thought events, and requires a completed response before saving it. JSON reference fallback remains distinct; shared fallback models may return a full answer without streaming. Public Help/Support/Planner can attach up to 800 characters of non-confidential .txt/.md reference text, included only on send. Client assistant excludes this file control. No private file storage or account-synced transcript is introduced.

## Private client archive

Opt-in storage through the existing invitation-authenticated portal, scoped to the server-derived project and hashed current recipient identity. AES-GCM encryption, service-only table, explicit save/load/delete, optimistic version checks, maximum eight completed conversation messages and two 2,000-character text notes. Text notes are never injected into model prompts. Public and demo chat cannot access the archive. Client AI session memory is cleared when leaving the workspace. Archives are hidden after 30 days; automatic physical purge is not implemented. Arbitrary PDFs, images and executables are not accepted.
