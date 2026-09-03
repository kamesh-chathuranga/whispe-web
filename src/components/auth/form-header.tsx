import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import React from "react";

const font = Poppins({
  subsets: ["latin"],
  weight: ["500"],
});

interface FormHeaderProps {
  label: string;
}

const FormHeader = ({ label }: FormHeaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 w-full">
      <h1 className={cn("text-3xl font-semibold", font.className)}>Whispe</h1>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
};

export default FormHeader;
