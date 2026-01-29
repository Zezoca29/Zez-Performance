'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TodayView } from './today-view'
import { RoutineCreator } from './routine-creator/routine-creator'
import { HabitsView } from './habits/habits-view'
import { useDailyReset } from '@/hooks/use-daily-reset'

export function RoutineTabs() {
  const [activeTab, setActiveTab] = useState('today')

  // Run daily reset on mount
  useDailyReset()

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="today">Hoje</TabsTrigger>
        <TabsTrigger value="routines">Criar Rotina</TabsTrigger>
        <TabsTrigger value="habits">Hábitos</TabsTrigger>
      </TabsList>

      <TabsContent value="today">
        <TodayView />
      </TabsContent>

      <TabsContent value="routines">
        <RoutineCreator />
      </TabsContent>

      <TabsContent value="habits">
        <HabitsView />
      </TabsContent>
    </Tabs>
  )
}
