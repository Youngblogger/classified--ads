'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Tag,
  Eye,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';

const categories = [
  'All Posts',
  'Tips & Advice',
  'Market Trends',
  'Success Stories',
  'Product Updates',
  'Company News',
];

const allPostsData = [
  {
    id: 1,
    slug: 'how-to-sell-your-items-faster',
    title: 'How to Sell Your Items Faster on iList.ng',
    excerpt: 'Discover proven strategies to get your listings seen by more buyers and close deals quickly.',
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    date: 'March 15, 2026',
    readTime: '5 min read',
    views: 2340,
    likes: 156,
  },
  {
    id: 2,
    slug: 'top-10-popular-categories-2026',
    title: 'Top 10 Most Popular Categories on iList.ng in 2026',
    excerpt: 'A look at the categories driving the most activity on our platform this year.',
    category: 'Market Trends',
    author: 'iList.ng Team',
    date: 'March 12, 2026',
    readTime: '4 min read',
    views: 1890,
    likes: 98,
  },
  {
    id: 3,
    slug: 'success-story-emmanuel-sold-car-3-days',
    title: 'Success Story: How Emmanuel Sold His Car in 3 Days',
    excerpt: 'Read how one seller used iList.ng to find a buyer quickly and at a great price.',
    category: 'Success Stories',
    author: 'iList.ng Team',
    date: 'March 8, 2026',
    readTime: '3 min read',
    views: 3210,
    likes: 245,
  },
  {
    id: 4,
    slug: 'new-feature-enhanced-messaging',
    title: 'New Feature: Enhanced Messaging System',
    excerpt: 'We have improved our messaging system to help buyers and sellers communicate better.',
    category: 'Product Updates',
    author: 'iList.ng Team',
    date: 'March 5, 2026',
    readTime: '2 min read',
    views: 1450,
    likes: 87,
  },
  {
    id: 5,
    slug: 'tips-taking-great-photos',
    title: '5 Tips for Taking Great Photos of Your Items',
    excerpt: 'Good photos can make a huge difference. Here is how to showcase your items the right way.',
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    date: 'March 1, 2026',
    readTime: '4 min read',
    views: 2560,
    likes: 178,
  },
  {
    id: 6,
    slug: 'ilist-ng-reaches-25000-sellers',
    title: 'iList.ng Reaches 25,000 Active Sellers Milestone',
    excerpt: 'We are proud to announce a major milestone for our growing marketplace community.',
    category: 'Company News',
    author: 'iList.ng Team',
    date: 'February 25, 2026',
    readTime: '2 min read',
    views: 4100,
    likes: 312,
  },
  {
    id: 7,
    slug: 'nigerian-second-hand-market',
    title: 'Understanding the Nigerian Second-Hand Market',
    excerpt: 'An analysis of how the pre-owned goods market works in Nigeria.',
    category: 'Market Trends',
    author: 'iList.ng Team',
    date: 'February 20, 2026',
    readTime: '6 min read',
    views: 1670,
    likes: 65,
  },
  {
    id: 8,
    slug: 'how-to-write-compelling-descriptions',
    title: 'How to Write Compelling Ad Descriptions',
    excerpt: 'Your description matters. Learn how to write listings that attract serious buyers.',
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    date: 'February 15, 2026',
    readTime: '3 min read',
    views: 2890,
    likes: 134,
  },
  {
    id: 9,
    slug: 'staying-safe-tips-buyers-sellers',
    title: 'Staying Safe: Tips for Buyers and Sellers',
    excerpt: 'Important safety guidelines to protect yourself when trading on iList.ng.',
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    date: 'February 10, 2026',
    readTime: '5 min read',
    views: 5230,
    likes: 289,
  },
  {
    id: 10,
    slug: 'rise-of-ecommerce-nigeria',
    title: 'The Rise of E-Commerce in Nigeria',
    excerpt: 'Exploring the growth and future of online shopping in Nigeria.',
    category: 'Market Trends',
    author: 'iList.ng Team',
    date: 'February 5, 2026',
    readTime: '7 min read',
    views: 3420,
    likes: 198,
  },
  {
    id: 11,
    slug: 'how-to-price-items-competitively',
    title: 'How to Price Your Items Competitively',
    excerpt: 'Learn how to set the right price for your items to attract buyers.',
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    date: 'January 28, 2026',
    readTime: '4 min read',
    views: 2150,
    likes: 145,
  },
  {
    id: 12,
    slug: 'ilist-ng-mobile-app-coming-soon',
    title: 'iList.ng Mobile App Coming Soon',
    excerpt: 'Exciting news about our upcoming mobile application.',
    category: 'Product Updates',
    author: 'iList.ng Team',
    date: 'January 20, 2026',
    readTime: '2 min read',
    views: 5670,
    likes: 423,
  },
];

