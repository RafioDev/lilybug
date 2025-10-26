import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '../../utils/cn'
import { Button } from '../Button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { useTimeFormat } from '../../contexts/TimeFormatContext'
import { timeUtils, type TimeFormat } from '../../utils/timeUtils'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar mode='single' selected={date} onSelect={onDateChange} />
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date and time',
  disabled = false,
  className,
}: DateTimePickerProps) {
  const { timeFormat } = useTimeFormat()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? timeUtils.formatTime(date, timeFormat) : ''
  )

  React.useEffect(() => {
    setSelectedDate(date)
    setTimeValue(date ? timeUtils.formatTime(date, timeFormat) : '')
  }, [date, timeFormat])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined)
      setTimeValue('')
      onDateChange?.(undefined)
      return
    }

    const [hours, minutes] = timeValue.split(':').map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      newDate.setHours(hours, minutes)
    }

    setSelectedDate(newDate)
    onDateChange?.(newDate)
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)

    if (!selectedDate) return

    const { hours, minutes } = timeUtils.parseTimeString(time)
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes)
      setSelectedDate(newDate)
      onDateChange?.(newDate)
    }
  }

  return (
    <div className='flex gap-2'>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'flex-1 justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selectedDate ? (
              format(selectedDate, 'PPP')
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-24 justify-center text-center font-normal',
              !timeValue && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled || !selectedDate}
          >
            {timeValue || '00:00'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-2'>
          <TimePickerContent
            timeValue={timeValue}
            timeFormat={timeFormat}
            onTimeChange={handleTimeChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface TimePickerContentProps {
  timeValue: string
  timeFormat: TimeFormat
  onTimeChange: (time: string) => void
}

const TimePickerContent: React.FC<TimePickerContentProps> = ({
  timeValue,
  timeFormat,
  onTimeChange,
}) => {
  if (timeFormat === '24h') {
    return (
      <div className='grid grid-cols-2 gap-2'>
        <div className='space-y-1'>
          <label className='text-muted-foreground text-xs font-medium'>
            Hour
          </label>
          <select
            value={timeValue.split(':')[0] || '00'}
            onChange={(e) => {
              const minutes = timeValue.split(':')[1] || '00'
              onTimeChange(`${e.target.value}:${minutes}`)
            }}
            className='border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none'
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div className='space-y-1'>
          <label className='text-muted-foreground text-xs font-medium'>
            Min
          </label>
          <select
            value={timeValue.split(':')[1] || '00'}
            onChange={(e) => {
              const hours = timeValue.split(':')[0] || '00'
              onTimeChange(`${hours}:${e.target.value}`)
            }}
            className='border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none'
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>
                {String(i).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  // 12-hour format
  const currentTime = timeUtils.parseTimeString(timeValue)
  const {
    hours: displayHours,
    minutes,
    period,
  } = timeUtils.to12HourFormat(currentTime.hours, currentTime.minutes)

  return (
    <div className='grid grid-cols-3 gap-2'>
      <div className='space-y-1'>
        <label className='text-muted-foreground text-xs font-medium'>
          Hour
        </label>
        <select
          value={String(displayHours)}
          onChange={(e) => {
            const newHours = parseInt(e.target.value)
            const { hours: convertedHours } = timeUtils.to24HourFormat(
              newHours,
              minutes,
              period
            )
            onTimeChange(
              timeUtils.formatTime(
                new Date(2000, 0, 1, convertedHours, minutes),
                '12h'
              )
            )
          }}
          className='border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none'
        >
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i + 1
            return (
              <option key={hour} value={String(hour)}>
                {hour}
              </option>
            )
          })}
        </select>
      </div>
      <div className='space-y-1'>
        <label className='text-muted-foreground text-xs font-medium'>Min</label>
        <select
          value={String(minutes).padStart(2, '0')}
          onChange={(e) => {
            const newMinutes = parseInt(e.target.value)
            const { hours: convertedHours } = timeUtils.to24HourFormat(
              displayHours,
              newMinutes,
              period
            )
            onTimeChange(
              timeUtils.formatTime(
                new Date(2000, 0, 1, convertedHours, newMinutes),
                '12h'
              )
            )
          }}
          className='border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none'
        >
          {Array.from({ length: 60 }, (_, i) => (
            <option key={i} value={String(i).padStart(2, '0')}>
              {String(i).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      <div className='space-y-1'>
        <label className='text-muted-foreground text-xs font-medium'>
          Period
        </label>
        <select
          value={period}
          onChange={(e) => {
            const newPeriod = e.target.value as 'AM' | 'PM'
            const { hours: convertedHours } = timeUtils.to24HourFormat(
              displayHours,
              minutes,
              newPeriod
            )
            onTimeChange(
              timeUtils.formatTime(
                new Date(2000, 0, 1, convertedHours, minutes),
                '12h'
              )
            )
          }}
          className='border-input bg-background focus:ring-ring w-full rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none'
        >
          <option value='AM'>AM</option>
          <option value='PM'>PM</option>
        </select>
      </div>
    </div>
  )
}
