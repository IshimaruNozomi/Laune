import { useState, useEffect } from 'react';
import { MoodPost } from '../types';
import { fetchPosts, addPost as apiAddPost } from '../utils/api';

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

  useEffect(() => {
    loadPosts();
  }, []);

  // 新しい投稿を追加
  const addPost = async (postData: Omit<MoodPost, 'id' | 'timestamp'>) => {
    try {
      setError(null);
      const newPost = await apiAddPost(postData);
      setPosts(prevPosts => [...prevPosts, newPost]);
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