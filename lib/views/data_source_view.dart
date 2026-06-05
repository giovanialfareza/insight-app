import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/data_source_viewmodel.dart';
import 'widgets/wizard_steps.dart';

class DataSourceView extends StatefulWidget {
  const DataSourceView({super.key});

  @override
  State<DataSourceView> createState() => _DataSourceViewState();
}

class _DataSourceViewState extends State<DataSourceView> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => Provider.of<DataSourceViewModel>(context, listen: false).fetchSources());
  }

  void _openAddSourceWizard() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => const FractionallySizedBox(
        heightFactor: 0.85,
        child: AddSourceWizardWidget(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dsVM = Provider.of<DataSourceViewModel>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Source Overview'),
        actions: [
          IconButton(onPressed: _openAddSourceWizard, icon: const Icon(Icons.add_circle_outline, size: 28)),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: dsVM.sources.length,
        itemBuilder: (context, index) {
  final src = dsVM.sources[index];
  return Card(
    child: ListTile(
      leading: const CircleAvatar(child: Icon(Icons.dns)),
      title: Text(src.name, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text('Tipe: ${src.type} | Records: ${src.records}'),
      trailing: Row(
        mainAxisSize: MainAxisSize.min, // Agar tidak makan ruang baris
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.indigo.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text('${src.qualityScore}%', style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 12)),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            onPressed: () {
              // Panggil fungsi hapus jika ID tidak kosong
              if (src.id != null) {
                dsVM.deleteSource(src.id!);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Data Source Berhasil Dihapus!')));
              }
            },
          ),
        ],
      ),
    ),
  );
}
      ),
    );
  }
}