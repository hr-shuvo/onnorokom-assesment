using System.Text.RegularExpressions;
using Domain.Dtos;
using Domain.Entities;
using Domain.Services.Interfaces;
using Framework.Common.Controllers;
using Framework.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api")]
public class HoldsController : BaseApiController
{
    private static readonly Regex StudentIdPattern = new(@"^\d{8}$", RegexOptions.Compiled);

    private readonly IAdmissionHoldService _holdService;

    public HoldsController(IAdmissionHoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpPost("classes/{classId:long}/holds")]
    public async Task<IActionResult> Apply(long classId, [FromHeader(Name = "X-Student-Id")] string studentId,
        ApplyHoldVm model)
    {
        EnsureValidStudentId(studentId);

        var hold = await _holdService.ApplyAsync(classId, studentId, model?.StudentName, model?.GuardianPhone);
        return StatusCode(201, ToDto(hold));
    }

    [HttpPost("classes/{classId:long}/waitlist")]
    public async Task<IActionResult> JoinWaitlist(long classId, [FromHeader(Name = "X-Student-Id")] string studentId,
        ApplyHoldVm model)
    {
        EnsureValidStudentId(studentId);

        var hold = await _holdService.JoinWaitlistAsync(classId, studentId, model?.StudentName, model?.GuardianPhone);
        return StatusCode(201, ToDto(hold));
    }

    [HttpPost("holds/{id:long}/confirm")]
    public async Task<IActionResult> Confirm(long id, [FromHeader(Name = "X-Student-Id")] string studentId)
    {
        EnsureValidStudentId(studentId);

        var hold = await _holdService.ConfirmAsync(id, studentId);
        return Ok(ToDto(hold));
    }


    #region Private Methods

    private static void EnsureValidStudentId(string studentId)
    {
        if (string.IsNullOrEmpty(studentId) || !StudentIdPattern.IsMatch(studentId))
        {
            throw new BadRequestException("INVALID_STUDENT_ID");
        }
    }

    private static AdmissionHoldDto ToDto(AdmissionHold entity) => new()
    {
        Id = entity.Id,
        StudentId = entity.StudentId,
        StudentName = entity.StudentName,
        GuardianPhone = entity.GuardianPhone,
        ClassId = entity.ClassId,
        Status = entity.Status,
        ExpiresAt = entity.ExpiresAt,
        ConfirmedAt = entity.ConfirmedAt,
        CreatedAt = entity.CreatedAt
    };

    #endregion
}