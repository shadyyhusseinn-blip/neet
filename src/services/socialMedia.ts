// Social Media Integration Service
// Supports: Facebook, Instagram, Twitter, LinkedIn, TikTok

export interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  content: string;
  mediaUrls: string[];
  scheduledAt?: string;
  postedAt?: string;
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  createdAt: number;
}

export interface SocialMediaAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  accountId: string;
  accountName: string;
  accessToken: string;
  connected: boolean;
}

export class SocialMediaService {
  private static posts: SocialMediaPost[] = [];
  private static accounts: SocialMediaAccount[] = [];

  private static apiKeys = {
    facebook: import.meta.env.VITE_FACEBOOK_APP_ID || '',
    instagram: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
    twitter: import.meta.env.VITE_TWITTER_API_KEY || '',
    linkedin: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
    tiktok: import.meta.env.VITE_TIKTOK_CLIENT_ID || '',
  };

  // Initialize social media service
  static initialize(): void {
    const storedPosts = localStorage.getItem('social_posts');
    if (storedPosts) {
      try {
        this.posts = JSON.parse(storedPosts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      }
    }

    const storedAccounts = localStorage.getItem('social_accounts');
    if (storedAccounts) {
      try {
        this.accounts = JSON.parse(storedAccounts);
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    }
  }

  // Connect account
  static connectAccount(account: Omit<SocialMediaAccount, 'id' | 'connected'>): SocialMediaAccount {
    const newAccount: SocialMediaAccount = {
      ...account,
      id: this.generateAccountId(),
      connected: true,
    };

    this.accounts.push(newAccount);
    this.saveAccounts();

    return newAccount;
  }

  // Disconnect account
  static disconnectAccount(accountId: string): boolean {
    const index = this.accounts.findIndex((a) => a.id === accountId);
    if (index === -1) return false;

    this.accounts[index].connected = false;
    this.saveAccounts();
    return true;
  }

  // Get connected accounts
  static getConnectedAccounts(): SocialMediaAccount[] {
    return this.accounts.filter((a) => a.connected);
  }

  // Create post
  static createPost(post: Omit<SocialMediaPost, 'id' | 'createdAt' | 'engagement'>): SocialMediaPost {
    const newPost: SocialMediaPost = {
      ...post,
      id: this.generatePostId(),
      createdAt: Date.now(),
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      },
    };

    this.posts.push(newPost);
    this.savePosts();

    return newPost;
  }

  // Schedule post
  static schedulePost(post: Omit<SocialMediaPost, 'id' | 'createdAt' | 'engagement' | 'status'>): SocialMediaPost {
    const newPost: SocialMediaPost = {
      ...post,
      id: this.generatePostId(),
      status: 'scheduled',
      createdAt: Date.now(),
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
      },
    };

    this.posts.push(newPost);
    this.savePosts();

    return newPost;
  }

  // Post immediately
  static async postNow(postId: string): Promise<boolean> {
    const post = this.getPostById(postId);
    if (!post) return false;

    try {
      // In production, this would call the social media APIs
      const success = await this.postToPlatform(post.platform, post);

      if (success) {
        post.status = 'posted';
        post.postedAt = new Date().toISOString();
        this.savePosts();
        return true;
      }

      post.status = 'failed';
      this.savePosts();
      return false;
    } catch (error) {
      console.error('Post failed:', error);
      post.status = 'failed';
      this.savePosts();
      return false;
    }
  }

  // Post to platform
  private static async postToPlatform(platform: string, post: SocialMediaPost): Promise<boolean> {
    // In production, this would call the actual APIs
    console.log(`Posting to ${platform}:`, post.content);
    return true;
  }

  // Get post by ID
  static getPostById(id: string): SocialMediaPost | undefined {
    return this.posts.find((p) => p.id === id);
  }

  // Delete post
  static deletePost(id: string): boolean {
    const index = this.posts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.posts.splice(index, 1);
    this.savePosts();
    return true;
  }

  // Get all posts
  static getPosts(filter?: {
    platform?: SocialMediaPost['platform'];
    status?: SocialMediaPost['status'];
  }): SocialMediaPost[] {
    let filtered = [...this.posts];

    if (filter?.platform) {
      filtered = filtered.filter((p) => p.platform === filter.platform);
    }

    if (filter?.status) {
      filtered = filtered.filter((p) => p.status === filter.status);
    }

    filtered.sort((a, b) => b.createdAt - a.createdAt);

    return filtered;
  }

  // Update post engagement
  static updateEngagement(postId: string, engagement: Partial<SocialMediaPost['engagement']>): boolean {
    const post = this.getPostById(postId);
    if (!post) return false;

    post.engagement = { ...post.engagement, ...engagement };
    this.savePosts();
    return true;
  }

  // Get social media statistics
  static getStatistics(): {
    totalPosts: number;
    postsByPlatform: Record<string, number>;
    totalEngagement: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
    };
    scheduledPosts: number;
    postedPosts: number;
    failedPosts: number;
  } {
    const postsByPlatform: Record<string, number> = {};
    const totalEngagement = {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    };

    this.posts.forEach((post) => {
      postsByPlatform[post.platform] = (postsByPlatform[post.platform] || 0) + 1;
      totalEngagement.likes += post.engagement.likes;
      totalEngagement.comments += post.engagement.comments;
      totalEngagement.shares += post.engagement.shares;
      totalEngagement.views += post.engagement.views;
    });

    const scheduledPosts = this.posts.filter((p) => p.status === 'scheduled').length;
    const postedPosts = this.posts.filter((p) => p.status === 'posted').length;
    const failedPosts = this.posts.filter((p) => p.status === 'failed').length;

    return {
      totalPosts: this.posts.length,
      postsByPlatform,
      totalEngagement,
      scheduledPosts,
      postedPosts,
      failedPosts,
    };
  }

  // Generate post ID
  private static generatePostId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate account ID
  private static generateAccountId(): string {
    return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save posts
  private static savePosts(): void {
    try {
      localStorage.setItem('social_posts', JSON.stringify(this.posts));
    } catch (error) {
      console.error('Failed to save posts:', error);
    }
  }

  // Save accounts
  private static saveAccounts(): void {
    try {
      localStorage.setItem('social_accounts', JSON.stringify(this.accounts));
    } catch (error) {
      console.error('Failed to save accounts:', error);
    }
  }

  // Get platform-specific analytics
  static async getPlatformAnalytics(platform: string): Promise<any> {
    // In production, this would call the platform's analytics API
    return {
      followers: 0,
      following: 0,
      posts: 0,
      engagementRate: 0,
    };
  }

  // Bulk schedule posts
  static bulkSchedulePosts(posts: Omit<SocialMediaPost, 'id' | 'createdAt' | 'engagement' | 'status'>[]): SocialMediaPost[] {
    return posts.map((post) => this.schedulePost(post));
  }

  // Get scheduled posts for today
  static getTodayScheduledPosts(): SocialMediaPost[] {
    const today = new Date().toISOString().split('T')[0];
    return this.posts.filter(
      (p) => p.status === 'scheduled' && p.scheduledAt?.startsWith(today)
    );
  }

  // Auto-post scheduled posts
  static async processScheduledPosts(): Promise<number> {
    const now = new Date();
    const scheduledPosts = this.posts.filter(
      (p) => p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= now
    );

    let postedCount = 0;
    for (const post of scheduledPosts) {
      const success = await this.postNow(post.id);
      if (success) postedCount++;
    }

    return postedCount;
  }
}

export const socialMediaService = SocialMediaService;
