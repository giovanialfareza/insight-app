import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image/image.dart' as img; // Lib Kompresi File Gambar
import '../models/user_model.dart';
import '../viewmodels/auth_viewmodel.dart';
import 'login_view.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String? _imageBase64;

  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthViewModel>(context, listen: false).currentUser;
    if (user != null) {
      _nameCtrl.text = user.fullName;
      _phoneCtrl.text = user.phone;
      _imageBase64 = user.profileImageBase64;
    }
  }

  // Fungsi Unggah File / Ambil Foto langsung dari Kamera & Mengompresi Ukuran
  Future<void> _pickAndProcessImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source);

    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();
      
      // Proses Kompresi Citra agar menghemat penyimpanan DB lokal biner
      img.Image? originalImage = img.decodeImage(bytes);
      if (originalImage != null) {
        img.Image compressedImage = img.copyResize(originalImage, width: 300); // resize lebar ke 300px
        List<int> compressedBytes = img.encodeJpg(compressedImage, quality: 75); // kompresi kualitas ke 75%

        setState(() {
          // Representasikan file biner bauran ke teks berbasis string Base64 sesuai standard modul
          _imageBase64 = base64Encode(compressedBytes);
        });
      }
    }
  }

  void _saveProfile() {
    final authVM = Provider.of<AuthViewModel>(context, listen: false);
    final current = authVM.currentUser!;
    
    final updated = UserModel(
      id: current.id,
      username: current.username,
      password: current.password,
      fullName: _nameCtrl.text,
      phone: _phoneCtrl.text,
      province: current.province,
      city: current.city,
      profileImageBase64: _imageBase64,
    );

    authVM.updateProfile(updated);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profil berhasil diperbarui di SQLite local database!')));
  }

  @override
  Widget build(BuildContext context) {
    final authVM = Provider.of<AuthViewModel>(context);
    if (authVM.currentUser == null) return const Center(child: Text('No Session.'));

    Uint8List? imageBytes;
    if (_imageBase64 != null) {
      imageBytes = base64Decode(_imageBase64!);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('User Profile Settings')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 60,
                    backgroundColor: Colors.indigo.shade100,
                    backgroundImage: imageBytes != null ? MemoryImage(imageBytes) : null,
                    child: imageBytes == null ? const Icon(Icons.person, size: 60, color: Colors.indigo) : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: CircleAvatar(
                      backgroundColor: Colors.indigo,
                      radius: 20,
                      child: IconButton(
                        icon: const Icon(Icons.camera_alt, size: 18, color: Colors.white),
                        onPressed: () {
                          // Tampilkan opsi Ambil Dari Kamera / Galeri File Picker
                          showModalBottomSheet(
                            context: context,
                            builder: (_) => SafeArea(
                              child: Wrap(
                                children: [
                                  ListTile(
                                    leading: const Icon(Icons.camera),
                                    title: const Text('Ambil Foto via Kamera'),
                                    onTap: () {
                                      Navigator.pop(context);
                                      _pickAndProcessImage(ImageSource.camera);
                                    },
                                  ),
                                  ListTile(
                                    leading: const Icon(Icons.photo_library),
                                    title: const Text('Pilih Berkas dari Galeri Device'),
                                    onTap: () {
                                      Navigator.pop(context);
                                      _pickAndProcessImage(ImageSource.gallery);
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nama Lengkap')),
            const SizedBox(height: 12),
            TextFormField(controller: _phoneCtrl, decoration: const InputDecoration(labelText: 'Nomor Telepon')),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50), backgroundColor: const Color(0xFF4F46E5)),
              onPressed: _saveProfile,
              child: const Text('Simpan Perubahan', style: TextStyle(color: Colors.white)),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                authVM.logout();
                Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginView()), (route) => false);
              },
              child: const Text('Sign Out / Keluar', style: TextStyle(color: Colors.red)),
            )
          ],
        ),
      ),
    );
  }
}