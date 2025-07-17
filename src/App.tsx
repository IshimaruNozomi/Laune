import React from 'react';
import { GoogleMapComponent } from './components/GoogleMapComponent';
import { Header } from './components/Header';
import { useMoodPosts } from './hooks/useMoodPosts';

function App() {
  const { posts, addPost, refreshPosts, loading, error } = useMoodPosts();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">投稿を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <Header 
        postsCount={posts.length} 
        onRefreshPosts={refreshPosts}
      />
      {error && (
        <div className="absolute top-24 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error}</p>
          <button 
            onClick={refreshPosts}
            className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            再試行
          </button>
        </div>
      )}
      <div className="pt-24 h-full">
        <GoogleMapComponent posts={posts} onAddPost={addPost} />
      </div>
    </div>
  );
}

export default App;