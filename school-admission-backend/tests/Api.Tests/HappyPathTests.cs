using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

public class HappyPathTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public HappyPathTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Apply_Then_Confirm_Succeeds_And_Updates_Seat_Counts()
    {
        var client = _fixture.CreateClient();
        await _fixture.SetAdmissionPublishedAsync(client);

        var classId = await _fixture.CreateClassAsync(client, totalSeats: 5);
        var studentId = ApiTestFixture.NewStudentId();

        client.DefaultRequestHeaders.Add("X-Student-Id", studentId);

        var applyResponse = await client.PostAsJsonAsync($"api/classes/{classId}/holds",
            new { studentName = "Test Student", guardianPhone = "01700000000" });

        Assert.Equal(HttpStatusCode.Created, applyResponse.StatusCode);
        var hold = await applyResponse.Content.ReadFromJsonAsync<JsonElement>();
        var holdId = hold.GetProperty("id").GetInt64();
        Assert.Equal("Held", hold.GetProperty("status").GetString());

        var classAfterHold = await client.GetFromJsonAsync<JsonElement>($"api/classes/{classId}");
        Assert.Equal(4, classAfterHold.GetProperty("availableSeats").GetInt32());

        var confirmResponse = await client.PostAsync($"api/holds/{holdId}/confirm", null);
        Assert.Equal(HttpStatusCode.OK, confirmResponse.StatusCode);
        var confirmed = await confirmResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Confirmed", confirmed.GetProperty("status").GetString());

        var classAfterConfirm = await client.GetFromJsonAsync<JsonElement>($"api/classes/{classId}");
        Assert.Equal(4, classAfterConfirm.GetProperty("availableSeats").GetInt32());
        Assert.Equal(1, classAfterConfirm.GetProperty("confirmedSeats").GetInt32());

        var getByIdResponse = await client.GetAsync($"api/holds/{holdId}");
        Assert.Equal(HttpStatusCode.OK, getByIdResponse.StatusCode);

        var myHolds = await client.GetFromJsonAsync<JsonElement[]>("api/me/holds");
        Assert.Single(myHolds!);
        Assert.Equal(holdId, myHolds![0].GetProperty("id").GetInt64());
    }
}
