import React from 'react';
import { MoodPost } from '../types';

interface MoodMarkerProps {
  post: MoodPost;
  shouldShowTooltip: boolean;
}

const moodIcons = {
  happy: '😊',
  smile: '🙂',
  neutral: '😐',
  sad: '😢'
};

const moodColors = {
  happy: '#10B981',
  smile: '#3B82F6',
  neutral: '#6B7280',
  sad: '#EF4444'
};

export const MoodMarker: React.FC<MoodMarkerProps> = ({ post, shouldShowTooltip }) => {
  const [showPopup, setShowPopup] = React.useState(false);

  const markerStyle = {
    backgroundColor: moodColors[post.mood],
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    border: '3px solid white',
    cursor: 'pointer',
    position: 'absolute' as const,
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    transition: 'transform 0.2s ease'
  };

  const tooltipStyle = {
    position: 'absolute' as const,
    top: '-60px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb',
    fontSize: '12px',
    whiteSpace: 'nowrap' as const,
    zIndex: 1001
  };

  const popupStyle = {
    position: 'absolute' as const,
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '1px solid #e5e7eb',
    minWidth: '200px',
    zIndex: 1002
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${((post.lng + 180) / 360) * 100}%`,
        top: `${((90 - post.lat) / 180) * 100}%`,
        zIndex: 1000
      }}
    >
      <div
        style={markerStyle}
        onClick={() => setShowPopup(!showPopup)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
        }}
      >
        {moodIcons[post.mood]}
      </div>

      {shouldShowTooltip && (
        <div style={tooltipStyle}>
          <div style={{ fontWeight: '500', marginBottom: '2px' }}>
            {post.nickname}
          </div>
          <div style={{ color: '#6b7280' }}>
            {post.comment}
          </div>
        </div>
      )}

      {showPopup && (
        <div style={popupStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>{moodIcons[post.mood]}</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>{post.nickname}</span>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            {post.comment}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            {new Date(post.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};