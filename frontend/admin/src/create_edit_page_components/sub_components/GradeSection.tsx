import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

import type { LayoutChangeEvent, PanResponderInstance } from "react-native";

const GRADE_OPTIONS = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const HANDLE_SIZE = 22;
const TRACK_HEIGHT = 6;

type GradeSectionProps = {
  minValue: string;
  maxValue: string;
  onChange: (minValue: string, maxValue: string) => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getIndexFromLabel = (label: string) => {
  const index = GRADE_OPTIONS.indexOf(label);
  return index >= 0 ? index : 0;
};

const getLabelFromIndex = (index: number) => GRADE_OPTIONS[index] ?? "K";

export const GradeSection: React.FC<GradeSectionProps> = ({ minValue, maxValue, onChange }) => {
  const [railWidth, setRailWidth] = useState(0);
  const railRef = useRef<View | null>(null);
  const railPageXRef = useRef(0);
  const railWidthRef = useRef(railWidth);
  const minIndexRef = useRef(0);
  const maxIndexRef = useRef(0);
  const onChangeRef = useRef(onChange);

  const minIndex = getIndexFromLabel(minValue);
  const maxIndex = getIndexFromLabel(maxValue);

  const stepCount = GRADE_OPTIONS.length - 1;
  const usableWidth = Math.max(railWidth - HANDLE_SIZE, 1);

  const getCenterXForIndex = (index: number) => {
    if (stepCount === 0) return HANDLE_SIZE / 2;
    return HANDLE_SIZE / 2 + (index / stepCount) * usableWidth;
  };

  const minCenterX = getCenterXForIndex(minIndex);
  const maxCenterX = getCenterXForIndex(maxIndex);

  useEffect(() => {
    railWidthRef.current = railWidth;
    minIndexRef.current = minIndex;
    maxIndexRef.current = maxIndex;
    onChangeRef.current = onChange;
  }, [railWidth, minIndex, maxIndex, onChange]);

  const measureRail = () => {
    railRef.current?.measureInWindow((x) => {
      railPageXRef.current = x;
    });
  };

  const getIndexFromGestureX = (gestureMoveX: number) => {
    const currentRailWidth = railWidthRef.current;
    const currentUsableWidth = Math.max(currentRailWidth - HANDLE_SIZE, 1);
    const relativeX = clamp(
      gestureMoveX - railPageXRef.current,
      HANDLE_SIZE / 2,
      currentRailWidth - HANDLE_SIZE / 2,
    );

    const ratio = (relativeX - HANDLE_SIZE / 2) / currentUsableWidth;
    return clamp(Math.round(ratio * stepCount), 0, stepCount);
  };

  const minResponder = useMemo(
    (): PanResponderInstance =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          measureRail();
        },
        onPanResponderMove: (_, gestureState) => {
          const currentRailWidth = railWidthRef.current;
          const currentMinIndex = minIndexRef.current;
          const currentMaxIndex = maxIndexRef.current;

          if (!currentRailWidth) return;

          const draggedIndex = getIndexFromGestureX(gestureState.moveX);
          const nextMinIndex = Math.min(draggedIndex, currentMaxIndex);

          onChangeRef.current(getLabelFromIndex(nextMinIndex), getLabelFromIndex(currentMaxIndex));
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  const maxResponder = useMemo(
    (): PanResponderInstance =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          measureRail();
        },
        onPanResponderMove: (_, gestureState) => {
          const currentRailWidth = railWidthRef.current;
          const currentMinIndex = minIndexRef.current;

          if (!currentRailWidth) return;

          const draggedIndex = getIndexFromGestureX(gestureState.moveX);
          const nextMaxIndex = Math.max(draggedIndex, currentMinIndex);

          onChangeRef.current(getLabelFromIndex(currentMinIndex), getLabelFromIndex(nextMaxIndex));
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [],
  );

  const handleRailLayout = (event: LayoutChangeEvent) => {
    setRailWidth(event.nativeEvent.layout.width);
    requestAnimationFrame(measureRail);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Grade</Text>

      <View style={styles.valueRow}>
        <Text style={styles.valueText}>
          {minValue} - {maxValue}
        </Text>
      </View>

      <View
        ref={railRef}
        onLayout={handleRailLayout}
        style={styles.railContainer}
        collapsable={false}
      >
        <View style={styles.rail} />

        <View
          style={[
            styles.selectedRail,
            {
              left: minCenterX,
              width: Math.max(maxCenterX - minCenterX, 0),
            },
          ]}
        />

        <View
          style={[
            styles.handle,
            {
              left: minCenterX - HANDLE_SIZE / 2,
            },
          ]}
          {...minResponder.panHandlers}
        />

        <View
          style={[
            styles.handle,
            {
              left: maxCenterX - HANDLE_SIZE / 2,
            },
          ]}
          {...maxResponder.panHandlers}
        />
      </View>

      <View style={styles.tickLabelRow}>
        {GRADE_OPTIONS.map((grade) => (
          <Text key={grade} style={styles.tickLabel}>
            {grade}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#153A7A",
    marginBottom: 12,
    fontFamily: "Instrument Sans Bold",
  },
  valueRow: {
    marginBottom: 12,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F3B82",
  },
  railContainer: {
    width: "100%",
    height: HANDLE_SIZE,
    justifyContent: "center",
  },
  rail: {
    position: "absolute",
    left: HANDLE_SIZE / 2,
    right: HANDLE_SIZE / 2,
    height: TRACK_HEIGHT,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2E4A8A",
  },
  selectedRail: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: 999,
    backgroundColor: "#2E4A8A",
    top: (HANDLE_SIZE - TRACK_HEIGHT) / 2,
  },
  handle: {
    position: "absolute",
    top: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#2E4A8A",
  },
  tickLabelRow: {
    marginTop: 10,
    paddingHorizontal: HANDLE_SIZE / 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tickLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B649D",
  },
});
