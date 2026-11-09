using Microsoft.AspNetCore.Http;

namespace Framework.Exceptions;

public class AppException(string message, int? statusCode, string details = null) : Exception(message)
{
    public int StatusCode { get; } = statusCode ?? StatusCodes.Status400BadRequest;
    public string Details { get; } = details;
}

public sealed class BadRequestException(string message = null)
    : AppException(message ?? "Bad Request", StatusCodes.Status400BadRequest);

public sealed class ForbiddenException(string message)
    : AppException(message ?? "Forbidden", StatusCodes.Status403Forbidden);

public sealed class NotFoundException(string message)
    : AppException(message ?? "Not Found", StatusCodes.Status404NotFound);

public sealed class ConflictException(string message)
    : AppException(message ?? "Conflict", StatusCodes.Status409Conflict);

public sealed class ApiException(string message, string details = null)
    : AppException(message ?? "Internal Server Error", StatusCodes.Status500InternalServerError, details);