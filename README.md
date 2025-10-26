# 英単語音声読み上げアプリ

CSVファイルをアップロードして英単語と日本語訳を音声で学習できるWEBアプリケーションです。

## 機能

- CSVファイルのアップロード（"英単語,日本語訳" 形式）
- 英単語と日本語訳の音声読み上げ
- 1秒間隔での自動読み上げ
- 読み上げの一時停止・再開・停止機能
- 進捗表示と単語リスト表示
- レスポンシブデザイン
- 🗄️ MongoDB Atlas連携（単語データの永続化）
- ⚙️ 環境変数による設定管理
- 🔄 自動接続機能

## MongoDB Atlas連携

### データベース設定
- **Database**: `english-word`
- **Collection**: `words`

### 環境変数設定
`.env` ファイルまたは環境変数でMongoDB接続文字列を事前設定可能：

```env
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster-url/english-word?retryWrites=true&w=majority
AUTO_CONNECT_MONGODB=true
MONGODB_DATABASE=english-word
MONGODB_COLLECTION=words
```

詳細は `environment-setup-guide.md` を参照してください。

## 使用方法

1. `index.html` をブラウザで開く
2. 「CSVファイルを選択」ボタンでCSVファイルをアップロード
3. 「読み上げ開始」ボタンで音声読み上げを開始
4. 必要に応じて一時停止・再開・停止・次の単語にスキップ可能

## CSVファイル形式

```
英単語,日本語訳
river,川
mountain,山
ocean,海
```

## 技術仕様

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **音声合成**: Web Speech API (SpeechSynthesis)
- **データベース**: MongoDB Atlas
- **対応ブラウザ**: Chrome, Firefox, Safari, Edge
- **ファイル形式**: CSV (UTF-8)
- **環境変数**: ローカルストレージ + 環境変数

## ファイル構成

- `index.html` - メインのHTMLファイル
- `style.css` - スタイルシート
- `script.js` - JavaScript機能
- `mongodb-manager.js` - MongoDB操作クラス
- `environment-manager.js` - 環境変数管理クラス
- `sample_words.csv` - サンプルCSVファイル
- `env.example` - 環境変数設定例
- `mongodb-setup-guide.md` - MongoDB Atlas設定ガイド
- `environment-setup-guide.md` - 環境変数設定ガイド
- `README.md` - このファイル

## 音声読み上げの仕様

- 英単語 → 1秒間隔 → 日本語訳 → 1秒間隔 → 次の英単語
- 英語は英語音声、日本語は日本語音声で読み上げ
- 読み上げ速度: 0.8倍速
- 音声の音量・ピッチは標準設定

## 注意事項

- 音声合成機能はブラウザの対応が必要です
- 初回使用時はブラウザから音声許可の確認が表示される場合があります
- 大量の単語がある場合は、読み上げに時間がかかります

## サンプルファイル

`sample_words.csv` には100個の基本的な英単語と日本語訳が含まれています。テスト用にご利用ください。
