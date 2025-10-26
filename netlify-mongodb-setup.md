# NetlifyでのMongoDBドライバー設定ガイド

## Netlifyのビルド環境

Netlifyは**Linuxベース**のビルド環境を使用しているため、Windows用のスクリプトは使用できません。

## 推奨設定方法

### 1. ビルドコマンドの設定（不要）

MongoDBドライバーはブラウザで動的に読み込まれるため、Netlifyでのビルド時にダウンロードする必要は**ありません**。

**Build Command**: 空のまま（デフォルト）

### 2. 環境変数の設定

Netlifyダッシュボードで以下の環境変数を設定：

1. **Site settings** → **Environment variables**
2. 以下の変数を追加：

```
MONGODB_CONNECTION_STRING = mongodb+srv://username:password@cluster-url/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB = true
MONGODB_DATABASE = english-word
MONGODB_COLLECTION = words
```

### 3. デプロイ設定

**Publish directory**: `.` (ルートディレクトリ)

**Build command**: 空のまま

## 代替案：ローカルファイル配置

もしCDNからの読み込みが不安定な場合は、ローカルにMongoDBドライバーファイルを配置：

### 1. ローカルでダウンロード

```bash
# Linux/Mac環境で実行
curl -o mongodb-browser.umd.js https://unpkg.com/mongodb@6.0.0/dist/browser.umd.js
```

### 2. HTMLファイルの修正

```html
<script src="mongodb-browser.umd.js"></script>
<script src="environment-manager.js"></script>
<script src="mongodb-manager.js"></script>
<script src="script.js"></script>
```

### 3. Gitにコミット

```bash
git add mongodb-browser.umd.js
git commit -m "Add local MongoDB driver file"
git push
```

## Netlifyでの自動デプロイ設定

### 1. GitHub連携

1. **Site settings** → **Build & deploy** → **Continuous Deployment**
2. **Link repository** でGitHubリポジトリを連携
3. **Branch to deploy**: `main`

### 2. 環境変数の設定

**Site settings** → **Environment variables** で以下を設定：

| Variable name | Value |
|---------------|-------|
| `MONGODB_CONNECTION_STRING` | `mongodb+srv://username:password@cluster-url/english-word?retryWrites=true&w=majority` |
| `AUTO_CONNECT_MONGODB` | `true` |
| `MONGODB_DATABASE` | `english-word` |
| `MONGODB_COLLECTION` | `words` |

### 3. デプロイ設定

**Build settings**:
- **Build command**: 空のまま
- **Publish directory**: `.`
- **Node version**: `18` (推奨)

## トラブルシューティング

### 1. ビルドエラーが発生する場合

**Build command**を空にして、静的ファイルとしてデプロイ：

```yaml
# netlify.toml (オプション)
[build]
  publish = "."
  command = ""
```

### 2. 環境変数が読み込まれない場合

ブラウザ環境では環境変数に直接アクセスできないため、アプリ内の設定保存機能を使用：

1. アプリを開く
2. MongoDB接続文字列を入力
3. 「設定保存」をクリック

### 3. MongoDBドライバー読み込みエラー

1. **ブラウザの開発者ツール**でコンソールエラーを確認
2. **ネットワークタブ**でCDNリクエストの状況を確認
3. 必要に応じてローカルファイルを配置

## 最適な設定

### 推奨設定

```yaml
# netlify.toml
[build]
  publish = "."
  command = ""

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### 環境変数（Netlifyダッシュボードで設定）

```
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster-url/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB=true
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

## まとめ

- **Build Command**: 空のまま（静的ファイルデプロイ）
- **環境変数**: Netlifyダッシュボードで設定
- **MongoDBドライバー**: ブラウザで動的読み込み
- **代替案**: ローカルファイル配置

この設定により、NetlifyでMongoDB Atlas連携機能が正常に動作します。
