import 'package:flutter/material.dart';
import '../database_helper.dart';
import '../models/pipeline_model.dart';

class PipelineViewModel extends ChangeNotifier {
  List<PipelineModel> _pipelines = [];
  List<PipelineModel> get pipelines => _pipelines;

  Future<void> fetchPipelines() async {
    final db = await DatabaseHelper.instance.database;
    final maps = await db.query('pipelines');
    _pipelines = maps.map((e) => PipelineModel.fromMap(e)).toList();
    notifyListeners();
  }

  // Tambahkan fungsi addPipeline ini
  Future<void> addPipeline(PipelineModel pipeline) async {
    final db = await DatabaseHelper.instance.database;
    await db.insert('pipelines', pipeline.toMap());
    await fetchPipelines(); // Refresh list setelah ditambah
  }

  // --- HAPUS DATA PIPELINE ---
  Future<void> deletePipeline(int id) async {
    final db = await DatabaseHelper.instance.database;
    await db.delete('pipelines', where: 'id = ?', whereArgs: [id]);
    await fetchPipelines(); // Ambil ulang data terbaru setelah dihapus
  }
}