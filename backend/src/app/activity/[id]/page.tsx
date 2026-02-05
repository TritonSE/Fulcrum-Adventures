import { notFound } from "next/navigation";

import ActivityDetail from "../../../components/ActivityDetail";
import { type Activity, mockActivities } from "../../../data/mockActivities";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function findActivityById(id: string): Activity {
  const activity = mockActivities.find((a) => a.id === id);
  if (!activity) {
    notFound();
  }
  return activity;
}

export default async function ActivityPage({ params }: PageProps) {
  const { id } = await params;
  const activity = findActivityById(id);
  return <ActivityDetail activity={activity} />;
}
