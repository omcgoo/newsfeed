import NewsFeed from '@/components/NewsFeed';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <header className="text-center mb-12 border-b border-gray-200 pb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight lowercase">
            slow news
          </h1>
          <div className="text-red-500 text-lg font-semibold mb-2">Slow news</div>
        </header>
        <NewsFeed />
      </div>
    </main>
  );
}
