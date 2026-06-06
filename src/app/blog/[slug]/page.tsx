'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Facebook, Linkedin } from '@/lib/social-icons';
import { 
  Calendar,
  Clock,
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Check,
  MessageCircle,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  Home
} from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const allPostsData = [
  {
    id: 1,
    slug: 'how-to-sell-your-items-faster',
    title: 'How to Sell Your Items Faster on iList.ng',
    excerpt: 'Discover proven strategies to get your listings seen by more buyers and close deals quickly.',
    content: `
      <p> Selling your items quickly on iList.ng requires more than just posting a listing. Here are our top tips to help you close deals faster:</p>
      
      <h2>1. Use High-Quality Photos</h2>
      <p>Photos are the first thing buyers see. Use good lighting and capture your item from multiple angles. Show any wear or imperfections honestly.</p>
      
      <h2>2. Write a Detailed Description</h2>
      <p>Include all relevant details: brand, model, condition, size, color, and any included accessories. The more information, the better.</p>
      
      <h2>3. Price Competitively</h2>
      <p>Research similar listings to price your item competitively. A slightly lower price can attract more buyers and lead to faster sales.</p>
      
      <h2>4. Respond Quickly</h2>
      <p>Buyers often contact multiple sellers. Respond to inquiries promptly to stay ahead of the competition.</p>
      
      <h2>5. Promote Your Listing</h2>
      <p>Consider using our promotion features to boost your listing's visibility and reach more potential buyers.</p>
      
      <h2>6. Be Honest About Condition</h2>
      <p>Honesty builds trust. Describe the true condition of your item to avoid disputes and negative reviews.</p>
      
      <p>By following these tips, you'll be well on your way to selling your items faster and more efficiently on iList.ng.</p>
    `,
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    authorRole: 'Marketplace Expert',
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
    content: `
      <p>The Nigerian marketplace is vibrant and diverse. Here are the categories that have seen the most growth and activity in 2026:</p>
      
      <h2>1. Vehicles</h2>
      <p>From cars to motorcycles, the vehicles category remains one of our most active, with thousands of listings added daily.</p>
      
      <h2>2. Property</h2>
      <p>Houses, apartments, and land listings continue to attract significant interest from buyers across Nigeria.</p>
      
      <h2>3. Mobile Phones & Tablets</h2>
      <p>The demand for smartphones and tablets remains high, with popular brands leading the way.</p>
      
      <h2>4. Electronics</h2>
      <p>Laptops, TVs, and gaming consoles are always in demand.</p>
      
      <h2>5. Fashion</h2>
      <p>Clothing, shoes, and accessories from both local and international brands.</p>
      
      <p>These categories represent the heart of trading activity on our platform.</p>
    `,
    category: 'Market Trends',
    author: 'iList.ng Team',
    authorRole: 'Research Analyst',
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
    content: `
      <p>Emmanuel had been trying to sell his Toyota Camry for months. After switching to iList.ng, he found a buyer in just 3 days. Here's his story:</p>
      
      <h2>The Challenge</h2>
      <p>"I had listed my car on several platforms but wasn't getting any serious buyers. The inquiries I did get often didn't convert to actual sales."</p>
      
      <h2>The Solution</h2>
      <p>Emmanuel decided to try iList.ng after a friend recommended it. He followed the tips in our selling guide and saw immediate results.</p>
      
      <h2>The Results</h2>
      <p>Within 3 days of posting, Emmanuel received 5 serious inquiries and closed a deal at his asking price. The buyer was impressed by the detailed photos and description.</p>
      
      <p>"I wish I had started with iList.ng from the beginning," Emmanuel said.</p>
    `,
    category: 'Success Stories',
    author: 'iList.ng Team',
    authorRole: 'Content Writer',
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
    content: `
      <p>We are excited to announce significant improvements to our messaging system. Here's what's new:</p>
      
      <h2>Read Receipts</h2>
      <p>Know when your message has been read. This helps you follow up appropriately.</p>
      
      <h2>Quick Replies</h2>
      <p>Respond faster with pre-defined quick replies for common questions.</p>
      
      <h2>Better Notifications</h2>
      <p>Stay updated with improved push and email notifications.</p>
      
      <p>These changes are part of our ongoing effort to improve the iList.ng experience.</p>
    `,
    category: 'Product Updates',
    author: 'iList.ng Team',
    authorRole: 'Product Team',
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
    content: `
      <p>Great photos are essential for selling online. Here are 5 tips to help you capture better images:</p>
      
      <h2>1. Use Natural Light</h2>
      <p>Take photos near a window or outdoors during daylight. Avoid harsh shadows.</p>
      
      <h2>2. Clean Background</h2>
      <p>Use a clean, plain background to keep focus on your item.</p>
      
      <h2>3. Multiple Angles</h2>
      <p>Capture front, back, sides, and close-ups of details.</p>
      
      <h2>4. Show Real Condition</h2>
      <p>Include photos showing any wear or defects honestly.</p>
      
      <h2>5. High Resolution</h2>
      <p>Ensure your photos are clear and not blurry.</p>
      
      <p>Following these tips will help your listings stand out.</p>
    `,
    category: 'Tips & Advice',
    author: 'iList.ng Team',
    authorRole: 'Photography Expert',
    date: 'March 1, 2026',
    readTime: '4 min read',
    views: 2560,
    likes: 178,
  },
];

