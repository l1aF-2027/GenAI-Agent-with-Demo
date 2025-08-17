"use client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { History, LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface ChatHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onShowHistory: () => void;
}

export function ChatHeader({ user, onShowHistory }: ChatHeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="border-b bg-background p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">
              AI
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={onShowHistory}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            History
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user.name?.[0] || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {user.name || user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
