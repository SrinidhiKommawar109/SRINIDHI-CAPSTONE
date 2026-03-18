using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string email, string name);
    }
}
