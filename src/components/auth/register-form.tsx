import React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RegisterSchema } from "../../schema";

import CardWrapper from "./card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FormError from "../form-error";
import { loginAction, registerAction } from "@/actions/auth-actions";
import { Loader } from "lucide-react";
// import { useStore } from "@/store";

const RegisterForm = () => {
  const [error, setError] = React.useState<string | undefined>("");
  // const { setCurrentUser } = useStore();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof RegisterSchema>) => {
    setError("");
    const response = await registerAction(formData);

    if (response.status === 201 && response.success) {
      const formValues = {
        email: formData.email,
        password: formData.password,
      };

      const response = await loginAction(formValues);

      if (!response?.success && response?.status !== 200) {
        setError(response?.message);
      }
    } else {
      setError(response.message);
    }
  };

  return (
    <CardWrapper
      headerLabel="Create an Account"
      backButtonText="Already have an account?"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={form.formState.isSubmitting}
                      placeholder="Jennifer Doe"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={form.formState.isSubmitting}
                      placeholder="chatter@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={form.formState.isSubmitting}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader color="white" className="animate-spin" size={24} />
            ) : (
              "Create an Account"
            )}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
