import { useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { BuildingItem } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORY_INFO = {
  decoration: { name: '装饰物', icon: '🎨', color: 'text-neon-cyan' },
  landmark: { name: '地标', icon: '🏛️', color: 'text-gold-yellow' },
  functional: { name: '功能设施', icon: '⚙️', color: 'text-starlight-light' },
};

export default function Build() {
  const { buildings, materials, consumeMaterials, unlockBuilding, placeBuilding } = useGameStore();
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'decoration' | 'landmark' | 'functional'>('all');
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredBuildings = activeCategory === 'all'
    ? buildings
    : buildings.filter(b => b.category === activeCategory);

  const placedBuildings = buildings.filter(b => b.placed);

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

  const handlePreviewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingMode || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingMode || !previewRef.current || !selectedBuilding) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
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
                          <span className="text-xs text-aurora-green">✓已放置</span>
                        )}
                      </div>
                      <span className={cn('text-xs', catInfo.color)}>{catInfo.name}</span>
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
              isPlacingMode && 'cursor-crosshair'
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
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce-in"
                style={{
                  left: `${building.position?.x ?? 50}%`,
                  top: `${building.position?.y ?? 50}%`,
                }}
              >
                <div className="relative group">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    {building.icon}
                  </div>
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {building.name}
                  </div>
                </div>
              </div>
            ))}

            {isPlacingMode && mousePos && (
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
                    {selectedBuilding.icon}
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
                <div className="glass-panel p-4 text-center">
                  <div className="text-4xl mb-2">
                    {selectedBuilding.unlocked ? selectedBuilding.icon : '🔒'}
                  </div>
                  <div className="text-white font-semibold">{selectedBuilding.name}</div>
                  <div className="text-sm text-white/60 mt-1">{selectedBuilding.description}</div>
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
                  <div className="text-center py-3 text-aurora-green">
                    ✓ 该建筑已放置在岛屿上
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
