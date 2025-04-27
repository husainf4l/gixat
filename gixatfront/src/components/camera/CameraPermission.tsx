import React from "react";
import { cameraService, type CameraServiceState } from "@/services/camera";

interface CameraPermissionProps {
  state: CameraServiceState;
  updateState: (update: Partial<CameraServiceState>) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showAdvancedOptions: boolean;
  setShowAdvancedOptions: (show: boolean) => void;
  refreshCameras: () => Promise<void>;
  useFallbackBackground: () => void;
}

export function CameraPermission({
  state,
  updateState,
  videoRef,
  showAdvancedOptions,
  setShowAdvancedOptions,
  refreshCameras,
  useFallbackBackground,
}: CameraPermissionProps) {
  // Request camera permission
  const requestCameraPermission = async () => {
    // First check if the device has any cameras
    if (state.hasCamera === false) {
      updateState({
        permissionState: "unavailable",
        errorMessage: "No camera found on this device.",
      });
      return;
    }

    await cameraService.requestCameraPermission(
      videoRef,
      state.selectedCamera,
      updateState
    );
  };

  // Render based on permission state
  if (state.permissionState === "loading") {
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md text-center border border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="mb-4 text-gray-200">جاري الوصول إلى الكاميرا...</p>
        <button
          onClick={() => {
            // Stop the current attempt
            cameraService.stopCamera(videoRef);
            // Go back to camera selection
            updateState({ permissionState: "not-requested" });
          }}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          إلغاء والعودة
        </button>
      </div>
    );
  }

  if (state.permissionState === "timeout") {
    return (
      <div className="bg-gray-900 border border-amber-700 text-gray-200 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-medium mb-2 text-amber-400">
          انتهت مهلة الوصول إلى الكاميرا
        </h2>
        <p className="mb-4 text-gray-300">
          {state.errorMessage ||
            "يستغرق الوصول إلى الكاميرا وقتًا طويلاً. عادة ما يحدث هذا عندما تكون الكاميرا قيد الاستخدام بواسطة تطبيق آخر."}
        </p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={requestCameraPermission}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            المحاولة مرة أخرى
          </button>
          <div className="flex justify-between">
            <button
              onClick={refreshCameras}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              تحديث قائمة الكاميرات
            </button>
            <button
              onClick={useFallbackBackground}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              استخدام خلفية احتياطية
            </button>
          </div>
          <div className="mt-2 p-3 bg-gray-800 rounded-md text-sm">
            <p className="font-medium mb-1 text-gray-200">
              نصائح استكشاف الأخطاء وإصلاحها:
            </p>
            <ul className="list-disc pr-5 space-y-1 text-gray-300">
              <li>أغلق التطبيقات الأخرى التي قد تستخدم الكاميرا</li>
              <li>لكاميرات iPhone: تأكد من استقرار الاتصال</li>
              <li>حاول إعادة تشغيل المتصفح</li>
              <li>قد تحظر بعض برامج مكافحة الفيروسات الوصول إلى الكاميرا</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (state.permissionState === "denied" && state.errorMessage) {
    return (
      <div className="bg-gray-900 border border-red-700 text-gray-200 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-medium mb-2 text-red-400">
          تم رفض الوصول إلى الكاميرا
        </h2>
        <p className="mb-4 text-gray-300">{state.errorMessage}</p>
        <div className="flex flex-col space-y-3">
          <button
            onClick={requestCameraPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            المحاولة مرة أخرى
          </button>
          <div className="flex justify-between">
            <button
              onClick={refreshCameras}
              className="text-sm text-red-400 hover:text-red-300"
            >
              تحديث قائمة الكاميرات
            </button>
            <button
              onClick={useFallbackBackground}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              استخدام خلفية احتياطية
            </button>
          </div>
          <p className="text-sm mt-2 text-gray-400">
            إذا كنت قد رفضت الإذن مسبقًا، فقد تحتاج إلى إعادة تعيين الأذونات في
            إعدادات المتصفح.
          </p>
        </div>
      </div>
    );
  }

  if (state.permissionState === "unavailable") {
    return (
      <div className="bg-gray-900 border border-amber-700 text-gray-200 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-medium mb-2 text-amber-400">
          الكاميرا غير متوفرة
        </h2>
        <p className="mb-4 text-gray-300">
          {state.errorMessage || "لم يتم اكتشاف كاميرا على جهازك."}
        </p>

        <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700 text-sm">
          <h3 className="font-medium mb-2 text-gray-200">
            استكشاف الأخطاء وإصلاحها:
          </h3>
          <ol className="list-decimal pr-5 space-y-2 text-gray-300">
            <li>تأكد من توصيل الكاميرا وعدم تغطيتها.</li>
            <li>
              أغلق التطبيقات الأخرى التي قد تستخدم الكاميرا (Zoom، FaceTime،
              Photo Booth، إلخ).
            </li>
            <li>
              تحقق من أذونات كاميرا المتصفح:
              <ul className="list-disc pr-5 my-1">
                <li>افتح إعدادات النظام &gt; الخصوصية والأمان &gt; الكاميرا</li>
                <li>
                  تأكد من السماح للمتصفح (Safari أو Chrome أو غيره) بالوصول إلى
                  الكاميرا
                </li>
              </ul>
            </li>
            <li>حاول تحديث قائمة الكاميرات بعد توصيل الأجهزة.</li>
          </ol>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <h3 className="font-medium mb-2 text-gray-200">
              استخدام iPhone ككاميرا:
            </h3>
            <ol className="list-decimal pr-5 space-y-2 text-gray-300">
              <li>
                <strong>لتطبيقات EpocCam أو Camo أو ما شابه:</strong>
                <ul className="list-disc pr-5 my-1">
                  <li>تأكد من أن iPhone والكمبيوتر متصلان بنفس شبكة WiFi</li>
                  <li>تأكد من تثبيت التطبيق المصاحب على جهاز Mac الخاص بك</li>
                  <li>
                    تحقق مما إذا كانت الكاميرا الافتراضية تظهر في قائمة
                    الكاميرات
                  </li>
                  <li>
                    حاول النقر على زر &quot;تحديث قائمة الكاميرات&quot; بعد
                    الاتصال
                  </li>
                  <li>
                    حاول إعادة تشغيل المتصفح إذا لم يتم اكتشاف الكاميرا
                    الافتراضية
                  </li>
                </ul>
              </li>
              <li>
                <strong>لـ Continuity Camera:</strong>
                <ul className="list-disc pr-5 my-1">
                  <li>
                    تأكد من تشغيل جهاز Mac الخاص بك على macOS Ventura أو أحدث
                  </li>
                  <li>تأكد من تشغيل iPhone على iOS 16 أو أحدث</li>
                  <li>
                    يجب تسجيل الدخول لكلا الجهازين باستخدام نفس معرف Apple
                  </li>
                  <li>
                    حاول النقر على زر &quot;تحديث قائمة الكاميرات&quot; بعد
                    الاتصال
                  </li>
                </ul>
              </li>
            </ol>
          </div>
        </div>

        <div className="flex justify-between flex-wrap gap-2">
          <button
            onClick={refreshCameras}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            تحديث قائمة الكاميرات
          </button>
          <button
            onClick={useFallbackBackground}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            استخدام خلفية احتياطية
          </button>
        </div>
      </div>
    );
  }

  // Default case (state.permissionState === "not-requested")
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md text-center border border-gray-700">
      <h2 className="text-xl font-medium mb-3 text-gray-100">
        الوصول إلى الكاميرا مطلوب
      </h2>
      <p className="mb-4 text-gray-300">
        لاستخدام بث الكاميرا المباشر، نحتاج إلى إذن للوصول إلى الكاميرا الخاصة
        بك.
      </p>
      {state.hasCamera ? (
        <>
          {state.cameraDevices.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                اختر الكاميرا:
              </label>
              <select
                value={state.selectedCamera || ""}
                onChange={(e) =>
                  updateState({ selectedCamera: e.target.value })
                }
                className="w-full p-2 bg-gray-800 border border-gray-600 text-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {state.cameraDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `كاميرا ${device.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={requestCameraPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors mb-3"
          >
            السماح بالوصول إلى الكاميرا
          </button>
          <div className="text-right mt-1">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showAdvancedOptions
                ? "إخفاء الخيارات المتقدمة"
                : "إظهار الخيارات المتقدمة"}
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="mt-3 text-right">
              <button
                onClick={refreshCameras}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                تحديث قائمة الكاميرات
              </button>
              <p className="text-xs text-gray-400 mt-1">
                استخدم هذا إذا قمت بتوصيل جهاز كاميرا جديد.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-amber-500 font-medium">
            لم يتم اكتشاف كاميرا على جهازك.
          </p>
          <button
            onClick={refreshCameras}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors mb-2"
          >
            تحديث قائمة الكاميرات
          </button>
          <p className="text-sm text-gray-400">
            إذا قمت للتو بتوصيل كاميرا أو iPhone، انقر على تحديث.
          </p>
          <hr className="my-3 border-gray-700" />
          <button
            onClick={useFallbackBackground}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            المتابعة باستخدام خلفية احتياطية
          </button>
        </div>
      )}
    </div>
  );
}
