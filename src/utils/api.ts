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

// GitHub Gist から投稿データを取得
export const fetchPosts = async (): Promise<MoodPost[]> => {
  try {
    if (GIST_ID) {
      // GitHub Gist から取得
      const response = await axios.get(`${GIST_API_URL}/${GIST_ID}`);
      const gistContent = response.data.files['db.json']?.content;
      if (gistContent) {
        const data: DbData = JSON.parse(gistContent);
        return data.posts || [];
      }
    }
    
    // フォールバック: ローカルストレージから取得
    const storedPosts = localStorage.getItem('mood-posts');
    return storedPosts ? JSON.parse(storedPosts) : [];
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    // エラー時はローカルストレージから取得
    const storedPosts = localStorage.getItem('mood-posts');
    return storedPosts ? JSON.parse(storedPosts) : [];
  }
};

// GitHub Gist に投稿データを保存
export const savePosts = async (posts: MoodPost[]): Promise<void> => {
  try {
    if (GIST_ID && GITHUB_TOKEN) {
      const dbData: DbData = { posts };
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
    
    // 常にローカルストレージにもバックアップ
    localStorage.setItem('mood-posts', JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts:', error);
    // エラー時はローカルストレージのみに保存
    localStorage.setItem('mood-posts', JSON.stringify(posts));
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
