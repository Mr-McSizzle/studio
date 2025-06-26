
import { ChatInterface } from "@/components/mentor/chat-interface";

export default function PostLaunchMentorPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-headline text-foreground">Post-Launch Hive Mind</h1>
        <p className="text-muted-foreground">
          Continue your conversation with EVE as your company grows. She'll provide advanced strategic guidance for the post-launch phase.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}
