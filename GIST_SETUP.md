# GitHub Gist データベース設定手順

## 1. GitHub Gist を作成

1. https://gist.github.com/ にアクセス
2. 「Create a new gist」をクリック
3. 以下の内容で設定：
   - **Filename**: `db.json`
   - **Content**: 
     ```json
     {
       "posts": []
     }
     ```
   - **Create public gist** または **Create secret gist** を選択

## 2. Gist ID を取得

作成されたGistのURLから ID を取得します：
```
https://gist.github.com/USERNAME/GIST_ID
                              ↑この部分
```

例：`https://gist.github.com/IshimaruNozomi/abc123def456`
の場合、Gist ID は `abc123def456`

## 3. GitHub Personal Access Token を作成

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token (classic)」をクリック
3. 設定：
   - **Note**: Laune App Gist Access
   - **Expiration**: 90 days (または適切な期間)
   - **Scopes**: `gist` にチェック
4. 「Generate token」をクリック
5. 表示されたトークンをコピー（この画面を閉じると再度見ることはできません）

## 4. 環境変数を設定

### ローカル開発用
`.env` ファイルに追加：
```
VITE_GIST_ID=your_gist_id_here
VITE_GITHUB_TOKEN=your_github_token_here
```

### GitHub Actions用
1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 以下の2つのSecretを追加：
   - `VITE_GIST_ID`: 取得したGist ID
   - `VITE_GITHUB_TOKEN`: 取得したPersonal Access Token

## 5. データの流れ

- **読み取り**: GitHub Gist → フォールバック：ローカルストレージ
- **書き込み**: GitHub Gist + ローカルストレージ（バックアップ）
- **エラー時**: ローカルストレージのみで動作

## 注意事項

- Personal Access Token は機密情報です。他人と共有しないでください
- Gist を public にすると、誰でもデータを見ることができます
- Secret gist にすると、URL を知っている人のみアクセス可能です
