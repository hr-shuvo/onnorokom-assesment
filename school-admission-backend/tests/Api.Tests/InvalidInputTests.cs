using System.Net;
using System.Net.Http.Json;

namespace Api.Tests;

public class InvalidInputTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public InvalidInputTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Apply_With_Invalid_StudentId_Returns_4xx_Not_500()
    {
        var client = _fixture.CreateClient();
        await _fixture.SetAdmissionPublishedAsync(client);

        var classId = await _fixture.CreateClassAsync(client, totalSeats: 5);

        client.DefaultRequestHeaders.Add("X-Student-Id", "12345");

        var response = await client.PostAsJsonAsync($"api/classes/{classId}/holds",
            new { studentName = "Test Student" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Apply_To_FullyBooked_Class_Returns_Conflict_Not_500()
    {
        var client = _fixture.CreateClient();
        await _fixture.SetAdmissionPublishedAsync(client);

        var classId = await _fixture.CreateClassAsync(client, totalSeats: 1);

        var firstClient = _fixture.CreateClient();
        firstClient.DefaultRequestHeaders.Add("X-Student-Id", ApiTestFixture.NewStudentId());
        var firstApply = await firstClient.PostAsJsonAsync($"api/classes/{classId}/holds",
            new { studentName = "First Student" });
        Assert.Equal(HttpStatusCode.Created, firstApply.StatusCode);

        var secondClient = _fixture.CreateClient();
        secondClient.DefaultRequestHeaders.Add("X-Student-Id", ApiTestFixture.NewStudentId());
        var secondApply = await secondClient.PostAsJsonAsync($"api/classes/{classId}/holds",
            new { studentName = "Second Student" });

        Assert.Equal(HttpStatusCode.Conflict, secondApply.StatusCode);
    }

    [Fact]
    public async Task GetHold_For_NonExistentId_Returns_404_Not_500()
    {
        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Add("X-Student-Id", ApiTestFixture.NewStudentId());

        var response = await client.GetAsync("api/holds/999999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
