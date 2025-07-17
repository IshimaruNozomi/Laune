// Google Maps APIを動的に読み込むユーティリティ関数
let isGoogleMapsLoaded = false;
let isLoading = false;
const callbacks: (() => void)[] = [];

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 既に読み込み済みの場合
    if (isGoogleMapsLoaded && window.google && window.google.maps) {
      resolve();
      return;
    }

    // コールバックリストに追加
    callbacks.push(resolve);

    // 既に読み込み中の場合は待機
    if (isLoading) {
      return;
    }

    isLoading = true;

    // 環境変数からAPIキーを取得
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
      reject(new Error('Google Maps API key is not set'));
      return;
    }

    // スクリプトタグを作成
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    // 読み込み完了時のコールバック
    script.onload = () => {
      isGoogleMapsLoaded = true;
      isLoading = false;
      
      // すべてのコールバックを実行
      callbacks.forEach(callback => callback());
      callbacks.length = 0;
    };

    // エラー処理
    script.onerror = () => {
      isLoading = false;
      console.error('Failed to load Google Maps API');
      reject(new Error('Failed to load Google Maps API'));
    };

    // スクリプトをDOMに追加
    document.head.appendChild(script);
  });
};

// Google Maps APIが利用可能かチェック
export const isGoogleMapsAPIAvailable = (): boolean => {
  return isGoogleMapsLoaded && window.google && window.google.maps;
};
