class DataSourceModel {
  final int? id;
  final String name;
  final String type;
  final int records;
  final double qualityScore;
  final String status;

  DataSourceModel({
    this.id,
    required this.name,
    required this.type,
    required this.records,
    required this.qualityScore,
    required this.status,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'records': records,
      'qualityScore': qualityScore,
      'status': status,
    };
  }

  factory DataSourceModel.fromMap(Map<String, dynamic> map) {
    return DataSourceModel(
      id: map['id'],
      name: map['name'],
      type: map['type'],
      records: map['records'],
      qualityScore: map['qualityScore'],
      status: map['status'],
    );
  }
}