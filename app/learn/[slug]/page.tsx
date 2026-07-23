import { AcademyApp } from "../../components/AcademyApp";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AcademyApp initialChapterSlug={slug} />;
}
