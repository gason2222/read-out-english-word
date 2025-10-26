class WordReader {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.speechSupported = false;
        this.speechErrorCount = 0;
        this.maxSpeechErrors = 3;
        
        this.initializeElements();
        this.bindEvents();
        this.checkSpeechSupport();
    }

    initializeElements() {
        this.csvFileInput = document.getElementById('csvFile');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.wordCount = document.getElementById('wordCount');
        this.controls = document.getElementById('controls');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.currentWord = document.getElementById('currentWord');
        this.englishWord = document.getElementById('englishWord');
        this.japaneseWord = document.getElementById('japaneseWord');
        this.wordList = document.getElementById('wordList');
        this.wordItems = document.getElementById('wordItems');
        
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.nextBtn = document.getElementById('nextBtn');
    }

    bindEvents() {
        this.csvFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.startBtn.addEventListener('click', () => this.startReading());
        this.pauseBtn.addEventListener('click', () => this.pauseReading());
        this.stopBtn.addEventListener('click', () => this.stopReading());
        this.nextBtn.addEventListener('click', () => this.nextWord());
    }

    checkSpeechSupport() {
        if (!('speechSynthesis' in window)) {
            this.showSpeechError('お使いのブラウザは音声合成機能をサポートしていません。Chrome、Firefox、Safariなどの最新ブラウザをご利用ください。');
            return;
        }

        // 音声合成の基本的なサポートをチェック
        try {
            // 音声合成オブジェクトの存在とメソッドの確認
            if (this.speechSynthesis && typeof this.speechSynthesis.speak === 'function') {
                console.log('Speech synthesis is available');
                
                // 音声リストの取得を試行（非同期）
                this.loadVoices();
            } else {
                this.speechSupported = false;
                this.showSpeechWarning();
            }
        } catch (error) {
            console.error('Speech synthesis check error:', error);
            this.speechSupported = false;
            this.showSpeechWarning();
        }
    }

    loadVoices() {
        // 音声リストの読み込み
        const voices = this.speechSynthesis.getVoices();
        if (voices.length > 0) {
            console.log('Voices loaded:', voices.length);
            this.speechSupported = true;
            this.availableVoices = voices;
        } else {
            // 音声リストが空の場合は、イベントを待つ
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                const voices = this.speechSynthesis.getVoices();
                console.log('Voices loaded after event:', voices.length);
                
                if (voices.length > 0) {
                    this.speechSupported = true;
                    this.availableVoices = voices;
                    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
                } else {
                    console.warn('No voices available - speech synthesis may not work properly');
                    this.speechSupported = false;
                    this.showLinuxVoiceWarning();
                }
            });
            
            // タイムアウト設定（5秒）
            setTimeout(() => {
                if (!this.speechSupported) {
                    console.warn('Voice loading timeout - proceeding with limited functionality');
                    this.speechSupported = true; // 音声がなくてもテキスト表示は可能
                }
            }, 5000);
        }
    }

    showLinuxVoiceWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'speech-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ Linux環境での音声合成警告</h3>
                <p>音声エンジンが見つかりません。Linux環境では以下の設定が必要な場合があります：</p>
                <ul style="text-align: left; margin: 10px 0;">
                    <li>espeak-ng のインストール: <code>sudo apt install espeak-ng</code></li>
                    <li>festival のインストール: <code>sudo apt install festival</code></li>
                    <li>Chrome の音声設定確認</li>
                </ul>
                <p>テキスト表示モードで学習を続けることができます。</p>
                <div class="warning-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">了解</button>
                    <button onclick="window.wordReader.retrySpeechSupport()" class="retry-btn">音声を再試行</button>
                </div>
            </div>
        `;
        document.querySelector('.container').insertBefore(warningDiv, document.querySelector('main'));
    }

    showSpeechError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'speech-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ 音声機能エラー</h3>
                <p>${message}</p>
                <p>テキスト表示モードで学習を続けることができます。</p>
            </div>
        `;
        document.querySelector('.container').insertBefore(errorDiv, document.querySelector('main'));
    }

    showSpeechWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'speech-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ 音声機能の警告</h3>
                <p>音声合成に問題が発生する可能性があります。Linux環境では特に注意が必要です。</p>
                <p>音声が再生されない場合は、テキスト表示で学習を続けてください。</p>
                <div class="warning-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.style.display='none'">了解</button>
                    <button onclick="window.wordReader.retrySpeechSupport()" class="retry-btn">音声を再試行</button>
                </div>
            </div>
        `;
        document.querySelector('.container').insertBefore(warningDiv, document.querySelector('main'));
    }

    retrySpeechSupport() {
        console.log('Retrying speech support...');
        this.speechErrorCount = 0;
        this.speechSupported = true;
        
        // 警告メッセージを非表示
        const warning = document.querySelector('.speech-warning');
        if (warning) {
            warning.style.display = 'none';
        }
        
        // 成功メッセージを表示
        this.showSpeechSuccess();
    }

    showSpeechSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'speech-success';
        successDiv.innerHTML = `
            <div class="success-content">
                <h3>✅ 音声機能が有効になりました</h3>
                <p>音声合成を再試行しました。学習を開始してください。</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">了解</button>
            </div>
        `;
        document.querySelector('.container').insertBefore(successDiv, document.querySelector('main'));
        
        // 3秒後に自動で非表示
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.style.display = 'none';
            }
        }, 3000);
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('CSVファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSV(e.target.result);
                this.displayFileInfo(file.name);
                this.showControls();
                this.displayWordList();
            } catch (error) {
                alert('CSVファイルの読み込みに失敗しました。ファイル形式を確認してください。');
                console.error('CSV parsing error:', error);
            }
        };
        reader.readAsText(file, 'UTF-8');
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        this.words = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // カンマで分割（シンプルな実装）
            const parts = line.split(',');
            if (parts.length >= 2) {
                const english = parts[0].trim();
                const japanese = parts.slice(1).join(',').trim(); // 複数のカンマがある場合も対応
                
                if (english && japanese) {
                    this.words.push({ english, japanese });
                }
            }
        }

        if (this.words.length === 0) {
            throw new Error('有効な単語データが見つかりませんでした。');
        }
    }

    displayFileInfo(fileName) {
        this.fileName.textContent = fileName;
        this.wordCount.textContent = this.words.length;
        this.fileInfo.style.display = 'block';
    }

    showControls() {
        this.controls.style.display = 'flex';
        this.progressSection.style.display = 'block';
        this.currentWord.style.display = 'block';
        this.wordList.style.display = 'block';
    }

    displayWordList() {
        this.wordItems.innerHTML = '';
        
        this.words.forEach((word, index) => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.innerHTML = `
                <div class="english">${word.english}</div>
                <div class="japanese">${word.japanese}</div>
            `;
            wordItem.dataset.index = index;
            this.wordItems.appendChild(wordItem);
        });
    }

    updateWordList() {
        const items = this.wordItems.querySelectorAll('.word-item');
        items.forEach((item, index) => {
            item.classList.remove('current', 'completed');
            
            if (index === this.currentIndex) {
                item.classList.add('current');
            } else if (index < this.currentIndex) {
                item.classList.add('completed');
            }
        });
    }

    startReading() {
        if (this.words.length === 0) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.currentIndex = 0;

        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.stopBtn.disabled = false;
        this.nextBtn.disabled = false;

        this.readCurrentWord();
    }

    pauseReading() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.speechSynthesis.pause();
            this.pauseBtn.textContent = '再開';
        } else {
            this.speechSynthesis.resume();
            this.pauseBtn.textContent = '一時停止';
        }
    }

    stopReading() {
        this.isPlaying = false;
        this.isPaused = false;
        this.speechSynthesis.cancel();

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.stopBtn.disabled = true;
        this.nextBtn.disabled = true;
        this.pauseBtn.textContent = '一時停止';

        this.updateProgress();
        this.updateWordList();
    }

    nextWord() {
        if (this.currentIndex < this.words.length - 1) {
            this.speechSynthesis.cancel();
            this.currentIndex++;
            this.readCurrentWord();
        } else {
            this.stopReading();
        }
    }

    readCurrentWord() {
        if (this.currentIndex >= this.words.length) {
            this.stopReading();
            return;
        }

        const word = this.words[this.currentIndex];
        this.displayCurrentWord(word);
        this.updateProgress();
        this.updateWordList();

        // 英単語を読み上げ
        this.speak(word.english, 'en-US', () => {
            if (!this.isPlaying || this.isPaused) return;
            
            // 1秒待機
            setTimeout(() => {
                if (!this.isPlaying || this.isPaused) return;
                
                // 日本語訳を読み上げ
                this.speak(word.japanese, 'ja-JP', () => {
                    if (!this.isPlaying || this.isPaused) return;
                    
                    // 1秒待機して次の単語へ
                    setTimeout(() => {
                        if (this.isPlaying && !this.isPaused) {
                            this.currentIndex++;
                            this.readCurrentWord();
                        }
                    }, 1000);
                });
            }, 1000);
        });
    }

    speak(text, lang, onEnd) {
        // 音声合成がサポートされていない場合、テキスト表示のみ
        if (!this.speechSupported || this.speechErrorCount >= this.maxSpeechErrors) {
            console.log(`Text display only: ${text}`);
            if (onEnd) {
                setTimeout(onEnd, 1000); // 1秒待機してから次へ
            }
            return;
        }

        // 音声合成が利用可能か再チェック
        if (!this.speechSynthesis || typeof this.speechSynthesis.speak !== 'function') {
            console.log('Speech synthesis not available, falling back to text display');
            this.speechSupported = false;
            if (onEnd) {
                setTimeout(onEnd, 1000);
            }
            return;
        }

        // Stack Overflowの解決策: 必ずcancel()を呼ぶ
        this.speechSynthesis.cancel();

        try {
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = lang;
            
            // レートを2以下に制限（Chromeの制限）
            this.currentUtterance.rate = Math.min(0.8, 2);
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 1;

            // 利用可能な音声を設定
            if (this.availableVoices && this.availableVoices.length > 0) {
                const voice = this.selectBestVoice(lang);
                if (voice) {
                    this.currentUtterance.voice = voice;
                    console.log(`Using voice: ${voice.name} (${voice.lang})`);
                }
            }

            // タイムアウト設定（8秒）
            const timeoutId = setTimeout(() => {
                console.warn('Speech synthesis timeout');
                this.speechSynthesis.cancel();
                if (onEnd) {
                    setTimeout(onEnd, 1000);
                }
            }, 8000);

            this.currentUtterance.onend = () => {
                clearTimeout(timeoutId);
                this.speechErrorCount = 0; // 成功時はエラーカウントをリセット
                console.log(`Finished speaking: ${text}`);
                if (onEnd) onEnd();
            };

            this.currentUtterance.onerror = (event) => {
                clearTimeout(timeoutId);
                console.error('Speech synthesis error:', event.error);
                this.speechErrorCount++;
                
                if (this.speechErrorCount >= this.maxSpeechErrors) {
                    this.showSpeechFallback();
                }
                
                // エラーが発生しても次の処理を続行
                if (onEnd) {
                    setTimeout(onEnd, 1000);
                }
            };

            this.currentUtterance.onstart = () => {
                console.log(`Speaking: ${text}`);
            };

            // 音声合成の実行（Stack Overflowの解決策に従って）
            this.speechSynthesis.speak(this.currentUtterance);
            
        } catch (error) {
            console.error('Speech synthesis exception:', error);
            this.speechErrorCount++;
            if (onEnd) {
                setTimeout(onEnd, 1000);
            }
        }
    }

    selectBestVoice(lang) {
        if (!this.availableVoices || this.availableVoices.length === 0) {
            return null;
        }

        // 指定された言語の音声を探す
        let voice = this.availableVoices.find(v => v.lang.startsWith(lang.split('-')[0]));
        
        // 見つからない場合は、デフォルト音声を使用
        if (!voice) {
            voice = this.availableVoices.find(v => v.default) || this.availableVoices[0];
        }

        return voice;
    }

    showSpeechFallback() {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'speech-fallback';
        fallbackDiv.innerHTML = `
            <div class="fallback-content">
                <h3>🔇 音声機能が無効になりました</h3>
                <p>音声合成でエラーが続発したため、テキスト表示モードに切り替えました。</p>
                <p>学習は継続できますが、音声は再生されません。</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">了解</button>
            </div>
        `;
        document.querySelector('.container').insertBefore(fallbackDiv, document.querySelector('main'));
    }

    displayCurrentWord(word) {
        this.englishWord.textContent = word.english;
        this.japaneseWord.textContent = word.japanese;
    }

    updateProgress() {
        const progress = ((this.currentIndex + 1) / this.words.length) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.currentIndex + 1} / ${this.words.length} 単語`;
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.wordReader = new WordReader();
});
