import { useState, useRef } from 'react';
import { Undo2, Check, User } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';
import type { BuildingItem } from '@/types';
import { cn, formatRelativeTime } from '@/lib/utils';

const CATEGORY_INFO = {
  decoration: { name: '装饰物', icon: '🎨', color: 'text-neon-cyan' },
  landmark: { name: '地标', icon: '🏛️', color: 'text-gold-yellow' },
  functional: { name: '功能设施', icon: '⚙️', color: 'text-starlight-light' },
};

export default function Build() {
  const { buildings, materials, consumeMaterials, unlockBuilding, placeBuilding, moveBuilding, undoBuilding, confirmBuilding } = useGameStore();
  const { players } = usePlayerStore();
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'decoration' | 'landmark' | 'functional'>('all');
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [draggingBuilding, setDraggingBuilding] = useState<BuildingItem | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredBuildings = activeCategory === 'all'
    ? buildings
    : buildings.filter(b => b.category === activeCategory);

  const placedBuildings = buildings.filter(b => b.placed);

  const getPlacedByPlayer = (building: BuildingItem) => {
    if (!building.placedBy) return null;
    return players.find(p => p.id === building.placedBy) || null;
  };

  const canCraft = (building: BuildingItem) => {
    if (!building.recipe) return building.unlocked;
    return building.recipe.every(r => {
      const material = materials.find(m => m.id === r.itemId);
      return material && material.count >= r.count;
    });
  };

  const handleCraft = (building: BuildingItem) => {
    if (!building.recipe || building.unlocked) return;
    if (!canCraft(building)) return;
    if (consumeMaterials(building.recipe)) {
      unlockBuilding(building.id);
    }
  };

  const handlePlace = (building: BuildingItem, x: number, y: number) => {
    if (!building.unlocked || building.placed) return;
    placeBuilding(building.id, x, y);
    setSelectedBuilding(null);
    setMousePos(null);
  };

  const isPlacingMode = selectedBuilding && selectedBuilding.unlocked && !selectedBuilding.placed;
  const isDraggingMode = !!draggingBuilding;

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((!isPlacingMode && !isDraggingMode) || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isDraggingMode && draggingBuilding) {
      moveBuilding(draggingBuilding.id, x, y);
      setDraggingBuilding(null);
      setMousePos(null);
      return;
    }

    if (!isPlacingMode || !selectedBuilding) return;
    handlePlace(selectedBuilding, x, y);
  };

  const handlePreviewMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div>
        <h1 className="section-title">建造区</h1>
        <p className="text-white/60 ml-4">收集材料，合成道具，打造专属团队岛屿</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-64 glass-panel p-4 flex flex-col gap-4">
          <div>
            <h3 className="title-font text-lg text-white mb-3">道具栏</h3>
            <div className="flex flex-wrap gap-1 mb-4">
              {(['all', 'decoration', 'landmark', 'functional'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg transition-all',
                    activeCategory === cat
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  {cat === 'all' ? '全部' : CATEGORY_INFO[cat].icon + ' ' + CATEGORY_INFO[cat].name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
            {filteredBuildings.map(building => {
              const catInfo = CATEGORY_INFO[building.category];
              const isSelected = selectedBuilding?.id === building.id;

              return (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuilding(building)}
                  className={cn(
                    'w-full p-3 rounded-xl text-left transition-all border',
                    isSelected
                      ? 'bg-neon-cyan/15 border-neon-cyan/50 shadow-lg shadow-neon-cyan/10'
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10',
                    !building.unlocked && !canCraft(building) && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                      building.unlocked
                        ? 'bg-gradient-to-br from-white/15 to-white/5'
                        : 'bg-ocean-dark'
                    )}>
                      {building.unlocked ? building.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{building.name}</span>
                        {building.placed && (
                          <span className={cn(
                            'text-xs',
                            building.confirmed ? 'text-aurora-green' : 'text-gold-yellow'
                          )}>
                            {building.confirmed ? '✓已确认' : '●待确认'}
                          </span>
                        )}
                      </div>
                      <span className={cn('text-xs', catInfo.color)}>{catInfo.name}</span>
                      {building.placedBy && building.placedAt && (() => {
                        const placer = getPlacedByPlayer(building);
                        return (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-white/50">
                            {placer?.avatarEmoji}
                            <span>{placer?.name || '未知'}</span>
                            <span>· {formatRelativeTime(building.placedAt)}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 glass-panel p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="title-font text-lg text-white">岛屿预览</h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>已放置</span>
              <span className="text-neon-cyan font-bold">{placedBuildings.length}</span>
              <span>/ {buildings.length}</span>
            </div>
          </div>

          <div 
            ref={previewRef}
            className={cn(
              'flex-1 relative rounded-xl overflow-hidden bg-gradient-to-br from-ocean-dark via-ocean-mid to-deep-ocean transition-all',
              (isPlacingMode || isDraggingMode) && 'cursor-crosshair'
            )}
            onMouseMove={handlePreviewMouseMove}
            onClick={handlePreviewClick}
            onMouseLeave={handlePreviewMouseLeave}
          >
            <div className="absolute inset-0 bg-stars opacity-40" />
            <div className="absolute inset-0 bg-aurora opacity-30 animate-aurora" />
            
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-emerald-900/40 via-teal-800/30 to-cyan-900/40 border border-white/10 shadow-2xl">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-800/30 via-green-700/20 to-teal-800/30" />
            </div>

            {placedBuildings.map(building => (
              <div
                key={building.id}
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce-in',
                  draggingBuilding?.id === building.id && 'opacity-30'
                )}
                style={{
                  left: `${building.position?.x ?? 50}%`,
                  top: `${building.position?.y ?? 50}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedBuilding && selectedBuilding.placed && selectedBuilding.id === building.id) {
                    setDraggingBuilding(building);
                  }
                }}
              >
                <div className="relative group">
                  <div className={cn(
                    'w-14 h-14 rounded-xl backdrop-blur-md border flex items-center justify-center text-3xl shadow-lg hover:scale-110 transition-transform cursor-pointer',
                    selectedBuilding?.id === building.id
                      ? 'bg-gradient-to-br from-neon-cyan/30 to-aurora-green/30 border-neon-cyan/50'
                      : 'bg-gradient-to-br from-white/20 to-white/5 border-white/20'
                  )}>
                    {building.icon}
                  </div>
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {building.name}
                  </div>
                </div>
              </div>
            ))}

            {(isPlacingMode || isDraggingMode) && mousePos && (
              <>
                <div
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                  }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-aurora-green/30 backdrop-blur-md border-2 border-neon-cyan/60 flex items-center justify-center text-3xl shadow-lg"
                    style={{ boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)' }}
                  >
                    {(isPlacingMode ? selectedBuilding : draggingBuilding)?.icon}
                  </div>
                </div>
                <div
                  className="absolute pointer-events-none w-8 h-8 -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-neon-cyan/80" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-neon-cyan/80" />
                  </div>
                </div>
              </>
            )}

            {isPlacingMode && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-5 py-2.5 flex items-center gap-2 z-10"
                style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)' }}
              >
                <span className="text-xl">🎯</span>
                <span className="text-neon-cyan font-medium">点击岛屿上的位置来放置 {selectedBuilding.name}</span>
              </div>
            )}

            {isDraggingMode && draggingBuilding && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-5 py-2.5 flex items-center gap-2 z-10"
                style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)' }}
              >
                <span className="text-xl">↔️</span>
                <span className="text-neon-cyan font-medium">拖动「{draggingBuilding.name}」中 - 点击确定新位置</span>
              </div>
            )}

            {selectedBuilding && !selectedBuilding.placed && selectedBuilding.unlocked && !isPlacingMode && null}
          </div>
        </div>

        <div className="w-72 glass-panel p-4 flex flex-col gap-4">
          <div>
            <h3 className="title-font text-lg text-white mb-3">材料库存</h3>
            <div className="grid grid-cols-3 gap-2">
              {materials.map(mat => (
                <div
                  key={mat.id}
                  className="glass-panel p-2 text-center"
                >
                  <div className="text-2xl">{mat.icon}</div>
                  <div className="text-xs text-white/60 mt-1">{mat.name}</div>
                  <div className="text-neon-cyan font-bold">{mat.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="title-font text-lg text-white mb-3">合成配方</h3>
            
            {selectedBuilding ? (
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
                <div className="glass-panel p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0',
                      selectedBuilding.unlocked
                        ? 'bg-gradient-to-br from-white/15 to-white/5'
                        : 'bg-ocean-dark'
                    )}>
                      {selectedBuilding.unlocked ? selectedBuilding.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-base">{selectedBuilding.name}</span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          selectedBuilding.category === 'decoration' && 'bg-neon-cyan/20 text-neon-cyan',
                          selectedBuilding.category === 'landmark' && 'bg-gold-yellow/20 text-gold-yellow',
                          selectedBuilding.category === 'functional' && 'bg-starlight-light/20 text-starlight-light'
                        )}>
                          {CATEGORY_INFO[selectedBuilding.category].icon} {CATEGORY_INFO[selectedBuilding.category].name}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mt-1">{selectedBuilding.description}</p>
                    </div>
                  </div>

                  {selectedBuilding.placed && selectedBuilding.position && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>📍</span>
                        <span>位置坐标：{selectedBuilding.position.x.toFixed(1)}%, {selectedBuilding.position.y.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}

                  {selectedBuilding.placedBy && selectedBuilding.placedAt && (() => {
                    const placer = getPlacedByPlayer(selectedBuilding);
                    return (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                            style={{ backgroundColor: placer?.color || '#666' }}
                          >
                            {placer?.avatarEmoji || <User size={12} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-sm text-white/80">
                              <User size={12} />
                              <span>由 {placer?.name || '未知玩家'} 放置</span>
                            </div>
                            <div className="text-xs text-white/50 mt-0.5">
                              放置于 {formatRelativeTime(selectedBuilding.placedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {selectedBuilding.placed && selectedBuilding.confirmed && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1.5 text-aurora-green text-sm">
                        <Check size={16} />
                        <span className="font-medium">已确认</span>
                      </div>
                    </div>
                  )}

                  {selectedBuilding.placed && !selectedBuilding.confirmed && (
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="text-xs text-gold-yellow flex items-center gap-1">
                        <span>⚠️</span>
                        <span>该建筑尚未确认，可撤回或确认</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            confirmBuilding(selectedBuilding.id);
                            const updated = buildings.find(b => b.id === selectedBuilding.id);
                            if (updated) setSelectedBuilding({ ...updated, confirmed: true });
                          }}
                          className="flex-1 py-2.5 rounded-xl font-semibold transition-all bg-aurora-green/20 text-aurora-green border border-aurora-green/40 hover:bg-aurora-green/30 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <Check size={16} />
                          确认放置
                        </button>
                        <button
                          onClick={() => {
                            undoBuilding(selectedBuilding.id);
                            setSelectedBuilding(null);
                          }}
                          className="flex-1 py-2.5 rounded-xl font-semibold transition-all bg-coral-orange/20 text-coral-orange border border-coral-orange/40 hover:bg-coral-orange/30 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                        >
                          <Undo2 size={16} />
                          撤回放置
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedBuilding.recipe && !selectedBuilding.unlocked && (
                  <div className="space-y-2">
                    <div className="text-sm text-white/80 font-medium">所需材料：</div>
                    {selectedBuilding.recipe.map(r => {
                      const material = materials.find(m => m.id === r.itemId);
                      const hasEnough = material && material.count >= r.count;
                      return (
                        <div
                          key={r.itemId}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg',
                            hasEnough ? 'bg-aurora-green/10' : 'bg-coral-orange/10'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{material?.icon}</span>
                            <span className="text-white/80 text-sm">{material?.name}</span>
                          </div>
                          <span className={cn(
                            'font-bold text-sm',
                            hasEnough ? 'text-aurora-green' : 'text-coral-orange'
                          )}>
                            {material?.count ?? 0} / {r.count}
                          </span>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => handleCraft(selectedBuilding)}
                      disabled={!canCraft(selectedBuilding)}
                      className={cn(
                        'w-full py-3 rounded-xl font-semibold transition-all',
                        canCraft(selectedBuilding)
                          ? 'bg-gradient-to-r from-neon-cyan to-starlight-purple text-white hover:shadow-lg hover:shadow-neon-cyan/30 active:scale-[0.98]'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                      )}
                    >
                      {canCraft(selectedBuilding) ? '🔨 合成' : '材料不足'}
                    </button>
                  </div>
                )}

                {selectedBuilding.unlocked && !selectedBuilding.placed && (
                  <div className="glass-panel p-3 text-center">
                    <p className="text-neon-cyan text-sm font-medium">🏗️ 放置模式已激活</p>
                    <p className="text-xs text-white/60 mt-1">在左侧岛屿预览区域点击任意位置放置建筑</p>
                  </div>
                )}

                {selectedBuilding.placed && (
                  <div className="glass-panel p-3 text-center">
                    <p className="text-white/70 text-xs">💡 选中该建筑后，在预览区点击建筑图标可拖动位置</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/40 text-sm text-center p-4">
                选择左侧道具栏中的物品<br />查看详细信息和合成配方
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
