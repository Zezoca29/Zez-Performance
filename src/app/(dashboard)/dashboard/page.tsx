'use client'

import Image from 'next/image'
import {
  Droplets,
  ListTodo,
  Dumbbell,
  Apple,
  BookOpen,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DailyScore } from '@/components/dashboard/daily-score'
import { ModuleCard } from '@/components/dashboard/module-card'
import { useDailyScore } from '@/hooks/use-daily-score'
import { useHydrationToday } from '@/hooks/use-hydration'
import { useTasksToday } from '@/hooks/use-tasks'
import { useGymToday } from '@/hooks/use-gym'
import { useDietToday } from '@/hooks/use-diet'
import { useReadingToday } from '@/hooks/use-reading'
import { useExpensesToday } from '@/hooks/use-finances'

export default function DashboardPage() {
  const { data: scoreData } = useDailyScore()
  const { data: hydration } = useHydrationToday()
  const { data: tasks } = useTasksToday()
  const { data: gym } = useGymToday()
  const { data: diet } = useDietToday()
  const { data: reading } = useReadingToday()
  const { data: expenses } = useExpensesToday()

  const score = scoreData?.score ?? 0
  const streak = scoreData?.streak ?? 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="Zez Performance"
            width={100}
            height={100}
            className="lg:hidden"
          />
          <CardTitle>Performance de Hoje</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <DailyScore score={score} streak={streak} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <ModuleCard
          title="Hidratacao"
          icon={Droplets}
          value={`${hydration?.total ?? 0}ml`}
          subtext={`Meta: ${hydration?.goal ?? 2500}ml`}
          progress={hydration?.percentage ?? 0}
          href="/hydration"
        />

        <ModuleCard
          title="Tarefas"
          icon={ListTodo}
          value={`${tasks?.completed ?? 0}/${tasks?.total ?? 0}`}
          subtext="completadas"
          progress={tasks?.percentage ?? 0}
          href="/routine"
        />

        <ModuleCard
          title="Academia"
          icon={Dumbbell}
          value={gym?.checkedIn ? 'Feito' : 'Pendente'}
          subtext={gym?.workoutType ?? 'Nenhum treino'}
          href="/gym"
        />

        <ModuleCard
          title="Dieta"
          icon={Apple}
          value={diet?.status === 'clean' ? 'Limpo' : diet?.status === 'free' ? 'Livre' : 'Parcial'}
          subtext={`${diet?.mealsLogged ?? 0} refeicoes`}
          href="/diet"
        />

        <ModuleCard
          title="Leitura"
          icon={BookOpen}
          value={`${reading?.pagesRead ?? 0} pags`}
          subtext={reading?.currentBook ?? 'Nenhum livro'}
          href="/reading"
        />

        <ModuleCard
          title="Gastos"
          icon={Wallet}
          value={`R$ ${(expenses?.todayTotal ?? 0).toFixed(2)}`}
          subtext={`${expenses?.transactionsCount ?? 0} transacoes`}
          href="/finances"
        />
      </div>
    </div>
  )
}
