import React from "react";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import FormHeader from "./form-header";
import BackButton from "./back-button";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonText: string;
  backButtonHref: string;
}

const CardWrapper = ({
  children,
  headerLabel,
  backButtonText,
  backButtonHref,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <FormHeader label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <BackButton href={backButtonHref} label={backButtonText} />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
