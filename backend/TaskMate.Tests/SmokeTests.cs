using System.Net;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-INFRA: Smoke tests — verifică că infrastructura Docker e funcțională (#67)
/// </summary>
public class SmokeTests
{
    // TC-INFRA-01: API pornit — Swagger returnează 200
    [Fact]
    public async Task Api_IsRunning_SwaggerReturns200()
    {
        var client = new ApiClient();
        var response = await client.GetAsync("/swagger/index.html");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TC-INFRA-02: Endpoint-ul de auth e accesibil (nu returnează 500)
    [Fact]
    public async Task Api_AuthEndpoint_IsReachable()
    {
        var client = new ApiClient();
        var response = await client.PostAsync("/api/auth/login", new { });

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    // TC-INFRA-03: Endpoint-ul de tasks necesită autentificare (returnează 401, nu 500)
    [Fact]
    public async Task Api_TasksEndpoint_RequiresAuth_Returns401()
    {
        var client = new ApiClient();
        var response = await client.GetAsync("/api/tasks");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
