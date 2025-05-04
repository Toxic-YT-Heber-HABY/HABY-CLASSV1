"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClassStore } from "@/store/class-store"
import { AnnouncementsList } from "@/components/announcements-list"
import { AssignmentsList } from "@/components/assignments-list"
import { PeopleList } from "@/components/people-list"

export function ClassTabs() {
  const params = useParams()
  const classId = params.id as string
  const { currentClass } = useClassStore()
  const [activeTab, setActiveTab] = useState("stream")

  if (!currentClass) {
    return <div>Cargando...</div>
  }

  return (
    <Tabs defaultValue="stream" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="stream">Novedades</TabsTrigger>
        <TabsTrigger value="classwork">Trabajo de clase</TabsTrigger>
        <TabsTrigger value="people">Personas</TabsTrigger>
      </TabsList>
      <TabsContent value="stream">
        <AnnouncementsList classId={classId} announcements={currentClass.announcements || []} />
      </TabsContent>
      <TabsContent value="classwork">
        <AssignmentsList classId={classId} assignments={currentClass.assignments || []} />
      </TabsContent>
      <TabsContent value="people">
        <PeopleList classId={classId} />
      </TabsContent>
    </Tabs>
  )
}

