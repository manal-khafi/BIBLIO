Biblio (Frontend + API)

Simple library manager with a static frontend and an optional Node/Express + MongoDB backend.

Frontend
- Open `index.html` in a browser.
- Data persists in `localStorage` by default.
- If the API is running on `http://localhost:4000/api`, the frontend will auto-detect it and use it.

Backend (Node.js + MongoDB)
Requirements: Node 18+, MongoDB 6+

1. Install dependencies
```bash
npm install
```

2. Start MongoDB locally, or set `MONGO_URI` to your cluster.

3. Create `.env` in `server/` with:
```env
MONGO_URI=mongodb://127.0.0.1:27017/biblio
PORT=4000
```

4. Run the API
```bash
npm run dev
# or
npm start
```

API base: `http://localhost:4000/api`

Collections
- `adherents, bibliothecaires, categories, livres, users, emprunts`

Each has full CRUD at `/api/<collection>`.

Notes
- Frontend will fallback to localStorage when API is unavailable.
- Import/Export JSON works for both modes.

  # Biblio

A simple library management system (Frontend + API).

## Features

- Manage members, librarians, categories, books, loans, and users
- Switch between localStorage and MongoDB backend
- Import/export data as JSON
- Responsive SPA interface

## Installation

```bash
git clone https://github.com/manal-khafi/BIBLIO.git
cd BIBLIO
npm install
```

## Usage

- **Start backend:**  
  ```bash
  npm run dev
  ```
- **Open `index.html` in your browser** for the frontend.

## Configuration

- Edit `server/.env` to set your MongoDB connection string.

## API

- The backend runs at `http://127.0.0.1:4000/api`.

## License

ISC

## Issues

Report bugs [here](https://github.com/manal-khafi/BIBLIO/issues).

