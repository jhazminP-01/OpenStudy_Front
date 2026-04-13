import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  // Container centrado para pantallas sin ScrollView (como Login)
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: COLORS.textWhite,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: COLORS.textLight,
  },
  form: {
    width: '100%',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: COLORS.textWhite,
    fontSize: 14,
  },
  // Estilos específicos para Register
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    color: COLORS.textWhite,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
  },
});

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textWhite,
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusActive: {
    color: COLORS.success,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  logoutButton: {
    marginTop: 20,
  },
});

