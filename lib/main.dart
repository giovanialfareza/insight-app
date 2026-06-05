import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'viewmodels/auth_viewmodel.dart';
import 'viewmodels/data_source_viewmodel.dart';
import 'viewmodels/pipeline_viewmodel.dart';
import 'views/login_view.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthViewModel()),
        ChangeNotifierProvider(create: (_) => DataSourceViewModel()),
        ChangeNotifierProvider(create: (_) => PipelineViewModel()),
      ],
      child: const InsightApp(),
    ),
  );
}

class InsightApp extends StatelessWidget {
  const InsightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Insight Data App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        primarySwatch: Colors.indigo,
        primaryColor: const Color(0xFF4F46E5), // Indigo600 ala Tailwind CSS Web
        scaffoldBackgroundColor: const Color(0xFFF9FAFB),
      ),
      home: const LoginView(),
    );
  }
}