const recentPosts = allPostsData.slice(0, 4);

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [shareToast, setShareToast] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, name: 'Chidi O', text: 'Great article! Very helpful tips.', date: '2 days ago' },
    { id: 2, name: 'Ada M', text: 'I tried these tips and my items sold faster.', date: '1 day ago' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  const post = allPostsData.find(p => p.slug === slug) || allPostsData[0];
  const relatedPosts = allPostsData.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  const fallbackRelated = allPostsData.filter(p => p.id !== post.id).slice(0, 3);
  const displayRelated = relatedPosts.length > 0 ? relatedPosts : fallbackRelated;

  useEffect(() => {
    setLikeCount(post.likes);
    setViewCount(post.views + Math.floor(Math.random() * 100));
  }, [post]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = post.title;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
        break;
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && commentName.trim()) {
      const comment = {
        id: Date.now(),
        name: commentName,
        text: newComment,
        date: 'Just now',
      };
      setComments([comment, ...comments]);
      setNewComment('');
      setCommentName('');
      setCommentSubmitted(true);
      setTimeout(() => setCommentSubmitted(false), 3000);
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

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-app py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/blog" className="text-gray-500 hover:text-primary-600">
              Blog
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 line-clamp-1">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="py-12">
        <div className="container-app">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                {post.excerpt}
              </p>
              
              {/* Author & Stats */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-500">{post.authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {viewCount.toLocaleString()} views
                  </span>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition-colors ${
                      liked ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    {likeCount}
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {comments.length}
                  </span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            <div className="h-64 md:h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-12 flex items-center justify-center">
              <span className="text-white text-8xl font-bold opacity-20">i</span>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share */}
            <div className="bg-gray-100 rounded-xl p-6 mb-12">
              <h3 className="font-bold text-gray-900 mb-4">Share this article</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                  X
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>

            {/* Comments */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Comments ({comments.length})
              </h3>
              
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                {commentSubmitted ? (
                  <div className="flex items-center gap-2 py-3 px-4 bg-green-50 text-green-700 rounded-lg">
                    <Check className="w-5 h-5" />
                    Comment posted successfully!
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="Write your comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                )}
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comment.name}</p>
                        <p className="text-sm text-gray-500">{comment.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Posts */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {displayRelated.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-32 bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold opacity-30">i</span>
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-gray-500 mb-2 block">{related.category}</span>
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {related.title}
                      </h4>
                      <span className="text-xs text-gray-500">{related.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
