import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles';

export default StyleSheet.create({
  // Contenedor principal del chat
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Lista de mensajes
  messageList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },

  messageListContent: {
    paddingVertical: SPACING.md,
  },

  // Contenedor de mensaje (propio vs otros)
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },

  messageContainerOwn: {
    justifyContent: 'flex-end',
  },

  messageContainerOther: {
    justifyContent: 'flex-start',
  },

  // Avatar del remitente
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundRoomsMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },

  avatarText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textWhite,
    fontWeight: '600',
  },

  // Burbuja de mensaje
  messageBubble: {
    maxWidth: '75%',
    minWidth: 60,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.borderRadius.lg,
    flexDirection: 'column',
  },

  messageBubbleOwn: {
    backgroundColor: COLORS.buttonPurple,
    borderBottomRightRadius: 4,
  },

  messageBubbleOther: {
    backgroundColor: COLORS.backgroundRoomsMedium,
    borderBottomLeftRadius: 4,
  },

  // Nombre del remitente (solo para mensajes de otros)
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(167, 139, 250, 0.9)',
    marginBottom: 2,
  },

  // Contenido del mensaje
  messageText: {
    color: COLORS.textWhite,
    fontSize: 15,
    lineHeight: 22,
  },

  // Timestamp del mensaje
  messageTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textRoomsTertiary,
    marginTop: 2,
    alignSelf: 'flex-end',
  },

  // Indicador de mensaje censurado
  censoredLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.error,
    fontStyle: 'italic',
    marginLeft: 4,
  },

  // Separador de fecha
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },

  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  dateSeparatorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
    marginHorizontal: SPACING.md,
  },

  // Input de mensaje
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(7, 0, 22, 0.5)',
  },

  input: {
    flex: 1,
    backgroundColor: COLORS.backgroundRoomsMedium,
    borderRadius: SPACING.borderRadius.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textWhite,
    ...TYPOGRAPHY.body,
    maxHeight: 100,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.buttonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  // Indicador de "escribiendo..."
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },

  typingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textRoomsTertiary,
    fontStyle: 'italic',
    marginLeft: SPACING.xs,
  },

  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textRoomsTertiary,
    marginHorizontal: 2,
  },

  // Estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textRoomsTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Indicador de mensaje no enviado (error)
  errorIcon: {
    marginLeft: 4,
  },

  // Contenedor de metadatos del mensaje (hora, editado)
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
});
