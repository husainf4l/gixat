import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return androidOptions;
      case TargetPlatform.iOS:
        return iosOptions;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not configured for ${defaultTargetPlatform.toString()}',
        );
    }
  }

  static const FirebaseOptions androidOptions = FirebaseOptions(
    apiKey: 'AIzaSyCs61YqBb_lw9H0qzd5KH3YEHBXgVBd240',
    appId: '1:452012051448:android:d6c35bc59f0bf7908ce40d',
    messagingSenderId: '452012051448',
    projectId: 'gixat-app',
    storageBucket: 'gixat-app.firebasestorage.app',
  );

  static const FirebaseOptions iosOptions = FirebaseOptions(
    apiKey: 'AIzaSyA-8Umt4Zz24yONTNOtweUmRV3OGKm16d0',
    appId: '1:452012051448:ios:fab10fadbf0fe64a8ce40d',
    messagingSenderId: '452012051448',
    projectId: 'gixat-app',
    storageBucket: 'gixat-app.firebasestorage.app',
    iosBundleId: 'com.roxate.gixatapp',
  );
}
