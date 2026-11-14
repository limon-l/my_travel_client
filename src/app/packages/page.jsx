import { redirect } from "next/navigation";

/**
 * `/packages` was the old catalogue route. The catalogue now lives at `/tours`
 * so one URL owns discovery. Keeping this redirect preserves existing links.
 */
export default function PackagesPage() {
  redirect("/tours");
}
