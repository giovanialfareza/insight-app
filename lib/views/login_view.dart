import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../viewmodels/auth_viewmodel.dart';
import 'main_navigation_view.dart';
import 'register_view.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>(); // Android Form: GlobalKey untuk validasi
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  void _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      final authVM = Provider.of<AuthViewModel>(context, listen: false);
      bool success = await authVM.login(_usernameController.text, _passwordController.text);
      setState(() => _isLoading = false);

      if (success) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const MainNavigationView()), // Explicit Intent Navigation
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Username atau Password Salah! (Coba: suharso/pancasila123)')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Definisikan warna palette slate secara lokal agar kode di bawah lebih bersih
    const colorSlate400 = Color(0xFF94A3B8);
    const colorSlate700 = Color(0xFF334155);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Dark mode UI untuk area Auth sesuai web
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.analytics, size: 80, color: Color(0xFF6366F1)),
                const SizedBox(height: 16),
                const Text('INSIGHT', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: 2)),
                const Text('Data Quality Analytics Platform', style: TextStyle(color: colorSlate400, fontSize: 14)),
                const SizedBox(height: 40),
                TextFormField(
                  controller: _usernameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Username',
                    labelStyle: TextStyle(color: colorSlate400),
                    enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: colorSlate700)),
                    focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF6366F1))),
                  ),
                  validator: (value) => value!.isEmpty ? 'Username tidak boleh kosong' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    labelStyle: TextStyle(color: colorSlate400),
                    enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: colorSlate700)),
                    focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF6366F1))),
                  ),
                  validator: (value) => value!.length < 6 ? 'Password minimal 6 karakter' : null,
                ),
                const SizedBox(height: 24),
                _isLoading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size.fromHeight(50),
                          backgroundColor: const Color(0xFF6366F1),
                        ),
                        onPressed: _handleLogin,
                        child: const Text('Sign In', style: TextStyle(color: Colors.white, fontSize: 16)),
                      ),
                TextButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterView()));
                  },
                  child: const Text('Belum punya akun? Buat Akun Baru', style: TextStyle(color: Color(0xFF818CF8))),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}