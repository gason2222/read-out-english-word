# MongoDB Atlas設定ガイド

## 概要

英単語音声読み上げアプリにMongoDB Atlas連携機能を追加しました。CSVファイルの単語を自動でデータベースに登録し、永続化できます。

## データベース設定

- **Database**: `english-word`
- **Collection**: `words`

## MongoDB Atlas設定手順

### 1. MongoDB Atlasアカウント作成

1. [MongoDB Atlas](https://www.mongodb.com/atlas) にアクセス
2. 「Try Free」でアカウント作成
3. 無料プラン（M0 Sandbox）を選択

### 2. クラスター作成

1. **Cluster Name**: `english-word-cluster`（任意）
2. **Provider**: AWS（推奨）
3. **Region**: 最も近いリージョンを選択
4. 「Create Cluster」をクリック

### 3. データベースユーザー作成

1. 「Database Access」をクリック
2. 「Add New Database User」をクリック
3. **Authentication Method**: Password
4. **Username**: `english-word-user`（任意）
5. **Password**: 強力なパスワードを設定
6. **Database User Privileges**: Read and write to any database
7. 「Add User」をクリック

### 4. ネットワークアクセス設定

1. 「Network Access」をクリック
2. 「Add IP Address」をクリック
3. **Access List Entry**: `0.0.0.0/0`（すべてのIPからアクセス許可）
4. 「Confirm」をクリック

### 5. 接続文字列の取得

1. 「Clusters」に戻る
2. 「Connect」をクリック
3. **Connect your application**を選択
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. 接続文字列をコピー

### 6. 接続文字列の形式

```
mongodb+srv://<username>:<password>@<cluster-url>/english-word?retryWrites=true&w=majority
```

例：
```
mongodb+srv://english-word-user:yourpassword@english-word-cluster.abc123.mongodb.net/english-word?retryWrites=true&w=majority
```

## アプリでの使用方法

### 1. MongoDB Atlas接続

1. アプリを開く
2. 「MongoDB Atlas接続文字列」フィールドに接続文字列を入力
3. 「接続」ボタンをクリック
4. 接続成功時に「接続済み」と表示される

### 2. CSVデータの登録

1. CSVファイルをアップロード
2. 「CSVをDBに登録」ボタンをクリック
3. 単語がデータベースに保存される

### 3. データベースからの読み込み

1. 「DBから読み込み」ボタンをクリック
2. データベースの単語がアプリに読み込まれる

### 4. データの削除

1. 「DB全削除」ボタンをクリック
2. 確認ダイアログで「OK」をクリック
3. データベースのすべての単語が削除される

## データ構造

### wordsコレクション

```javascript
{
  _id: ObjectId("..."),
  english: "distinguish",
  japanese: "区別する",
  createdAt: ISODate("2024-01-01T00:00:00.000Z"),
  source: "csv-upload"
}
```

### フィールド説明

- `_id`: MongoDBの自動生成ID
- `english`: 英単語
- `japanese`: 日本語訳
- `createdAt`: 登録日時
- `source`: データソース（csv-upload）

## セキュリティ注意事項

1. **接続文字列の管理**
   - 接続文字列にはパスワードが含まれます
   - 他人と共有しないでください
   - 本番環境では環境変数を使用してください

2. **ネットワークアクセス**
   - 本番環境では特定のIPアドレスのみ許可することを推奨
   - 定期的にパスワードを変更してください

3. **データバックアップ**
   - 重要なデータは定期的にバックアップしてください
   - MongoDB Atlasの自動バックアップ機能を活用してください

## トラブルシューティング

### 接続エラー

1. **接続文字列の確認**
   - ユーザー名とパスワードが正しいか
   - クラスターURLが正しいか

2. **ネットワークアクセス**
   - IPアドレスが許可されているか
   - ファイアウォールの設定

3. **ブラウザの制限**
   - CORS設定の確認
   - HTTPS接続の確認

### データ登録エラー

1. **CSVファイルの形式**
   - `英単語,日本語訳`の形式か
   - 文字エンコーディング（UTF-8）

2. **データベース権限**
   - ユーザーに書き込み権限があるか
   - コレクションが存在するか

## 料金について

- **M0 Sandbox**: 無料（512MB、共有クラスター）
- **M2/M5**: 有料プラン（専用クラスター）
- 詳細は[MongoDB Atlas料金](https://www.mongodb.com/pricing)を確認

## サポート

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Community Forums](https://community.mongodb.com/)
- [MongoDB Support](https://support.mongodb.com/)
