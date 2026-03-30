# Flashcard Hub Frontend

React 19 frontend for the Flashcard Hub learning platform.

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```

## Features

- **Homepage Dashboard** - Browse and search all flashcard decks
- **HTML Uploader** - Upload pre-built HTML flashcard files
- **Deck Builder** - Create decks manually through the UI
- **3D Study Mode** - Interactive card flipping with animations
- **SRS Controls** - Rate card difficulty (Reset, Hard, Good, Easy, Perfect)
- **Progress Tracking** - View study statistics

## Project Structure

```
src/
  ├── components/
  │   ├── DeckList.js       # Homepage dashboard
  │   ├── Uploader.js       # HTML file uploader
  │   ├── DeckBuilder.js    # Manual deck creation
  │   ├── StudyMode.js      # Main study interface
  │   └── Flashcard.js      # Card flip component
  ├── App.js                # Main app and routing
  ├── api.js                # Axios API calls
  ├── index.js              # React entry point
  └── index.css             # Global styles
```

## Environment Variables

Create `.env` in the frontend root:

```
REACT_APP_API_URL=http://localhost:8000
```

## Technology Stack

- React 19
- React Router v6
- Tailwind CSS
- Axios
