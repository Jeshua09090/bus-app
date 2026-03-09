import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Colors ──
const ActiveEmerald = '#00E5A0';
const GlassTint = 'rgba(13, 16, 34, 0.55)';
const InactiveWhite = 'rgba(255, 255, 255, 0.4)';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OUTLINED_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: 'search-outline',
    explore: 'map-outline',
    profile: 'person-outline',
};
const FILLED_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: 'search',
    explore: 'map',
    profile: 'person',
};

// ── Tab Item ──
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabItem({
    isFocused,
    label,
    routeName,
    onPress,
}: {
    isFocused: boolean;
    label: string;
    routeName: string;
    onPress: () => void;
}) {
    // No exaggerated bounce — just color/icon swap
    const colorProgress = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        colorProgress.value = withTiming(isFocused ? 1 : 0, { duration: 150 });
    }, [isFocused]);

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            colorProgress.value,
            [0, 1],
            [InactiveWhite, ActiveEmerald],
        ),
    }));

    const iconOutlined = OUTLINED_ICONS[routeName] || 'ellipse-outline';
    const iconFilled = FILLED_ICONS[routeName] || 'ellipse';

    return (
        <AnimatedPressable
            onPress={() => {
                if (Platform.OS === 'ios') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onPress();
            }}
            style={styles.tab}
            hitSlop={10}
        >
            <Ionicons
                name={isFocused ? iconFilled : iconOutlined}
                size={24}
                color={isFocused ? ActiveEmerald : InactiveWhite}
            />
            <Animated.Text
                style={[
                    styles.label,
                    animatedTextStyle,
                    isFocused && { fontWeight: '600', letterSpacing: 0.3 },
                ]}
                numberOfLines={1}
            >
                {label}
            </Animated.Text>
        </AnimatedPressable>
    );
}

// ── Main Tab Bar ──
export function FloatingTabBar({
    state,
    descriptors,
    navigation,
}: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const tabsCount = state.routes.length;
    const tabWidth = SCREEN_WIDTH / tabsCount;

    // Spring-animated pill offset
    const indicatorOffset = useSharedValue(state.index);

    useEffect(() => {
        indicatorOffset.value = withSpring(state.index, {
            damping: 25,   // Higher damping = less bounce/overshoot
            stiffness: 300, // Higher stiffness = moves faster
            mass: 0.8,      // Lower mass = snappier start/stop
        });
    }, [state.index]);

    const animatedPillContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorOffset.value * tabWidth }],
        width: tabWidth,
    }));

    const baseHeight = 72;
    const totalHeight = baseHeight + insets.bottom;

    return (
        <View style={[styles.barContainer, { height: totalHeight }]}>
            {/* ── Glass Background ── */}
            <View style={[StyleSheet.absoluteFill, styles.clipTopRounds]}>
                <BlurView
                    tint="dark"
                    intensity={100}
                    experimentalBlurMethod="dimezisBlurView"
                    style={StyleSheet.absoluteFill}
                />
                <View
                    style={[StyleSheet.absoluteFill, { backgroundColor: GlassTint }]}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.25)']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* ── Top Rim Light ── */}
            <LinearGradient
                colors={[
                    'transparent',
                    'rgba(0, 229, 160, 0.38)',
                    'transparent',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topRimLight}
            />

            {/* ── Sliding Pill ── */}
            <Animated.View
                style={[styles.pillSystemContainer, animatedPillContainerStyle]}
            >
                <View style={styles.pillCentering}>
                    <Animated.View style={styles.pill} />
                </View>
            </Animated.View>

            {/* ── Tab Items ── */}
            <View style={styles.tabRow}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const label =
                        typeof options.tabBarLabel === 'string'
                            ? options.tabBarLabel
                            : options.title ?? route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    return (
                        <TabItem
                            key={route.key}
                            isFocused={isFocused}
                            label={label}
                            routeName={route.name}
                            onPress={onPress}
                        />
                    );
                })}
            </View>
        </View>
    );
}

// ── Styles ──
const styles = StyleSheet.create({
    barContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        elevation: 0,
    },
    clipTopRounds: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    topRimLight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1.5,
        zIndex: 2,
    },
    pillSystemContainer: {
        position: 'absolute',
        top: 0,
        height: 72, // Only the interactive area, not the safe area padding
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    pillCentering: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // ── THE PILL: wide flat capsule, NOT a circle ──
    pill: {
        width: 90,   // wider than tall = horizontal capsule
        height: 40,  // shorter = flat
        borderRadius: 20, // exactly height/2 = perfect capsule ends
        backgroundColor: 'rgba(0, 229, 160, 0.13)',
        borderWidth: 1,
        borderColor: 'rgba(0, 229, 160, 0.25)',
    },
    tabRow: {
        flex: 1,
        flexDirection: 'row',
        zIndex: 1,
    },
    tab: {
        flex: 1,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    label: {
        fontSize: 10,
        marginTop: 3,
        fontWeight: '400',
    },
});
