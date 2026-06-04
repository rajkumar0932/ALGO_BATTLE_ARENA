import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BattleReview } from "@/components/review/BattleReview";

interface Props {
  params: { battleId: string };
}

export default async function BattleReviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <BattleReview battleId={params.battleId} currentUserId={session.user.id} />;
}
