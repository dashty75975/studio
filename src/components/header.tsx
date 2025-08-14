import Link from 'next/link';
import { MapIcon, UserPlus, ShieldCheck, LogIn } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <MapIcon className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">SulyTrack</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
             <Link href="/driver/login" className="text-foreground/60 transition-colors hover:text-foreground/80 flex items-center gap-1">
              <LogIn className="h-4 w-4" /> 
              <span className="hidden sm:inline">Driver Login</span>
            </Link>
            <Link href="/register" className="text-foreground/60 transition-colors hover:text-foreground/80 flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> 
              <span className="hidden sm:inline">Driver Registration</span>
            </Link>
            <Link href="/admin" className="text-foreground/60 transition-colors hover:text-foreground/80 flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> 
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
