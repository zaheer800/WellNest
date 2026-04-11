import React from 'react'

interface FamilyMember {
  id: string
  name: string
  relationship: string | null
  last_seen_at: string | null
}

interface FamilyCircleProps {
  members: FamilyMember[]
  onInvite?: () => void
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function getLastSeen(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const AVATAR_COLORS = [
  'bg-brand-teal',
  'bg-pink-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-cyan-400',
  'bg-violet-400',
]

const FamilyCircle: React.FC<FamilyCircleProps> = ({ members, onInvite }) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="text-4xl">👨‍👩‍👧‍👦</p>
        <p className="text-sm text-gray-500 font-medium">Your family circle is empty</p>
        <p className="text-xs text-gray-400">Invite family members to support your journey</p>
        {onInvite && (
          <button
            type="button"
            onClick={onInvite}
            className="mt-1 px-5 py-2.5 bg-brand-teal text-white rounded-xl text-sm font-semibold hover:bg-brand-teal transition"
          >
            Invite Family Member
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {members.map((m, i) => (
        <div key={m.id} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-bold">{getInitials(m.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{m.name}</p>
            <p className="text-xs text-gray-400">{m.relationship ?? 'Family'}</p>
          </div>
          <p className="text-xs text-gray-400 flex-shrink-0">{getLastSeen(m.last_seen_at)}</p>
        </div>
      ))}

      {onInvite && (
        <button
          type="button"
          onClick={onInvite}
          className="w-full mt-1 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-400 hover:border-indigo-300 hover:text-brand-teal transition"
        >
          + Invite another member
        </button>
      )}
    </div>
  )
}

export default FamilyCircle
