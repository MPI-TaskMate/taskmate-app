using System.Net;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-AUTH: Teste de integrare pentru autentificare (#61)
/// Acoperă: register, login, validări de input
/// </summary>
public class AuthTests
{
    // TC-AUTH-01: Register cu date valide → 201 + token JWT
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

    // TC-AUTH-02: Register cu email duplicat → 400
    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";

        await client.PostAsync("/api/auth/register", new { email, password = "Password123!" });
        var response = await client.PostAsync("/api/auth/register", new { email, password = "Password123!" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-AUTH-03: Register cu parolă mai scurtă de 8 caractere → 400
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

    // TC-AUTH-04: Register cu format invalid de email → 400
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

    // TC-AUTH-05: Login cu credențiale valide → 200 + token JWT
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

    // TC-AUTH-06: Login cu parolă greșită → 401
    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";

        await client.PostAsync("/api/auth/register", new { email, password = "Password123!" });
        var response = await client.PostAsync("/api/auth/login", new { email, password = "WrongPassword!" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // TC-AUTH-07: Login cu email inexistent → 401
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
