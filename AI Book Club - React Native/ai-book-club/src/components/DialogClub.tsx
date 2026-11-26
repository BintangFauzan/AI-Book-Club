import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { DesignColors, Fonts, Type } from '@/constants/theme';

type DialogClubProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
};

const CLUBS = ['The Marginalia Club', 'Quiet Readers', 'New Fiction Circle'];

export function DialogClub({ visible, onClose, onSelect }: DialogClubProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel} accessibilityViewIsModal>
          <Text style={styles.title}>Choose your club</Text>
          <Text style={styles.subtitle}>Switch to a space that fits your reading mood.</Text>
          <View style={styles.list}>
            {CLUBS.map((name) => (
              <Pressable
                key={name}
                style={({ pressed }) => [styles.clubChoice, pressed && styles.pressed]}
                onPress={() => {
                  onSelect(name);
                  onClose();
                }}
                accessibilityRole="button"
              >
                <Text style={styles.clubChoiceText}>{name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.closeRow, pressed && styles.pressed]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7,7,7,0.44)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    backgroundColor: DesignColors.white,
    borderRadius: 22,
    padding: 22,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: DesignColors.ink,
    marginBottom: 10,
  },
  subtitle: {
    ...Type.muted,
    color: DesignColors.muted,
    marginBottom: 18,
  },
  list: {
    gap: 8,
  },
  clubChoice: {
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  clubChoiceText: {
    color: DesignColors.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 18,
  },
  closeRow: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeText: {
    color: DesignColors.brown,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