const popularTags = [
  'Tips',
  'Cars',
  'Real Estate',
  'Mobile Phones',
  'Safety',
  'Photography',
  'Pricing',
  'Negotiation',
];

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Posts');
  const [currentPage, setCurrentPage] = useState(1);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [postLikes, setPostLikes] = useState<Record<number, number>>(
    Object.fromEntries(allPostsData.map(p => [p.id, p.likes]))
  );
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const filteredPosts = allPostsData.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Posts' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  const featuredPost = allPostsData[0];
  const gridPosts = paginatedPosts.filter(p => p.id !== featuredPost.id);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      if (prev.includes(postId)) {
        setPostLikes(p => ({ ...p, [postId]: p[postId] - 1 }));
        return prev.filter(id => id !== postId);
      } else {
        setPostLikes(p => ({ ...p, [postId]: p[postId] + 1 }));
        return [...prev, postId];
      }
    });
  };

  const handleShare = async (post: typeof allPostsData[0]) => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.origin + '/blog',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${post.title} - ${shareData.url}`);
        setShareToast(post.title);
        setTimeout(() => setShareToast(null), 2000);
      }
    } catch (err) {
      console.log('Share cancelled or failed');
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {shareToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5 text-green-400" />
          Link copied to clipboard!
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
        <div className="container-app">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              iList.ng Blog
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Tips, news, and insights to help you get the most out of our marketplace.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-app py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured Post */}
            <article className="bg-white rounded-2xl overflow-hidden shadow-sm mb-8 hover:shadow-md transition-shadow">
              <div className="h-64 md:h-80 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white text-8xl font-bold opacity-20">i</span>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {featuredPost.views.toLocaleString()} views
                    </span>
                    <button
                      onClick={() => handleLike(featuredPost.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedPosts.includes(featuredPost.id) ? 'text-red-500' : 'hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.includes(featuredPost.id) ? 'fill-current' : ''}`} />
                      {postLikes[featuredPost.id]}
                    </button>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`} className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700">
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </article>

            {/* Post Grid */}
            {gridPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link href={`/blog/${post.slug}`}>
                    <div className="h-40 bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center cursor-pointer">
                      <span className="text-white text-4xl font-bold opacity-30">i</span>
                    </div>
                    </Link>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{post.category}</span>
                        <span>{post.date}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary-600">
                        {post.title}
                      </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views.toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                              likedPosts.includes(post.id) 
                                ? 'bg-red-50 text-red-500' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                            {postLikes[post.id]}
                          </button>
                          <button 
                            onClick={() => handleShare(post)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">No articles found matching your search.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Popular Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-primary-100 text-sm mb-4">
                Get the latest tips and updates delivered to your inbox.
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 py-3 px-4 bg-green-500/20 rounded-lg text-green-200">
                  <Check className="w-5 h-5" />
                  Thanks for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button 
                    type="submit"
                    className="w-full py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>

            {/* Recent Posts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {allPostsData.slice(0, 4).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <div className="w-16 h-16 bg-primary-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-primary-600 font-bold">i</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <h3 className="font-bold mb-2">Start Selling Today</h3>
              <p className="text-gray-400 text-sm mb-4">
                Join thousands of sellers on iList.ng and reach millions of buyers.
              </p>
              <Link
                href="/post-ad"
                className="block w-full py-3 bg-primary-600 text-white font-semibold rounded-lg text-center hover:bg-primary-700 transition-colors"
              >
                Post Your First Ad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
