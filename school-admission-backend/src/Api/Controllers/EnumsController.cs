using Domain.Enums;
using Framework.Common.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class EnumsController : BaseApiController
{
    [HttpGet("shifts")]
    public IActionResult GetShifts()
    {
        var result = Enum.GetValues<Shift>().Select(value => new
        {
            Value = (int)value,
            Name = value.ToString(),
        });

        return Ok(result);
    }
}
