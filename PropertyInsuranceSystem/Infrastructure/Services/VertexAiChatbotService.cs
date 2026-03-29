using Application.PolicyChat;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Google.Apis.Auth.OAuth2;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;
using Infrastructure.Persistence;

namespace Infrastructure.Services
{
    // If you don't actually have an IChatbotService defined in Application.Interfaces, 
    // it's best to either create one or use the IPolicyChatService you already had. 
    // I am assuming you have a generic interface mapped, but if not, I'm providing the raw class.
    public class VertexAiChatbotService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VertexAiChatbotService> _logger;
        private readonly IConfiguration _config;
        private readonly string _projectId;
        private readonly string _location;
        private readonly string _modelId;
        private static readonly HttpClient _httpClient = new HttpClient();

        public VertexAiChatbotService(ApplicationDbContext context, ILogger<VertexAiChatbotService> logger, IConfiguration config)
        {
            _context = context;
            _logger = logger;
            _config = config;
            _projectId = _config["GoogleCloud:ProjectId"] ?? "xenon-lantern-490215-q3";
            _location = _config["GoogleCloud:Location"] ?? "us-central1";
            _modelId = _config["GoogleCloud:ModelId"] ?? "gemini-2.5-flash"; 
        }

        public async Task<List<PropertyPlans>> GetAvailablePlansAsync()
        {
            // Removed p.IsActive as PropertyPlans does not have an IsActive field explicitly set up in your entity
            return await _context.PropertyPlans.ToListAsync();
        }

        public async Task<string> GetChatResponseAsync(string userMessage, string? planId = null)
        {
            try
            {
                string planContext = "";
                if (!string.IsNullOrEmpty(planId) && int.TryParse(planId, out var parsedPlanId))
                {
                    var plan = await _context.PropertyPlans.FindAsync(parsedPlanId);
                    if (plan != null)
                    {
                        planContext = $"\n\nCONTEXT - SELECTED PLAN:\nName: {plan.PlanName}\nPremium: {plan.BasePremium}\nCoverage: {plan.BaseCoverageAmount}\nCoverage Rate: {plan.CoverageRate}\nFrequency: {plan.Frequency}";
                    }
                }

                var systemPrompt = @"You are the official Insure Chatbot. 
                    Your goal is to help customers understand our insurance plans and benefits.
                    Be professional, friendly, and factual. 
                    - If the user asks about a specific plan (provided in context), explain its details clearly.
                    - If the user asks general questions, guide them towards our plans.
                    - Do NOT provide medical or legal advice.
                    - Keep responses concise and easy to read.";

                var fullPrompt = $"{systemPrompt}{planContext}\n\nUser Message: {userMessage}";

                return await GenerateGeminiResponseAsync(fullPrompt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chatbot error");
                return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
            }
        }

        private async Task<string> GenerateGeminiResponseAsync(string prompt)
        {
            try
            {
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", null);
                var credential = await GoogleCredential.GetApplicationDefaultAsync();
                if (credential.IsCreateScopedRequired)
                {
                    credential = credential.CreateScoped("https://www.googleapis.com/auth/cloud-platform");
                }
                var token = await ((ITokenAccess)credential).GetAccessTokenForRequestAsync();

                var url = $"https://{_location}-aiplatform.googleapis.com/v1/projects/{_projectId}/locations/{_location}/publishers/google/models/{_modelId}:generateContent";

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            role = "user",
                            parts = new[] { new { text = prompt } }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.5f,
                        maxOutputTokens = 1000,
                        topP = 0.8f,
                        topK = 40
                    }
                };

                var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                requestMessage.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

                var responseMessage = await _httpClient.SendAsync(requestMessage);
                var responseJson = await responseMessage.Content.ReadAsStringAsync();

                if (!responseMessage.IsSuccessStatusCode)
                {
                    _logger.LogError($"Vertex API Error: {responseJson}");
                    return $"Service unavailable (Backend Vertex Error: {responseMessage.StatusCode})";
                }

                using var doc = JsonDocument.Parse(responseJson);
                var root = doc.RootElement;
                if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var text = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                    return text ?? "I understood your message but I'm not sure how to respond. Could you rephrase that?";
                }

                return "I understood your message but I'm not sure how to respond. Could you rephrase that?";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while communicating with Vertex AI via REST.");
                return "Service unavailable (Configuration is missing).";
            }
        }
    }
}
