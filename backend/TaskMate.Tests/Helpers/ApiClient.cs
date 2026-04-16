using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace TaskMate.Tests.Helpers;

public class ApiClient
{
    private readonly HttpClient _client;

    private static readonly string BaseUrl =
        Environment.GetEnvironmentVariable("API_BASE_URL") ?? "http://localhost:5048";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public ApiClient()
    {
        _client = new HttpClient { BaseAddress = new Uri(BaseUrl) };
    }

    public void SetToken(string token)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<HttpResponseMessage> PostAsync(string url, object body)
    {
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await _client.PostAsync(url, content);
    }

    public async Task<HttpResponseMessage> GetAsync(string url)
        => await _client.GetAsync(url);

    public async Task<HttpResponseMessage> PutAsync(string url, object body)
    {
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await _client.PutAsync(url, content);
    }

    public async Task<HttpResponseMessage> PatchAsync(string url, object body)
    {
        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await _client.PatchAsync(url, content);
    }

    public async Task<HttpResponseMessage> DeleteAsync(string url)
        => await _client.DeleteAsync(url);

    public static async Task<T?> DeserializeAsync<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, JsonOptions);
    }
}
