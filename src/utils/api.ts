import axios from 'axios';
import { MoodPost } from '../types';

// GitHub PagesでホストされるデータベースファイルのベースURL
const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://ishimarunozomi.github.io/Laune'
  : 'http://localhost:5173';

// JSONファイルへの直接アクセス（読み取り専用）
const DB_URL = `${BASE_URL}/db.json`;

// GitHub Gist を使用した書き込み可能なデータベース
const GIST_API_URL = 'https://api.github.com/gists';
const GIST_ID = import.meta.env.VITE_GIST_ID || '';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

interface DbData {
  posts: MoodPost[];
}

// 24時間 = 24 * 60 * 60 * 1000 ミリ秒
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// 古い投稿をフィルタリングする関数
const filterRecentPosts = (posts: MoodPost[]): MoodPost[] => {
  const now = Date.now();
  return posts.filter(post => {
    const postAge = now - post.timestamp;
    return postAge < TWENTY_FOUR_HOURS;
  });
};

// GitHub Gist から投稿データを取得
export const fetchPosts = async (): Promise<MoodPost[]> => {
  try {
    if (GIST_ID) {
      // GitHub Gist から取得
      const response = await axios.get(`${GIST_API_URL}/${GIST_ID}`);
      const gistContent = response.data.files['db.json']?.content;
      if (gistContent) {
        const data: DbData = JSON.parse(gistContent);
        const allPosts = data.posts || [];
        
        // 24時間以内の投稿のみを返す
        const recentPosts = filterRecentPosts(allPosts);
        
        // 古い投稿が削除された場合、Gistを更新
        if (recentPosts.length !== allPosts.length) {
          await savePosts(recentPosts);
        }
        
        return recentPosts;
      }
    }
    
    // フォールバック: ローカルストレージから取得
    const storedPosts = localStorage.getItem('mood-posts');
    const localPosts = storedPosts ? JSON.parse(storedPosts) : [];
    
    // ローカルストレージからも古い投稿をフィルタリング
    const recentLocalPosts = filterRecentPosts(localPosts);
    
    // 古い投稿が削除された場合、ローカルストレージを更新
    if (recentLocalPosts.length !== localPosts.length) {
      localStorage.setItem('mood-posts', JSON.stringify(recentLocalPosts));
    }
    
    return recentLocalPosts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    // エラー時はローカルストレージから取得（フィルタリング付き）
    const storedPosts = localStorage.getItem('mood-posts');
    const localPosts = storedPosts ? JSON.parse(storedPosts) : [];
    return filterRecentPosts(localPosts);
  }
};

// GitHub Gist に投稿データを保存
export const savePosts = async (posts: MoodPost[]): Promise<void> => {
  try {
    // 保存前に24時間以内の投稿のみをフィルタリング
    const recentPosts = filterRecentPosts(posts);
    
    if (GIST_ID && GITHUB_TOKEN) {
      const dbData: DbData = { posts: recentPosts };
      const content = JSON.stringify(dbData, null, 2);
      
      await axios.patch(`${GIST_API_URL}/${GIST_ID}`, {
        files: {
          'db.json': {
            content: content
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
    }
    
    // 常にローカルストレージにもバックアップ（フィルタリング済み）
    localStorage.setItem('mood-posts', JSON.stringify(recentPosts));
  } catch (error) {
    console.error('Failed to save posts:', error);
    // エラー時はローカルストレージのみに保存（フィルタリング済み）
    const recentPosts = filterRecentPosts(posts);
    localStorage.setItem('mood-posts', JSON.stringify(recentPosts));
  }
};

// 新しい投稿を追加
export const addPost = async (postData: Omit<MoodPost, 'id' | 'timestamp'>): Promise<MoodPost> => {
  const newPost: MoodPost = {
    ...postData,
    id: Date.now().toString(),
    timestamp: Date.now()
  };

  const currentPosts = await fetchPosts();
  const updatedPosts = [...currentPosts, newPost];
  await savePosts(updatedPosts);
  
  return newPost;
};

// 定期的なクリーンアップ - 古い投稿を削除
export const cleanupOldPosts = async (): Promise<void> => {
  try {
    const currentPosts = await fetchPosts();
    const recentPosts = filterRecentPosts(currentPosts);
    
    // 古い投稿があった場合のみ保存
    if (recentPosts.length !== currentPosts.length) {
      await savePosts(recentPosts);
      console.log(`Cleaned up ${currentPosts.length - recentPosts.length} old posts`);
    }
  } catch (error) {
    console.error('Failed to cleanup old posts:', error);
  }
};
