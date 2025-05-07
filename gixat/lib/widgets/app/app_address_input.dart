import 'package:flutter/material.dart';
import 'package:gixat/widgets/app/gixat_text_field.dart';
import 'package:gixat/utils/theme.dart';

/// A comprehensive address input widget that includes:
/// - Street text field
/// - Country dropdown (limited to launch countries)
/// - City dropdown (dynamically populated based on selected country)
/// - Phone number field with country code automatically populated
class AppAddressInput extends StatefulWidget {
  final TextEditingController? streetController;
  final TextEditingController? phoneController;
  final Function(String) onCountryChanged;
  final Function(String) onCityChanged;
  final Function(String) onPhoneChanged;
  final String? initialCountry;
  final String? initialCity;
  final String? initialPhone;
  final String? Function(String?)?
  phoneValidator; // Added phoneValidator parameter

  const AppAddressInput({
    super.key,
    this.streetController,
    this.phoneController,
    required this.onCountryChanged,
    required this.onCityChanged,
    required this.onPhoneChanged,
    this.initialCountry,
    this.initialCity,
    this.initialPhone,
    this.phoneValidator, // Added phoneValidator parameter
  });

  @override
  AppAddressInputState createState() => AppAddressInputState();
}

class AppAddressInputState extends State<AppAddressInput> {
  String? selectedCountry;
  String? selectedCity;

  // Limited launch countries with country codes and phone codes
  final Map<String, Map<String, dynamic>> _countriesAndCities = {
    'Bahrain': {
      'code': 'BH',
      'phoneCode': '+973',
      'cities': ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town'],
    },
    'Jordan': {
      'code': 'JO',
      'phoneCode': '+962',
      'cities': [
        'Amman',
        'Irbid',
        'Zarqa',
        'Aqaba',
        'Madaba',
        'Jerash',
        'Salt',
        'Karak',
      ],
    },
    'Kuwait': {
      'code': 'KW',
      'phoneCode': '+965',
      'cities': ['Kuwait City', 'Hawalli', 'Salmiya', 'Al Ahmadi', 'Fahaheel'],
    },
    'Oman': {
      'code': 'OM',
      'phoneCode': '+968',
      'cities': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur'],
    },
    'Qatar': {
      'code': 'QA',
      'phoneCode': '+974',
      'cities': [
        'Doha',
        'Al Wakrah',
        'Al Khor',
        'Dukhan',
        'Mesaieed',
        'Ras Laffan',
      ],
    },
    'Saudi Arabia': {
      'code': 'SA',
      'phoneCode': '+966',
      'cities': [
        'Riyadh',
        'Jeddah',
        'Mecca',
        'Medina',
        'Dammam',
        'Dhahran',
        'Al Khobar',
        'Tabuk',
      ],
    },
    'United Arab Emirates': {
      'code': 'AE',
      'phoneCode': '+971',
      'cities': [
        'Dubai',
        'Abu Dhabi',
        'Sharjah',
        'Ajman',
        'Ras Al Khaimah',
        'Fujairah',
        'Umm Al Quwain',
      ],
    },
    'United Kingdom': {
      'code': 'GB',
      'phoneCode': '+44',
      'cities': [
        'London',
        'Manchester',
        'Birmingham',
        'Glasgow',
        'Liverpool',
        'Edinburgh',
        'Leeds',
        'Bristol',
        'Cardiff',
        'Belfast',
        'Sheffield',
        'Newcastle',
        'Nottingham',
        'Cambridge',
        'Oxford',
      ],
    },
  };

  // Cities for selected country
  List<String> get _cities {
    if (selectedCountry == null) return [];
    final countryCities = _countriesAndCities[selectedCountry]?['cities'];
    return countryCities != null ? List<String>.from(countryCities) : [];
  }

  String? get _phoneCode {
    if (selectedCountry == null) return null;
    return _countriesAndCities[selectedCountry]?['phoneCode'];
  }

  @override
  void initState() {
    super.initState();

    // Set initial values if provided
    if (widget.initialCountry != null &&
        _countriesAndCities.containsKey(widget.initialCountry)) {
      selectedCountry = widget.initialCountry;

      if (widget.initialCity != null &&
          (_countriesAndCities[widget.initialCountry]?['cities']
                  as List<String>)
              .contains(widget.initialCity)) {
        selectedCity = widget.initialCity;
      }
    }

    if (widget.initialPhone != null) {
      widget.phoneController?.text = widget.initialPhone!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      children: [
        if (widget.streetController != null) ...[
          GixatTextField(
            controller: widget.streetController,
            labelText: 'Street',
            hintText: 'Enter your street address',
            prefixIcon: Icon(
              Icons.location_on_rounded,
              color: Theme.of(context).colorScheme.primary,
              size: 22,
            ),
            textInputAction: TextInputAction.next,
          ),
          const SizedBox(height: 12),
        ],
        // Country dropdown
        _buildDropdown(
          value: selectedCountry,
          hint: 'Select Country',
          items: _countriesAndCities.keys.toList(),
          prefixIcon: Icon(
            Icons.public_rounded,
            color: Theme.of(context).colorScheme.primary,
            size: 22,
          ),
          onChanged: (value) {
            if (value != null) {
              setState(() {
                selectedCountry = value;
                selectedCity = null; // Reset city when country changes
                widget.phoneController?.text = _phoneCode ?? '';
              });
              widget.onCountryChanged(value);
            }
          },
          isDark: isDark,
        ),
        const SizedBox(height: 12),
        // City dropdown (enabled only if a country is selected)
        _buildDropdown(
          value: selectedCity,
          hint: 'Select City',
          items: _cities,
          prefixIcon: Icon(
            Icons.location_city_rounded,
            color: Theme.of(context).colorScheme.primary,
            size: 22,
          ),
          onChanged: (value) {
            if (value != null) {
              setState(() {
                selectedCity = value;
              });
              widget.onCityChanged(value);
            }
          },
          enabled: selectedCountry != null,
          isDark: isDark,
        ),
        const SizedBox(height: 14),
        if (widget.phoneController != null)
          GixatTextField(
            controller: widget.phoneController,
            labelText: 'Phone Number',
            hintText: 'Enter your phone number',
            prefixIcon: Icon(
              Icons.phone_rounded,
              color: Theme.of(context).colorScheme.primary,
              size: 22,
            ),
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.next,
            onChanged: widget.onPhoneChanged,
            validator: widget.phoneValidator, // Added phoneValidator usage
          ),
      ],
    );
  }

  // Helper method to build consistent dropdowns
  Widget _buildDropdown({
    required String? value,
    required String hint,
    required List<String> items,
    required Function(String?) onChanged,
    required Widget prefixIcon,
    required bool isDark,
    bool enabled = true,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      hint: Text(hint),
      isExpanded: true,
      icon: Icon(
        Icons.arrow_drop_down,
        color: Theme.of(context).colorScheme.primary,
      ),
      style: TextStyle(
        fontSize: 16,
        color: isDark ? Colors.white : Colors.black87,
      ),
      decoration: InputDecoration(
        prefixIcon: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: prefixIcon,
        ),
        prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Theme.of(context).colorScheme.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.primary,
            width: 2,
          ),
        ),
        fillColor:
            isDark ? Colors.white.withAlpha(20) : const Color(0xFFF2F4F8),
        filled: true,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      onChanged: enabled ? onChanged : null,
      items:
          items.map((String item) {
            return DropdownMenuItem<String>(value: item, child: Text(item));
          }).toList(),
    );
  }
}
