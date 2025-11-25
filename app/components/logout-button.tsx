'use client';

import { logout } from '@/app/actions';

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[200px]"
    >
      Logout
    </button>
  );
}
