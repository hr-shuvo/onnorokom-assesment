using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

public class ConcurrencyTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public ConcurrencyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Concurrent_Holds_Never_Exceed_Total_Seats()
    {
        var setupClient = _fixture.CreateClient();
        await _fixture.SetAdmissionPublishedAsync(setupClient);

        const int totalSeats = 3;
        const int concurrentRequests = 15;

        var classId = await _fixture.CreateClassAsync(setupClient, totalSeats);

        var tasks = Enumerable.Range(0, concurrentRequests).Select(async _ =>
        {
            var client = _fixture.CreateClient();
            client.DefaultRequestHeaders.Add("X-Student-Id", ApiTestFixture.NewStudentId());
            return await client.PostAsJsonAsync($"api/classes/{classId}/holds", new { studentName = "Concurrent Student" });
        });

        var responses = await Task.WhenAll(tasks);

        var succeeded = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
        var rejected = responses.Count(r => r.StatusCode is HttpStatusCode.Conflict or HttpStatusCode.BadRequest);

        Assert.Equal(concurrentRequests, succeeded + rejected);
        Assert.All(responses, r => Assert.NotEqual(HttpStatusCode.InternalServerError, r.StatusCode));
        Assert.True(succeeded <= totalSeats, $"Expected at most {totalSeats} successful holds, but {succeeded} succeeded.");

        var classState = await setupClient.GetFromJsonAsync<JsonElement>($"api/classes/{classId}");
        var confirmedSeats = classState.GetProperty("confirmedSeats").GetInt32();
        var availableSeats = classState.GetProperty("availableSeats").GetInt32();
        var heldSeats = totalSeats - availableSeats - confirmedSeats;

        Assert.True(heldSeats + confirmedSeats <= totalSeats,
            $"heldSeats ({heldSeats}) + confirmedSeats ({confirmedSeats}) exceeded totalSeats ({totalSeats}).");
        Assert.Equal(succeeded, heldSeats + confirmedSeats);
    }
}
