import 'package:flutter/material.dart';
import 'dashboard_view.dart';
import 'data_source_view.dart';
import 'pipeline_view.dart';
import 'profile_view.dart';

class MainNavigationView extends StatefulWidget {
  const MainNavigationView({super.key});

  @override
  State<MainNavigationView> createState() => _MainNavigationViewImplState();
}

class _MainNavigationViewImplState extends State<MainNavigationView> {
  int _currentIndex = 0;
  final List<Widget> _views = [
    const DashboardView(),
    const DataSourceView(),
    const PipelineView(),
    const ProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _views[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF4F46E5),
        unselectedItemColor: Colors.grey,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.storage), label: 'Data Sources'),
          BottomNavigationBarItem(icon: Icon(Icons.alt_route), label: 'Pipelines'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}