# 環境変数設定ガイド

## 概要

英単語音声読み上げアプリでMongoDB Atlas接続文字列を環境変数として事前設定できる機能を追加しました。これにより、毎回接続文字列を入力する必要がなくなり、セキュリティも向上します。

## 設定方法

### 1. 環境変数ファイルの作成

プロジェクトルートに `.env` ファイルを作成し、以下の内容を記述：

```env
# MongoDB Atlas接続文字列
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster-url/english-word?retryWrites=true&w=majority

# 自動接続設定（true/false）
AUTO_CONNECT_MONGODB=true

# データベース設定
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

### 2. 接続文字列の取得

MongoDB Atlasダッシュボードで接続文字列を取得：

1. **Clusters** → **Connect** → **Connect your application**
2. **Driver**: Node.js
3. **Version**: 4.1 or later
4. 接続文字列をコピー

### 3. 環境変数の設定

#### 開発環境（ローカル）

`.env` ファイルに直接記述：

```env
MONGODB_CONNECTION_STRING=mongodb+srv://english-word-user:yourpassword@english-word-cluster.abc123.mongodb.net/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB=true
```

#### 本番環境（Netlify）

Netlifyダッシュボードで環境変数を設定：

1. **Site settings** → **Environment variables**
2. 以下の変数を追加：
   - `MONGODB_CONNECTION_STRING`: 接続文字列
   - `AUTO_CONNECT_MONGODB`: `true` または `false`

#### 本番環境（Vercel）

Vercelダッシュボードで環境変数を設定：

1. **Settings** → **Environment Variables**
2. 以下の変数を追加：
   - `MONGODB_CONNECTION_STRING`: 接続文字列
   - `AUTO_CONNECT_MONGODB`: `true` または `false`

## アプリでの使用方法

### 1. 設定の保存

1. MongoDB Atlas接続文字列を入力フィールドに入力
2. 「自動接続を有効にする」チェックボックスを選択（オプション）
3. 「設定保存」ボタンをクリック
4. 設定がローカルストレージに保存される

### 2. 設定の読み込み

1. 「設定読み込み」ボタンをクリック
2. 保存された設定が入力フィールドに復元される

### 3. 自動接続

- 自動接続が有効な場合、アプリ起動時に自動的にMongoDB Atlasに接続
- 接続文字列が設定されていない場合は自動接続されない

### 4. 設定のリセット

1. 「設定リセット」ボタンをクリック
2. 確認ダイアログで「OK」をクリック
3. すべての設定が削除される

## セキュリティ考慮事項

### 1. 接続文字列の保護

- **本番環境**: 環境変数を使用し、コードに直接記述しない
- **開発環境**: `.env` ファイルを `.gitignore` に追加
- **共有時**: 接続文字列を他人と共有しない

### 2. パスワード管理

- 強力なパスワードを使用
- 定期的にパスワードを変更
- MongoDB Atlasのユーザー権限を最小限に設定

### 3. ネットワークアクセス

- 本番環境では特定のIPアドレスのみ許可
- 不要なネットワークアクセスを削除

## トラブルシューティング

### 1. 環境変数が読み込まれない

**原因**: ブラウザ環境では環境変数に直接アクセスできない

**解決方法**:
- アプリ内の「設定保存」機能を使用
- ローカルストレージに設定を保存

### 2. 自動接続が動作しない

**原因**: 接続文字列が無効またはネットワークエラー

**解決方法**:
1. 接続文字列の確認
2. MongoDB Atlasのネットワークアクセス設定
3. ブラウザのコンソールでエラーを確認

### 3. 設定が保存されない

**原因**: ローカルストレージの制限またはブラウザの設定

**解決方法**:
1. ブラウザのローカルストレージを有効化
2. プライベートブラウジングモードを無効化
3. ブラウザの設定をリセット

## 設定ファイルの例

### `.env` ファイル（開発用）

```env
# MongoDB Atlas接続設定
MONGODB_CONNECTION_STRING=mongodb+srv://dev-user:devpassword@dev-cluster.abc123.mongodb.net/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB=true
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

### `.env.production` ファイル（本番用）

```env
# MongoDB Atlas接続設定（本番環境）
MONGODB_CONNECTION_STRING=mongodb+srv://prod-user:strongpassword@prod-cluster.xyz789.mongodb.net/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB=true
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

## ベストプラクティス

### 1. 環境別設定

- 開発環境と本番環境で異なる接続文字列を使用
- 環境変数で環境を切り替え

### 2. 設定のバックアップ

- 重要な設定は複数の場所にバックアップ
- 設定変更時は変更履歴を記録

### 3. セキュリティ監査

- 定期的に接続文字列を確認
- 不要な権限を削除
- アクセスログを監視

## サポート

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Environment Variables Guide](https://docs.netlify.com/environment-variables/overview/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
