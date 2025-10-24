# Google翻訳からCSV変換ガイド

## 方法1: Google翻訳の保存された翻訳から直接取得

### 手順
1. **Google翻訳** (https://translate.google.com) にアクセス
2. **「保存された翻訳」** をクリック
3. **「すべて表示」** をクリック
4. ブラウザの開発者ツールを開く (F12)
5. 以下のJavaScriptコードをコンソールに貼り付けて実行

```javascript
// Google翻訳の保存された翻訳をCSV形式で取得
function exportSavedTranslations() {
    const translations = [];
    
    // 保存された翻訳の要素を取得
    const items = document.querySelectorAll('[data-testid="saved-translation-item"]');
    
    items.forEach(item => {
        const source = item.querySelector('[data-testid="source-text"]')?.textContent;
        const target = item.querySelector('[data-testid="target-text"]')?.textContent;
        
        if (source && target) {
            translations.push(`${source},${target}`);
        }
    });
    
    // CSVデータを生成
    const csvContent = translations.join('\n');
    
    // ダウンロード用のBlobを作成
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'google-translate-words.csv';
    link.click();
    
    console.log(`エクスポート完了: ${translations.length}件の翻訳`);
    return translations;
}

// 実行
exportSavedTranslations();
```

## 方法2: 手動でコピー&ペースト

### 手順
1. Google翻訳の保存された翻訳を開く
2. 英単語と日本語訳を手動でコピー
3. テキストエディタ（メモ帳など）に貼り付け
4. 以下の形式に手動で整理：
   ```
   英単語,日本語訳
   river,川
   mountain,山
   ```

## 方法3: ブラウザ拡張機能を使用

### 推奨拡張機能
- **"Google Translate Export"** (Chrome拡張機能)
- **"Translation Export"** (Firefox拡張機能)

これらの拡張機能で保存された翻訳を一括エクスポート可能

## 方法4: スクレイピングツールの使用

### Pythonスクリプト例
```python
import requests
from bs4 import BeautifulSoup
import csv

# Google翻訳の保存された翻訳ページにアクセス
# (認証が必要な場合があります)
```

## 注意事項
- Google翻訳の仕様変更により、方法1のスクリプトが動作しない場合があります
- 大量のデータがある場合は、段階的にエクスポートすることをお勧めします
- エクスポート後は、CSVファイルの形式を確認してください
