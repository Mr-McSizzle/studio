
import { ChatInterface } from "@/components/mentor/chat-interface";

export default function MentorPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground">EVE - Your AI Hive Mind Assistant</h1>
        <p className="text-muted-foreground">
          Engage with EVE for personalized business advice, strategic guidance, and synthesized insights from her team of expert AI agents.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}

    