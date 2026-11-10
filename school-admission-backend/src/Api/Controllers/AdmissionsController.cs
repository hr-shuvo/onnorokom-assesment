using Domain.Dtos;
using Domain.Services.Interfaces;
using Framework.Common.Controllers;
using Framework.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/admissions")]
public class AdmissionsController : BaseApiController
{
    private readonly IAdmissionService _admissionService;

    public AdmissionsController(IAdmissionService admissionService)
    {
        _admissionService = admissionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AdmissionQueryParams queryParams)
    {
        var (count, items) = await _admissionService.LoadAsync(queryParams);
        var result = new PagedList<AdmissionDto>(items, count, queryParams.PageNumber, queryParams.PageSize);

        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _admissionService.GetAsync(id);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(AdmissionVm model)
    {
        var result = await _admissionService.SaveAsync(model);
        return Ok(result);
    }

    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> ChangeStatus(long id)
    {
        var result = await _admissionService.ChangeStatusAsync(id);
        return Ok(result);
    }
}
