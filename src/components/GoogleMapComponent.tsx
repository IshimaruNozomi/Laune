import React, { useState, useEffect, useRef } from 'react';
import { MoodPost, MapPosition } from '../types';
import { MoodForm } from './MoodForm';
import { loadGoogleMapsAPI } from '../utils/googleMaps';

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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const [openInfoWindowId, setOpenInfoWindowId] = useState<string | null>(null);

  useEffect(() => {
    const initializeAPI = async () => {
      try {
        await loadGoogleMapsAPI();
        setIsAPILoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };

    initializeAPI();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isAPILoaded || !window.google) return;

    // 東京駅を中心にマップを初期化
    initializeMap(35.6762, 139.6503);
  }, [isAPILoaded]);

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
        // インフォウィンドウを閉じる
        setOpenInfoWindowId(null);
        
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
    markersRef.current.forEach(marker => marker.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindows: google.maps.InfoWindow[] = [];
    const markerInfoMap = new Map<string, { marker: google.maps.Marker, infoWindow: google.maps.InfoWindow }>();

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
          <div style="padding: 10px 14px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 20px;">${moodIcons[post.mood]}</span>
              <span style="font-weight: 600; color: #1f2937; font-size: 15px;">${post.nickname}</span>
            </div>
            <div style="font-size: 13px; color: #4b5563; line-height: 1.3; margin-bottom: 6px;">
              ${post.comment}
            </div>
            <div style="font-size: 11px; color: #9ca3af;">
              ${new Date(post.timestamp).toLocaleString('ja-JP', { 
                month: 'numeric', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        `
      });

      // マーカーとインフォウィンドウのマップに追加
      markerInfoMap.set(post.id, { marker, infoWindow });

      // マーカークリックでインフォウィンドウをトグル
      marker.addListener('click', () => {
        const isCurrentlyOpen = openInfoWindowId === post.id;
        
        if (isCurrentlyOpen) {
          // 現在開いている場合は閉じる
          infoWindow.close();
          setOpenInfoWindowId(null);
        } else {
          // 他のインフォウィンドウを全て閉じる
          markerInfoMap.forEach((item, id) => {
            if (id !== post.id) {
              item.infoWindow.close();
            }
          });
          
          // このインフォウィンドウを開く
          infoWindow.open(map, marker);
          setOpenInfoWindowId(post.id);
        }
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
    });

    markersRef.current = newMarkers;
    infoWindowsRef.current = newInfoWindows;

    // 現在開いているインフォウィンドウを復元
    if (openInfoWindowId) {
      const targetPost = posts.find(p => p.id === openInfoWindowId);
      if (targetPost) {
        const targetInfo = markerInfoMap.get(openInfoWindowId);
        if (targetInfo) {
          targetInfo.infoWindow.open(map, targetInfo.marker);
        }
      }
    }
  }, [map, posts, openInfoWindowId]);



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