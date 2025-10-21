# analyzer-api

Lightweight string analysis REST API built with Node.js, Express and MongoDB.  
Analyze strings (length, word count, character frequency, palindrome check, SHA256 hash) and store results.

## Features
- Analyze and persist string metadata
- Retrieve stored analyses with filtering (palindrome, length range, word count, contains character)
- Fetch a specific string analysis by string (SHA256 lookup)
- Delete a stored string analysis

## Prerequisites
- Node.js 18+ (or compatible)
- MongoDB instance (local or hosted)
- npm or yarn

## Environment
Create a `.env` file at the project root with:

```
PORT=5000
MONGO_URI=mongodb://user:pass@host:port/dbname
```

## Install & Run
1. Install dependencies
   - npm: `npm install`
   - yarn: `yarn`

2. Start the server (development)
   - npm: `npm run dev` (or `node server.js` if `dev` script not defined)

3. The server listens on `http://localhost:<PORT>` (default 5000).

## API

Base path: `/strings`

- POST /strings
  - Description: Analyze a string and store the result.
  - Body (JSON): `{ "value": "your string here" }`
  - Responses:
    - 201 Created: returns stored analysis (id, value, properties, createdAt)
    - 400 / 422 / 409 / 500 on error
  - Example:
    ```
    curl -X POST http://localhost:5000/strings \
      -H "Content-Type: application/json" \
      -d '{"value":"Hello world"}'
    ```

- GET /strings
  - Description: List stored string analyses. Supports filters via query parameters:
    - is_palindrome: `true` or `false`
    - min_length: integer
    - max_length: integer
    - word_count: integer
    - contains_character: single character (case-insensitive)
  - Example:
    ```
    curl "http://localhost:5000/strings?is_palindrome=false&min_length=3"
    ```

- GET /strings/:string_value
  - Description: Retrieve analysis for a specific string. The server computes SHA256 of `:string_value` and returns matching analysis.
  - Note: URL-encode strings that contain special characters or spaces.
  - Example:
    ```
    curl "http://localhost:5000/strings/Hello%20world"
    ```

- DELETE /strings/:string_value
  - Description: Delete stored analysis for the provided string (lookup by value).
  - Example:
    ```
    curl -X DELETE "http://localhost:5000/strings/Hello%20world"
    ```

## Data shape (response example)
```json
{
  "id": "sha256_hash_here",
  "value": "Hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": ["H","e","l","o"," ","w","r","d"],
    "word_count": 2,
    "sha256_hash": "sha256_hash_here",
    "character_frequency_map": { "H":1, "e":1, "l":3, ... }
  },
  "createdAt": "2025-10-21T12:34:56.789Z"
}
```

## Notes / Tips
- Ensure `app.use(express.json())` is enabled (server.js already sets this).
- If you plan to query by SHA256 frequently, consider storing `sha256_hash` at the top-level of the document and adding a unique index for faster lookup.
- When sending strings with spaces or special characters in the URL, always URL-encode them.

## Contributing
- Open an issue or submit a PR.
- Follow existing code style and add tests for new behavior.

## License
MIT
