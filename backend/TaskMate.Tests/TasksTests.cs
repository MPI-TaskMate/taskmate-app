using System.Net;
using System.Text.Json;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-TASK: Teste de integrare pentru gestionarea task-urilor (#62, #63)
/// Acoperă: creare, citire, editare, ștergere, schimbare status (Kanban)
/// </summary>
public class TasksTests
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

    // ─── CREATE ───────────────────────────────────────────────────────────────

    // TC-TASK-01: Creare task cu date valide → 201
    [Fact]
    public async Task CreateTask_WithValidData_Returns201()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.PostAsync("/api/tasks", new
        {
            title = "Test Task",
            description = "Test Description",
            priority = 1 // Medium
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    // TC-TASK-02: Creare task fără titlu → 400
    [Fact]
    public async Task CreateTask_WithoutTitle_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.PostAsync("/api/tasks", new
        {
            title = "",
            priority = 0
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-TASK-03: Creare task fără autentificare → 401
    [Fact]
    public async Task CreateTask_WithoutAuth_Returns401()
    {
        var client = new ApiClient();

        var response = await client.PostAsync("/api/tasks", new
        {
            title = "Unauthorized Task",
            priority = 0
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    // TC-TASK-04: Listare task-uri autentificat → 200
    [Fact]
    public async Task GetAllTasks_Authenticated_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/tasks");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TC-TASK-05: Un user nu vede task-urile altui user
    [Fact]
    public async Task GetAllTasks_DoesNotReturnOtherUsersTasks()
    {
        var client1 = await CreateAuthenticatedClient();
        var client2 = await CreateAuthenticatedClient();

        await client1.PostAsync("/api/tasks", new { title = "User1 Private Task", priority = 0 });

        var response = await client2.GetAsync("/api/tasks");
        var tasks = await ApiClient.DeserializeAsync<List<Dictionary<string, JsonElement>>>(response);

        Assert.NotNull(tasks);
        Assert.DoesNotContain(tasks, t =>
            t.ContainsKey("title") && t["title"].GetString() == "User1 Private Task");
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    // TC-TASK-06: Editare task cu date valide → 200
    [Fact]
    public async Task UpdateTask_WithValidData_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsync("/api/tasks", new { title = "Original Title", priority = 0 });
        var task = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var taskId = task!["id"].GetString();

        var updateResponse = await client.PutAsync($"/api/tasks/{taskId}", new
        {
            title = "Updated Title",
            priority = 2, // High
            status = 1    // InProgress
        });

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
    }

    // TC-TASK-07: Editare task inexistent → 404
    [Fact]
    public async Task UpdateTask_NonExisting_Returns404()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.PutAsync($"/api/tasks/{Guid.NewGuid()}", new
        {
            title = "Ghost Task",
            priority = 0,
            status = 0
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    // TC-TASK-08: Ștergere task existent → 204
    [Fact]
    public async Task DeleteTask_Existing_Returns204()
    {
        var client = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsync("/api/tasks", new { title = "To Delete", priority = 0 });
        var task = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var taskId = task!["id"].GetString();

        var deleteResponse = await client.DeleteAsync($"/api/tasks/{taskId}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    // TC-TASK-09: Ștergere task inexistent → 404
    [Fact]
    public async Task DeleteTask_NonExisting_Returns404()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.DeleteAsync($"/api/tasks/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ─── PATCH STATUS (Kanban) ────────────────────────────────────────────────

    // TC-TASK-10: Schimbare status → InProgress (Kanban) → 200
    [Fact]
    public async Task PatchTask_StatusToInProgress_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsync("/api/tasks", new { title = "Kanban Task", priority = 0 });
        var task = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var taskId = task!["id"].GetString();

        var patchResponse = await client.PatchAsync($"/api/tasks/{taskId}", new { status = 1 }); // InProgress

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);
    }

    // TC-TASK-11: Schimbare status → Done (Kanban) → 200
    [Fact]
    public async Task PatchTask_StatusToDone_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsync("/api/tasks", new { title = "Done Task", priority = 0 });
        var task = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var taskId = task!["id"].GetString();

        var patchResponse = await client.PatchAsync($"/api/tasks/{taskId}", new { status = 2 }); // Done

        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);
    }
}
