namespace Application.PolicyChat;

public class PolicyChatRequest
{
    public string Question { get; set; } = string.Empty;
    public string? ContextPolicy { get; set; }
}
