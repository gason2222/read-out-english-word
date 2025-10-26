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

        // 音声合成の初期化を試行
        try {
            // 空の音声を生成して初期化をテスト
            const testUtterance = new SpeechSynthesisUtterance('');
            testUtterance.volume = 0;
            testUtterance.rate = 10;
            testUtterance.pitch = 0;
            
            testUtterance.onerror = (event) => {
                console.warn('Speech synthesis test failed:', event.error);
                this.speechSupported = false;
                this.showSpeechWarning();
            };
            
            testUtterance.onend = () => {
                this.speechSupported = true;
                console.log('Speech synthesis is working properly');
            };
            
            this.speechSynthesis.speak(testUtterance);
            
            // 3秒後にタイムアウト
            setTimeout(() => {
                if (!this.speechSupported) {
                    this.showSpeechWarning();
                }
            }, 3000);
            
        } catch (error) {
            console.error('Speech synthesis initialization error:', error);
            this.speechSupported = false;
            this.showSpeechWarning();
        }
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
                <button onclick="this.parentElement.parentElement.style.display='none'">了解</button>
            </div>
        `;
        document.querySelector('.container').insertBefore(warningDiv, document.querySelector('main'));
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

        if (this.currentUtterance) {
            this.speechSynthesis.cancel();
        }

        try {
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = lang;
            this.currentUtterance.rate = 0.8;
            this.currentUtterance.pitch = 1;
            this.currentUtterance.volume = 1;

            this.currentUtterance.onend = () => {
                this.speechErrorCount = 0; // 成功時はエラーカウントをリセット
                if (onEnd) onEnd();
            };

            this.currentUtterance.onerror = (event) => {
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

            this.speechSynthesis.speak(this.currentUtterance);
            
        } catch (error) {
            console.error('Speech synthesis exception:', error);
            this.speechErrorCount++;
            if (onEnd) {
                setTimeout(onEnd, 1000);
            }
        }
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
    new WordReader();
});
