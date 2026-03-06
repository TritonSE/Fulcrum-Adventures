import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import NoteIcon from "../../assets/NoteIcon";

const ROW_HEIGHT = 44;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TIMES = (() => {
  const out: string[] = [];
  out.push("12:00 Am");
  for (let h = 1; h <= 11; h++) {
    out.push(`${h.toString().padStart(2, "0")}:00 Am`);
  }
  out.push("12:00 Pm");
  for (let h = 1; h <= 11; h++) {
    out.push(`${h.toString().padStart(2, "0")}:00 Pm`);
  }
  return out;
})();

function getDayLabel(day: number, month: number, year: number) {
  const d = new Date(year, month, day);
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${day.toString().padStart(2, "0")} ${weekdays[d.getDay()]}`;
}

function formatDisplayDate(month: number, day: number, year: number) {
  const d = new Date(year, month, day);
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${weekdays[d.getDay()]}, ${MONTHS[month]} ${day.toString().padStart(2, "0")}, ${year}`;
}

function getCurrentDateState() {
  const now = new Date();
  const hour = now.getHours();
  const timeIndex = hour <= 11 ? (hour === 0 ? 0 : hour) : hour;
  return {
    month: now.getMonth(),
    day: now.getDate(),
    year: now.getFullYear(),
    timeIndex: Math.min(timeIndex, TIMES.length - 1),
  };
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L14.09 8.26L21 9.27L16 13.14L17.18 20.02L12 17.77L6.82 20.02L8 13.14L3 9.27L9.91 8.26L12 2Z"
      stroke={filled ? "#ECD528" : "#D9D9D9"}
      fill={filled ? "#ECD528" : "none"}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Path d="M14 13L27 26" stroke="#153F7A" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M14 26L27 13" stroke="#153F7A" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  titleIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#153F7A",
    fontFamily: "League Spartan",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 31.2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
  },
  dateSection: {
    marginBottom: 0,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearDateButton: {
    padding: 4,
  },
  clearDateX: {
    fontSize: 20,
    color: "#153A7A",
  },
  inlinePicker: {
    flexDirection: "row",
    height: ROW_HEIGHT * 5,
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    flexShrink: 0,
    color: "#153F7A",
    fontFamily: "League Spartan",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
  },
  rowValue: {
    fontSize: 14,
    color: "#153F7A",
    fontFamily: "Instrument Sans",
  },
  rowPlaceholder: {
    flexShrink: 0,
    color: "#B4B4B4",
    textAlign: "right",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    letterSpacing: 0.28,
  },
  divider: {
    width: 342,
    height: 1,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
  },
  stars: {
    flexDirection: "row",
    gap: 0,
  },
  starTouch: {
    padding: 0,
  },
  notesInput: {
    marginTop: 0,
    alignSelf: "stretch",
    color: "#153F7A",
    fontFamily: "Instrument Sans",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    letterSpacing: 0.28,
    minHeight: 160,
    paddingVertical: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
    gap: 16,
  },
  cancelButton: {
    display: "flex",
    width: 167,
    paddingVertical: 10,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 100,
    backgroundColor: "#EBEBEB",
  },
  cancelButtonText: {
    color: "#153A7A",
    fontFamily: "Instrument Sans Medium",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  saveButton: {
    display: "flex",
    width: 167,
    paddingVertical: 10,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#153A7A",
  },
  saveButtonText: {
    color: "#153A7A",
    fontFamily: "Instrument Sans Medium",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerRowCell: {
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  pickerRowCellSelected: {
    backgroundColor: "#F3F3F3",
  },
  pickerCellText: {
    fontSize: 14,
    color: "#949494",
  },
  pickerCellTextSelected: {
    fontWeight: "700",
    color: "#153A7A",
  },
});

export type NotesScreenProps = {
  activityId: string;
  onClose: () => void;
};

export default function NotesScreen({ activityId: _activityId, onClose }: NotesScreenProps) {
  const [notesText, setNotesText] = useState("");
  const [rating, setRating] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const monthScrollRef = useRef<ScrollView>(null);
  const dayScrollRef = useRef<ScrollView>(null);
  const timeScrollRef = useRef<ScrollView>(null);

  const displayDate = formatDisplayDate(selectedMonth, selectedDay, selectedYear);
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dayOptions = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const openDatePicker = () => {
    const now = getCurrentDateState();
    setSelectedMonth(now.month);
    setSelectedDay(now.day);
    setSelectedYear(now.year);
    setSelectedTimeIndex(now.timeIndex);
    setShowDatePicker(true);
  };

  const clearDate = () => {
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (!showDatePicker) return;
    const t = setTimeout(() => {
      monthScrollRef.current?.scrollTo({ y: selectedMonth * ROW_HEIGHT, animated: false });
      dayScrollRef.current?.scrollTo({ y: (selectedDay - 1) * ROW_HEIGHT, animated: false });
      timeScrollRef.current?.scrollTo({ y: selectedTimeIndex * ROW_HEIGHT, animated: false });
    }, 100);
    return () => clearTimeout(t);
  }, [showDatePicker, selectedMonth, selectedDay, selectedTimeIndex]);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleIcon}>
              <NoteIcon />
            </View>
            <Text style={styles.title}>Notes</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              <Text style={styles.rowLabel}>Date</Text>
              {showDatePicker ? (
                <View style={styles.dateRowRight}>
                  <Text style={styles.rowValue}>{displayDate}</Text>
                  <TouchableOpacity
                    onPress={clearDate}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.clearDateButton}
                  >
                    <Text style={styles.clearDateX}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={openDatePicker} activeOpacity={0.7}>
                  <Text style={styles.rowPlaceholder}>Add date</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ height: 8 }} />
            {showDatePicker && (
              <View style={styles.inlinePicker}>
                <ScrollView
                  ref={monthScrollRef}
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT);
                    setSelectedMonth(Math.max(0, Math.min(MONTHS.length - 1, i)));
                  }}
                >
                  <View style={{ height: ROW_HEIGHT * 2 }} />
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.pickerRowCell,
                        { height: ROW_HEIGHT },
                        selectedMonth === i && styles.pickerRowCellSelected,
                      ]}
                      onPress={() => {
                        setSelectedMonth(i);
                        monthScrollRef.current?.scrollTo({ y: i * ROW_HEIGHT, animated: true });
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerCellText,
                          selectedMonth === i && styles.pickerCellTextSelected,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={{ height: ROW_HEIGHT * 2 }} />
                </ScrollView>
                <ScrollView
                  ref={dayScrollRef}
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT);
                    setSelectedDay(Math.max(1, Math.min(daysInSelectedMonth, i + 1)));
                  }}
                >
                  <View style={{ height: ROW_HEIGHT * 2 }} />
                  {dayOptions.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.pickerRowCell,
                        { height: ROW_HEIGHT },
                        selectedDay === d && styles.pickerRowCellSelected,
                      ]}
                      onPress={() => {
                        setSelectedDay(d);
                        dayScrollRef.current?.scrollTo({
                          y: (d - 1) * ROW_HEIGHT,
                          animated: true,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerCellText,
                          selectedDay === d && styles.pickerCellTextSelected,
                        ]}
                      >
                        {getDayLabel(d, selectedMonth, selectedYear)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={{ height: ROW_HEIGHT * 2 }} />
                </ScrollView>
                <ScrollView
                  ref={timeScrollRef}
                  style={styles.pickerColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ROW_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const i = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT);
                    setSelectedTimeIndex(Math.max(0, Math.min(TIMES.length - 1, i)));
                  }}
                >
                  <View style={{ height: ROW_HEIGHT * 2 }} />
                  {TIMES.map((t, i) => (
                    <TouchableOpacity
                      key={`time-${t}`}
                      style={[
                        styles.pickerRowCell,
                        { height: ROW_HEIGHT },
                        selectedTimeIndex === i && styles.pickerRowCellSelected,
                      ]}
                      onPress={() => {
                        setSelectedTimeIndex(i);
                        timeScrollRef.current?.scrollTo({ y: i * ROW_HEIGHT, animated: true });
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerCellText,
                          selectedTimeIndex === i && styles.pickerCellTextSelected,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={{ height: ROW_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Rating</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity
                  key={`star-${i}`}
                  onPress={() => setRating(i)}
                  style={styles.starTouch}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <StarIcon filled={i <= rating} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ height: 8 }} />
          <View style={styles.divider} />
          <View style={{ height: 8 }} />

          <TextInput
            style={styles.notesInput}
            placeholder="Add notes..."
            placeholderTextColor="#B4B4B4"
            value={notesText}
            onChangeText={setNotesText}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
