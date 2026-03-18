using Application.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendWelcomeEmailAsync(string email, string name)
        {
            var apiKey = _configuration["SendGridSettings:ApiKey"];
            var fromEmail = _configuration["SendGridSettings:FromEmail"];
            var fromName = _configuration["SendGridSettings:FromName"];

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(fromEmail))
            {
                throw new Exception("SendGrid configuration is missing. Please check your appsettings.json for SendGridSettings:ApiKey and SendGridSettings:FromEmail.");
            }

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(fromEmail, fromName);
            var to = new EmailAddress(email, name);
            var subject = "Welcome to PropShield Insurance!";
            
            var plainTextContent = $"Hello {name}, Welcome to PropShield! We are thrilled to have you join our community.";
            
            var htmlContent = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;'>
                    <div style='background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                        <h1 style='margin: 0;'>Welcome to PropShield</h1>
                    </div>
                    <div style='padding: 20px;'>
                        <p>Hello <strong>{name}</strong>,</p>
                        <p>Welcome to PropShield! We are thrilled to have you join our community. Our platform is designed to provide you with the best property insurance experience.</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='#' style='background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;'>Get Started</a>
                        </div>
                    </div>
                    <div style='text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;'>
                        &copy; 2026 PropShield Insurance. All rights reserved.
                    </div>
                </div>";

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
            var response = await client.SendEmailAsync(msg);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Body.ReadAsStringAsync();
                throw new Exception($"Failed to send email. Status Code: {response.StatusCode}. Body: {body}");
            }
        }
    }
}
