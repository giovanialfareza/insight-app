class UserModel {
  final int? id;
  final String username;
  final String password;
  final String fullName;
  final String phone;
  final String province;
  final String city;
  final String? profileImageBase64;

  UserModel({
    this.id,
    required this.username,
    required this.password,
    required this.fullName,
    required this.phone,
    required this.province,
    required this.city,
    this.profileImageBase64,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'username': username,
      'password': password,
      'fullName': fullName,
      'phone': phone,
      'province': province,
      'city': city,
      'profileImageBase64': profileImageBase64,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'],
      username: map['username'],
      password: map['password'],
      fullName: map['fullName'],
      phone: map['phone'],
      province: map['province'],
      city: map['city'],
      profileImageBase64: map['profileImageBase64'],
    );
  }
}