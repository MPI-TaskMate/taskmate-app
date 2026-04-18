using System.Net;
using System.Text.Json;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-OVERDUE: Teste de integrare pentru deadline highlighting (#65)
/// Acoperă: isOverdue, isDueToday pe task-uri returnate de GET /api/tasks
/// </summary>
public class TasksOverdueTests
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

    private async Task<Dictionary<string, JsonElement>?> GetTaskById(ApiClient client, string taskId)
    {
        var response = await client.GetAsync("/api/tasks");
        var tasks = await ApiClient.DeserializeAsync<List<Dictionary<string, JsonElement>>>(response);
        return tasks?.FirstOrDefault(t => t["id"].GetString() == taskId);
    }

    // TC-OVERDUE-01: Task cu deadline în trecut → isOverdue = true
    [Fact]
    public async Task GetTasks_TaskWithPastDeadline_IsOverdueTrue()
    {
        var client = await CreateAuthenticatedClient();
        var pastDate = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd");

        var createResponse = await client.PostAsync("/api/tasks", new
        {
            title = "Overdue Task",
            priority = 0,
            deadline = pastDate
        });

        var created = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var task = await GetTaskById(client, created!["id"].GetString()!);

        Assert.NotNull(task);
        Assert.True(task!["isOverdue"].GetBoolean());
        Assert.False(task["isDueToday"].GetBoolean());
    }

    // TC-OVERDUE-02: Task cu deadline azi → isDueToday = true
    [Fact]
    public async Task GetTasks_TaskWithTodayDeadline_IsDueTodayTrue()
    {
        var client = await CreateAuthenticatedClient();
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

        var createResponse = await client.PostAsync("/api/tasks", new
        {
            title = "Due Today Task",
            priority = 0,
            deadline = today
        });

        var created = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var task = await GetTaskById(client, created!["id"].GetString()!);

        Assert.NotNull(task);
        Assert.True(task!["isDueToday"].GetBoolean());
        Assert.False(task["isOverdue"].GetBoolean());
    }

    // TC-OVERDUE-03: Task cu deadline în viitor → isOverdue = false, isDueToday = false
    [Fact]
    public async Task GetTasks_TaskWithFutureDeadline_BothFalse()
    {
        var client = await CreateAuthenticatedClient();
        var futureDate = DateTime.UtcNow.AddDays(30).ToString("yyyy-MM-dd");

        var createResponse = await client.PostAsync("/api/tasks", new
        {
            title = "Future Task",
            priority = 0,
            deadline = futureDate
        });

        var created = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var task = await GetTaskById(client, created!["id"].GetString()!);

        Assert.NotNull(task);
        Assert.False(task!["isOverdue"].GetBoolean());
        Assert.False(task["isDueToday"].GetBoolean());
    }

    // TC-OVERDUE-04: Task fără deadline → isOverdue = false, isDueToday = false
    [Fact]
    public async Task GetTasks_TaskWithoutDeadline_BothFalse()
    {
        var client = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsync("/api/tasks", new
        {
            title = "No Deadline Task",
            priority = 0
        });

        var created = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var task = await GetTaskById(client, created!["id"].GetString()!);

        Assert.NotNull(task);
        Assert.False(task!["isOverdue"].GetBoolean());
        Assert.False(task["isDueToday"].GetBoolean());
    }

    // TC-OVERDUE-05: Task Done cu deadline în trecut → isOverdue = false
    [Fact]
    public async Task GetTasks_DoneTaskWithPastDeadline_IsOverdueFalse()
    {
        var client = await CreateAuthenticatedClient();
        var pastDate = DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd");

        var createResponse = await client.PostAsync("/api/tasks", new
        {
            title = "Done Overdue Task",
            priority = 0,
            deadline = pastDate
        });

        var created = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var taskId = created!["id"].GetString();

        await client.PatchAsync($"/api/tasks/{taskId}", new { status = 2 }); // Done

        var task = await GetTaskById(client, taskId!);

        Assert.NotNull(task);
        Assert.False(task!["isOverdue"].GetBoolean());
    }
}
