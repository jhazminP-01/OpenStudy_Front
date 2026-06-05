import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../styles';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.rooms.paddingX,
  },

  screenCenter: {
    flex: 1,
    alignItems: 'center',
  },

  listWrapper: {
    width: '100%',
  },

  listContent: {
    paddingTop: SPACING.rooms.paddingTop,
    paddingHorizontal: SPACING.rooms.paddingX,
    paddingBottom: SPACING.rooms.paddingBottom,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomLarge,
    gap: SPACING.rooms.gapMedium,
    paddingBottom: SPACING.rooms.marginBottomLarge,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderRoomsLight,
  },

  headerTextBox: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    ...TYPOGRAPHY.rooms.title,
    color: COLORS.textWhite,
    marginBottom: 0,
    flexShrink: 1,
  },

  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsSecondary,
    flexShrink: 1,
    lineHeight: 20,
  },

  notificationButton: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
  },

  searchInput: {
    backgroundColor: COLORS.backgroundRoomsLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 44,
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
  },

  filtersContainer: {
    paddingBottom: SPACING.rooms.marginBottomLarge,
  },

  filterChip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.borderRoomsExtra,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    marginRight: 10,
  },

  filterChipSelected: {
    backgroundColor: COLORS.filterChipSelected,
    borderColor: COLORS.filterChipSelected,
  },

  filterChipText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },

  advancedFilterButton: {
    width: 44,
    height: 44,
    borderRadius: SPACING.borderRadius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  advancedFilterButtonText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.rooms.marginBottomMedium,
    gap: SPACING.rooms.gapMedium,
  },

  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.successIconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  sectionTitle: {
    ...TYPOGRAPHY.rooms.sectionTitle,
    color: COLORS.textWhite,
    flexShrink: 1,
  },

  sectionCount: {
    ...TYPOGRAPHY.rooms.badge,
    color: COLORS.textRoomsAccent,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  // Card styles
  card: {
    backgroundColor: COLORS.cardRoomsBackground,
    borderRadius: SPACING.borderRadiusRooms.card,
    padding: 16,
    marginBottom: SPACING.rooms.marginBottomMedium,
    borderWidth: 1,
    borderColor: COLORS.borderRoomsLight,
    overflow: 'hidden',
  },

  cardHeaderRow: {
    flexDirection: 'row',
    marginBottom: SPACING.rooms.marginBottomMedium,
  },

  iconBox: {
    width: 78,
    height: 78,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  iconProgramming: {
    backgroundColor: COLORS.iconProgrammingBg,
  },

  iconMath: {
    backgroundColor: COLORS.iconMathBg,
  },

  iconPhysics: {
    backgroundColor: COLORS.iconPhysicsBg,
  },

  iconLanguage: {
    backgroundColor: COLORS.iconLanguageBg,
  },

  iconChemistry: {
    backgroundColor: 'rgba(245,158,11,0.15)',
  },

  iconHistory: {
    backgroundColor: 'rgba(146,64,14,0.15)',
  },

  iconBiology: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },

  iconEconomics: {
    backgroundColor: 'rgba(251,191,36,0.15)',
  },

  iconDatabase: {
    backgroundColor: 'rgba(139,92,246,0.15)',
  },

  iconDefault: {
    backgroundColor: COLORS.iconDefaultBg,
  },

  cardContent: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.rooms.marginBottomSmall,
    alignItems: 'center',
    gap: SPACING.rooms.gapMedium,
  },

  categoryBadge: {
    backgroundColor: COLORS.successIconBg,
    color: COLORS.textRoomsTertiary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    ...TYPOGRAPHY.rooms.badge,
    fontWeight: '700',
    overflow: 'hidden',
    flexShrink: 1,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },

  statusActive: {
    backgroundColor: COLORS.statusActiveBg,
  },

  statusPaused: {
    backgroundColor: COLORS.statusPausedBg,
  },

  statusText: {
    ...TYPOGRAPHY.rooms.badge,
    fontWeight: '700',
  },

  statusActiveText: {
    color: COLORS.statusActive,
  },

  statusPausedText: {
    color: COLORS.statusPaused,
  },

  roomTitle: {
    ...TYPOGRAPHY.rooms.cardTitle,
    color: COLORS.textWhite,
    marginBottom: SPACING.rooms.marginBottomSmall,
  },

  roomDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    lineHeight: 21,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.rooms.marginBottomMedium,
    paddingTop: 4,
    gap: SPACING.rooms.gapMedium,
    flexWrap: 'wrap',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  infoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsMuted,
    flexShrink: 1,
  },

  enterButton: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },

  buttonPurple: {
    backgroundColor: COLORS.buttonPurple,
  },

  buttonGreen: {
    backgroundColor: COLORS.buttonGreen,
  },

  buttonBlue: {
    backgroundColor: COLORS.buttonBlue,
  },

  buttonPink: {
    backgroundColor: COLORS.buttonPink,
  },

  buttonOrange: {
    backgroundColor: COLORS.subjects.quimica,
  },

  buttonBrown: {
    backgroundColor: COLORS.subjects.historia,
  },

  buttonYellow: {
    backgroundColor: COLORS.subjects.economia,
  },

  buttonGray: {
    backgroundColor: COLORS.subjects.otros,
  },

  enterButtonText: {
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },

  enterButtonDisabled: {
    opacity: 0.5,
  },

  fullCapacityText: {
    color: COLORS.error,
  },

  createRoomButtonWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 100,
  },

  createRoomButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  joinByCodeButtonWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 170,
    zIndex: 100,
  },

  joinByCodeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowRooms,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  errorText: {
    color: COLORS.textRoomsError,
    textAlign: 'center',
    marginTop: SPACING.rooms.marginBottomLarge,
    marginBottom: SPACING.rooms.marginBottomLarge,
  },

  emptyText: {
    color: COLORS.textRoomsSecondary,
    textAlign: 'center',
    marginTop: SPACING.rooms.marginBottomLarge,
    marginBottom: SPACING.rooms.marginBottomLarge,
    ...TYPOGRAPHY.body,
  },
});
