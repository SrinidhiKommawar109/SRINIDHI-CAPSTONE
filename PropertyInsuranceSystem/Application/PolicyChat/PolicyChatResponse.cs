namespace Application.PolicyChat;

public class PolicyChatResponse
{
    public string Answer { get; set; } = string.Empty;
    public bool IsOutOfScope { get; set; }
}
