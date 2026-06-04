import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BattleRoom } from "@/components/battle/BattleRoom";

interface Props {
  params: { battleId: string };
}

export default async function BattleRoomPage({ params }: Props) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <BattleRoom 
      battleId={params.battleId} 
      currentUser={{ 
        id: session.user.id, 
        username: session.user.username 
      }} 
    />
  );
}
