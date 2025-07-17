import { useState, useEffect } from 'react';
import { MoodPost } from '../types';
import { fetchPosts, addPost as apiAddPost, cleanupOldPosts } from '../utils/api';
import { filterRecentPosts } from '../utils/timeFilter';

export const useMoodPosts = () => {
  const [posts, setPosts] = useState<MoodPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 投稿を取得
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError('投稿の取得に失敗しました');
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // ローカルで古い投稿をフィルタリング
  const filterLocalPosts = () => {
    setPosts(prevPosts => {
      const recentPosts = filterRecentPosts(prevPosts);
      if (recentPosts.length !== prevPosts.length) {
        console.log(`Filtered out ${prevPosts.length - recentPosts.length} expired posts locally`);
      }
      return recentPosts;
    });
  };

  useEffect(() => {
    loadPosts();
    
    // 定期的なローカルフィルタリング（30秒間隔）
    const localFilterInterval = setInterval(() => {
      filterLocalPosts();
    }, 30 * 1000); // 30秒
    
    // 定期的なクリーンアップ（1分間隔）
    const cleanupInterval = setInterval(async () => {
      try {
        await cleanupOldPosts();
        // クリーンアップ後に投稿を再読み込み
        const updatedPosts = await fetchPosts();
        setPosts(updatedPosts);
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
    }, 60 * 1000); // 1分

    return () => {
      clearInterval(localFilterInterval);
      clearInterval(cleanupInterval);
    };
  }, []);

  // 新しい投稿を追加
  const addPost = async (postData: Omit<MoodPost, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      const newPost = await apiAddPost(postData);
      setPosts(prevPosts => filterRecentPosts([...prevPosts, newPost]));
    } catch (err) {
      setError('投稿の保存に失敗しました');
      console.error('Failed to add post:', err);
    }
  };

  // 投稿を再読み込み
  const refreshPosts = () => {
    loadPosts();
  };

  const clearPosts = () => {
    setPosts([]);
    localStorage.removeItem('mood-posts');
  };

  return { 
    posts, 
    addPost, 
    clearPosts, 
    refreshPosts, 
    loading, 
    error 
  };
};