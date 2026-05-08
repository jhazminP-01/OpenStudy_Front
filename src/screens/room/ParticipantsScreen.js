import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';
import { roomsService } from '../../services/rooms';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

const ParticipantsScreen = ({ route }) => {
  const { roomId } = route.params;
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const loadParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await roomsService.getParticipants(roomId);
      if (error) {
        console.error('Error loading participants:', error);
      } else {
        setParticipants(data || []);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadParticipants();

    // Usar timestamp para nombre único y evitar conflictos
    const timestamp = Date.now();
    const channelName = `participacion:sala_id=eq.${roomId}:${timestamp}`;

    try {
      // Crear nuevo canal con nombre único
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: user?.id }
        }
      });
      
      // Configurar listeners ANTES de subscribe
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participacion',
        filter: `sala_id=eq.${roomId}`
      }, (payload) => {
        loadParticipants();
      });
      
      // Suscribir después de configurar listeners
      channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Channel subscription error');
        }
      });
      
      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomId]);

  const renderParticipant = ({ item }) => {
    const isModerator = item.rol === 'moderador';
    const isCurrentUser = item.usuario_id === user?.id;

    return (
      <View style={styles.participantCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, styles.avatarOnline]}>
            <Text style={styles.avatarText}>
              {item.nombre_completo?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.onlineIndicator} />
        </View>

        <View style={styles.participantInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.participantName}>
              {item.nombre_completo || 'Usuario'}
            </Text>
            {isCurrentUser && (
              <Text style={styles.youBadge}> (Tú)</Text>
            )}
          </View>
          <View style={styles.badgesRow}>
            {isModerator && (
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.accent} />
                <Text style={styles.roleBadgeText}>Moderador</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={participants}
        renderItem={renderParticipant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={COLORS.textRoomsMuted} />
            <Text style={styles.emptyText}>No hay participantes</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: {
    padding: SPACING.md,
  },

  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  avatarContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.success,
  },

  avatarText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textWhite,
    fontSize: 18,
  },

  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },

  participantInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  participantName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    fontWeight: '600',
    fontSize: 16,
  },

  youBadge: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
    fontWeight: '600',
    marginLeft: 4,
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },

  roleBadgeText: {
    ...TYPOGRAPHY.small,
    color: COLORS.success,
    fontWeight: '600',
    fontSize: 11,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },

  statusOnline: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },

  statusOffline: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textRoomsTertiary,
  },

  statusDotOnline: {
    backgroundColor: COLORS.success,
  },

  statusText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textRoomsTertiary,
    fontSize: 11,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default ParticipantsScreen;
