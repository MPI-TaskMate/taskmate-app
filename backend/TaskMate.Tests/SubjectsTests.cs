using System.Net;
using System.Text.Json;
using TaskMate.Tests.Helpers;

namespace TaskMate.Tests;

/// <summary>
/// TC-SUBJECT: Integration tests for subject management (#66)
/// Covers: create, list, edit, delete subjects
/// </summary>
public class SubjectsTests
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

    // TC-SUBJECT-01: Create subject with valid data → 201
    [Fact]
    public async Task CreateSubject_WithValidData_Returns201()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.PostAsync("/api/subjects", new
        {
            name = "Mathematics",
            color = "#FF5733"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    // TC-SUBJECT-02: Create subject without name → 400
    [Fact]
    public async Task CreateSubject_WithoutName_Returns400()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.PostAsync("/api/subjects", new
        {
            name = "",
            color = "#FF5733"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // TC-SUBJECT-03: Create subject without authentication → 401
    [Fact]
    public async Task CreateSubject_WithoutAuth_Returns401()
    {
        var client = new ApiClient();

        var response = await client.PostAsync("/api/subjects", new
        {
            name = "Math",
            color = "#FF5733"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    // TC-SUBJECT-04: List subjects authenticated → 200
    [Fact]
    public async Task GetSubjects_Authenticated_Returns200()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.GetAsync("/api/subjects");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TC-SUBJECT-05: A user does not see another user's subjects
    [Fact]
    public async Task GetSubjects_DoesNotReturnOtherUsersSubjects()
    {
        var client1 = await CreateAuthenticatedClient();
        var client2 = await CreateAuthenticatedClient();

        await client1.PostAsync("/api/subjects", new { name = "User1 Private Subject", color = "#000" });

        var response = await client2.GetAsync("/api/subjects");
        var subjects = await ApiClient.DeserializeAsync<List<Dictionary<string, JsonElement>>>(response);

        Assert.NotNull(subjects);
        Assert.DoesNotContain(subjects, s =>
            s.ContainsKey("name") && s["name"].GetString() == "User1 Private Subject");
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    // TC-SUBJECT-08: Delete existing subject → 204
    [Fact]
    public async Task DeleteSubject_Existing_Returns204()
    {
        var client = await CreateAuthenticatedClient();

        var createResponse = await client.PostAsync("/api/subjects", new { name = "To Delete", color = "#000" });
        var subject = await ApiClient.DeserializeAsync<Dictionary<string, JsonElement>>(createResponse);
        var subjectId = subject!["id"].GetString();

        var deleteResponse = await client.DeleteAsync($"/api/subjects/{subjectId}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    // TC-SUBJECT-09: Delete non-existing subject → 404
    [Fact]
    public async Task DeleteSubject_NonExisting_Returns404()
    {
        var client = await CreateAuthenticatedClient();

        var response = await client.DeleteAsync($"/api/subjects/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
