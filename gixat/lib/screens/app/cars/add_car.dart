import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:gixat/widgets/app/custom_app_bar.dart';

class AddCar extends StatefulWidget {
  final String? clientId;
  const AddCar({super.key, this.clientId});

  @override
  State<AddCar> createState() => _AddCarState();
}

class _AddCarState extends State<AddCar> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Add Car',
        actions: [
          IconButton(
            icon: Icon(CupertinoIcons.cloud_upload),
            onPressed: () {
              Get.offNamed('/home');
            },
          ),
        ],
      ),
      body: Center(child: Text('Add Car for Client ID: ${widget.clientId}')),
    );
  }
}
