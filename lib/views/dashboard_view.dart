import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/data_source_viewmodel.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final dsVM = Provider.of<DataSourceViewModel>(context);

    // Menggunakan DefaultTabController untuk membagi konten agar rapi di layar mobile
    return DefaultTabController(
      length: 3, // 3 Tab: Overview, Strategy Guide, dan Audit Details
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Insight Analytics', style: TextStyle(fontWeight: FontWeight.bold)),
          bottom: const TabBar(
            isScrollable: true,
            indicatorColor: Color(0xFF4F46E5),
            labelColor: Color(0xFF4F46E5),
            unselectedLabelColor: Colors.grey,
            tabs: [
              Tab(icon: Icon(Icons.dashboard), text: 'Overview'),
              Tab(icon: Icon(Icons.menu_book), text: 'Data Strategy Guide'),
              Tab(icon: Icon(Icons.fact_check), text: 'Data Audit Details'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // ==================== TAB 1: OVERVIEW METRICS ====================
            SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Metrik Kualitas Data Global', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          'Avg Quality Score', 
                          '${dsVM.averageQuality.toStringAsFixed(1)}%', 
                          Icons.check_circle, 
                          Colors.green
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricCard(
                          'Total Sources', 
                          '${dsVM.sources.length}', 
                          Icons.source, 
                          Colors.indigo
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  const Card(
                    color: Colors.amberAccent,
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Icon(Icons.warning, color: Colors.brown),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Peringatan Sistem: Terdapat 1 Isu Kritis terdeteksi pada Pipeline Log_Aggregation_Stream.',
                              style: TextStyle(color: Colors.brown, fontWeight: FontWeight.w600),
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ==================== TAB 2: DATA STRATEGY GUIDE (Dari web index.html) ====================
            SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('1. Data Strategy Planning', Icons.lightbulb),
                  _buildArticleText(
                    'Data strategy planning is the foundational process of aligning an organization\'s data capabilities with its overarching business goals. It defines how data will be collected, managed, and utilized to drive decision-making and innovation.'
                  ),
                  const SizedBox(height: 16),
                  _buildSectionHeader('2. Best Practices for Data Management', Icons.star),
                  _buildArticleText(
                    '• Establish Clear Data Governance: Define roles, responsibilities, and rules for data ownership and usage.\n'
                    '• Ensure Data Quality: Implement automated checks to monitor completeness, accuracy, and validity.\n'
                    '• Prioritize Data Security: Protect sensitive information through encryption, access controls, and regular compliance audits.'
                  ),
                  const SizedBox(height: 16),
                  _buildSectionHeader('3. Data Governance Framework', Icons.gavel),
                  _buildArticleText(
                    'A robust data governance framework outlines the strategic roadmap for data architecture, lifecycle management, and metadata integration. This ensures consistency across enterprise pipeline streams.'
                  ),
                ],
              ),
            ),

            // ==================== TAB 3: DATA AUDIT DETAILS (Dari web app.js) ====================
            SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Rincian Parameter Kualitas Data Audit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text('Metrik evaluasi kepatuhan aset data berdasarkan standar tata kelola:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  const SizedBox(height: 16),
                  
                  // Menampilkan tabel parameter seperti di versi web
                  Table(
                    border: TableBorder.all(color: Colors.grey.shade300, width: 1),
                    columnWidths: const {
                      0: FlexColumnWidth(1.2),
                      1: FlexColumnWidth(2),
                    },
                    children: [
                      _buildTableRow('Parameter Audit', 'Deskripsi Operasional / Kriteria', isHeader: true),
                      _buildTableRow('Completeness', 'Mengukur ketiadaan nilai kosong (null/missing values) pada kolom kritikal database.'),
                      _buildTableRow('Accuracy', 'Tingkat kecocokan data entri dengan realitas bisnis atau kebenaran logis aturan sistem.'),
                      _buildTableRow('Validity', 'Kepatuhan format data terhadap tipe data yang ditentukan (regex, kode pos, email pattern).'),
                      _buildTableRow('Consistency', 'Keselarasan nilai data yang sama saat direplikasi di berbagai tabel atau sistem backend.'),
                      _buildTableRow('Timeliness', 'Seberapa mutakhir data tersebut tersedia saat dibutuhkan untuk proses analitik/pengambilan keputusan.'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Helper Widgets untuk Mempercantik Tampilan Layout ---

  Widget _buildMetricCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF4F46E5), size: 20),
          const SizedBox(width: 8),
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
        ],
      ),
    );
  }

  Widget _buildArticleText(String text) {
    return Text(
      text,
      style: const TextStyle(fontSize: 14, color: Color(0xFF475569), height: 1.5),
      textAlign: TextAlign.justify,
    );
  }

  TableRow _buildTableRow(String col1, String col2, {bool isHeader = false}) {
    return TableRow(
      decoration: BoxDecoration(
        color: isHeader ? Colors.indigo.shade50 : null,
      ),
      children: [
        Padding(
          padding: const EdgeInsets.all(10.0),
          child: Text(col1, style: TextStyle(fontWeight: isHeader ? FontWeight.bold : FontWeight.w600, color: isHeader ? Colors.indigo : Colors.black87, fontSize: 13)),
        ),
        Padding(
          padding: const EdgeInsets.all(10.0),
          child: Text(col2, style: TextStyle(fontSize: 13, color: isHeader ? Colors.indigo : Colors.black, fontWeight: isHeader ? FontWeight.bold : FontWeight.normal)),
        ),
      ],
    );
  }
}