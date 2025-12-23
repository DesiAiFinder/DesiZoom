import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';
import { NewsService, type NewsArticle } from '../services/newsService';

const NewsWidget = () => {
  const { location, loading: locationLoading } = useLocationContext();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      // Don't fetch if location is still loading
      if (locationLoading) {
        return;
      }

      try {
        setNewsLoading(true);
        setNewsError(null);
        
        console.log('📰 Fetching news for location:', location);
        const articles = await NewsService.getLocalNews(location, 3);
        
        if (articles.length > 0) {
          setNews(articles);
          setRetryCount(0); // Reset retry count on success
        } else {
          setNewsError('No news available at the moment');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsError('Failed to load news');
        
        // Auto-retry up to 2 times
        if (retryCount < 2) {
          console.log(`📰 Retrying news fetch (${retryCount + 1}/2)...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 5000); // Retry after 5 seconds
        }
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [location, locationLoading, retryCount]);

  if (newsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg shadow-sm border border-green-200 p-3 sm:p-4 h-full flex flex-col">
      {/* News Header */}
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Local News</h3>
      </div>
      
      {/* News Content */}
      <div className="flex-1">
        {news.length > 0 ? (
          <div className="space-y-2">
            {news.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group hover:bg-green-100/50 rounded p-2 -m-2 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-green-600 mt-0.5 flex-shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {article.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500">
                        {NewsService.formatRelativeTime(article.publishedAt)}
                      </span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-[10px] text-gray-500 truncate">
                        {article.source}
                      </span>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-green-600 flex-shrink-0 ml-auto" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : newsError ? (
          <div className="text-center py-2">
            <div className="text-xs text-gray-500 mb-2">
              {newsError}
            </div>
            {retryCount < 2 && (
              <div className="text-[10px] text-gray-400">
                Retrying... ({retryCount + 1}/2)
              </div>
            )}
            {retryCount >= 2 && (
              <button
                onClick={() => {
                  setRetryCount(0);
                  setNewsError(null);
                }}
                className="text-[10px] text-green-600 hover:text-green-700 underline"
              >
                Try again
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            No news available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsWidget;
