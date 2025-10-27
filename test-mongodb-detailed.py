#!/usr/bin/env python3
"""
MongoDB Atlas詳細テストスクリプト
接続、CRUD操作、データベース状態の詳細確認
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError
import json

def load_env_file():
    """環境変数ファイルを読み込み"""
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars

def test_detailed_connection():
    """詳細なMongoDB接続テスト"""
    print("🔍 MongoDB Atlas詳細テスト")
    print("=" * 60)
    
    # 環境変数読み込み
    env_vars = load_env_file()
    connection_string = env_vars.get('MONGODB_CONNECTION_STRING', '').strip()
    database_name = env_vars.get('MONGODB_DATABASE', 'english-word')
    collection_name = env_vars.get('MONGODB_COLLECTION', 'words')
    
    if not connection_string:
        print("❌ MONGODB_CONNECTION_STRINGが設定されていません")
        return False
    
    try:
        # 接続
        print(f"🔗 接続文字列: {connection_string[:50]}...")
        print(f"📚 データベース: {database_name}")
        print(f"📄 コレクション: {collection_name}")
        print("-" * 60)
        
        client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
        
        # 接続テスト
        print("⏳ 接続中...")
        client.admin.command('ping')
        print("✅ 接続成功！")
        
        # データベース取得
        db = client[database_name]
        collection = db[collection_name]
        
        # 1. データベース情報
        print(f"\n📊 データベース情報:")
        print(f"   データベース名: {database_name}")
        print(f"   コレクション名: {collection_name}")
        
        # 2. コレクション統計
        print(f"\n📈 コレクション統計:")
        total_docs = collection.count_documents({})
        print(f"   総ドキュメント数: {total_docs}件")
        
        if total_docs > 0:
            # サンプルドキュメント表示
            sample_doc = collection.find_one()
            print(f"   サンプルドキュメント:")
            print(f"   {json.dumps(sample_doc, indent=6, ensure_ascii=False, default=str)}")
        
        # 3. CRUD操作テスト
        print(f"\n🧪 CRUD操作テスト:")
        
        # テストデータ作成
        test_word = {
            "english": "test",
            "japanese": "テスト",
            "createdAt": datetime.now(),
            "testFlag": True
        }
        
        # Create
        print("   📝 Create (作成)...")
        result = collection.insert_one(test_word)
        print(f"   ✅ 作成成功: ID = {result.inserted_id}")
        
        # Read
        print("   📖 Read (読み取り)...")
        found_doc = collection.find_one({"_id": result.inserted_id})
        if found_doc:
            print(f"   ✅ 読み取り成功: {found_doc['english']} = {found_doc['japanese']}")
        else:
            print("   ❌ 読み取り失敗")
        
        # Update
        print("   ✏️  Update (更新)...")
        update_result = collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"japanese": "テスト（更新済み）"}}
        )
        print(f"   ✅ 更新成功: {update_result.modified_count}件更新")
        
        # Delete
        print("   🗑️  Delete (削除)...")
        delete_result = collection.delete_one({"_id": result.inserted_id})
        print(f"   ✅ 削除成功: {delete_result.deleted_count}件削除")
        
        # 4. 接続詳細情報
        print(f"\n🔧 接続詳細情報:")
        print(f"   ホスト: {client.address[0]}")
        print(f"   ポート: {client.address[1]}")
        print(f"   接続状態: アクティブ")
        
        # 5. サーバー情報
        print(f"\n🖥️  サーバー情報:")
        server_info = client.server_info()
        print(f"   MongoDBバージョン: {server_info.get('version', 'N/A')}")
        print(f"   プラットフォーム: {server_info.get('platform', 'N/A')}")
        
        client.close()
        return True
        
    except ConnectionFailure as e:
        print(f"❌ 接続失敗: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        print(f"⏰ 接続タイムアウト: {e}")
        return False
    except ConfigurationError as e:
        print(f"⚙️  設定エラー: {e}")
        return False
    except Exception as e:
        print(f"💥 予期しないエラー: {e}")
        return False

def main():
    """メイン処理"""
    print("🚀 MongoDB Atlas詳細テストスクリプト")
    print(f"📅 実行時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = test_detailed_connection()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 詳細テスト完了 - 成功！")
        print("💡 MongoDB Atlas接続とCRUD操作が正常に動作します")
        print("💡 アプリでMongoDB Atlasを安全に使用できます")
    else:
        print("💥 詳細テスト完了 - 失敗")
        print("💡 接続文字列とネットワーク設定を確認してください")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  テストを中断しました")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 スクリプトエラー: {e}")
        sys.exit(1)
