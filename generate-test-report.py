#!/usr/bin/env python3
"""
MongoDB Atlas接続テスト結果レポート生成スクリプト
"""

import os
import subprocess
import sys
from datetime import datetime

def run_test_script(script_name, description):
    """テストスクリプトを実行して結果を取得"""
    print(f"🧪 {description}を実行中...")
    try:
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=True, text=True, timeout=60)
        # 出力に"成功"または"完了"が含まれていれば成功と判定
        success = ("成功" in result.stdout or "完了" in result.stdout) and result.returncode == 0
        return success, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "タイムアウトエラー"
    except Exception as e:
        return False, "", str(e)

def generate_report():
    """テストレポートを生成"""
    print("📊 MongoDB Atlas接続テストレポート生成")
    print("=" * 60)
    print(f"📅 実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 環境変数確認
    print("🔧 環境設定確認:")
    if os.path.exists('.env'):
        print("   ✅ .envファイル: 存在")
        with open('.env', 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines:
                if line.strip().startswith('MONGODB_CONNECTION_STRING='):
                    conn_str = line.split('=', 1)[1].strip()
                    if conn_str:
                        print(f"   ✅ 接続文字列: {conn_str[:30]}...")
                    else:
                        print("   ❌ 接続文字列: 未設定")
                    break
    else:
        print("   ❌ .envファイル: 存在しない")
    
    print()
    
    # 基本接続テスト
    success1, stdout1, stderr1 = run_test_script('test-mongodb-connection.py', '基本接続テスト')
    print(f"🔍 基本接続テスト: {'✅ 成功' if success1 else '❌ 失敗'}")
    
    # 詳細テスト
    success2, stdout2, stderr2 = run_test_script('test-mongodb-detailed.py', '詳細CRUDテスト')
    print(f"🧪 詳細CRUDテスト: {'✅ 成功' if success2 else '❌ 失敗'}")
    
    print()
    print("=" * 60)
    
    # 総合結果
    if success1 and success2:
        print("🎉 総合結果: すべてのテストが成功しました！")
        print("💡 MongoDB Atlas接続は正常に動作しています")
        print("💡 アプリでMongoDB Atlasを安全に使用できます")
        
        # 成功時の推奨事項
        print("\n📋 推奨事項:")
        print("   1. アプリを再起動してMongoDB Atlasに接続")
        print("   2. CSVファイルをアップロードして単語を登録")
        print("   3. データベースから単語を読み込んで音声再生")
        
    else:
        print("💥 総合結果: テストに失敗しました")
        print("💡 接続文字列とネットワーク設定を確認してください")
        
        # 失敗時の対処法
        print("\n🔧 対処法:")
        print("   1. MongoDB Atlas接続文字列を確認")
        print("   2. ネットワーク接続を確認")
        print("   3. MongoDB Atlasクラスターの状態を確認")
        print("   4. ファイアウォール設定を確認")
    
    print()
    print("📁 テストファイル:")
    print("   - test-mongodb-connection.py: 基本接続テスト")
    print("   - test-mongodb-detailed.py: 詳細CRUDテスト")
    print("   - create-env.py: .envファイル作成")
    print("   - requirements.txt: 必要なPythonパッケージ")
    
    return success1 and success2

if __name__ == "__main__":
    try:
        success = generate_report()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  レポート生成を中断しました")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 エラー: {e}")
        sys.exit(1)
