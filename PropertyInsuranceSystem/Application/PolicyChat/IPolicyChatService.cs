using System.Threading.Tasks;

namespace Application.PolicyChat;

public interface IPolicyChatService
{
    Task<PolicyChatResponse> GetChatResponseAsync(PolicyChatRequest request);
}
