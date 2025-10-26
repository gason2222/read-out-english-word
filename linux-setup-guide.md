# Linux環境での音声合成設定ガイド

## 問題の概要

Linux Mintで英単語音声読み上げアプリを使用する際、以下のエラーが発生する場合があります：

- `Voices loaded after event: 0` - 音声エンジンが見つからない
- `Speech synthesis error: synthesis-failed` - 音声合成の失敗

## 解決方法

### 1. 音声エンジンのインストール

#### espeak-ng（推奨）
```bash
sudo apt update
sudo apt install espeak-ng
```

#### festival（代替）
```bash
sudo apt install festival
```

#### その他の音声エンジン
```bash
# より多くの音声オプション
sudo apt install espeak-ng espeak-ng-data
sudo apt install festival festvox-kallpc16k
```

### 2. Chrome/Chromiumの設定

#### Chromeの音声設定を確認
1. Chrome を開く
2. アドレスバーに `chrome://settings/content/sound` を入力
3. 音声合成の設定を確認

#### 音声合成のテスト
1. アドレスバーに `chrome://settings/content/sound` を入力
2. 「音声合成」セクションで音声をテスト

### 3. システム音声設定の確認

#### 音声デバイスの確認
```bash
# 音声デバイスの一覧表示
aplay -l

# 音声テスト
speaker-test -c 2
```

#### PulseAudioの状態確認
```bash
# PulseAudioの状態確認
pulseaudio --check -v

# 必要に応じて再起動
pulseaudio --kill
pulseaudio --start
```

### 4. ブラウザ別の対応

#### Chrome/Chromium
- 音声合成は自動的にespeak-ngを使用
- 追加設定は通常不要

#### Firefox
- 音声合成エンジンの設定が必要な場合がある
- `about:config` で `media.webspeech.synth.enabled` を `true` に設定

### 5. トラブルシューティング

#### 音声エンジンの動作確認
```bash
# espeak-ngのテスト
espeak-ng "Hello, this is a test"

# festivalのテスト
echo "Hello, this is a test" | festival --tts
```

#### ブラウザのコンソールで確認
1. ブラウザの開発者ツールを開く（F12）
2. コンソールタブで以下のコマンドを実行：
```javascript
// 利用可能な音声を確認
speechSynthesis.getVoices().forEach(voice => {
    console.log(voice.name, voice.lang);
});

// 音声合成のテスト
const utterance = new SpeechSynthesisUtterance("test");
speechSynthesis.speak(utterance);
```

### 6. 代替手段

音声合成が動作しない場合：
- アプリは自動的にテキスト表示モードに切り替わります
- 英単語と日本語訳は画面に表示されるため、学習は継続可能です
- 「音声を再試行」ボタンで音声機能の復旧を試行できます

## 参考情報

- [Web Speech API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [espeak-ng Documentation](https://github.com/espeak-ng/espeak-ng)
- [Chrome Speech Synthesis Issues](https://stackoverflow.com/questions/41539680/speechsynthesis-speak-not-working-in-chrome)
