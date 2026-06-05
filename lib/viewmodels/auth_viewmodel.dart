import 'package:flutter/material.dart';
import '../database_helper.dart';
import '../models/user_model.dart';

class AuthViewModel extends ChangeNotifier {
  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  Future<bool> login(String username, String password) async {
    final db = await DatabaseHelper.instance.database;
    final res = await db.query(
      'users',
      where: 'username = ? AND password = ?',
      whereArgs: [username, password],
    );

    if (res.isNotEmpty) {
      _currentUser = UserModel.fromMap(res.first);
      notifyListeners();
      return true;
    }
    return false;
  }

  Future<bool> register(UserModel user) async {
    final db = await DatabaseHelper.instance.database;
    try {
      await db.insert('users', user.toMap());
      return true;
    } catch (e) {
      return false; // Mengembalikan false jika username duplikat/conflict
    }
  }

  Future<void> updateProfile(UserModel updatedUser) async {
    final db = await DatabaseHelper.instance.database;
    await db.update(
      'users',
      updatedUser.toMap(),
      where: 'id = ?',
      whereArgs: [updatedUser.id],
    );
    _currentUser = updatedUser;
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }
}