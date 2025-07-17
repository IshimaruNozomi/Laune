import React, { useState, useEffect, useRef } from 'react';
import { MoodPost, MapPosition } from '../types';
import { MoodForm } from './MoodForm';

interface GoogleMapComponentProps {
  posts: MoodPost[];
  onAddPost: (post: Omit<MoodPost, 'id' | 'timestamp'>) => void;
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

export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ posts, onAddPost }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<MapPosition | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // 東京駅を中心にマップを初期化
    initializeMap(35.6762, 139.6503);
  }, []);

  const initializeMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // マップクリックイベント
    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        setSelectedPosition({
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        });
      }
    });

    setMap(mapInstance);
  };

  // 投稿マーカーを更新
  useEffect(() => {
    if (!map) return;

    // 既存のマーカーとインフォウィンドウを削除
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindows: google.maps.InfoWindow[] = [];

    posts.forEach((post) => {
      // カスタムマーカーを作成
      const marker = new google.maps.Marker({
        position: { lat: post.lat, lng: post.lng },
        map: map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${moodColors[post.mood]}" stroke="white" stroke-width="3"/>
              <text x="20" y="28" text-anchor="middle" font-size="20" fill="white">${moodIcons[post.mood]}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        },
        title: post.nickname
      });

      // インフォウィンドウを作成
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">${moodIcons[post.mood]}</span>
              <span style="font-weight: 600; color: #1f2937;">${post.nickname}</span>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px; margin-top: 0;">
              ${post.comment}
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              ${new Date(post.timestamp).toLocaleString()}
            </p>
          </div>
        `
      });

      // マーカークリックでインフォウィンドウを表示
      marker.addListener('click', () => {
        // 他のインフォウィンドウを閉じる
        newInfoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);

      // 投稿密度が低い場合は常時表示
      const shouldShowTooltip = shouldShowTooltipForPost(post);
      if (shouldShowTooltip) {
        const tooltipWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 4px 8px; font-size: 12px;">
              <div style="font-weight: 500; margin-bottom: 2px;">${post.nickname}</div>
              <div style="color: #6b7280;">${post.comment}</div>
            </div>
          `,
          disableAutoPan: true
        });
        tooltipWindow.open(map, marker);
        newInfoWindows.push(tooltipWindow);
      }
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);
  }, [map, posts]);

  const shouldShowTooltipForPost = (post: MoodPost) => {
    const radius = 0.01; // 約1km
    const nearbyPosts = posts.filter(p => {
      const distance = Math.sqrt(
        Math.pow(p.lat - post.lat, 2) + Math.pow(p.lng - post.lng, 2)
      );
      return distance <= radius && p.id !== post.id;
    });
    return nearbyPosts.length < 3;
  };

  const handleSubmit = (post: Omit<MoodPost, 'id' | 'timestamp'>) => {
    onAddPost(post);
    setSelectedPosition(null);
  };

  const handleCancel = () => {
    setSelectedPosition(null);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      <MoodForm
        selectedPosition={selectedPosition}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};