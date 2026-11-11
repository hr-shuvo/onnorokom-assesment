using Domain.Services.Interfaces;
using Domain.Settings;
using Framework.Common.Controllers;
using Framework.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/configuration")]
public class ConfigurationController : BaseApiController
{
    private readonly ISettingsService<AdmissionSettings> _admissionSettings;

    public ConfigurationController(ISettingsService<AdmissionSettings> admissionSettings)
    {
        _admissionSettings = admissionSettings;
    }

    [HttpGet("admission")]
    public async Task<IActionResult> GetAdmission()
    {
        var result = await _admissionSettings.GetAsync();
        return Ok(result);
    }

    [HttpPost("admission")]
    public async Task<IActionResult> SaveAdmission(AdmissionSettings model)
    {
        if (model.OpensAt >= model.ClosesAt)
        {
            throw new BadRequestException("Admission opening date must be before the closing date.");
        }

        var current = await _admissionSettings.GetAsync();

        current.Title = model.Title;
        current.Description = model.Description;
        current.OpensAt = model.OpensAt;
        current.ClosesAt = model.ClosesAt;
        current.HoldMinutes = model.HoldMinutes;
        current.WaitlistHoldMinutes = model.WaitlistHoldMinutes;
        current.UpdatedAt = DateTime.UtcNow;

        var result = await _admissionSettings.SaveAsync(current);
        return Ok(result);
    }

    [HttpPatch("admission/status")]
    public async Task<IActionResult> ChangeAdmissionStatus([FromQuery] bool isPublished)
    {
        var current = await _admissionSettings.GetAsync();

        current.IsPublished = isPublished;
        current.UpdatedAt = DateTime.UtcNow;

        var result = await _admissionSettings.SaveAsync(current);
        return Ok(result);
    }
}
