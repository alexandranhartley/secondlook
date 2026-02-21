# API Documentation: Generate Questions Endpoint

## Overview

The `/api/generate-questions` endpoint generates contextual questions to help improve confidence levels for insights that have Low or Medium confidence. Questions are designed to help multiple insights simultaneously when possible.

## When the API is Called

### Trigger Conditions

The API is called automatically when:

1. **Component Mount**: The `GlobalQuestionsSection` component mounts on the results page
2. **Insights Need Help**: There is at least one insight with `Low` or `Medium` confidence
3. **Dependencies Change**: The API call is triggered when any of these dependencies change:
   - `insightsNeedingHelp` array
   - `photos` array
   - `price` string
   - `notes` string
   - `overallAnalysis` object

### Location in Code Flow

```
Results Page (`app/results/page.tsx`)
  └─> Identifies Low/Medium confidence insights
      └─> Renders GlobalQuestionsSection component
          └─> useEffect hook triggers API call on mount
              └─> POST /api/generate-questions
```

### Component Location

**File**: `app/components/GlobalQuestionsSection.tsx`

**Hook**: `useEffect` (lines 46-73)

**Condition**: Only executes if `insightsNeedingHelp.length > 0`

## How the API is Called

### Request Details

**Endpoint**: `POST /api/generate-questions`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```typescript
{
  insightsNeedingHelp: Array<{
    label: string;           // e.g., "Age", "Materials", "Condition", "Est. Savings"
    value: string;            // e.g., "1980s", "Solid oak", "$500-700"
    confidence: "High" | "Medium" | "Low"
  }>;
  photos: string[];          // Array of data URLs (base64 encoded images)
  price: string;             // Asking price as string, e.g., "500"
  notes: string;             // User-provided notes about the item
  overallAnalysis: {         // Full analysis object from /api/analyze-item
    recommendation: {
      headline: string;
      subhead: string;
      confidence: "High" | "Medium" | "Low";
      chips: string[];
    };
    insights: Array<{
      label: string;
      value: string;
      confidence: "High" | "Medium" | "Low";
      reasoning?: string;
    }>;
    title: string;
    fairValueRange: [number, number];
    estSavingsRange: [number, number];
  }
}
```

### Example Request

```json
{
  "insightsNeedingHelp": [
    {
      "label": "Age",
      "value": "1980s",
      "confidence": "Medium"
    },
    {
      "label": "Materials",
      "value": "Solid oak hardwood",
      "confidence": "Low"
    }
  ],
  "photos": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ],
  "price": "500",
  "notes": "Found at estate sale",
  "overallAnalysis": {
    "recommendation": {
      "headline": "Worth a closer look",
      "confidence": "Medium"
    },
    "insights": [...]
  }
}
```

### Response Format

**Success Response** (200):
```typescript
{
  questions: Array<{
    id: string;                    // e.g., "q1", "q2"
    text: string;                  // Question text
    answerType: "photo" | "text";  // Type of answer expected
    helpsInsights: string[];       // Array of insight labels this helps
  }>
}
```

**Example Response**:
```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Can you see a maker's mark or label?",
      "answerType": "photo",
      "helpsInsights": ["Age", "Materials"]
    },
    {
      "id": "q2",
      "text": "What style period does it match?",
      "answerType": "text",
      "helpsInsights": ["Age"]
    }
  ]
}
```

**Error Responses**:
- `400`: Invalid JSON body
- `502`: OpenAI API error or invalid response format
- `503`: OPENAI_API_KEY not configured

## Prompts Used

### System Prompt

**Location**: `app/lib/prompts.ts` (line 6)

**Content**:
```
You are an expert secondhand furniture advisor. Given multiple insights that need confidence improvement and full context about the item (photos, price, notes, and overall analysis), generate exactly 2 short questions that would be most beneficial and move the needle in confidence levels. Prioritize questions that help multiple insights simultaneously. Each question should be answerable by either a photo or a short text answer. Questions must be highly relevant to the specific item being analyzed, referencing details from the photos, price, or notes provided. Return valid JSON only, no markdown or explanation.
```

### User Prompt Template

**Location**: `app/lib/prompts.ts` (function `buildQuestionsUserPrompt`, lines 8-49)

**Structure**:
```
Insights that need confidence improvement:
- {label}: "{value}" ({confidence} confidence)
- {label}: "{value}" ({confidence} confidence)
...

Context about this specific item:
- Number of photos provided: {photoCount}
- Asking price: ${price} (or "No price provided")
- Notes: {notes} (or "No notes provided")

Overall analysis summary:
- Recommendation: {headline}
- All insights: {label}: {value} ({confidence}), ...

Generate exactly 2 questions that would be most beneficial and move the needle in confidence levels. Prioritize questions that help MULTIPLE insights simultaneously (e.g., a question about maker's marks could help both Age and Materials insights). Questions must reference details from the photos, price, or notes provided.

Return a JSON array of exactly 2 objects. Each object must have:
- "id": short unique id (e.g. "q1", "q2")
- "text": the question text (one short sentence, specific to this item)
- "answerType": "photo" | "text" (use "photo" if a photo would best answer it, e.g. "Can you see the maker's mark?"; use "text" for things like style or provenance)
- "helpsInsights": array of insight labels that this question helps (e.g. ["Age", "Materials"])

Example format: [{"id":"q1","text":"Can you see a maker's mark or label?","answerType":"photo","helpsInsights":["Age","Materials"]},{"id":"q2","text":"What style period does it match?","answerType":"text","helpsInsights":["Age"]}]
```

