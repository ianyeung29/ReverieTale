import { CompanionStudio } from "@/components/CompanionStudio";

export default async function CompanionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanionStudio characterId={id} />;
}
