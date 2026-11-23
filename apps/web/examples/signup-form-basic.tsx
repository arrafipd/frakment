"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SignupFormBasic({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card className={cn("mx-auto w-full max-w-sm", className)} {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(event) => event.preventDefault()}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="signup-basic-name">Full Name</FieldLabel>
              <Input
                autoComplete="name"
                id="signup-basic-name"
                placeholder="John Doe"
                required
                type="text"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-basic-email">Email</FieldLabel>
              <Input
                autoComplete="email"
                id="signup-basic-email"
                placeholder="m@example.com"
                required
                type="email"
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-basic-password">Password</FieldLabel>
              <Input
                autoComplete="new-password"
                id="signup-basic-password"
                required
                type="password"
              />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-basic-confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                autoComplete="new-password"
                id="signup-basic-confirm-password"
                required
                type="password"
              />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            <Field>
              <Button type="submit">Create Account</Button>
              <Button type="button" variant="outline">
                Sign up with Google
              </Button>
              <FieldDescription className="px-6 text-center">
                Already have an account? <a href="#">Sign in</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
