using System.Text.RegularExpressions;
using Domain.Dtos;
using Domain.Entities;
using Domain.Services.Interfaces;
using Framework.Common.Controllers;
using Framework.Exceptions;
using Framework.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api")]
public class AdmissionHoldController : BaseApiController
{
    private static readonly Regex StudentIdPattern = new(@"^\d{17}$", RegexOptions.Compiled);

    private readonly IAdmissionHoldService _holdService;
    private readonly IAcademicClassService _classService;

    public AdmissionHoldController(IAdmissionHoldService holdService, IAcademicClassService classService)
    {
        _holdService = holdService;
        _classService = classService;
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

    [HttpGet("classes/{classId:long}/holds")]
    public async Task<IActionResult> GetHoldsForClass(long classId, [FromQuery] AdminHoldQueryParams queryParams)
    {
        var classDto = await _classService.GetAsync(classId);
        var (count, items) = await _holdService.LoadByClassAsync(classId, queryParams);
        var dtos = items.Select(x => ToDto(x, classDto));
        return Ok(new PagedList<AdmissionHoldDto>(dtos, count, queryParams.PageNumber, queryParams.PageSize));
    }

    [HttpPost("holds/{id:long}/confirm")]
    public async Task<IActionResult> Confirm(long id, [FromHeader(Name = "X-Student-Id")] string studentId)
    {
        EnsureValidStudentId(studentId);

        var hold = await _holdService.ConfirmAsync(id, studentId);
        return Ok(ToDto(hold));
    }

    [HttpDelete("holds/{id:long}")]
    public async Task<IActionResult> Delete(long id, [FromHeader(Name = "X-Student-Id")] string studentId)
    {
        EnsureValidStudentId(studentId);

        await _holdService.CancelAsync(id, studentId);
        return NoContent();
    }

    [HttpGet("holds/{id:long}")]
    public async Task<IActionResult> GetById(long id, [FromHeader(Name = "X-Student-Id")] string studentId)
    {
        EnsureValidStudentId(studentId);

        var hold = await _holdService.GetByIdAsync(id);
        if (hold.StudentId != studentId)
        {
            throw new ForbiddenException("This hold does not belong to this student.");
        }

        var classDto = await _classService.GetAsync(hold.ClassId);
        return Ok(ToDto(hold, classDto));
    }

    [HttpGet("me/holds")]
    public async Task<IActionResult> GetMyHolds([FromHeader(Name = "X-Student-Id")] string studentId)
    {
        EnsureValidStudentId(studentId);

        var holds = (await _holdService.GetHoldsForStudentAsync(studentId)).ToList();
        var classesById = await _classService.GetManyByIdsAsync(holds.Select(x => x.ClassId));
        var dtos = holds.Select(hold =>
        {
            classesById.TryGetValue(hold.ClassId, out var academicClass);
            return ToDto(hold, academicClass);
        }).ToList();

        return Ok(dtos);
    }


    #region Private Methods

    private static void EnsureValidStudentId(string studentId)
    {
        if (string.IsNullOrEmpty(studentId) || !StudentIdPattern.IsMatch(studentId))
        {
            throw new BadRequestException("Student ID must be exactly 17 digits.");
        }
    }

    private static AdmissionHoldDto ToDto(AdmissionHold entity, AcademicClassDto academicClass = null) => new()
    {
        Id = entity.Id,
        StudentId = entity.StudentId,
        StudentName = entity.StudentName,
        GuardianPhone = entity.GuardianPhone,
        ClassId = entity.ClassId,
        ClassName = academicClass?.Name,
        ClassShift = academicClass?.Shift ?? default,
        Status = entity.Status,
        ExpiresAt = entity.ExpiresAt,
        ConfirmedAt = entity.ConfirmedAt,
        CreatedAt = entity.CreatedAt
    };

    private static AdmissionHoldDto ToDto(AdmissionHold entity, AcademicClass academicClass) => new()
    {
        Id = entity.Id,
        StudentId = entity.StudentId,
        StudentName = entity.StudentName,
        GuardianPhone = entity.GuardianPhone,
        ClassId = entity.ClassId,
        ClassName = academicClass?.Name,
        ClassShift = academicClass?.Shift ?? default,
        Status = entity.Status,
        ExpiresAt = entity.ExpiresAt,
        ConfirmedAt = entity.ConfirmedAt,
        CreatedAt = entity.CreatedAt
    };

    #endregion
}