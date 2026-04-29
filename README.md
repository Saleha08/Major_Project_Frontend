# CampusConnect Frontend

CampusConnect is a React + Vite frontend for a campus event and collaboration platform.

Current frontend capabilities:

- Public event discovery
- Student registration, OTP verification, and login
- Admin registration and admin login
- Organizer event creation
- Applicant review and status updates
- Student profile management
- Notifications
- Bulk email to applicants for organizers
- Admin event moderation

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Lint the app:

```bash
npx eslint src
```

## Configuration

The frontend reads the API base URL from:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

If not provided, it defaults to `http://localhost:3000/api`.

