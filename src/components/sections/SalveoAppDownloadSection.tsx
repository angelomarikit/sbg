import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "@/components/sections/FadeInSection";
import {
  SALVEO_APP_DOWNLOAD_CAPTION,
  SALVEO_APP_REGISTER_LABEL,
  SALVEO_APP_DOWNLOAD_URL,
} from "@/config/site";

type SalveoAppDownloadSectionProps = {
  variant?: "banner" | "compact";
};

export function SalveoAppDownloadSection({ variant = "banner" }: SalveoAppDownloadSectionProps) {
  if (variant === "compact") {
    return (
      <p className="text-sm text-muted">
        {SALVEO_APP_DOWNLOAD_CAPTION}{" "}
        <a
          href={SALVEO_APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          {SALVEO_APP_REGISTER_LABEL}
        </a>
      </p>
    );
  }

  return (
    <section
      id="download-app"
      className="border-y border-primary/20 bg-gradient-to-br from-fresh via-white to-fresh/60 py-12 md:py-14"
      aria-labelledby="app-download-heading"
    >
      <FadeInSection>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center md:px-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <Smartphone className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <h2 id="app-download-heading" className="text-xl font-bold text-deep md:text-2xl">
            {SALVEO_APP_DOWNLOAD_CAPTION}
          </h2>
          <p className="max-w-lg text-sm text-muted">
            Register on the official Salveo app for member promos, discounts, and updates.
          </p>
          <Button asChild size="lg" className="mt-1">
            <a href={SALVEO_APP_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
              {SALVEO_APP_REGISTER_LABEL}
            </a>
          </Button>
        </div>
      </FadeInSection>
    </section>
  );
}