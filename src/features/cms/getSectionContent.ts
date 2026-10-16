import { fetchSectionByKey } from "@/services/cmsService";
import type { SiteSection } from "@/types/database";

export async function getSectionContent(sectionKey: string): Promise<SiteSection | null> {
  return fetchSectionByKey(sectionKey);
}
