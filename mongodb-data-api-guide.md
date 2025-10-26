# MongoDB Atlas Data API設定ガイド

## 概要

MongoDBドライバーの読み込みに失敗した場合の代替手段として、MongoDB Atlas Data APIを使用できます。Data APIはREST API経由でMongoDB Atlasにアクセスする方法です。

## Data APIの有効化

### 1. MongoDB AtlasダッシュボードでData APIを有効化

1. **MongoDB Atlas**にログイン
2. **Data Services** → **Data API**をクリック
3. **Enable Data API**をクリック
4. **Generate API Key**をクリック
5. API KeyとCluster Nameをメモ

### 2. API Keyの設定

1. **API Key Name**: `english-word-app`（任意）
2. **API Key Description**: `English Word App Data API Key`
3. **Access List**: `0.0.0.0/0`（すべてのIPからアクセス許可）
4. **Generate**をクリック

## アプリでの使用方法

### 1. Data API接続

MongoDBドライバーの読み込みに失敗した場合、自動的にData APIオプションが表示されます：

1. **「Data API設定」ボタン**をクリック
2. **API Key**を入力
3. **Cluster Name**を入力
4. **接続**をクリック

### 2. 接続情報の取得

#### API Key
- MongoDB Atlasダッシュボードの**Data API**セクションで確認
- 形式: `abc123def456...`

#### Cluster Name
- MongoDB Atlasダッシュボードの**Clusters**セクションで確認
- 形式: `Cluster0`、`english-word-cluster`など

## Data APIの利点

### 1. ドライバー不要
- MongoDBドライバーの読み込みが不要
- CDNの問題を回避
- ブラウザの制限を回避

### 2. セキュリティ
- API Keyによる認証
- IPアドレス制限可能
- HTTPS通信

### 3. シンプル
- REST API経由のアクセス
- 標準的なHTTPリクエスト
- エラーハンドリングが簡単

## Data APIの制限

### 1. 機能制限
- 一部のMongoDB機能が制限される
- 複雑なクエリが制限される場合がある
- リアルタイム更新は不可

### 2. パフォーマンス
- HTTPリクエストのオーバーヘッド
- ネットワーク遅延
- 同時接続数の制限

## トラブルシューティング

### 1. API Keyエラー

**エラー**: `API接続エラー: 401 Unauthorized`

**解決方法**:
- API Keyが正しいか確認
- API Keyが有効か確認
- アクセスリストの設定を確認

### 2. Cluster Nameエラー

**エラー**: `API接続エラー: 404 Not Found`

**解決方法**:
- Cluster Nameが正しいか確認
- クラスターが存在するか確認
- Data APIが有効か確認

### 3. ネットワークエラー

**エラー**: `API接続エラー: Network Error`

**解決方法**:
- インターネット接続を確認
- ファイアウォールの設定を確認
- プロキシの設定を確認

## セキュリティ考慮事項

### 1. API Keyの管理
- API Keyを他人と共有しない
- 定期的にAPI Keyを更新
- 不要なAPI Keyは削除

### 2. アクセス制限
- 本番環境では特定のIPアドレスのみ許可
- 必要最小限の権限を設定
- アクセスログを監視

### 3. データ保護
- HTTPS通信を使用
- 機密データの暗号化
- 定期的なバックアップ

## 設定例

### 1. 開発環境

```javascript
// API KeyとCluster Nameの設定例
const apiKey = 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
const clusterName = 'Cluster0';
```

### 2. 本番環境

```javascript
// 環境変数から取得
const apiKey = process.env.MONGODB_DATA_API_KEY;
const clusterName = process.env.MONGODB_CLUSTER_NAME;
```

## 比較表

| 機能 | MongoDB Driver | Data API |
|------|----------------|----------|
| セットアップ | 複雑 | 簡単 |
| パフォーマンス | 高速 | 中程度 |
| セキュリティ | 高 | 高 |
| 機能 | 完全 | 制限あり |
| エラー処理 | 複雑 | 簡単 |
| ブラウザ対応 | 制限あり | 完全 |

## 推奨事項

### 1. 開発環境
- Data APIを使用（簡単）
- API Keyを環境変数で管理
- ローカルでのテストを推奨

### 2. 本番環境
- MongoDB Driverを優先
- Data APIをフォールバックとして使用
- 両方の方法をサポート

## サポート

- [MongoDB Atlas Data API Documentation](https://docs.atlas.mongodb.com/api/data-api/)
- [MongoDB Atlas Data API Reference](https://docs.atlas.mongodb.com/api/data-api-resources/)
- [MongoDB Community Forums](https://community.mongodb.com/)
