using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Gixat.Web.Shared.Services;
using Gixat.Web.Shared.Interfaces;
using Microsoft.Extensions.Logging;

namespace Gixat.Web.Modules.Sessions.Services;

/// <summary>
/// Service for sending automated notifications related to sessions, appointments, and invoices
/// </summary>
public class NotificationService
{
    private readonly IEmailService _emailService;
    private readonly EmailTemplateService _templateService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IEmailService emailService,
        EmailTemplateService templateService,
        ILogger<NotificationService> logger)
    {
        _emailService = emailService;
        _templateService = templateService;
        _logger = logger;
    }

    /// <summary>
    /// Send appointment confirmation email
    /// </summary>
    public async Task<bool> SendAppointmentConfirmationAsync(
        string clientEmail,
        string clientName,
        DateTime appointmentDate,
        string vehicleInfo,
        string serviceType,
        string garageName,
        string garageAddress,
        string garagePhone,
        string garageEmail,
        string? notes = null)
    {
        try
        {
            var data = new Dictionary<string, string>
            {
                ["ClientName"] = clientName,
                ["AppointmentDate"] = appointmentDate.ToString("dddd, MMMM dd, yyyy"),
                ["AppointmentTime"] = appointmentDate.ToString("h:mm tt"),
                ["VehicleMake"] = vehicleInfo.Split(' ')[0],
                ["VehicleModel"] = vehicleInfo.Split(' ').Length > 1 ? vehicleInfo.Split(' ')[1] : "",
                ["LicensePlate"] = vehicleInfo.Split('(').Length > 1 ? vehicleInfo.Split('(')[1].TrimEnd(')') : "",
                ["ServiceType"] = serviceType,
                ["GarageName"] = garageName,
                ["GarageAddress"] = garageAddress,
                ["GaragePhone"] = garagePhone,
                ["GarageEmail"] = garageEmail,
                ["Notes"] = notes ?? "N/A",
                ["AddToCalendarLink"] = GenerateCalendarLink(appointmentDate, serviceType, garageAddress)
            };

            var htmlBody = _templateService.RenderTemplate("AppointmentConfirmation.html", data);

            await _emailService.SendEmailAsync(
                to: clientEmail,
                subject: $"Appointment Confirmed - {appointmentDate:MMM dd} at {appointmentDate:h:mm tt}",
                htmlBody: htmlBody
            );

            _logger.LogInformation("Appointment confirmation sent to {Email} for {Date}", clientEmail, appointmentDate);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send appointment confirmation to {Email}", clientEmail);
            return false;
        }
    }

    /// <summary>
    /// Send appointment reminder email (typically 1 day before)
    /// </summary>
    public async Task<bool> SendAppointmentReminderAsync(
        string clientEmail,
        string clientName,
        DateTime appointmentDate,
        string vehicleInfo,
        string serviceType,
        string garageName,
        string garageAddress,
        string garagePhone)
    {
        try
        {
            var data = new Dictionary<string, string>
            {
                ["ClientName"] = clientName,
                ["AppointmentDate"] = appointmentDate.ToString("dddd, MMMM dd, yyyy"),
                ["AppointmentTime"] = appointmentDate.ToString("h:mm tt"),
                ["VehicleMake"] = vehicleInfo.Split(' ')[0],
                ["VehicleModel"] = vehicleInfo.Split(' ').Length > 1 ? vehicleInfo.Split(' ')[1] : "",
                ["LicensePlate"] = vehicleInfo.Split('(').Length > 1 ? vehicleInfo.Split('(')[1].TrimEnd(')') : "",
                ["ServiceType"] = serviceType,
                ["GarageName"] = garageName,
                ["GarageAddress"] = garageAddress,
                ["GaragePhone"] = garagePhone
            };

            var htmlBody = _templateService.RenderTemplate("AppointmentReminder.html", data);

            await _emailService.SendEmailAsync(
                to: clientEmail,
                subject: $"Reminder: Your Appointment Tomorrow at {appointmentDate:h:mm tt}",
                htmlBody: htmlBody
            );

            _logger.LogInformation("Appointment reminder sent to {Email} for {Date}", clientEmail, appointmentDate);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send appointment reminder to {Email}", clientEmail);
            return false;
        }
    }

    /// <summary>
    /// Send vehicle ready for pickup notification
    /// </summary>
    public async Task<bool> SendVehicleReadyNotificationAsync(
        string clientEmail,
        string clientName,
        string vehicleInfo,
        List<string> servicesPerformed,
        string garageName,
        string garageAddress,
        string garagePhone,
        string businessHours)
    {
        try
        {
            var listData = new Dictionary<string, List<Dictionary<string, string>>>
            {
                ["ServicesPerformed"] = servicesPerformed.ConvertAll(s => new Dictionary<string, string> { ["this"] = s })
            };

            var data = new Dictionary<string, string>
            {
                ["ClientName"] = clientName,
                ["VehicleMake"] = vehicleInfo.Split(' ')[0],
                ["VehicleModel"] = vehicleInfo.Split(' ').Length > 1 ? vehicleInfo.Split(' ')[1] : "",
                ["LicensePlate"] = vehicleInfo.Split('(').Length > 1 ? vehicleInfo.Split('(')[1].TrimEnd(')') : "",
                ["GarageName"] = garageName,
                ["GarageAddress"] = garageAddress,
                ["GaragePhone"] = garagePhone,
                ["BusinessHours"] = businessHours
            };

            var htmlBody = _templateService.RenderTemplateWithLists("VehicleReady.html", data, listData);

            await _emailService.SendEmailAsync(
                to: clientEmail,
                subject: "Your Vehicle is Ready for Pickup! 🎉",
                htmlBody: htmlBody
            );

            _logger.LogInformation("Vehicle ready notification sent to {Email}", clientEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send vehicle ready notification to {Email}", clientEmail);
            return false;
        }
    }

    /// <summary>
    /// Send invoice email
    /// </summary>
    public async Task<bool> SendInvoiceEmailAsync(
        string clientEmail,
        string clientName,
        string clientPhone,
        string invoiceNumber,
        DateTime invoiceDate,
        string vehicleInfo,
        List<(string Description, decimal Amount)> lineItems,
        decimal taxRate,
        string garageName,
        string garageAddress,
        string garagePhone,
        string? paymentLink = null)
    {
        try
        {
            var subtotal = 0m;
            var lineItemsList = new List<Dictionary<string, string>>();

            foreach (var item in lineItems)
            {
                subtotal += item.Amount;
                lineItemsList.Add(new Dictionary<string, string>
                {
                    ["Description"] = item.Description,
                    ["Amount"] = $"AED {item.Amount:N2}"
                });
            }

            var taxAmount = subtotal * (taxRate / 100);
            var total = subtotal + taxAmount;

            var listData = new Dictionary<string, List<Dictionary<string, string>>>
            {
                ["LineItems"] = lineItemsList
            };

            var data = new Dictionary<string, string>
            {
                ["ClientName"] = clientName,
                ["ClientPhone"] = clientPhone,
                ["ClientEmail"] = clientEmail,
                ["InvoiceNumber"] = invoiceNumber,
                ["InvoiceDate"] = invoiceDate.ToString("MMMM dd, yyyy"),
                ["VehicleMake"] = vehicleInfo.Split(' ')[0],
                ["VehicleModel"] = vehicleInfo.Split(' ').Length > 1 ? vehicleInfo.Split(' ')[1] : "",
                ["LicensePlate"] = vehicleInfo.Split('(').Length > 1 ? vehicleInfo.Split('(')[1].TrimEnd(')') : "",
                ["Subtotal"] = $"AED {subtotal:N2}",
                ["TaxRate"] = taxRate.ToString("N0"),
                ["TaxAmount"] = $"AED {taxAmount:N2}",
                ["Total"] = $"AED {total:N2}",
                ["GarageName"] = garageName,
                ["GarageAddress"] = garageAddress,
                ["GaragePhone"] = garagePhone,
                ["PaymentLink"] = paymentLink ?? "#"
            };

            var htmlBody = _templateService.RenderTemplateWithLists("InvoiceEmail.html", data, listData);

            await _emailService.SendEmailAsync(
                to: clientEmail,
                subject: $"Invoice #{invoiceNumber} - {garageName}",
                htmlBody: htmlBody
            );

            _logger.LogInformation("Invoice {InvoiceNumber} sent to {Email}", invoiceNumber, clientEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invoice to {Email}", clientEmail);
            return false;
        }
    }

    /// <summary>
    /// Generate a calendar link for adding appointment to user's calendar
    /// </summary>
    private string GenerateCalendarLink(DateTime appointmentDate, string serviceType, string location)
    {
        // Google Calendar link format
        var startTime = appointmentDate.ToUniversalTime().ToString("yyyyMMddTHHmmssZ");
        var endTime = appointmentDate.AddHours(2).ToUniversalTime().ToString("yyyyMMddTHHmmssZ");
        
        return $"https://calendar.google.com/calendar/render?action=TEMPLATE&text={Uri.EscapeDataString($"Car Service - {serviceType}")}&dates={startTime}/{endTime}&location={Uri.EscapeDataString(location)}";
    }
}
