# Tech Feed

A modern news feed application inspired by latest.is, providing curated tech, development, UX, digital, internet, and AI content from various sources.

## Features

- **Curated Content**: Aggregates content from multiple tech-focused sources
- **Smart Ranking**: Items are ranked based on popularity and relevance
- **Clean Interface**: Modern, distraction-free design
- **Source Diversity**: Content from Hacker News, Reddit, Bluesky, Lemmy, and more
- **Real-time Updates**: Fresh content that updates based on popularity

## Sources

The app aggregates content from:

- **Hacker News** - Tech and development discussions
- **Reddit** - Programming, technology, and web development communities
- **Bluesky** - Tech-focused social media
- **Lemmy** - Open source discussions
- **TechCrunch** - Tech industry news
- **The Verge** - Technology and culture
- **Ars Technica** - Technology and science

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **date-fns** - Date formatting utilities

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main page component
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── NewsFeed.tsx    # Main feed component
│   └── NewsItem.tsx    # Individual news item
├── lib/                # Utility functions
│   └── newsApi.ts      # News fetching logic
└── types/              # TypeScript type definitions
    └── news.ts         # News item types
```

## API Integration

The app currently includes:

- **Hacker News API** - Real-time top stories
- **Reddit API** - Hot posts from tech subreddits
- **Mock Data** - Fallback content for demonstration

## Future Enhancements

- [ ] Add more news sources (Bluesky, Lemmy APIs)
- [ ] Implement user preferences and filtering
- [ ] Add dark mode support
- [ ] Create mobile app version
- [ ] Add bookmarking functionality
- [ ] Implement real-time updates

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own news feed applications.
