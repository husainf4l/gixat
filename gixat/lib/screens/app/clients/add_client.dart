import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:gixat/services/clients/client_service.dart';
import 'package:gixat/services/shared/snack_bar.dart';
import 'package:gixat/widgets/app/custom_app_bar.dart';
import 'package:gixat/widgets/app/app_address_input.dart';
import 'package:gixat/widgets/app/gixat_text_field.dart';
import 'package:gixat/screens/app/cars/add_car.dart';

class AddClient extends StatefulWidget {
  const AddClient({super.key});

  @override
  State<AddClient> createState() => _AddClientState();
}

class _AddClientState extends State<AddClient> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _companyNameController = TextEditingController();
  final TextEditingController _trnController = TextEditingController();

  bool _isCompany = false;
  String? _selectedCountry;
  String? _selectedCity;
  bool _isLoading = false;
  final ClientService _clientService = ClientService();
  final SnackBarService _snackBarService = SnackBarService();

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    _companyNameController.dispose();
    _trnController.dispose();
    super.dispose();
  }

  Future<void> _saveClient() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _isLoading = true;
    });
    try {
      final result = await _clientService.saveClient(
        name: _nameController.text,
        phoneNumber: _phoneController.text,
        city: _selectedCity,
        country: _selectedCountry,
        isCompany: _isCompany,
        companyName: _companyNameController.text,
        trn: _trnController.text,
        formKey: _formKey,
      );
      _snackBarService.showMessage(result.message, isError: !result.success);
      if (result.success && result.client != null) {
        // Navigate to AddCarPage with client ID
        Get.to(
          () => AddCar(clientId: result.client!.id!),
          transition: Transition.rightToLeft,
        );
      }
    } catch (e) {
      _snackBarService.showMessage(
        'An unexpected error occurred',
        isError: true,
      );
    } finally {
      // Reset loading state if still mounted
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Add Client',
        showBackButton: true,
        actions: [
          _isLoading
              ? const Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              )
              : IconButton(
                onPressed: _saveClient,
                icon: const Icon(CupertinoIcons.cloud_upload),
                tooltip: 'Save Client',
              ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 16),
                GixatTextField(
                  controller: _nameController,
                  labelText: 'Name',
                  hintText: 'Enter client name',
                  prefixIcon: Icon(
                    Icons.person,
                    color: Theme.of(context).colorScheme.primary,
                    size: 22,
                  ),
                  textInputAction: TextInputAction.next,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a name';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                AppAddressInput(
                  phoneController: _phoneController,
                  onCountryChanged: (country) {
                    setState(() {
                      _selectedCountry = country;
                    });
                  },
                  onCityChanged: (city) {
                    setState(() {
                      _selectedCity = city;
                    });
                  },
                  onPhoneChanged: (phone) {},
                  phoneValidator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a phone number';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Switch(
                      value: _isCompany,
                      onChanged: (val) {
                        setState(() {
                          _isCompany = val;
                        });
                      },
                    ),
                    const SizedBox(width: 8),
                    const Text('Is Company?'),
                  ],
                ),
                if (_isCompany) ...[
                  const SizedBox(height: 12),
                  GixatTextField(
                    controller: _companyNameController,
                    labelText: 'Company Name',
                    hintText: 'Enter company name',
                    prefixIcon: Icon(
                      Icons.business,
                      color: Theme.of(context).colorScheme.primary,
                      size: 22,
                    ),
                    textInputAction: TextInputAction.next,
                    validator: (value) {
                      if (_isCompany && (value == null || value.isEmpty)) {
                        return 'Please enter a company name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  GixatTextField(
                    controller: _trnController,
                    labelText: 'TRN Number',
                    hintText: 'Enter TRN number',
                    prefixIcon: Icon(
                      Icons.numbers,
                      color: Theme.of(context).colorScheme.primary,
                      size: 22,
                    ),
                    textInputAction: TextInputAction.done,
                  ),
                ],
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _saveClient,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16.0),
                    ),
                    child:
                        _isLoading
                            ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                            : const Text('Save Client'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
