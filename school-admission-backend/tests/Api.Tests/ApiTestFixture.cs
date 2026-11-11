using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Testcontainers.PostgreSql;

namespace Api.Tests;

public class ApiTestFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17")
        .WithDatabase("admission-db-test")
        .WithUsername("onnorokom")
        .WithPassword("onnorokom")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    public new async Task DisposeAsync()
    {
        await _postgres.StopAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Default"] = _postgres.GetConnectionString(),
            });
        });
    }

    public async Task SetAdmissionPublishedAsync(HttpClient client)
    {
        var response = await client.PatchAsync("api/configuration/admission/status?isPublished=true", null);
        response.EnsureSuccessStatusCode();
    }

    public async Task<long> CreateClassAsync(HttpClient client, int totalSeats, string? name = null)
    {
        var payload = new
        {
            name = name ?? $"Test Class {Guid.NewGuid():N}",
            order = 1,
            totalSeats,
            isActive = true,
            shift = "Morning",
        };

        var response = await client.PostAsJsonAsync("api/classes", payload);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("id").GetInt64();
    }

    public static string NewStudentId()
    {
        var digits = Random.Shared.NextInt64(10_000_000_000_000_000, 99_999_999_999_999_999);
        return digits.ToString();
    }
}
