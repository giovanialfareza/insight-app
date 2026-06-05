class PipelineModel {
  final int? id;
  final String name;
  final String status; // To Do, In Progress, In Review, Done
  final double throughput;
  final double latency;

  PipelineModel({
    this.id,
    required this.name,
    required this.status,
    required this.throughput,
    required this.latency,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'throughput': throughput,
      'latency': latency,
    };
  }

  factory PipelineModel.fromMap(Map<String, dynamic> map) {
    return PipelineModel(
      id: map['id'],
      name: map['name'],
      status: map['status'],
      throughput: map['throughput'],
      latency: map['latency'],
    );
  }
}