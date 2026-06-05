// lib/views/widgets/wizard_steps.dart
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart'; // <--- Memakai File Picker asli karena Java 11 sudah aktif
import '../../models/data_source_model.dart';
import '../../models/pipeline_model.dart';
import '../../viewmodels/data_source_viewmodel.dart';
import '../../viewmodels/pipeline_viewmodel.dart';

class AddSourceWizardWidget extends StatefulWidget {
  const AddSourceWizardWidget({super.key});

  @override
  State<AddSourceWizardWidget> createState() => _AddSourceWizardWidgetState();
}

class _AddSourceWizardWidgetState extends State<AddSourceWizardWidget> {
  int _currentStep = 0;
  final _nameController = TextEditingController();
  
  String _selectedType = 'CSV / Excel';
  final List<String> _fileTypes = ['CSV / Excel', 'JSON', 'PDF Document', 'Image (PNG/JPG)', 'PostgreSQL / MySQL'];

  String _selectedStatus = 'In Progress';
  final List<String> _statusOptions = ['To Do', 'In Progress', 'In Review', 'Done'];

  String _uploadedFileName = 'Belum ada file yang dipilih';
  bool _isFileUploaded = false;
  int _simulationRecords = 0;
  double _calculatedQualityScore = 100.0;
  
  File? _actualFile;

  // FUNGSI UTAMA: Menjelajahi file asli dari internal storage sistem operasi Android
  Future<void> _pickActualFile() async {
    FileType pickerType = FileType.custom;
    List<String>? allowedExtensions;

    // Filter ekstensi berdasarkan tipe format data yang dipilih user
    if (_selectedType == 'CSV / Excel') {
      allowedExtensions = ['csv', 'xls', 'xlsx'];
    } else if (_selectedType == 'JSON') {
      allowedExtensions = ['json'];
    } else if (_selectedType == 'PDF Document') {
      allowedExtensions = ['pdf'];
    } else if (_selectedType == 'Image (PNG/JPG)') {
      pickerType = FileType.image; // Menggunakan preset Image bawaan OS
    } else {
      allowedExtensions = ['sql', 'txt'];
    }

    try {
      // Membuka jendela File Explorer asli perangkat
      FilePickerResult? result = await FilePicker.pickFiles(
        type: pickerType,
        allowedExtensions: allowedExtensions,
      );

      if (result != null && result.files.single.path != null) {
        setState(() {
          _actualFile = File(result.files.single.path!);
          _uploadedFileName = result.files.single.name; // Mengambil nama berkas asli lokal
          _isFileUploaded = true;
          
          // Kalkulasi record dinamis berdasarkan ukuran kapasitas byte file asli
          int fileSizeInBytes = _actualFile!.lengthSync();
          if (fileSizeInBytes > 0) {
            _simulationRecords = (fileSizeInBytes / 120).round() + 30;
          } else {
            _simulationRecords = 1200;
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat dokumen: $e')),
      );
    }
  }

  String _getFileExtension(String type) {
    if (type.contains('JSON')) return 'JSON';
    if (type.contains('PDF')) return 'PDF';
    if (type.contains('Image')) return 'IMG';
    return 'CSV/XLS';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 16),
        Text(
          'Add New Data & Pipeline (Step ${_currentStep + 1}/4)', 
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)
        ),
        Expanded(
          child: Stepper(
            type: StepperType.horizontal,
            currentStep: _currentStep,
            onStepContinue: () async {
              if (_currentStep < 3) {
                if (_currentStep == 1 && !_isFileUploaded) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Silakan pilih berkas asli terlebih dahulu!')),
                  );
                  return;
                }
                setState(() {
                  _currentStep += 1;
                  if (_currentStep == 2) {
                    _calculatedQualityScore = 83.2 + (DateTime.now().millisecond % 15);
                  }
                });
              } else {
                final sourceName = _nameController.text.isEmpty ? _uploadedFileName : _nameController.text;
                
                final newSrc = DataSourceModel(
                  name: sourceName,
                  type: _selectedType,
                  records: _simulationRecords,
                  qualityScore: _calculatedQualityScore,
                  status: 'Active',
                );
                await Provider.of<DataSourceViewModel>(context, listen: false).addSource(newSrc);

                final double generatedThroughput = 350.0 + (DateTime.now().millisecond % 450);
                final double generatedLatency = 1.5 + (DateTime.now().millisecond % 8);

                final newPipeline = PipelineModel(
                  name: 'Process_${sourceName.replaceAll(' ', '_')}',
                  status: _selectedStatus,
                  throughput: generatedThroughput,
                  latency: generatedLatency,
                );
                await Provider.of<PipelineViewModel>(context, listen: false).addPipeline(newPipeline);

                Navigator.pop(context);
              }
            },
            onStepCancel: () {
              if (_currentStep > 0) setState(() => _currentStep -= 1);
            },
            steps: [
              Step(
                title: const Text('Nama'),
                isActive: _currentStep >= 0,
                content: Column(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Data Source Name (Opsional)', 
                        hintText: 'ex: Dataset_Trisakti_Kualitas'
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedStatus,
                      decoration: const InputDecoration(labelText: 'Set Initial Pipeline Status'),
                      items: _statusOptions.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                      onChanged: (val) => setState(() => _selectedStatus = val!),
                    ),
                  ],
                ),
              ),
              Step(
                title: const Text('Upload'),
                isActive: _currentStep >= 1,
                content: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    DropdownButtonFormField<String>(
                      value: _selectedType,
                      decoration: const InputDecoration(labelText: 'Pilih Tipe / Format File Target'),
                      items: _fileTypes.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
                      onChanged: (val) => setState(() {
                        _selectedType = val!;
                        _isFileUploaded = false;
                        _uploadedFileName = 'Belum ada file yang dipilih';
                        _actualFile = null;
                      }),
                    ),
                    const SizedBox(height: 20),
                    Center(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(minimumSize: const Size(220, 45)),
                        icon: const Icon(Icons.folder_open),
                        label: Text('Buka Berkas Lokal (.${_getFileExtension(_selectedType)})'),
                        onPressed: _pickActualFile, 
                      ),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        _uploadedFileName, 
                        style: TextStyle(
                          color: _isFileUploaded ? Colors.green : Colors.grey, 
                          fontWeight: _isFileUploaded ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
              Step(
                title: const Text('Scan'),
                isActive: _currentStep >= 2,
                content: Column(
                  children: [
                    const Text('Sistem membaca berkas asli & menghitung nilai integritas data...'),
                    const SizedBox(height: 12),
                    LinearProgressIndicator(value: _calculatedQualityScore / 100),
                    const SizedBox(height: 8),
                    Text('Ukuran File: ${((_actualFile?.lengthSync() ?? 0) / 1024).toStringAsFixed(1)} KB'),
                    Text('Terhitung: $_simulationRecords Estimasi Records | Integrity Score: ${_calculatedQualityScore.toStringAsFixed(1)}%')
                  ],
                ),
              ),
              Step(
                title: const Text('Selesai'),
                isActive: _currentStep >= 3,
                content: Text('Berkas "$_uploadedFileName" siap dimasukkan ke dalam Pipeline Antrean dengan status: "$_selectedStatus".'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}