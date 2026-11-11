using Domain.Entities;
using Domain.Services.Interfaces;
using Framework.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Domain.BackgroundServices;

public class HoldExpiryService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<HoldExpiryService> _logger;

    public HoldExpiryService(IServiceScopeFactory scopeFactory, ILogger<HoldExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunOnceAsync(stoppingToken);
        }
    }

    private async Task RunOnceAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();

        var classRepository = scope.ServiceProvider.GetRequiredService<IBaseRepository<AcademicClass>>();
        var holdService = scope.ServiceProvider.GetRequiredService<IAdmissionHoldService>();

        // Include inactive classes too: ExpireAndPromoteAsync is what cancels a
        // closed class's waitlist, and that should happen even without further
        // lazy-triggering API traffic on that class.
        var classIds = await classRepository.Query()
            .Select(x => x.Id)
            .ToListAsync(stoppingToken);

        foreach (var classId in classIds)
        {
            try
            {
                await holdService.ExpireAndPromoteAsync(classId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to expire/promote holds for class {ClassId}", classId);
            }
        }
    }
}
