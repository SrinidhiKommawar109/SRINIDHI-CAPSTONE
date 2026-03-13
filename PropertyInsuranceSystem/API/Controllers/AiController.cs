using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public AiController(IHttpClientFactory factory, IConfiguration configuration)
        {
            _httpClient = factory.CreateClient();
            _configuration = configuration;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> Analyze([FromBody] object requestBody)
        {
            try
            {
                var groqSettings = _configuration.GetSection("GroqSettings");
                var apiKey = groqSettings["ApiKey"];
                var baseUrl = groqSettings["BaseUrl"];

                if (string.IsNullOrEmpty(apiKey))
                {
                    return StatusCode(500, new { error = "Groq API key is not configured." });
                }

                var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/chat/completions");
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                request.Content = new StringContent(JsonSerializer.Serialize(requestBody), System.Text.Encoding.UTF8, "application/json");

                var response = await _httpClient.SendAsync(request);
                var result = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return Content(result, "application/json");
                }

                return StatusCode((int)response.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An internal error occurred while processing the AI analysis request.", details = ex.Message });
            }
        }
    }
}
