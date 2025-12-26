"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

export const SignInWithMicrosoftButton = () => {
  return (
    <Button
      className="w-full h-12 text-base rounded-xl cursor-pointer bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
      onClick={() => {
        signIn("azure-ad", { redirectTo: "/dashboard" });
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 23 23"
        width="23"
        height="23"
        className="w-5 h-5"
      >
        <path fill="#f3f3f3" d="M0 0h23v23H0z" />
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
      Sign in with Microsoft
    </Button>
  );
};
