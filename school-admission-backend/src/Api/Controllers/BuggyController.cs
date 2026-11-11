using Domain.Entities;
using Framework.Common.Controllers;
using Framework.Data;
using Framework.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class BuggyController : BaseApiController
{
    private readonly AppDbContext _context;

    public BuggyController(AppDbContext dbContext)
    {
        _context = dbContext;
    }

    [HttpGet]
    public ActionResult<string> GetHealth()
    {
        return "Health is ok";
    }

    [HttpGet("notfound")]
    public ActionResult<string> GetNotFoundRequest()
    {
        var thing = _context.Set<AcademicClass>().Find(999999L);

        if (thing == null)
        {
            throw new NotFoundException("AcademicClass with id 999999 was not found.");
        }

        return Ok();
    }

    [HttpGet("servererror")]
    public ActionResult<string> GetServerError()
    {
        var thing = _context.Set<AcademicClass>().Find(999999L);

        var thingToReturn = thing!.ToString();

        return Ok(thingToReturn);
    }

    [HttpGet("badrequest")]
    public ActionResult<string> GetBadRequest()
    {
        throw new BadRequestException("This is a test bad request.");
    }

    [HttpGet("badrequest/{id}")]
    public ActionResult<string> GetBadRequest(long id)
    {
        throw new BadRequestException($"This is a test bad request for id {id}.");
    }

    [HttpGet("conflict")]
    public ActionResult<string> GetConflict()
    {
        throw new ConflictException("This is a test conflict.");
    }

    [HttpGet("forbidden")]
    public ActionResult<string> GetForbidden()
    {
        throw new ForbiddenException("This is a test forbidden request.");
    }
}
