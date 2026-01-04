import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockKeyhole, LogIn } from "lucide-react";
import Link from "next/link";

export function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-blue-100 shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <LockKeyhole className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Authentication Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            You need to be signed in to access this part of the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Join our student community to message sellers, post items, and join
            university events.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            asChild
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg"
          >
            <Link href="/">
              <LogIn className="mr-2 h-5 w-5" /> Sign in
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full text-gray-500">
            <Link href="/marketplace">
              Browse Marketplace as Guest (View only)
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
