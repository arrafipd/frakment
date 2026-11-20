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

export function SignupFormSocial({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto flex w-full max-w-sm flex-col gap-6", className)}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => event.preventDefault()}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="signup-social-name">Full Name</FieldLabel>
                <Input
                  autoComplete="name"
                  id="signup-social-name"
                  placeholder="John Doe"
                  required
                  type="text"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-social-email">Email</FieldLabel>
                <Input
                  autoComplete="email"
                  id="signup-social-email"
                  placeholder="m@example.com"
                  required
                  type="email"
                />
              </Field>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="signup-social-password">
                      Password
                    </FieldLabel>
                    <Input
                      autoComplete="new-password"
                      id="signup-social-password"
                      required
                      type="password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="signup-social-confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      autoComplete="new-password"
                      id="signup-social-confirm-password"
                      required
                      type="password"
                    />
                  </Field>
                </div>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </div>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