### Example User Prompt (Generated)

```
Insights that need confidence improvement:
- Age: "1980s" (Medium confidence)
- Materials: "Solid oak hardwood" (Low confidence)

Context about this specific item:
- Number of photos provided: 2
- Asking price: $500
- Notes: Found at estate sale

Overall analysis summary:
- Recommendation: Worth a closer look
- All insights: Age: 1980s (Medium), Materials: Solid oak hardwood (Low), Condition: Good (High), Restoration effort: Minimal - ~1 hour (High)

Generate exactly 2 questions that would be most beneficial and move the needle in confidence levels. Prioritize questions that help MULTIPLE insights simultaneously (e.g., a question about maker's marks could help both Age and Materials insights). Questions must reference details from the photos, price, or notes provided.

Return a JSON array of exactly 2 objects. Each object must have:
- "id": short unique id (e.g. "q1", "q2")
- "text": the question text (one short sentence, specific to this item)
- "answerType": "photo" | "text" (use "photo" if a photo would best answer it, e.g. "Can you see the maker's mark?"; use "text" for things like style or provenance)
- "helpsInsights": array of insight labels that this question helps (e.g. ["Age", "Materials"])

Example format: [{"id":"q1","text":"Can you see a maker's mark or label?","answerType":"photo","helpsInsights":["Age","Materials"]},{"id":"q2","text":"What style period does it match?","answerType":"text","helpsInsights":["Age"]}]
```

## OpenAI API Configuration

**Model**: `gpt-4o-mini`

**Temperature**: `0.5`

**Messages Structure**:
```typescript
[
  {
    role: "system",
    content: QUESTIONS_SYSTEM_PROMPT
  },
  {
    role: "user",
    content: buildQuestionsUserPrompt(...)
  }
]
```

## Response Processing

1. **Content Extraction**: Strips markdown code fences if present
2. **JSON Parsing**: Parses the response as JSON
3. **Validation**: Ensures response is an array
4. **Validation**: Ensures each question has `helpsInsights` array (defaults to empty array if missing)
5. **Limiting**: Limits to maximum of 2 questions (slices array)

## Error Handling

### Client-Side (`GlobalQuestionsSection.tsx`)

- Logs errors to console
- Shows "No questions available" if API fails
- Handles non-OK HTTP responses

### Server-Side (`app/api/generate-questions/route.ts`)

- Returns empty array if no insights need help
- Validates JSON body
- Handles OpenAI API errors
- Validates response format
- Returns appropriate HTTP status codes

## Data Flow Diagram

```
User navigates to Results Page
  │
  ├─> Results Page loads analysis from sessionStorage
  │
  ├─> Identifies insights with Low/Medium confidence
  │   ├─> Filters insights array
  │   └─> Includes Est. Savings if recommendation confidence is Low/Medium
  │
  ├─> Renders GlobalQuestionsSection component
  │   │
  │   └─> useEffect hook triggers
  │       │
  │       ├─> Checks: insightsNeedingHelp.length > 0?
  │       │   ├─> NO → Component returns null (doesn't render)
  │       │   └─> YES → Continues
  │       │
  │       └─> POST /api/generate-questions
  │           │
  │           ├─> Request body includes:
  │           │   ├─> insightsNeedingHelp array
  │           │   ├─> photos array
  │           │   ├─> price string
  │           │   ├─> notes string
  │           │   └─> overallAnalysis object
  │           │
  │           └─> API Route processes:
  │               ├─> Validates request body
  │               ├─> Builds prompts (system + user)
  │               ├─> Calls OpenAI API (gpt-4o-mini)
  │               ├─> Parses JSON response
  │               ├─> Validates and limits to 2 questions
  │               └─> Returns questions array
  │
  └─> Component receives response
      ├─> Updates questions state
      └─> Renders questions in UI
```

## Key Files

- **API Route**: `app/api/generate-questions/route.ts`
- **Prompts**: `app/lib/prompts.ts`
- **Component**: `app/components/GlobalQuestionsSection.tsx`
- **Results Page**: `app/results/page.tsx`

## Notes

- Questions are generated **once per page load** (not per-card expansion)
- Questions are designed to help **multiple insights** when possible
- Maximum of **2 questions** are returned
- Questions include metadata about which insights they help (`helpsInsights` array)
- The component only renders if there are insights with Low/Medium confidence
