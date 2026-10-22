import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

/**
 * Fade + slide-up entrance. Use `delay` to stagger items one after another.
 */
export function FadeSlideIn({
  children,
  delay = 0,
  distance = 18,
  duration = 520,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Soft zoom-in with a little spring (used for the photo).
 */
export function ZoomIn({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(v, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Button with a spring press effect. Drop-in replacement for TouchableOpacity
 * on full-width buttons: `style` goes to the pressable itself.
 */
export function PressableScale({
  children,
  style,
  onPress,
  disabled,
  scaleTo = 0.96,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  activeOpacity?: number; // accepted so old props don't break, ignored
}) {
  const s = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) =>
    Animated.spring(s, { toValue: value, speed: 40, bounciness: 6, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ alignSelf: 'stretch', transform: [{ scale: s }] }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => animateTo(scaleTo)}
        onPressOut={() => animateTo(1)}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Slow "breathing" loop (gentle scale + opacity). Fills its parent, ignores touches.
 */
export function Breathe({
  children,
  duration = 3200,
}: {
  children: React.ReactNode;
  duration?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.06] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}