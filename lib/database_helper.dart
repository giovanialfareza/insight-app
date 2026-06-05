import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('insight.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    // Tabel Pengguna (User)
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        fullName TEXT,
        phone TEXT,
        province TEXT,
        city TEXT,
        profileImageBase64 TEXT
      )
    ''');

    // Tabel Data Sources
    await db.execute('''
      CREATE TABLE data_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        records INTEGER,
        qualityScore REAL,
        status TEXT
      )
    ''');

    // Tabel Pipelines
    await db.execute('''
      CREATE TABLE pipelines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT,
        throughput REAL,
        latency REAL
      )
    ''');

    // Menyemai Data Mock Awal (Seed Data) persis seperti aplikasi Web
    await db.rawInsert("INSERT INTO users (username, password, fullName, phone, province, city) VALUES ('suharso', 'pancasila123', 'Suharso', '08123456789', 'DKI Jakarta', 'Jakarta Timur')");
    await db.rawInsert("INSERT INTO data_sources (name, type, records, qualityScore, status) VALUES ('Customer_DB_Production', 'PostgreSQL', 24500, 94.2, 'Active')");
    await db.rawInsert("INSERT INTO data_sources (name, type, records, qualityScore, status) VALUES ('E-Commerce_Clickstream_2026', 'S3 Bucket', 142000, 88.7, 'Active')");
    await db.rawInsert("INSERT INTO pipelines (name, status, throughput, latency) VALUES ('ETL_Core_Financials', 'In Progress', 450.2, 12.4)");
    await db.rawInsert("INSERT INTO pipelines (name, status, throughput, latency) VALUES ('Log_Aggregation_Stream', 'Done', 1200.8, 4.1)");
  }
}