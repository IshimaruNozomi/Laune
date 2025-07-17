import { useState, useEffect } from 'react';
import { MoodPost } from '../types';

const STORAGE_KEY = 'mood-posts';

export const useMoodPosts = () => {
  const [posts, setPosts] = useState<MoodPost[]>([]);

  useEffect(() => {
    const storedPosts = localStorage.getItem(STORAGE_KEY);
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }
  }, []);

  const addPost = (postData: Omit<MoodPost, 'id' | 'timestamp'>) => {
    const newPost: MoodPost = {
      ...postData,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  const clearPosts = () => {
    setPosts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { posts, addPost, clearPosts };
};