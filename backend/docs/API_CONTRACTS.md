# Activity API Contracts

Base URL: `http://localhost:4000`

All endpoints prefixed with `/api/activities`.

---

## Data Types

```typescript
type Category = "Opener" | "Icebreaker" | "Active" | "Connection" | "Debrief" | "Team Challenge";
type EnergyLevel = "Low" | "Medium" | "High";
type Environment = "Large Open Space" | "Outdoor" | "Any" | "Small Space" | "Virtual";
type Setup = "None" | "Required";
type Duration = "5-15 min" | "15-30 min" | "30+ min";
type Status = "Draft" | "Published" | "Archived";

type Activity = {
  _id: string;
  title: string;
  overview: string;
  thumbnailUrl?: string;
  additionalMedia?: { type: "image" | "video"; url: string }[];
  category: Category[]; // up to 3
  gradeRange: { min: number; max: number };
  groupSize: { min: number; max: number; anySize: boolean };
  duration: Duration;
  energyLevel: EnergyLevel;
  environment: Environment[];
  setup: Setup;
  objective?: string;
  facilitateSections: { tabName: string; content: string }[];
  materials: string[];
  selTags: string[];
  status: Status;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};
```

---

## Endpoints

### 1. List Activities

```
GET /api/activities
```

**Query Parameters:**

| Param      | Type   | Default      | Description                                           |
| ---------- | ------ | ------------ | ----------------------------------------------------- |
| `status`   | string | —            | Filter by status: `Draft`, `Published`, `Archived`    |
| `search`   | string | —            | Case-insensitive search on `title` and `overview`     |
| `category` | string | —            | Filter by category (exact match)                      |
| `sort`     | string | `-createdAt` | Sort field. Prefix `-` for descending (e.g. `-title`) |
| `page`     | number | `1`          | Page number (1-based)                                 |
| `limit`    | number | `10`         | Items per page (max 100)                              |

**Response `200`:**

```json
{
  "activities": [Activity],
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

**Mobile app usage:** Always pass `?status=Published` to get only published activities.

---

### 2. Get Single Activity

```
GET /api/activities/:id
```

**Response `200`:** `Activity` object

**Response `404`:**

```json
{ "error": "Activity not found" }
```

---

### 3. Create Activity

```
POST /api/activities
Content-Type: application/json
```

Status is always forced to `"Draft"` on creation regardless of what is sent in the body.

**Request Body:**

```json
{
  "title": "Human Knot",
  "overview": "Teams untangle themselves from a human knot without letting go of hands.",
  "category": "Team Challenge",
  "gradeRange": { "min": 3, "max": 12 },
  "groupSize": { "min": 6, "max": 30, "anySize": false },
  "duration": "15-30 min",
  "energyLevel": "High",
  "environment": ["Large Open Space", "Outdoor"],
  "setup": "None",
  "objective": "Develop communication and teamwork skills.",
  "facilitateSections": [
    { "tabName": "Setup", "content": "Form a circle with 6-12 people." },
    { "tabName": "Play", "content": "Reach across and grab two different hands..." },
    { "tabName": "Debrief", "content": "Ask: What strategies worked?" }
  ],
  "materials": [],
  "selTags": ["teamwork", "communication"]
}
```

**Response `201`:** Created `Activity` object (with `_id`, `status: "Draft"`, timestamps)

**Response `400`:** Mongoose validation error

```json
{ "error": "Activity validation failed: title: Path `title` is required." }
```

---

### 4. Update Activity

```
PUT /api/activities/:id
Content-Type: application/json
```

Send any fields to update. Runs Mongoose validators.

**Request Body (partial example):**

```json
{
  "title": "Updated Title",
  "energyLevel": "Medium"
}
```

**Response `200`:** Updated `Activity` object

**Response `404`:**

```json
{ "error": "Activity not found" }
```

---

### 5. Change Activity Status

```
PATCH /api/activities/:id/status
Content-Type: application/json
```

**Request Body:**

```json
{ "status": "Published" }
```

Valid values: `"Draft"`, `"Published"`, `"Archived"`

**Response `200`:** Updated `Activity` object

**Response `400`:**

```json
{ "error": "Invalid status. Must be Draft, Published, or Archived." }
```

**Response `404`:**

```json
{ "error": "Activity not found" }
```

---

### 6. Delete Activity

```
DELETE /api/activities/:id
```

**Response `204`:** No content (success)

**Response `404`:**

```json
{ "error": "Activity not found" }
```

---

### 7. Upload Media

```
POST /api/activities/:id/media
Content-Type: multipart/form-data
```

**Form Fields:**

| Field         | Type   | Required | Description                                                               |
| ------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `file`        | File   | Yes      | Image or video file (jpg, png, gif, webp, mp4, webm, mov)                 |
| `mediaTarget` | string | Yes      | `"thumbnail"` or `"additional"`                                           |
| `mediaType`   | string | No       | `"image"` or `"video"` (for additional media only, defaults to `"image"`) |

**Max file size:** 10 MB

**Response `200`:** Updated `Activity` object

**Response `400`:**

```json
{ "error": "No file uploaded" }
```

**Response `404`:**

```json
{ "error": "Activity not found" }
```

---

### 8. Activity Stats (Dashboard)

```
GET /api/activities/stats
```

Returns category counts with percentages and status breakdown for dashboard overview cards.

**Response `200`:**

```json
{
  "total": 42,
  "categories": [
    { "category": "Active", "count": 10, "percentage": 23.8 },
    { "category": "Connection", "count": 8, "percentage": 19 },
    { "category": "Debrief", "count": 5, "percentage": 11.9 },
    { "category": "Icebreaker", "count": 7, "percentage": 16.7 },
    { "category": "Opener", "count": 6, "percentage": 14.3 },
    { "category": "Team Challenge", "count": 6, "percentage": 14.3 }
  ],
  "statuses": {
    "Draft": 15,
    "Published": 22,
    "Archived": 5
  }
}
```

---

## Error Handling

All errors return JSON:

```json
{ "error": "Error message here" }
```

| Status | Meaning                  |
| ------ | ------------------------ |
| `400`  | Validation / bad request |
| `404`  | Resource not found       |
| `500`  | Internal server error    |

---

## Use these curl commands to seed activities for development:

```bash
# Create a draft activity
curl -X POST http://localhost:4000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Human Knot",
    "overview": "Teams untangle themselves from a human knot.",
    "category": "Team Challenge",
    "gradeRange": { "min": 3, "max": 12 },
    "groupSize": { "min": 6, "max": 30, "anySize": false },
    "duration": "15-30 min",
    "energyLevel": "High",
    "environment": ["Large Open Space", "Outdoor"],
    "setup": "None",
    "facilitateSections": [
      { "tabName": "Setup", "content": "Form a circle." },
      { "tabName": "Play", "content": "Grab two different hands." }
    ],
    "materials": [],
    "selTags": ["teamwork"]
  }'

# Publish it (replace <id> with the _id from above)
curl -X PATCH http://localhost:4000/api/activities/<id>/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "Published" }'

# Mobile: fetch published only
curl "http://localhost:4000/api/activities?status=Published"

# Dashboard stats
curl http://localhost:4000/api/activities/stats
```
