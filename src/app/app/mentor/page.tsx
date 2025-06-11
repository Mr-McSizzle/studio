
import { ChatInterface } from "@/components/mentor/chat-interface";

export default function MentorPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground">Hive Mind Assistant</h1>
        <p className="text-muted-foreground">
          Engage with your AI Hive Mind for personalized business advice, strategic guidance, and synthesized insights from expert agents.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}

