import { MoodPost } from '../types';

// 24時間以内の投稿のみをフィルタリング
export const filterRecentPosts = (posts: MoodPost[]): MoodPost[] => {
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000); // 24時間前のタイムスタンプ
  
  return posts.filter(post => post.timestamp > twentyFourHoursAgo);
};

// 投稿の経過時間を人間が読める形式で取得
export const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else {
    return '24時間以上前';
  }
};

// 投稿が24時間以内かどうかをチェック
export const isWithin24Hours = (timestamp: number): boolean => {
  const now = Date.now();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  return timestamp > twentyFourHoursAgo;
};
