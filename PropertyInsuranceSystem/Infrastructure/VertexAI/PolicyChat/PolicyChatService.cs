using Application.PolicyChat;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;

namespace Infrastructure.VertexAI.PolicyChat;

public class PolicyChatService : IPolicyChatService
{
    private readonly IConfiguration _config;
    private readonly ILogger<PolicyChatService> _logger;
    private readonly string _projectId;
    private readonly string _locationId;
    private const string ModelId = "gemini-2.5-flash";
    private static readonly HttpClient _httpClient = new HttpClient();

    public PolicyChatService(IConfiguration config, ILogger<PolicyChatService> logger)
    {
        _config = config;
        _logger = logger;
        _projectId = config["GoogleCloud:ProjectId"] ?? "xenon-lantern-490215-q3"; 
        _locationId = config["GoogleCloud:Location"] ?? "us-central1";
    }

    public async Task<PolicyChatResponse> GetChatResponseAsync(PolicyChatRequest request)
    {
        var originalQ = request.Question.Trim();

        // 1. Check for Context
        if (string.IsNullOrWhiteSpace(request.ContextPolicy))
        {
            return new PolicyChatResponse
            {
                Answer = "I need context about a specific policy to answer your question.",
                IsOutOfScope = true
            };
        }

        // 2. PROMPT ENGINEERING
        var systemInstruction = @"You are an expert Property Insurance Assistant.
        STRICT RULES:
        - You are strictly assisting the user with the SPECIFIC policy detailed in the JSON data below.
        - Answer ONLY using the provided policy JSON data.
        - DO NOT assume or invent information.
        - DO NOT output raw JSON to the user.
        - Provide clear, conversational, and helpful answers. 
        - Display details line by line.
        - DO NOT use any Markdown formatting like asterisks (*), bold (**), or hashtags (#). Use plain text ONLY.
        - DO NOT include or expose Agent Commission or any internal commission details to the customer.
        - ALL monetary amounts MUST be formatted in Indian Rupees (e.g., ₹1,250.00).";

        var prompt = $"{systemInstruction}\n\nPOLICY DATA JSON:\n{request.ContextPolicy}\n\nUSER QUESTION:\n{originalQ}";

        // 3. CALL VERTEX AI VIA REST
        try
        {
            Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", null);
            var credential = await GoogleCredential.GetApplicationDefaultAsync();
            if (credential.IsCreateScopedRequired)
            {
                credential = credential.CreateScoped("https://www.googleapis.com/auth/cloud-platform");
            }
            var token = await ((ITokenAccess)credential).GetAccessTokenForRequestAsync();

            var url = $"https://{_locationId}-aiplatform.googleapis.com/v1/projects/{_projectId}/locations/{_locationId}/publishers/google/models/{ModelId}:generateContent";

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = prompt } }
                    }
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
                return new PolicyChatResponse
                {
                    Answer = $"Backend Vertex Error: {responseMessage.StatusCode}. Raw: {responseJson}",
                    IsOutOfScope = false
                };
            }

            using var doc = JsonDocument.Parse(responseJson);
            var root = doc.RootElement;
            var answerText = root.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

            return new PolicyChatResponse
            {
                Answer = answerText?.Trim() ?? "I'm sorry, I couldn't generate a response.",
                IsOutOfScope = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while communicating with Vertex AI.");
            return new PolicyChatResponse
            {
                Answer = $"Backend Vertex Error: {ex.Message}",
                IsOutOfScope = false
            };
        }
    }
}
