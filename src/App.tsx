import React from 'react';
import { GoogleMapComponent } from './components/GoogleMapComponent';
import { Header } from './components/Header';
import { useMoodPosts } from './hooks/useMoodPosts';

function App() {
  const { posts, addPost, clearPosts } = useMoodPosts();

  return (
    <div className="w-full h-screen relative">
      <Header postsCount={posts.length} onClearPosts={clearPosts} />
      <div className="pt-24 h-full">
        <GoogleMapComponent posts={posts} onAddPost={addPost} />
      </div>
    </div>
  );
}

export default App;