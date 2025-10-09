# My OOTD (Outfit of the Day)

A full-stack wardrobe management application that helps users organize their clothing and get AI-powered outfit suggestions based on their personal inventory.

## Features

- **User Authentication** – Secure sign up and login with JWT-based authentication, refresh tokens, and session management
- **Clothing Management** – Add, edit, and organize clothing items in your digital wardrobe
- **Style Tagging** – Categorize items by colour, name, type, and style (clean-fit, street, classic, etc.)
- **AI Outfit Set Suggestions** – Get personalized outfit recommendations when you select an item (e.g., pick a top and receive suggestions for bottoms, shoes and accessories)
- **Lucky Items of the Day** – Discover random outfit inspiration from your wardrobe

## Tech Stack

**Frontend:**

- Next.js (TypeScript)
- React
- Tailwind CSS

**Backend:**

- Flask (Python)
- Supabase (PostgreSQL database)
- JWT authentication with secure cookies

**AI/ML:**

- NVIDIA Nemotron-Nano-9B-V2 (free) LLM for outfit generation
- Hugging Face embeddings for semantic similarity matching
- Cosine similarity prefiltering for improved performance

## How It Works

1. Users upload their clothing items with details (name, type, colour, style tags)
2. When selecting an item, the app uses Hugging Face embeddings to prefilter compatible items via cosine similarity
3. NVIDIA's (free) LLM generates contextual outfit suggestions based on the filtered results
4. Automated cleanup of revoked tokens runs via Supabase cron jobs

## Project Status

This is an active development project for portfolio demonstration of fullstack skills.

## Future Improvements

- Implement password reset and email confirmation flows for improved account security
- Auto image tagging with AI when users upload items
- Generate a single image for an outfit set for sharing
