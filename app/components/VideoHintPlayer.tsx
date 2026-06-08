import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { API_BASE_URL } from '@/services/apiConfig';

interface VideoHintPlayerProps {
  /** URL видео: абсолютный (https://...) или относительный (/api/media/...). */
  uri: string;
  /** Подпись над плеером. */
  title?: string;
  isDark?: boolean;
}

/** Достраивает относительный URL (/api/media/...) до полного через базовый адрес API. */
function resolveUri(uri: string): string {
  if (/^https?:\/\//i.test(uri)) return uri;
  const base = (API_BASE_URL || '').replace(/\/+$/, '');
  const path = uri.startsWith('/') ? uri : `/${uri}`;
  return `${base}${path}`;
}

const VideoHintPlayer: React.FC<VideoHintPlayerProps> = ({
  uri,
  title = 'Видеоурок',
  isDark = true,
}) => {
  const source = resolveUri(uri);

  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = false;
  });

  // Отслеживаем статус для индикаторов загрузки/ошибки
  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  const isLoading = status === 'loading';
  const isError = status === 'error';

  const labelColor = isDark ? '#9CA3AF' : '#6B7280';
  const cardBg = isDark ? '#000000' : '#0B0B0C';

  return (
    <View style={styles.wrapper}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Ionicons name="play-circle" size={18} color="#F97316" />
        <Text style={[styles.title, { color: labelColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Плеер */}
      <View style={[styles.videoCard, { backgroundColor: cardBg }]}>
        {isError ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={28} color="#9CA3AF" />
            <Text style={styles.errorText}>
              Не удалось загрузить видео
            </Text>
            {!!error?.message && (
              <Text style={styles.errorSub} numberOfLines={2}>
                {error.message}
              </Text>
            )}
          </View>
        ) : (
          <>
            <VideoView
              style={styles.video}
              player={player}
              contentFit="contain"
              nativeControls
              allowsFullscreen
              allowsPictureInPicture
            />
            {isLoading && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color="#F97316" />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    fontFamily: 'SFProDisplayRegular',
  },
  videoCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: '#D1D5DB',
    fontSize: 13,
    marginTop: 8,
    fontFamily: 'SFProDisplayRegular',
  },
  errorSub: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default VideoHintPlayer;
