import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';
import { useGamification } from '@/hooks/useGamification';
import FadeInView from '@/app/components/FadeInView';
import FinGuide from '@/app/components/FinGuide';
import { Motion, Opacity } from '@/constants/design';
import { FINGUIDE_SKINS } from '@/constants/finGuide';
import { ChallengeProgress, LEVELS, LootResult, rollLootbox } from '@/utils/gamification';
import { goBack } from '@/utils/navigation';

type Tab = 'level' | 'challenges' | 'rewards';

const TABS: { key: Tab; label: string }[] = [
  { key: 'level', label: 'Уровень' },
  { key: 'challenges', label: 'Челленджи' },
  { key: 'rewards', label: 'Награды' },
];

/** Геймификация из ТЗ: уровень и опыт, челленджи, сундуки и скины ФинГида. */
const ProgressScreen = () => {
  const router = useRouter();
  const { theme, startChallenge, claimChallenge, applyLootbox, buySkin, setActiveSkin } = useFinancialStore();
  const { xp, level, coins, boxes, challenges, state } = useGamification();
  const [tab, setTab] = useState<Tab>('level');
  const [loot, setLoot] = useState<LootResult | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const trackColor = isDark ? 'bg-white/10' : 'bg-gray-200';
  const iconColor = isDark ? 'white' : '#11181C';

  const openBox = () => {
    const result = rollLootbox(state);
    applyLootbox(result);
    setLoot(result);
  };

  const handleBuy = (id: (typeof FINGUIDE_SKINS)[number]['id'], price: number, name: string) => {
    if (coins.balance < price) {
      Alert.alert('Не хватает монет', `Нужно ${price}, у вас ${coins.balance}. Монеты дают за записи, уровни и челленджи.`);
      return;
    }
    Alert.alert('Купить скин?', `«${name}» за ${price} монет`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Купить', onPress: () => buySkin(id, price) },
    ]);
  };

  const ProgressBar = ({ value, color = '#4CAF50' }: { value: number; color?: string }) => (
    <View className={`h-2 rounded-full overflow-hidden ${trackColor}`}>
      <View className="h-full rounded-full" style={{ width: `${Math.round(Math.min(1, value) * 100)}%`, backgroundColor: color }} />
    </View>
  );

  const renderChallenge = (c: ChallengeProgress, index: number) => {
    const { def, status } = c;
    const statusText =
      status === 'active'
        ? `Осталось ${c.daysLeft} дн.`
        : status === 'completed'
          ? 'Выполнен!'
          : status === 'failed'
            ? 'Не выполнен'
            : status === 'claimed'
              ? 'Награда получена'
              : `${def.days} дн. на выполнение`;
    return (
      <FadeInView key={def.id} delay={index * Motion.stagger}>
        <View className={`${cardBgColor} rounded-2xl p-4 mb-3`} style={status === 'claimed' ? { opacity: Opacity.disabled } : undefined}>
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`${textColor} text-base flex-1 mr-2 font-['SFProDisplaySemiBold']`}>{def.title}</Text>
            <Text className="text-xs text-[#F59E0B] font-['SFProDisplaySemiBold']">
              🪙 {def.coins} · +{def.xp} XP
            </Text>
          </View>
          <Text className={`${textSecondaryColor} text-sm leading-5 mb-3 font-['SFProDisplayRegular']`}>{def.description}</Text>

          {(status === 'active' || status === 'completed' || status === 'failed') && (
            <View className="mb-3">
              <ProgressBar value={c.current / c.target} color={status === 'failed' ? '#EF4444' : '#4CAF50'} />
              <Text className={`${textSecondaryColor} text-sm mt-1 font-['SFProDisplayRegular']`}>
                {c.current} из {c.target} {def.unit} · {statusText}
              </Text>
            </View>
          )}

          {status === 'available' && (
            <TouchableOpacity onPress={() => startChallenge(def.id)} activeOpacity={Opacity.press} className="bg-[#4CAF50] rounded-xl py-2.5 items-center">
              <Text className="text-white text-sm font-['SFProDisplaySemiBold']">Начать · {statusText}</Text>
            </TouchableOpacity>
          )}
          {status === 'completed' && (
            <TouchableOpacity
              onPress={() => claimChallenge(def.id, { coins: def.coins, xp: def.xp })}
              activeOpacity={Opacity.press}
              className="bg-[#F59E0B] rounded-xl py-2.5 items-center"
            >
              <Text className="text-white text-sm font-['SFProDisplaySemiBold']">Забрать награду</Text>
            </TouchableOpacity>
          )}
          {status === 'failed' && (
            <TouchableOpacity onPress={() => startChallenge(def.id)} activeOpacity={Opacity.press} className={`rounded-xl py-2.5 items-center border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>Попробовать снова</Text>
            </TouchableOpacity>
          )}
          {status === 'claimed' && <Text className="text-[#4CAF50] text-sm font-['SFProDisplayRegular']">✓ {statusText}</Text>}
        </View>
      </FadeInView>
    );
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity activeOpacity={Opacity.press} onPress={() => goBack('/main/profile')}>
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className={`${textColor} flex-1 text-center text-lg font-['SFProDisplaySemiBold'] mr-6`}>Мой прогресс</Text>
      </View>

      {/* Шапка: ФинГид, уровень, монеты */}
      <View className="px-4 mb-4 flex-row items-center">
        <FinGuide size={72} mood="happy" />
        <View className="flex-1 ml-3">
          <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold']`}>{level.level.title}</Text>
          <Text className={`${textSecondaryColor} text-sm mb-2 font-['SFProDisplayRegular']`}>
            {level.next ? `${xp.total} / ${level.next.xp} XP до «${level.next.title}»` : `${xp.total} XP — максимальный уровень`}
          </Text>
          <ProgressBar value={level.progress} />
        </View>
        <View className="items-center ml-3">
          <Text className="text-lg font-['SFProDisplayBold'] text-[#F59E0B]">🪙 {coins.balance}</Text>
          <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>монеты</Text>
        </View>
      </View>

      <View className="flex-row px-4 mb-4 gap-2">
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            activeOpacity={Opacity.press}
            className={`flex-1 py-2 rounded-full items-center border ${tab === t.key ? 'bg-[#4CAF50] border-[#4CAF50]' : isDark ? 'border-gray-700' : 'border-gray-300'}`}
          >
            <Text className={`text-sm font-['SFProDisplayRegular'] ${tab === t.key ? 'text-white' : textSecondaryColor}`}>
              {t.label}
              {t.key === 'challenges' && challenges.some((c) => c.status === 'completed') ? ' •' : ''}
              {t.key === 'rewards' && boxes > 0 ? ` (${boxes})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FadeInView key={tab} style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {tab === 'level' && (
            <>
              <Text className={`${textColor} text-base mb-3 font-['SFProDisplaySemiBold']`}>Уровни</Text>
              {LEVELS.map((l) => {
                const reached = xp.total >= l.xp;
                const current = l.index === level.level.index;
                return (
                  <View
                    key={l.title}
                    className={`${cardBgColor} rounded-2xl p-3 mb-2 flex-row items-center`}
                    style={current ? { borderWidth: 2, borderColor: '#4CAF50' } : reached ? undefined : { opacity: Opacity.disabled }}
                  >
                    <Ionicons name={reached ? 'checkmark-circle' : 'lock-closed-outline'} size={20} color={reached ? '#4CAF50' : iconColor} />
                    <View className="flex-1 ml-3">
                      <Text className={`${textColor} text-sm font-['SFProDisplaySemiBold']`}>
                        {l.title} · {l.xp} XP
                      </Text>
                      <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
                        {l.perks} · 🪙 {l.bonusCoins}
                      </Text>
                    </View>
                  </View>
                );
              })}

              <Text className={`${textColor} text-base mt-4 mb-3 font-['SFProDisplaySemiBold']`}>За что начислен опыт</Text>
              <View className={`${cardBgColor} rounded-2xl p-3 mb-6`}>
                {xp.items.length === 0 ? (
                  <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
                    Добавьте первую запись, цель или пройдите тест — опыт начнёт копиться.
                  </Text>
                ) : (
                  xp.items.map((item) => (
                    <View key={item.label} className="flex-row justify-between py-1.5">
                      <Text className={`${textColor} text-sm flex-1 mr-3 font-['SFProDisplayRegular']`}>
                        {item.label} × {item.count}
                      </Text>
                      <Text className="text-sm text-[#4CAF50] font-['SFProDisplaySemiBold']">+{item.xp}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}

          {tab === 'challenges' && (
            <>
              <Text className={`${textSecondaryColor} text-sm mb-3 font-['SFProDisplayRegular']`}>
                Челлендж засчитывается по данным, которые вы вносите после старта.
              </Text>
              {[...challenges]
                .sort((a, b) => ORDER[a.status] - ORDER[b.status])
                .map(renderChallenge)}
              <View className="h-4" />
            </>
          )}

          {tab === 'rewards' && (
            <>
              <View className={`${cardBgColor} rounded-2xl p-4 mb-4 items-center`}>
                <Text className="text-5xl mb-2">🎁</Text>
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>
                  {boxes > 0 ? `Сундуков к открытию: ${boxes}` : 'Сундуков пока нет'}
                </Text>
                <Text className={`${textSecondaryColor} text-sm text-center mt-1 mb-3 font-['SFProDisplayRegular']`}>
                  Сундук выдаётся за каждый новый уровень и выполненный челлендж. Внутри — монеты, скин ФинГида или совет.
                </Text>
                <TouchableOpacity
                  disabled={boxes === 0}
                  onPress={openBox}
                  activeOpacity={Opacity.press}
                  className={`rounded-xl py-2.5 px-8 ${boxes > 0 ? 'bg-[#F59E0B]' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                >
                  <Text className="text-white text-sm font-['SFProDisplaySemiBold']">Открыть</Text>
                </TouchableOpacity>
              </View>

              <Text className={`${textColor} text-base mb-3 font-['SFProDisplaySemiBold']`}>Скины ФинГида</Text>
              <View className="flex-row flex-wrap justify-between mb-6">
                {FINGUIDE_SKINS.map((skin) => {
                  const owned = state.ownedSkins.includes(skin.id);
                  const active = state.activeSkin === skin.id;
                  return (
                    <View
                      key={skin.id}
                      className={`${cardBgColor} w-[48%] rounded-2xl p-3 mb-3 items-center`}
                      style={active ? { borderWidth: 2, borderColor: '#4CAF50' } : undefined}
                    >
                      <FinGuide size={70} skin={skin.id} animated={false} />
                      <Text className={`${textColor} text-sm mt-2 font-['SFProDisplaySemiBold']`}>{skin.name}</Text>
                      <TouchableOpacity
                        disabled={active}
                        onPress={() => (owned ? setActiveSkin(skin.id) : handleBuy(skin.id, skin.price, skin.name))}
                        activeOpacity={Opacity.press}
                        className={`mt-2 rounded-lg px-3 py-1.5 ${active ? '' : owned ? 'bg-[#4CAF50]' : 'bg-[#F59E0B]'}`}
                      >
                        <Text className={`text-sm font-['SFProDisplaySemiBold'] ${active ? 'text-[#4CAF50]' : 'text-white'}`}>
                          {active ? 'Выбран' : owned ? 'Выбрать' : `🪙 ${skin.price}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </FadeInView>

      {/* Результат открытия сундука */}
      <Modal visible={!!loot} transparent animationType="fade" onRequestClose={() => setLoot(null)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-8">
          <View className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-6 items-center w-full`}>
            <FinGuide size={100} mood="celebrate" skin={loot?.kind === 'skin' ? loot.skin : undefined} />
            <Text className={`${textColor} text-lg mt-3 text-center font-['SFProDisplaySemiBold']`}>
              {loot?.kind === 'skin'
                ? `Новый скин: «${FINGUIDE_SKINS.find((s) => s.id === loot.skin)?.name}»`
                : loot?.kind === 'coins'
                  ? `+${loot.coins} монет`
                  : `+${loot?.kind === 'quote' ? loot.coins : 0} монет и совет`}
            </Text>
            {loot?.kind === 'quote' && (
              <Text className={`${textSecondaryColor} text-sm text-center mt-2 italic font-['SFProDisplayRegular']`}>«{loot.quote}»</Text>
            )}
            <TouchableOpacity onPress={() => setLoot(null)} activeOpacity={Opacity.press} className="bg-[#4CAF50] rounded-xl py-3 px-10 mt-5">
              <Text className="text-white text-sm font-['SFProDisplaySemiBold']">Отлично</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ORDER: Record<ChallengeProgress['status'], number> = { completed: 0, active: 1, failed: 2, available: 3, claimed: 4 };

export default ProgressScreen;
