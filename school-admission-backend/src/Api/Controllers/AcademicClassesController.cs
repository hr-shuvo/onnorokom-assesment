using Domain.Dtos;
using Domain.Services.Interfaces;
using Framework.Common.Controllers;
using Framework.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[Route("api/classes")]
public class AcademicClassesController : BaseApiController
{
    private readonly IAcademicClassService _classService;

    public AcademicClassesController(IAcademicClassService classService)
    {
        _classService = classService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AcademicClassQueryParams queryParams)
    {
        var (count, items) = await _classService.LoadAsync(queryParams);
        var result = new PagedList<AcademicClassDto>(items, count, queryParams.PageNumber, queryParams.PageSize);

        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await _classService.GetAsync(id);
        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save(AcademicClassVm model)
    {
        var result = await _classService.SaveAsync(model);
        return Ok(result);
    }

    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> ToggleStatus(long id)
    {
        var result = await _classService.ToggleStatusAsync(id);
        return Ok(result);
    }

    [HttpDelete("delete/{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _classService.DeleteAsync(id);
        return NoContent();
    }
}
