// Simple test page to verify the application is working
export default function TestPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">CraveVerse Test Page</h1>
        <p className="text-lg text-muted-foreground mb-8">
          If you can see this page, the application is working correctly!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Application is running successfully
        </div>
      </div>
    </div>
  );
}
