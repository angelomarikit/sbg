import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Json } from "@/types/database";

type Cta = { label: string; href: string };

type FormatItem = {
  title: string;
  slug: string;
  caption: string;
  image_url: string;
};

function asRecord(json: Json | null | undefined): Record<string, unknown> {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return json as Record<string, unknown>;
  }
  return {};
}

function ctaFields(
  prefix: string,
  cta: Cta | undefined,
  onChange: (next: Cta) => void,
) {
  return (
    <div className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-2">
      <div>
        <Label>{prefix} label</Label>
        <Input
          value={cta?.label ?? ""}
          onChange={(e) => onChange({ label: e.target.value, href: cta?.href ?? "" })}
        />
      </div>
      <div>
        <Label>{prefix} link</Label>
        <Input
          value={cta?.href ?? ""}
          onChange={(e) => onChange({ label: cta?.label ?? "", href: e.target.value })}
          placeholder="#products"
        />
      </div>
    </div>
  );
}

const defaultFormatItems: FormatItem[] = [
  {
    title: "Powder in Jar",
    slug: "sbg-powder-jar-240g",
    caption: "Learn more about this Salveo format.",
    image_url: "/assets/promotions/promo-5.png",
  },
  {
    title: "Trial Pack",
    slug: "sbg-trial-pack-80g",
    caption: "Learn more about this Salveo format.",
    image_url: "/assets/products/product-4.png",
  },
  {
    title: "On The Go Sachets",
    slug: "sbg-on-the-go-12",
    caption: "Learn more about this Salveo format.",
    image_url: "/assets/products/product-2.png",
  },
  {
    title: "Capsules",
    slug: "sbg-capsules-120",
    caption: "Learn more about this Salveo format.",
    image_url: "/assets/products/product-3.png",
  },
];

type SectionExtrasEditorProps = {
  sectionKey: string;
  contentJson: Json | null | undefined;
  onChange: (json: Json) => void;
};

export function SectionExtrasEditor({ sectionKey, contentJson, onChange }: SectionExtrasEditorProps) {
  const data = asRecord(contentJson);

  const patch = (partial: Record<string, unknown>) => {
    onChange({ ...data, ...partial } as Json);
  };

  if (sectionKey === "hero") {
    const primary = data.primaryCta as Cta | undefined;
    const secondary = data.secondaryCta as Cta | undefined;
    const trustLine = (data.trustLine as string | undefined) ?? "";
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-deep">Hero buttons</p>
        {ctaFields("Primary button", primary, (primaryCta) => patch({ primaryCta }))}
        {ctaFields("Secondary button", secondary, (secondaryCta) => patch({ secondaryCta }))}
        <div>
          <Label>Line under buttons</Label>
          <Input
            value={trustLine}
            onChange={(e) => patch({ trustLine: e.target.value })}
            placeholder="Explore the available barley grass formats and packages."
          />
        </div>
      </div>
    );
  }

  if (sectionKey === "why_choose") {
    const bullets = (data.bullets as string[] | undefined) ?? [];
    const cta = data.cta as Cta | undefined;
    return (
      <div className="space-y-3">
        <div>
          <Label>Bullet points (one per line)</Label>
          <Textarea
            rows={5}
            value={bullets.join("\n")}
            onChange={(e) =>
              patch({
                bullets: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <p className="text-sm font-semibold text-deep">Section button</p>
        {ctaFields("Button", cta, (ctaValue) => patch({ cta: ctaValue }))}
      </div>
    );
  }

  if (sectionKey === "lifestyle" || sectionKey === "final_cta" || sectionKey === "products") {
    const cta = data.cta as Cta | undefined;
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-deep">Section button (optional)</p>
        {ctaFields("Button", cta, (ctaValue) => patch({ cta: ctaValue }))}
      </div>
    );
  }

  if (sectionKey === "trust_strip") {
    const items = (data.items as { title: string }[] | undefined) ?? [];
    return (
      <div>
        <Label>Trust strip captions (one per line)</Label>
        <Textarea
          rows={4}
          value={items.map((i) => i.title).join("\n")}
          onChange={(e) =>
            patch({
              items: e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((title) => ({ title })),
            })
          }
        />
      </div>
    );
  }

  if (sectionKey === "formats") {
    const items = (data.items as FormatItem[] | undefined)?.length
      ? (data.items as FormatItem[])
      : defaultFormatItems;

    const updateItem = (index: number, partial: Partial<FormatItem>) => {
      const next = items.map((item, i) => (i === index ? { ...item, ...partial } : item));
      patch({ items: next });
    };

    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-deep">Format cards</p>
        {items.map((item, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-xs font-bold uppercase text-muted">Card {index + 1}</p>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} />
              </div>
              <div>
                <Label>Product slug</Label>
                <Input value={item.slug} onChange={(e) => updateItem(index, { slug: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Caption</Label>
              <Input value={item.caption} onChange={(e) => updateItem(index, { caption: e.target.value })} />
            </div>
            <ImageUploadField
              label="Card image"
              folder={`sections/formats-${index + 1}`}
              category="products"
              value={item.image_url}
              onChange={(url) => updateItem(index, { image_url: url })}
            />
          </div>
        ))}
        <Button type="button" variant="secondary" size="sm" onClick={() => patch({ items: defaultFormatItems })}>
          Reset format cards to defaults
        </Button>
      </div>
    );
  }

  if (sectionKey === "promotions") {
    return (
      <p className="text-sm text-muted">
        Package cards come from <strong>Admin → Promotions</strong>. Use title and body above for the
        section heading and intro text.
      </p>
    );
  }

  if (sectionKey === "testimonials") {
    return (
      <p className="text-sm text-muted">
        Poster images and captions are managed under <strong>Admin → Testimonials</strong>.
      </p>
    );
  }

  if (sectionKey === "faq") {
    return (
      <p className="text-sm text-muted">
        Questions and answers are managed under <strong>Admin → FAQs</strong>.
      </p>
    );
  }

  return null;
}
