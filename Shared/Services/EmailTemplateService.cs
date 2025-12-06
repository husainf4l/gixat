using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace Gixat.Shared.Services;

/// <summary>
/// Service for rendering HTML email templates with placeholder replacement
/// </summary>
public class EmailTemplateService
{
    private readonly string _templateBasePath;

    public EmailTemplateService(IWebHostEnvironment env)
    {
        _templateBasePath = Path.Combine(env.ContentRootPath, "Shared", "EmailTemplates");
    }

    /// <summary>
    /// Render an email template with the provided data
    /// </summary>
    /// <param name="templateName">Template filename without path (e.g., "AppointmentConfirmation.html")</param>
    /// <param name="data">Dictionary of placeholder names and values</param>
    /// <returns>Rendered HTML string</returns>
    public string RenderTemplate(string templateName, Dictionary<string, string> data)
    {
        var templatePath = Path.Combine(_templateBasePath, templateName);
        
        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Email template not found: {templateName}", templatePath);
        }

        var template = File.ReadAllText(templatePath);
        
        // Replace simple placeholders like {{ClientName}}
        foreach (var kvp in data)
        {
            template = template.Replace($"{{{{{kvp.Key}}}}}", kvp.Value ?? string.Empty);
        }

        return template;
    }

    /// <summary>
    /// Render an email template with support for list items (for invoice line items, services, etc.)
    /// </summary>
    /// <param name="templateName">Template filename without path</param>
    /// <param name="data">Dictionary of placeholder names and values</param>
    /// <param name="listItems">Dictionary of list placeholder names and list data</param>
    /// <returns>Rendered HTML string</returns>
    public string RenderTemplateWithLists(string templateName, Dictionary<string, string> data, Dictionary<string, List<Dictionary<string, string>>> listItems)
    {
        var templatePath = Path.Combine(_templateBasePath, templateName);
        
        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Email template not found: {templateName}", templatePath);
        }

        var template = File.ReadAllText(templatePath);

        // Replace list placeholders (e.g., {{#each LineItems}}...{{/each}})
        foreach (var listKvp in listItems)
        {
            var listPlaceholder = listKvp.Key;
            var items = listKvp.Value;

            // Find the section between {{#each ListName}} and {{/each}}
            var pattern = $@"\{{\{{#each {listPlaceholder}\}}\}}(.*?)\{{\{{/each\}}\}}";
            var match = Regex.Match(template, pattern, RegexOptions.Singleline);

            if (match.Success)
            {
                var itemTemplate = match.Groups[1].Value;
                var renderedItems = "";

                foreach (var item in items)
                {
                    var renderedItem = itemTemplate;
                    foreach (var itemKvp in item)
                    {
                        renderedItem = renderedItem.Replace($"{{{{{itemKvp.Key}}}}}", itemKvp.Value ?? string.Empty);
                    }
                    renderedItems += renderedItem;
                }

                template = template.Replace(match.Value, renderedItems);
            }
        }

        // Replace simple placeholders
        foreach (var kvp in data)
        {
            template = template.Replace($"{{{{{kvp.Key}}}}}", kvp.Value ?? string.Empty);
        }

        return template;
    }

    /// <summary>
    /// Get the full path to a template file
    /// </summary>
    public string GetTemplatePath(string templateName)
    {
        return Path.Combine(_templateBasePath, templateName);
    }

    /// <summary>
    /// Check if a template exists
    /// </summary>
    public bool TemplateExists(string templateName)
    {
        return File.Exists(GetTemplatePath(templateName));
    }
}
