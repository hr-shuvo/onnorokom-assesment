using System.Text.Json.Serialization;
using Domain.Extensions;
using Framework.Extensions;
using Framework.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddSwaggerGen();

builder.Services.AddFrameworkServices(builder.Configuration, builder.Environment)
    .AddDomainServices();

var app = builder.Build();

await app.ApplyMigrationsAsync();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapControllers();


app.MapGet("/", () => "API is running...");

app.Run();