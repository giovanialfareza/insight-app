import 'package:flutter/material.dart';
import '../database_helper.dart';
import '../models/data_source_model.dart';

class DataSourceViewModel extends ChangeNotifier {
  List<DataSourceModel> _sources = [];
  List<DataSourceModel> get sources => _sources;

  Future<void> fetchSources() async {
    final db = await DatabaseHelper.instance.database;
    final maps = await db.query('data_sources');
    _sources = maps.map((e) => DataSourceModel.fromMap(e)).toList();
    notifyListeners();
  }

  Future<void> addSource(DataSourceModel source) async {
    final db = await DatabaseHelper.instance.database;
    await db.insert('data_sources', source.toMap());
    await fetchSources();
  }

  // --- HAPUS DATA SOURCE ---
  Future<void> deleteSource(int id) async {
    final db = await DatabaseHelper.instance.database;
    await db.delete('data_sources', where: 'id = ?', whereArgs: [id]);
    await fetchSources();
  }

  // Metrik Kualitas Data global (Cukup tulis sekali di dalam class)
  double get averageQuality {
    if (_sources.isEmpty) return 0.0;
    return _sources.map((e) => e.qualityScore).reduce((a, b) => a + b) / _sources.length;
  }
} // <--- Pastikan kurung kurawal penutup class berada di paling akhir seperti ini