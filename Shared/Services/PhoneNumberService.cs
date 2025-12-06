using PhoneNumbers;

namespace Gixat.Web.Shared.Services;

/// <summary>
/// Phone number validation and formatting service
/// </summary>
public class PhoneNumberService
{
    private readonly PhoneNumberUtil _phoneUtil;

    public PhoneNumberService()
    {
        _phoneUtil = PhoneNumberUtil.GetInstance();
    }

    /// <summary>
    /// Formats a phone number to E.164 international format (+971501234567)
    /// </summary>
    /// <param name="phoneNumber">Raw phone number input</param>
    /// <param name="defaultRegion">Default country code (e.g., "AE" for UAE)</param>
    /// <returns>Formatted phone number or original if invalid</returns>
    public string FormatToE164(string phoneNumber, string defaultRegion = "AE")
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return phoneNumber;

        try
        {
            var number = _phoneUtil.Parse(phoneNumber, defaultRegion);
            if (_phoneUtil.IsValidNumber(number))
            {
                return _phoneUtil.Format(number, PhoneNumberFormat.E164);
            }
        }
        catch
        {
            // If parsing fails, return original
        }

        return phoneNumber;
    }

    /// <summary>
    /// Validates a phone number
    /// </summary>
    public bool IsValid(string phoneNumber, string defaultRegion = "AE")
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        try
        {
            var number = _phoneUtil.Parse(phoneNumber, defaultRegion);
            return _phoneUtil.IsValidNumber(number);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Formats a phone number for display (national format)
    /// </summary>
    public string FormatForDisplay(string phoneNumber, string defaultRegion = "AE")
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return phoneNumber;

        try
        {
            var number = _phoneUtil.Parse(phoneNumber, defaultRegion);
            if (_phoneUtil.IsValidNumber(number))
            {
                return _phoneUtil.Format(number, PhoneNumberFormat.NATIONAL);
            }
        }
        catch
        {
            // If parsing fails, return original
        }

        return phoneNumber;
    }
}
