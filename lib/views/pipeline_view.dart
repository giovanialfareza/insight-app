import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../viewmodels/pipeline_viewmodel.dart';

class PipelineView extends StatefulWidget {
  const PipelineView({super.key});

  @override
  State<PipelineView> createState() => _PipelineViewState();
}

class _PipelineViewState extends State<PipelineView> {
  @override
  void initState() {
    super.initState();
    // Memuat data pipeline dari SQLite saat widget pertama kali dibuat
    Future.microtask(() => 
      Provider.of<PipelineViewModel>(context, listen: false).fetchPipelines()
    );
  }

  @override
  Widget build(BuildContext context) {
    final pipeVM = Provider.of<PipelineViewModel>(context);

    // 1. MEMBUAT TITIK KOORDINAT GRAFIK SECARA DINAMIS
    List<FlSpot> chartSpots = [];
    for (int i = 0; i < pipeVM.pipelines.length; i++) {
      // Sumbu X = Urutan data ke-i, Sumbu Y = Nilai throughput dari database
      chartSpots.add(FlSpot(i.toDouble(), pipeVM.pipelines[i].throughput));
    }

    // Antisipasi jika database kosong (biar grafik tidak crash atau kosong melompong)
    if (chartSpots.isEmpty) {
      chartSpots = [const FlSpot(0, 0)];
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pipeline Monitoring & Throughput', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Tren Throughput Kecepatan Pipa Data (Records/sec)', 
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)
              ),
              const SizedBox(height: 16),
              
              // 2. AREA VISUALISASI GRAFIK DINAMIS
              SizedBox(
                height: 200,
                child: LineChart(
                  LineChartData(
                    gridData: const FlGridData(
                      show: true,
                      drawVerticalLine: true,
                    ),
                    // Menyembunyikan label angka default bawaan fl_chart agar bersih seperti Chart.js web
                    titlesData: const FlTitlesData(
                      show: true,
                      rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    borderData: FlBorderData(
                      show: true,
                      border: Border.all(color: Colors.grey.shade300, width: 1),
                    ),
                    lineBarsData: [
                      LineChartBarData(
                        spots: chartSpots, // <--- GANTI DENGAN VARIABEL DINAMIS INI
                        isCurved: true,
                        color: Colors.indigo,
                        barWidth: 4,
                        dotData: const FlDotData(show: true), // Tampilkan titik koordinat data biar makin jelas
                      )
                    ]
                  )
                ),
              ),
              const SizedBox(height: 24),
              
              const Text(
                'Active Pipeline Stream Lists', 
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.indigo)
              ),
              const SizedBox(height: 8),
              
              // 3. DAFTAR LIST PIPELINE DARI DATABASE
              Expanded(
                child: pipeVM.pipelines.isEmpty
                    ? const Center(child: Text('Belum ada pipeline aktif. Sila tambah Data Source terlebih dahulu.'))
                    : ListView.builder(
  itemCount: pipeVM.pipelines.length,
  itemBuilder: (context, index) {
    final pipe = pipeVM.pipelines[index];
    return Card(
      child: ListTile(
        leading: Icon(
          Icons.alt_route, 
          color: pipe.status == 'Done' ? Colors.green : (pipe.status == 'To Do' ? Colors.grey : Colors.orange)
        ),
        title: Text(pipe.name),
        // Menampilkan status dinamis pilihan user (To Do, In Progress, In Review, Done)
        subtitle: Text('Status: ${pipe.status} | Latency: ${pipe.latency.toStringAsFixed(1)}ms'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${pipe.throughput.toStringAsFixed(1)} R/s',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo, fontSize: 12),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
              onPressed: () {
                if (pipe.id != null) {
                  pipeVM.deletePipeline(pipe.id!);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pipeline Progress Dihapus!')));
                }
              },
            ),
          ],
        ),
      ),
    );
  },
)
              )
            ],
          ),
        ),
      ),
    );
  }
}