import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoodPost, MapPosition } from '../types';
import { MoodForm } from './MoodForm';
import { MapControls } from './MapControls';
import { loadGoogleMapsAPI } from '../utils/googleMaps';
import { filterRecentPosts } from '../utils/timeFilter';

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
  const [apiError, setApiError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  useEffect(() => {
    const initializeAPI = async () => {
      try {
        await loadGoogleMapsAPI();
        setIsAPILoaded(true);
        setApiError(null);
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        setApiError('Google Maps APIの読み込みに失敗しました。APIキーを確認してください。');
      }
    };

    initializeAPI();
  }, []);

  // マップ初期化関数
  const initializeMap = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      mapTypeId: mapType,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      // デフォルトのコントロールを無効化
      mapTypeControl: false,
      zoomControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      scaleControl: false,
      rotateControl: false
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
  }, [mapType]);

  // 定期的にマーカーを更新してリアルタイムで期限切れ投稿を削除
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 60 * 1000); // 1分間隔

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isAPILoaded || !window.google) return;

    // 東京駅を中心にマップを初期化
    initializeMap(35.6762, 139.6503);
  }, [isAPILoaded, initializeMap]);

  // カスタムコントロールのハンドラー
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom() || 15;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom() || 15;
      map.setZoom(currentZoom - 1);
    }
  };

  const handleToggleMapType = () => {
    if (map) {
      const newMapType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
      setMapType(newMapType);
      map.setMapTypeId(newMapType);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // 全画面状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 投稿マーカーを更新
  useEffect(() => {
    if (!map) return;

    // 既存のマーカーとインフォウィンドウを削除
    markersRef.current.forEach(marker => marker.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());

    // 24時間以内の投稿のみをフィルタリング（リアルタイムチェック）
    const recentPosts = filterRecentPosts(posts);
    
    // 期限切れ投稿があることをログに出力
    if (recentPosts.length !== posts.length) {
      console.log(`Filtered out ${posts.length - recentPosts.length} expired posts from map`);
    }

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindows: google.maps.InfoWindow[] = [];
    const markerInfoMap = new Map<string, { marker: google.maps.Marker, infoWindow: google.maps.InfoWindow }>();

    recentPosts.forEach((post) => {
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
      const targetPost = recentPosts.find(p => p.id === openInfoWindowId);
      if (targetPost) {
        const targetInfo = markerInfoMap.get(openInfoWindowId);
        if (targetInfo) {
          targetInfo.infoWindow.open(map, targetInfo.marker);
        }
      }
    }
  }, [map, posts, openInfoWindowId, forceUpdate]);



  const handleSubmit = (post: Omit<MoodPost, 'id' | 'timestamp'>) => {
    onAddPost(post);
    setSelectedPosition(null);
  };

  const handleCancel = () => {
    setSelectedPosition(null);
  };

  return (
    <div className="relative w-full h-full">
      {!isAPILoaded && !apiError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">マップを読み込み中...</p>
          </div>
        </div>
      )}
      
      {apiError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-50">
          <div className="text-center p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-700 font-semibold mb-2">マップの読み込みエラー</p>
            <p className="text-red-600 text-sm">{apiError}</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full" />
      
      {/* カスタムマップコントロール */}
      {isAPILoaded && !apiError && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onToggleFullscreen={handleToggleFullscreen}
          onToggleMapType={handleToggleMapType}
          isFullscreen={isFullscreen}
          mapType={mapType}
        />
      )}
      
      <MoodForm
        selectedPosition={selectedPosition}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};