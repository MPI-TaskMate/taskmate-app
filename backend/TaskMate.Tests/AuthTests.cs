using System.Net;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-AUTH: Integration tests for authentication (#61)
/// Covers: register, login, input validation
/// </summary>
public class AuthTests
{
    // TC-AUTH-01: Register with valid data → 201 + JWT token
    [Fact]
    public async Task Register_WithValidCredentials_Returns201AndToken()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";

        var response = await client.PostAsync("/api/auth/register", new
        {
            email,
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var body = await ApiClient.DeserializeAsync<Dictionary<string, string>>(response);
        Assert.NotNull(body);
        Assert.True(body!.ContainsKey("token"));
        Assert.False(string.IsNullOrEmpty(body["token"]));
    }

    // TC-AUTH-02: Register with duplicate email → 400
    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";

        await client.PostAsync("/api/auth/register", new { email, password = "Password123!" });
        var response = await client.PostAsync("/api/auth/register", new { email, password = "Password123!" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-AUTH-03: Register with password shorter than 8 characters → 400
    [Fact]
    public async Task Register_WithShortPassword_Returns400()
    {
        var client = new ApiClient();

        var response = await client.PostAsync("/api/auth/register", new
        {
            email = $"test_{Guid.NewGuid()}@taskmate.test",
            password = "short"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-AUTH-04: Register with invalid email format → 400
    [Fact]
    public async Task Register_WithInvalidEmailFormat_Returns400()
    {
        var client = new ApiClient();

        var response = await client.PostAsync("/api/auth/register", new
        {
            email = "not-an-email",
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-AUTH-05: Login with valid credentials → 200 + JWT token
    [Fact]
    public async Task Login_WithValidCredentials_Returns200AndToken()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";
        const string password = "Password123!";

        await client.PostAsync("/api/auth/register", new { email, password });
        var response = await client.PostAsync("/api/auth/login", new { email, password });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await ApiClient.DeserializeAsync<Dictionary<string, string>>(response);
        Assert.NotNull(body);
        Assert.True(body!.ContainsKey("token"));
        Assert.False(string.IsNullOrEmpty(body["token"]));
    }

    // TC-AUTH-06: Login with wrong password → 401
    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";

        await client.PostAsync("/api/auth/register", new { email, password = "Password123!" });
        var response = await client.PostAsync("/api/auth/login", new { email, password = "WrongPassword!" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // TC-AUTH-07: Login with non-existent email → 401
    [Fact]
    public async Task Login_WithNonExistentEmail_Returns401()
    {
        var client = new ApiClient();

        var response = await client.PostAsync("/api/auth/login", new
        {
            email = $"nonexistent_{Guid.NewGuid()}@taskmate.test",
            password = "Password123!"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
