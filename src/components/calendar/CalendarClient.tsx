'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { PostSchedule, Channel, VideoStatus } from '@/types'
import { COLOR_THEME_MAP } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ScheduleModal } from './ScheduleModal'
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit } from 'lucide-react'
import { STATUS_LIST } from '@/lib/utils'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

interface CalendarClientProps {
  schedules: PostSchedule[]
  channels: Channel[]
}

export function CalendarClient({ schedules: initialSchedules, channels }: CalendarClientProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [schedules, setSchedules] = useState(initialSchedules)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<PostSchedule | null>(null)
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const router = useRouter()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getSchedulesForDate = (date: string) =>
    schedules.filter(s => s.post_date === date)

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setIsNewScheduleOpen(true)
  }

  const handleScheduleClick = (schedule: PostSchedule, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSchedule(schedule)
    setIsDetailOpen(true)
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('この投稿予定を削除しますか？')) return
    const res = await fetch('/api/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setSchedules(prev => prev.filter(s => s.id !== id))
      setIsDetailOpen(false)
      toast.success('削除しました')
    } else {
      toast.error('削除に失敗しました')
    }
  }

  const handleUpdateStatus = async (id: string, status: VideoStatus) => {
    const res = await fetch('/api/schedule', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      if (selectedSchedule?.id === id) setSelectedSchedule(prev => prev ? { ...prev, status } : null)
      toast.success('更新しました')
    }
  }

  const calendarCells: Array<{ date: Date | null; dateStr: string }> = []
  for (let i = 0; i < startDow; i++) {
    calendarCells.push({ date: null, dateStr: '' })
  }
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d)
    calendarCells.push({ date, dateStr: date.toISOString().split('T')[0] })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">投稿カレンダー</h1>
          <p className="text-gray-500 text-sm">{schedules.length}件の投稿予定</p>
        </div>
        <button
          onClick={() => { setSelectedDate(today.toISOString().split('T')[0]); setIsNewScheduleOpen(true) }}
          className="btn-primary bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5"
        >
          <Plus size={16} />
          予定追加
        </button>
      </div>

      {/* カレンダーナビ */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-black text-gray-800">
            {year}年{month + 1}月
          </h2>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d, i) => (
            <div key={d} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarCells.map((cell, i) => {
            if (!cell.date) {
              return <div key={`empty-${i}`} className="aspect-square" />
            }
            const isToday = cell.dateStr === today.toISOString().split('T')[0]
            const daySchedules = getSchedulesForDate(cell.dateStr)
            const dow = cell.date.getDay()

            return (
              <button
                key={cell.dateStr}
                onClick={() => handleDateClick(cell.dateStr)}
                className={`aspect-square flex flex-col items-center rounded-xl p-0.5 hover:bg-gray-50 transition-colors relative ${
                  isToday ? 'bg-pink-50' : ''
                }`}
              >
                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-pink-500 text-white' :
                  dow === 0 ? 'text-red-400' :
                  dow === 6 ? 'text-blue-400' :
                  'text-gray-700'
                }`}>
                  {cell.date.getDate()}
                </span>
                {daySchedules.length > 0 && (
                  <div className="w-full mt-0.5 space-y-0.5">
                    {daySchedules.slice(0, 2).map(schedule => {
                      const ch = schedule.channels as Channel | undefined
                      const cTheme = ch ? COLOR_THEME_MAP[ch.color_theme] : null
                      return (
                        <button
                          key={schedule.id}
                          onClick={e => handleScheduleClick(schedule, e)}
                          className={`w-full text-left px-1 py-0.5 rounded text-[9px] leading-tight font-medium truncate ${cTheme?.badge || 'bg-gray-100 text-gray-600'}`}
                        >
                          {ch?.icon} {schedule.title || schedule.video_ideas?.title || '投稿'}
                        </button>
                      )
                    })}
                    {daySchedules.length > 2 && (
                      <p className="text-[9px] text-gray-400 text-center">+{daySchedules.length - 2}</p>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 今後の投稿リスト */}
      <div>
        <h2 className="section-title mb-3">今後の投稿予定</h2>
        <div className="space-y-2">
          {schedules.filter(s => s.post_date >= today.toISOString().split('T')[0]).map(schedule => {
            const ch = schedule.channels as Channel | undefined
            const cTheme = ch ? COLOR_THEME_MAP[ch.color_theme] : null
            const dateObj = new Date(schedule.post_date + 'T00:00:00')
            return (
              <button
                key={schedule.id}
                onClick={() => { setSelectedSchedule(schedule); setIsDetailOpen(true) }}
                className="card w-full flex items-center gap-3 hover:shadow-md transition-shadow text-left"
              >
                <div className="text-center min-w-[44px]">
                  <p className="text-xl font-black text-gray-800">{dateObj.getDate()}</p>
                  <p className="text-xs text-gray-400">{dateObj.toLocaleDateString('ja-JP', { month: 'short' })}</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {ch && <span className="text-sm">{ch.icon}</span>}
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {schedule.title || schedule.video_ideas?.title || '未タイトル'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{schedule.platform} {schedule.post_time?.slice(0, 5)}</p>
                </div>
                <StatusBadge status={schedule.status} />
              </button>
            )
          })}
          {schedules.filter(s => s.post_date >= today.toISOString().split('T')[0]).length === 0 && (
            <div className="card text-center py-8">
              <p className="text-gray-400 text-sm">投稿予定がありません</p>
            </div>
          )}
        </div>
      </div>

      {/* 新規スケジュールモーダル */}
      <ScheduleModal
        isOpen={isNewScheduleOpen}
        onClose={() => { setIsNewScheduleOpen(false); router.refresh() }}
        channel={channels[0]}
        defaultDate={selectedDate || undefined}
      />

      {/* スケジュール詳細モーダル */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="投稿予定の詳細" size="md">
        {selectedSchedule && (() => {
          const ch = selectedSchedule.channels as Channel | undefined
          const cTheme = ch ? COLOR_THEME_MAP[ch.color_theme] : null
          return (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${cTheme?.light || 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {ch && <span>{ch.icon}</span>}
                  <p className="font-bold text-gray-800">
                    {selectedSchedule.title || selectedSchedule.video_ideas?.title || '未タイトル'}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSchedule.post_date + 'T00:00:00').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {selectedSchedule.post_time && ` ${selectedSchedule.post_time.slice(0, 5)}`}
                </p>
                <p className="text-sm text-gray-500">{selectedSchedule.platform}</p>
              </div>

              <div>
                <p className="label-base">ステータス変更</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_LIST.map(s => (
                    <button key={s} onClick={() => handleUpdateStatus(selectedSchedule.id, s as VideoStatus)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        selectedSchedule.status === s ? 'ring-2 ring-offset-1 scale-105' : 'opacity-50'
                      } ${s === '企画中' ? 'bg-gray-100 text-gray-700' :
                        s === '台本完成' ? 'bg-blue-100 text-blue-700' :
                        s === '画像作成済み' ? 'bg-purple-100 text-purple-700' :
                        s === '動画作成済み' ? 'bg-yellow-100 text-yellow-700' :
                        s === '投稿予約済み' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSchedule.notes && (
                <div>
                  <p className="label-base">メモ</p>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{selectedSchedule.notes}</p>
                </div>
              )}

              <button
                onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                className="btn-primary w-full bg-red-50 text-red-500 hover:bg-red-100"
              >
                <Trash2 size={14} />
                この予定を削除
              </button>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
