using System.Net;
using Framework.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Framework.Middleware;

public class ExceptionMiddleware(
    RequestDelegate next,
    ILogger<ExceptionMiddleware> logger,IHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
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
        
        
        if (ex is AppException appEx)
        {
            statusCode = appEx.StatusCode;
            message = appEx.Message;
        }else
        {
            statusCode = (int)HttpStatusCode.InternalServerError;
            
            if (env.IsDevelopment())
            {
                var innerMessage = ex.InnerException?.Message;
                message = innerMessage != null
                    ? $"{ex.Message} → {innerMessage}"
                    : ex.Message;
            }
            else
            {
                message = "Internal Server Error";
            }
            
            context.Response.StatusCode = statusCode;
            
            var response = env.IsDevelopment()
                ? new ApiException(message, ex.StackTrace)
                : new ApiException(message);
        }
        
    }
}