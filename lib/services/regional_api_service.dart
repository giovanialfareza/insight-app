import 'dart:convert';
import 'package:http/http.dart' as http;

class RegionalApiService {
  // Simulasi/Fetch Data Wilayah dari API Publik
  static Future<List<String>> getProvinces() async {
    try {
      final response = await http.get(Uri.parse('https://api.goapi.io/regional/provinsi'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        List<dynamic> provList = data['data'] ?? [];
        return provList.map((e) => e['name'].toString()).toList();
      }
    } catch (_) {}
    return ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten'];
  }
}