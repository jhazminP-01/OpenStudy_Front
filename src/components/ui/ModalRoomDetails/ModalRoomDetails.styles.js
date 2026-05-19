import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles';

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    flexShrink: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },

  modalGradient: {
    flexShrink: 1,
    borderRadius: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  scrollView: {
    flexShrink: 1,
    flexGrow: 0,
    paddingHorizontal: SPACING.lg,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },

  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    marginTop: SPACING.sm,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },

  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  roomInfo: {
    paddingVertical: SPACING.sm,
  },

  roomName: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  roomDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textWhite,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    opacity: 0.9,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
  },

  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
  },

  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
  },

  purpleBadge: {
    backgroundColor: '#8B5CF6',
  },

  yellowBadge: {
    backgroundColor: '#FACC15',
  },

  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  badgeTextBold: {
    fontWeight: '700',
  },

  statusActive: {
    backgroundColor: COLORS.success,
  },

  statusInactive: {
    backgroundColor: COLORS.textRoomsTertiary,
  },

  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },

  statusActiveText: {
    color: COLORS.textWhite,
  },

  statusInactiveText: {
    color: COLORS.textWhite,
  },

  fullBadgeCentered: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius.full,
    backgroundColor: COLORS.error,
    marginTop: SPACING.sm,
  },

  fullText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  section: {
    paddingVertical: SPACING.lg,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
  },

  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.borderRadius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    width: '100%',
  },

  sectionTitle: {
    ...TYPOGRAPHY.rooms.sectionTitle,
    color: COLORS.textWhite,
    marginBottom: SPACING.sm,
  },

  participantsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
  },

  noParticipantsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  placeholderText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    fontStyle: 'italic',
  },

  actionSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderRoomsLight,
  },

  joinButton: {
    borderRadius: SPACING.borderRadius.lg,
    overflow: 'hidden',
  },

  joinButtonDisabled: {
    opacity: 0.6,
  },

  joinButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  joinButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  // Estilos para participantes
  avatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },

  participantAvatar: {
    position: 'relative',
    marginRight: -8,
  },

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },

  defaultAvatarSmall: {
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },

  crownSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a2e',
  },

  moreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },

  moreText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
    fontWeight: '600',
  },
});
