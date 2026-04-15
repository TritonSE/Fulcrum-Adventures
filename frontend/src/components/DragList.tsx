/* eslint-disable react-hooks/refs -- DragList intentionally reads/writes refs during render to maintain stable gesture handlers and animated values */
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useLayoutEffect, useRef, useState } from "react";
import { Animated, PanResponder, ScrollView, View } from "react-native";

type DragListProps<T extends { id: string }> = {
  data: T[];
  onReorder: (data: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  contentContainerStyle?: object;
};

function calcShift(
  index: number,
  activeIndex: number,
  hoverIndex: number,
  itemHeight: number,
): number {
  if (index === activeIndex) return 0;
  if (activeIndex < hoverIndex && index > activeIndex && index <= hoverIndex) return -itemHeight;
  if (activeIndex > hoverIndex && index >= hoverIndex && index < activeIndex) return itemHeight;
  return 0;
}

export function DragList<T extends { id: string }>({
  data,
  onReorder,
  renderItem,
  contentContainerStyle,
}: DragListProps<T>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  const activeIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const itemHeightRef = useRef(90);
  const pendingResetRef = useRef(false);

  // After a reorder, reset all Y values once the new data is committed,
  // before the frame is painted — avoids the "snap to origin then jump" artifact.
  useLayoutEffect(() => {
    if (pendingResetRef.current) {
      pendingResetRef.current = false;
      itemYs.current.forEach((v) => v.setValue(0));
    }
  });

  // Per-item Y animated values — each slot owns its own value.
  // Transform always reads itemYs[index], so it never depends on activeIndex state,
  // meaning re-renders from setActiveIndex can't interrupt the running drag.
  const itemYs = useRef<Animated.Value[]>([]);
  while (itemYs.current.length < data.length) {
    itemYs.current.push(new Animated.Value(0));
  }

  // Stable pan responders — created once per slot, never recreated on re-render.
  // Uses refs for all dynamic values so closures never go stale.
  const panResponders = useRef<ReturnType<typeof PanResponder.create>[]>([]);
  while (panResponders.current.length < data.length) {
    const slot = panResponders.current.length;
    panResponders.current.push(
      PanResponder.create({
        // Only claim the gesture when no slot is already active
        onStartShouldSetPanResponder: () => activeIndexRef.current === null,
        onMoveShouldSetPanResponder: () => activeIndexRef.current === null,
        // Prevent another view from stealing once we've claimed
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          itemYs.current.forEach((v) => v.setValue(0));
          activeIndexRef.current = slot;
          hoverIndexRef.current = slot;
          setActiveIndex(slot);
        },
        onPanResponderMove: (_, g) => {
          if (activeIndexRef.current !== slot) return;
          itemYs.current[slot].setValue(g.dy);
          const raw = slot + Math.round(g.dy / itemHeightRef.current);
          const next = Math.max(0, Math.min(dataRef.current.length - 1, raw));
          if (next !== hoverIndexRef.current) {
            hoverIndexRef.current = next;
            itemYs.current.forEach((v, i) => {
              if (i === slot) return;
              Animated.spring(v, {
                toValue: calcShift(i, slot, next, itemHeightRef.current),
                useNativeDriver: true,
                speed: 40,
                bounciness: 0,
              }).start();
            });
          }
        },
        onPanResponderRelease: () => {
          if (activeIndexRef.current !== slot) return;
          const to = hoverIndexRef.current ?? slot;
          activeIndexRef.current = null;
          hoverIndexRef.current = null;
          setActiveIndex(null);

          if (slot !== to) {
            // Don't reset Ys here — let useLayoutEffect do it after the
            // new data is committed, so there's no snap-to-origin flash.
            pendingResetRef.current = true;
            const next = [...dataRef.current];
            const [moved] = next.splice(slot, 1);
            next.splice(to, 0, moved);
            onReorder(next);
          } else {
            itemYs.current.forEach((v) => v.setValue(0));
          }
        },
      }),
    );
  }

  return (
    <ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      scrollEnabled={activeIndex === null}
    >
      {data.map((item, index) => {
        const isActive = index === activeIndex;
        return (
          <Animated.View
            // eslint-disable-next-line react/no-array-index-key -- intentional: slot-stable keys required for animated value subscriptions
            key={index}
            onLayout={(e) => {
              if (index === 0) itemHeightRef.current = e.nativeEvent.layout.height;
            }}
            style={{
              transform: [{ translateY: itemYs.current[index] }],
              zIndex: isActive ? 999 : 0,
              elevation: isActive ? 6 : 0,
              shadowColor: "#000",
              shadowOpacity: isActive ? 0.15 : 0,
              shadowRadius: isActive ? 6 : 0,
              shadowOffset: { width: 0, height: 3 },
              opacity: isActive ? 0.95 : 1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                {...panResponders.current[index].panHandlers}
                style={{ paddingHorizontal: 8, paddingVertical: 12 }}
              >
                <Ionicons name="reorder-three-outline" size={22} color="#888" />
              </View>
              <View style={{ flex: 1 }}>{renderItem(item)}</View>
            </View>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
