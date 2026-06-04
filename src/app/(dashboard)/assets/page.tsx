import { createClient } from '@/lib/supabase/server'
import { FolderOpen, Upload } from 'lucide-react'

export default async function AssetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: assets } = await supabase
    .from('assets')
    .select('*, channels(name, icon)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const folders = [
    { id: 'oshirihime', label: 'おしりひめ', icon: '👸', color: 'from-pink-400 to-purple-400' },
    { id: 'nonchan', label: 'のんちゃん', icon: '🍶', color: 'from-slate-600 to-amber-600' },
    { id: 'thumbnail', label: 'サムネイル', icon: '🖼', color: 'from-blue-400 to-cyan-400' },
    { id: 'video', label: '動画素材', icon: '🎬', color: 'from-green-400 to-teal-400' },
    { id: 'audio', label: '音声素材', icon: '🎵', color: 'from-orange-400 to-red-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">素材管理</h1>
          <p className="text-gray-500 text-sm mt-1">Supabase Storageで素材を管理</p>
        </div>
      </div>

      {/* フォルダ */}
      <div>
        <h2 className="section-title mb-3">フォルダ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {folders.map(folder => (
            <div key={folder.id}
              className={`card bg-gradient-to-br ${folder.color} text-white hover:shadow-md transition-shadow cursor-pointer`}>
              <span className="text-3xl mb-2 block">{folder.icon}</span>
              <p className="font-bold text-sm">{folder.label}</p>
              <p className="text-white/70 text-xs mt-0.5">
                {assets?.filter(a => a.asset_type === folder.id).length || 0}件
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 素材一覧 */}
      {assets && assets.length > 0 ? (
        <div>
          <h2 className="section-title mb-3">最近追加した素材</h2>
          <div className="space-y-2">
            {assets.slice(0, 20).map(asset => (
              <div key={asset.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {asset.asset_type === 'image' ? '🖼' :
                   asset.asset_type === 'video' ? '🎬' :
                   asset.asset_type === 'audio' ? '🎵' :
                   asset.asset_type === 'thumbnail' ? '🖼' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{asset.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {asset.file_type} / {asset.file_size ? `${(asset.file_size / 1024).toFixed(1)}KB` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-bold">素材がありません</p>
          <p className="text-gray-400 text-sm mt-1">企画ページから素材をアップロードできます</p>
        </div>
      )}
    </div>
  )
}
