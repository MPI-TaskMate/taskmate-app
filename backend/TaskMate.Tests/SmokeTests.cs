using System.Net;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-INFRA: Smoke tests — verifies that Docker infrastructure is functional (#67)
/// </summary>
public class SmokeTests
{
    // TC-INFRA-01: API is running — Swagger returns 200
    [Fact]
    public async Task Api_IsRunning_SwaggerReturns200()
    {
        var client = new ApiClient();
        var response = await client.GetAsync("/swagger/index.html");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TC-INFRA-02: Auth endpoint is reachable (does not return 500)
    [Fact]
    public async Task Api_AuthEndpoint_IsReachable()
    {
        var client = new ApiClient();
        var response = await client.PostAsync("/api/auth/login", new { });

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    // TC-INFRA-03: Tasks endpoint requires authentication (returns 401, not 500)
    [Fact]
    public async Task Api_TasksEndpoint_RequiresAuth_Returns401()
    {
        var client = new ApiClient();
        var response = await client.GetAsync("/api/tasks");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
