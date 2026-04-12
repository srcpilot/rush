import { FilePreview } from "@/components/share/file-preview";
import { PasswordForm } from "@/components/share/password-form";
import { cn } from "@/lib/utils";

type ShareStatus = "loading" | "public" | "password" | "error" | "expired";

async function getShare(token: string) {
  const res = await fetch(`/api/shares/${token}`);
  if (res.status === 410) return { status: "expired" as const };
  if (res.status === 404) return { status: "not_found" as const };
  if (!res.ok) return { status: "error" as const };
  
  const data = await res.json();
  return {
    status: (data.access === "password" ? "password" : "public") as ShareStatus,
    data,
  };
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const share = await getShare(token);

  if (share.status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold">Link Expired</h1>
          <p className="text-muted-foreground">This share link has expired and is no longer available.</p>
        </div>
      </div>
    );
  }

  if (share.status === "not_found") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold">Not Found</h1>
          <p className="text-muted-foreground">The share link you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  if (share.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">An error occurred while retrieving the share.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          {share.status === "password" ? (
            <PasswordForm token={token} />
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  {share.data.name || "Shared File"}
                </h1>
                <p className="text-muted-foreground">
                  {share.data.size ? `${(share.data.size / 1024 / 1024).toFixed(2)} MB` : "File"}
                </p>
              </div>
              
              <FilePreview file={share.data} downloadUrl={`/api/shares/${token}/download`} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
