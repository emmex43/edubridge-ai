# Tutor Course Authoring API Contract

**Status:** Proposed; not implemented.  
**Media provider:** Cloudinary.  
**Base path:** `/api/v1/tutor`

This contract covers saving tutor-authored courses, modules, lessons, and
BlockNote editor content. It is separate from the existing
`GET /api/v1/modules` student catalogue, which currently returns RAG modules.

## Authentication and authorization

- Require `Authorization: Bearer <access_token>` on every endpoint.
- Resolve the owner from the authenticated user; never accept an owner or
  student ID from the request body as authority.
- Add an explicit tutor permission/role and check it on authoring and media
  routes. The passcode currently shown by the upload page is client-side only
  and is not an authorization mechanism.
- Verify course ownership for every nested module, lesson, publish, and media
  operation. Return `404` for resources the caller does not own.

## Data model

Use UUIDs for public resource IDs and UTC timestamps.

| Resource | Required fields | Notes |
|---|---|---|
| `Course` | `id`, `owner_id`, `title`, `description`, `status`, `created_at`, `updated_at`, `published_at` | `status` is `draft` or `published`; new courses start as drafts. |
| `CourseModule` | `id`, `course_id`, `title`, `position`, `created_at`, `updated_at` | Store the ordered curriculum modules. |
| `Lesson` | `id`, `module_id`, `title`, `position`, `content_json`, `content_version`, `created_at`, `updated_at` | `content_json` is a JSON column containing BlockNote blocks, not HTML or Markdown. Set `content_version` to `1`. |
| `MediaAsset` | `id`, `owner_id`, `course_id`, `public_id`, `resource_type`, `secure_url`, `format`, `bytes`, `created_at` | Recommended for validating ownership and reconciling/deleting Cloudinary assets. `public_id` must be unique. `resource_type` is `image` or `video`. |

Use foreign keys with cascading deletion from course to modules and modules to
lessons. Enforce ordering per parent and index foreign keys. The SQLAlchemy
`JSON` type keeps `content_json` portable across the project's supported
database URLs.

The current frontend keeps `Lesson.content` as a string in Zustand and stores
`JSON.stringify(editor.document)`. At the API boundary, parse that string and
send the resulting BlockNote block array as JSON; return the array in
`content_json` so the frontend can stringify it for the current store.

Example `content_json`:

```json
[
  {
    "id": "block-id",
    "type": "heading",
    "props": { "level": 1 },
    "content": [{ "type": "text", "text": "Introduction", "styles": {} }],
    "children": []
  }
]
```

Persist the complete block objects, including inline styles, nested children,
and media URLs/metadata. Do not reduce the document to rendered HTML or plain
text.

## Endpoints

All successful responses use the existing `{"status": "success", ...}` style.

| Method and path | Purpose |
|---|---|
| `GET /courses` | List the authenticated tutor's courses, ordered by most recently updated. |
| `POST /courses` | Create a draft course. Body: `{"title":"...", "description":"..."}`. |
| `GET /courses/{course_id}` | Get a course with its ordered modules and lessons. |
| `PATCH /courses/{course_id}` | Update `title` and/or `description`. |
| `DELETE /courses/{course_id}` | Delete an owned draft course and its modules/lessons. Published-course deletion should be rejected until an explicit unpublish flow is agreed. |
| `POST /courses/{course_id}/modules` | Add a module. Body: `{"title":"...", "position":0}`. |
| `PATCH /modules/{module_id}` | Update module `title` and/or `position`. |
| `DELETE /modules/{module_id}` | Delete an owned module and its lessons. |
| `POST /modules/{module_id}/lessons` | Add a lesson. Body: `{"title":"...", "position":0, "content_json":[]}`. |
| `GET /lessons/{lesson_id}` | Get one owned lesson. |
| `PATCH /lessons/{lesson_id}` | Update lesson `title`, `position`, and/or `content_json`. |
| `DELETE /lessons/{lesson_id}` | Delete an owned lesson. |
| `POST /courses/{course_id}/publish` | Publish an owned course after validating its required content; set `published_at`. |
| `POST /media/sign-upload` | Create a short-lived Cloudinary upload signature for an image or video in an owned course. |
| `POST /media/complete` | Verify a completed Cloudinary upload and register its asset metadata. |

The authoring endpoints intentionally live under `/api/v1/tutor`; do not change
the existing RAG-backed `GET /api/v1/modules` response as part of this work.
When student-facing lessons are ready, define a separate published-content
read endpoint and explicitly decide how it relates to that catalogue.

### Lesson update example

Request:

```http
PATCH /api/v1/tutor/lessons/4fe2116b-ece4-4a2d-b1bb-c1feea52304b
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "title": "Introduction",
  "position": 0,
  "content_json": [
    {
      "id": "block-id",
      "type": "paragraph",
      "props": {},
      "content": [{ "type": "text", "text": "Lesson text", "styles": {} }],
      "children": []
    }
  ]
}
```

Response:

```json
{
  "status": "success",
  "lesson": {
    "id": "4fe2116b-ece4-4a2d-b1bb-c1feea52304b",
    "module_id": "module-uuid",
    "title": "Introduction",
    "position": 0,
    "content_json": [
      {
        "id": "block-id",
        "type": "paragraph",
        "props": {},
        "content": [{ "type": "text", "text": "Lesson text", "styles": {} }],
        "children": []
      }
    ],
    "content_version": 1,
    "updated_at": "2026-11-08T10:00:00Z"
  }
}
```

Use partial-update semantics for `PATCH`: omitted fields stay unchanged;
`content_json: []` is an explicit empty document. Reject malformed block
payloads with `422`. Return `404` for a missing or non-owned resource and `403`
when the authenticated account lacks tutor permission.

## Cloudinary upload flow

1. The authenticated client requests a signature from
   `POST /api/v1/tutor/media/sign-upload`:

   ```json
   { "course_id": "course-uuid", "resource_type": "image" }
   ```

2. The backend checks tutor permission and course ownership, creates a
   user/course-scoped folder and unique `public_id`, and signs only the
   approved upload parameters using the server-side Cloudinary API secret.
   Return the Cloudinary `upload_url`, `cloud_name`, `api_key`, `timestamp`,
   `signature`, `folder`, `public_id`, and `resource_type`.
3. The browser uploads the file directly to the returned Cloudinary URL using
   `multipart/form-data`. It must never receive the Cloudinary API secret.
4. The client calls `POST /api/v1/tutor/media/complete` with the course ID,
   `public_id`, and `resource_type`. The backend verifies the asset with
   Cloudinary, checks that it is in the signed user/course folder, then stores
   its `secure_url`, format, and byte size in `MediaAsset`.
5. The editor stores the verified `secure_url` and `public_id` in its BlockNote
   image/video block. On lesson save, the API rejects media references not
   registered to that tutor and course.

Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` only in the backend environment. Apply configured file
size and format limits, and use Cloudinary's signed-upload mechanism rather
than exposing an unsigned upload preset.

## Implementation notes

- The backend currently calls `Base.metadata.create_all()` at startup. This
  creates the new tables but does not migrate existing tables; use the
  repository's agreed migration process before deploying schema changes.
- Keep save errors in FastAPI's existing `detail` response shape so the
  frontend's `ApiError` can display them. Use `409` for invalid state changes
  (for example publishing an incomplete course).
- The current authoring store is in-memory only. Once these endpoints exist,
  load the tutor's courses on entry and save course/lesson updates through the
  frontend API client; do not report a local Zustand update as a backend save.
