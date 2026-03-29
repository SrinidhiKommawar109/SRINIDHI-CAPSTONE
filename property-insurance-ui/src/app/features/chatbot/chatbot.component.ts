import { Component, ElementRef, ViewChild, inject, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, PolicyChatResponse, PolicyChatRequest } from './chatbot.service';
import { Subscription } from 'rxjs';

interface ChatMessage {
  text: string;
  isBot: boolean;
  time: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  private chatbotService = inject(ChatbotService);
  private sub?: Subscription;

  isOpen = false;
  isLoading = false;
  userInput = '';
  currentPlanData: any = null;
  messages: ChatMessage[] = [
    { text: 'Hi there! I am your AI Policy Assistant. How can I help you today?', isBot: true, time: new Date() }
  ];

  ngOnInit() {
    this.sub = this.chatbotService.context$.subscribe(ctx => {
      this.currentPlanData = ctx.planData;
      this.isOpen = true; // Open chat
      this.userInput = ctx.prefillMessage; // Prefill message
      this.messages = [
        { text: `Hi there! I am your AI Assistant explicitly focusing on the ${ctx.planData?.planName} plan. Ask me anything about it!`, isBot: true, time: new Date() }
      ];
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const rawQuestion = this.userInput.trim();
    this.messages.push({ text: rawQuestion, isBot: false, time: new Date() });
    this.userInput = '';
    this.isLoading = true;

    // Optional advanced: Basic conversation memory
    let questionPayload = rawQuestion;
    if (this.messages.length > 2) {
      // Find the last user message and the last bot message before the current one
      const prevUserMsg = this.messages[this.messages.length - 3]?.text;
      const prevBotMsg = this.messages[this.messages.length - 2]?.text;
      if (prevUserMsg && prevBotMsg) {
        questionPayload = `[Previous Context: User: "${prevUserMsg}" | Assistant: "${prevBotMsg}"] Current Question: ${rawQuestion}`;
      }
    }

    const payload: PolicyChatRequest = {
      question: questionPayload,
      contextPolicy: this.currentPlanData ? JSON.stringify(this.currentPlanData) : undefined
    };

    this.chatbotService.sendMessage(payload).subscribe({
      next: (res: PolicyChatResponse) => {
        this.messages.push({ text: res.answer, isBot: true, time: new Date() });
        this.isLoading = false;
      },
      error: (err) => {
        this.messages.push({ text: 'Sorry, I am having trouble connecting to the server. Please try again later.', isBot: true, time: new Date() });
        this.isLoading = false;
        console.error('Chat error', err);
      }
    });
  }
}
