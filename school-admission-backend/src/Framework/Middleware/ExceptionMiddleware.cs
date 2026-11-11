using System.Net;
using System.Text.Json;
using Framework.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Framework.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex) when (!context.Response.HasStarted)
        {
            await WriteProblemAsync(context, ex);
        }
    }

    private async Task WriteProblemAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        int statusCode;
        string message;
        string details = null;

        if (ex is AppException appEx)
        {
            statusCode = appEx.StatusCode;
            message = appEx.Message;
        }
        else
        {
            statusCode = (int)HttpStatusCode.InternalServerError;

            if (_env.IsDevelopment())
            {
                var innerMessage = ex.InnerException?.Message;
                message = innerMessage != null
                    ? $"{ex.Message} → {innerMessage}"
                    : ex.Message;
                details = ex.StackTrace;
            }
            else
            {
                message = "Internal Server Error";
            }
        }

        context.Response.StatusCode = statusCode;

        var payload = JsonSerializer.Serialize(new
        {
            title = message,
            detail = details,
            status = statusCode
        });

        await context.Response.WriteAsync(payload);
    }
}
