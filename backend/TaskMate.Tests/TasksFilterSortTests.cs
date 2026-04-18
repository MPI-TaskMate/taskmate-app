using System.Net;
using System.Text.Json;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-FILTER: Teste de integrare pentru filtrare și sortare task-uri (#64)
/// Acoperă: filter status/priority, sort deadline/priority, validări parametri invalizi
/// </summary>
public class TasksFilterSortTests
{
    private async Task<ApiClient> CreateAuthenticatedClient()
    {
        var client = new ApiClient();
        var email = $"test_{Guid.NewGuid()}@taskmate.test";

        var registerResponse = await client.PostAsync("/api/auth/register", new
        {
            email,
            password = "Password123!"
        });

        var body = await ApiClient.DeserializeAsync<Dictionary<string, string>>(registerResponse);
        client.SetToken(body!["token"]);

        return client;
    }

    // ─── FILTER STATUS ────────────────────────────────────────────────────────

    // TC-FILTER-01: Filter după status=Todo → returnează doar task-urile Todo
    [Fact]
    public async Task GetTasks_FilterByStatus_ReturnsOnlyMatchingTasks()
    {
        var client = await CreateAuthenticatedClient();

        await client.PostAsync("/api/tasks", new { title = "Todo Task", priority = 0 });

        var createResponse = await client.PostAsync("/api/tasks", new { title = "Done Task", priority = 0 });
        var task = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        await client.PatchAsync($"/api/tasks/{task!["id"].GetString()}", new { status = 2 }); // Done

        var response = await client.GetAsync("/api/tasks?status=Todo");
        var tasks = await ApiClient.DeserializeAsync<List<Dictionary<string, JsonElement>>>(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.Equal(0, t["status"].GetInt32())); // 0 = Todo
    }

    // TC-FILTER-02: Filter după status invalid → 400
    [Fact]
    public async Task GetTasks_FilterByInvalidStatus_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/tasks?status=InvalidStatus");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─── FILTER PRIORITY ──────────────────────────────────────────────────────

    // TC-FILTER-03: Filter după priority=High → returnează doar task-urile High
    [Fact]
    public async Task GetTasks_FilterByPriority_ReturnsOnlyMatchingTasks()
    {
        var client = await CreateAuthenticatedClient();

        await client.PostAsync("/api/tasks", new { title = "Low Task", priority = 0 });   // Low
        await client.PostAsync("/api/tasks", new { title = "High Task", priority = 2 });  // High

        var response = await client.GetAsync("/api/tasks?priority=High");
        var tasks = await ApiClient.DeserializeAsync<List<Dictionary<string, JsonElement>>>(response);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(tasks);
        Assert.All(tasks, t => Assert.Equal(2, t["priority"].GetInt32())); // 2 = High
    }

    // TC-FILTER-04: Filter după priority invalid → 400
    [Fact]
    public async Task GetTasks_FilterByInvalidPriority_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/tasks?priority=Critical");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ─── SORT ─────────────────────────────────────────────────────────────────

    // TC-FILTER-05: Sortare după priority desc → 200
    [Fact]
    public async Task GetTasks_SortByPriorityDesc_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        await client.PostAsync("/api/tasks", new { title = "Low Task", priority = 0 });
        await client.PostAsync("/api/tasks", new { title = "High Task", priority = 2 });

        var response = await client.GetAsync("/api/tasks?sortBy=priority&order=desc");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TC-FILTER-06: Sortare după deadline asc → 200
    [Fact]
    public async Task GetTasks_SortByDeadlineAsc_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        await client.PostAsync("/api/tasks", new { title = "Task A", priority = 0, deadline = "2026-05-01" });
        await client.PostAsync("/api/tasks", new { title = "Task B", priority = 0, deadline = "2026-06-01" });

        var response = await client.GetAsync("/api/tasks?sortBy=deadline&order=asc");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TC-FILTER-07: sortBy invalid → 400
    [Fact]
    public async Task GetTasks_InvalidSortBy_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/tasks?sortBy=title");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-FILTER-08: order fără sortBy → 400
    [Fact]
    public async Task GetTasks_OrderWithoutSortBy_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/tasks?order=asc");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-FILTER-09: order invalid → 400
    [Fact]
    public async Task GetTasks_InvalidOrder_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/tasks?sortBy=priority&order=random");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
