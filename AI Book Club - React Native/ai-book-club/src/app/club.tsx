import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DesignColors, Fonts, Type } from '@/constants/theme';
import { Avatar } from '@/components/Avatar';
import { BrandHeader } from '@/components/BrandHeader';
import { Tag } from '@/components/Tag';
import { ProgressBar } from '@/components/ProgressBar';
import { DialogClub } from '@/components/DialogClub';
import { Toast } from '@/components/Toast';

export default function ClubScreen() {
  const insets = useSafeAreaInsets();
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [clubName, setClubName] = React.useState('The Marginalia Club');
  const [pollSelected, setPollSelected] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2400);
  };

  const handlePollSelect = (label: string) => {
    setPollSelected(label);
    showToast(`Your vote: ${label} · 18 votes`);
  };

  return (
    <View style={styles.container}>
      <Toast visible={toast.visible} message={toast.message} />
      <DialogClub
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onSelect={(name) => {
          setClubName(name);
          showToast('Club switched');
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll} style={styles.scrollView}>
        <View style={[styles.padding, { paddingTop: insets.top + 8 }]}>
          <BrandHeader onProfile={() => showToast('Profile and reading preferences')} />
          <Text style={styles.eyebrow}>READ TOGETHER</Text>
          <View style={styles.top}>
            <Pressable
              style={styles.clubSwitch}
              onPress={() => setDialogVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Switch club, currently ${clubName}`}
            >
              <Text style={styles.clubSwitchText}>{clubName}⌄</Text>
            </Pressable>
            <Avatar label="8" size={38} />
          </View>

          <Text style={styles.tagline}>A little space for big ideas.</Text>

          <View style={styles.banner}>
            <View style={styles.bannerRow}>
              <View style={styles.bannerTitleWrap}>
                <Text style={styles.eyebrow}>THIS MONTH</Text>
                <Text style={styles.h2}>The Creative Act</Text>
              </View>
              <Tag>4 / 8 reading</Tag>
            </View>
            <View style={styles.progressWrap}>
              <ProgressBar percent={62} />
            </View>
            <Text style={styles.tiny}>Next meetup · Today, 7:30 PM</Text>
          </View>

          <View style={styles.live}>
            <View style={styles.liveTop}>
              <Text style={styles.liveDot}>● LIVE ROOM</Text>
              <Text style={styles.liveMeta}>3 reading now</Text>
            </View>
            <View>
              <Text style={styles.liveTitle}>Quiet reading hour</Text>
              <Text style={styles.liveSub}>Join your club for a little focus.</Text>
            </View>
            <View style={styles.liveRow}>
              <View style={styles.faces}>
                <Avatar label="M" size={36} fontSize={12} style={styles.faceBase} />
                <Avatar label="J" size={36} fontSize={12} style={[styles.faceBase, styles.faceOverlap]} />
                <Avatar label="S" size={36} fontSize={12} style={[styles.faceBase, styles.faceOverlap]} />
              </View>
              <Pressable
                style={({ pressed }) => [styles.joinBtn, pressed && styles.pressed]}
                onPress={() => showToast('Joining live reading room…')}
                accessibilityRole="button"
              >
                <Text style={styles.joinText}>Join call ↗</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.h2}>Discussion</Text>
            <Pressable
              style={styles.viewAll}
              onPress={() => showToast('Opened all discussion posts')}
              accessibilityRole="button"
            >
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.discussion}>
            <Avatar label="M" size={36} fontSize={12} style={styles.discussionFace} />
            <View style={styles.discussionBody}>
              <View style={styles.discussionHeader}>
                <Text style={styles.discussionName}>Maya Chen</Text>
                <Text style={styles.tiny}>· 12 min</Text>
              </View>
              <Text style={styles.discussionText}>
                Which part of your process feels most alive when you stop trying to control the
                outcome?
              </Text>
              <Pressable
                style={styles.replyBtn}
                onPress={() => showToast('Reply box opened')}
                accessibilityRole="button"
              >
                <Text style={styles.linkText}>♡ 6 · Reply</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.poll}>
            <View style={styles.pollHead}>
              <Text style={styles.h2}>Quick poll</Text>
              <Tag>Today</Tag>
            </View>
            <Text style={styles.muted}>Where do your best ideas show up?</Text>
            {['On a walk', 'In a quiet room', 'In conversation'].map((option) => (
              <Pressable
                key={option}
                style={({ pressed }) => [
                  styles.pollOption,
                  pollSelected === option && styles.pollSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => handlePollSelect(option)}
                accessibilityRole="radio"
                accessibilityState={{ checked: pollSelected === option }}
              >
                <Text style={styles.pollOptionText}>{option}</Text>
              </Pressable>
            ))}
            {pollSelected && (
              <Text style={styles.pollResult}>Your vote: {pollSelected} · 18 votes</Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.startWrap, pressed && styles.pressed]}
            onPress={() => showToast('New discussion post composer opened')}
            accessibilityRole="button"
          >
            <Text style={styles.startText}>＋ Start a discussion</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.paper,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 24,
  },
  padding: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eyebrow: {
    ...Type.eyebrow,
    color: DesignColors.muted,
    marginBottom: 6,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    flexShrink: 1,
  },
  clubSwitchText: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    lineHeight: 24,
    color: DesignColors.ink,
  },
  tagline: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  banner: {
    backgroundColor: DesignColors.blue,
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitleWrap: {
    flexShrink: 1,
  },
  h2: {
    ...Type.h2,
    color: DesignColors.ink,
  },
  progressWrap: {
    marginTop: 14,
    marginBottom: 7,
  },
  tiny: {
    ...Type.tiny,
    color: DesignColors.muted,
  },
  live: {
    backgroundColor: '#26383a',
    borderRadius: 20,
    padding: 16,
    minHeight: 170,
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  liveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveDot: {
    color: '#ff986f',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  liveMeta: {
    ...Type.tiny,
    color: '#d8dedc',
  },
  liveTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 26,
    color: '#fff',
    letterSpacing: -0.4,
  },
  liveSub: {
    ...Type.muted,
    color: '#d8dedc',
    marginTop: 5,
  },
  liveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  faces: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faceBase: {
    borderWidth: 2,
    borderColor: '#26383a',
  },
  faceOverlap: {
    marginLeft: -8,
  },
  joinBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 14,
  },
  joinText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    gap: 12,
  },
  viewAll: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: DesignColors.brown,
  },
  discussion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(7,7,7,0.07)',
  },
  discussionFace: {
    borderWidth: 2,
    borderColor: '#26383a',
  },
  discussionBody: {
    flex: 1,
    minWidth: 0,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  discussionName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: DesignColors.ink,
  },
  discussionText: {
    ...Type.muted,
    color: DesignColors.muted,
    marginBottom: 4,
  },
  replyBtn: {
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  poll: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(7,7,7,0.11)',
    borderRadius: 16,
    marginTop: 10,
  },
  pollHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
    gap: 12,
  },
  muted: {
    ...Type.muted,
    color: DesignColors.muted,
  },
  pollOption: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(7,7,7,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 7,
  },
  pollSelected: {
    borderColor: DesignColors.brown,
    backgroundColor: DesignColors.sand,
  },
  pollOptionText: {
    fontSize: 13,
    lineHeight: 17,
    color: DesignColors.ink,
  },
  pollResult: {
    ...Type.tiny,
    color: DesignColors.muted,
    marginTop: 8,
  },
  startWrap: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignColors.ink,
    borderRadius: 14,
    minHeight: 46,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  startText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.7,
  },
});
