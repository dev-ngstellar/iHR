import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { formatDate } from '../../utils/formatters';

export interface CustomDatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChangeDate: (dateStr: string) => void; // returns YYYY-MM-DD
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  visible?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = React.memo(({
  label,
  value,
  onChangeDate,
  error,
  minDate,
  placeholder = 'Select Date',
  containerStyle,
  visible,
  onOpen,
  onClose,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isModalOpen = visible !== undefined ? visible : internalOpen;

  const handleOpen = () => {
    Keyboard.dismiss();
    if (onOpen) onOpen();
    else setInternalOpen(true);
  };

  const handleClose = () => {
    if (onClose) onClose();
    else setInternalOpen(false);
  };

  // Helper to parse YYYY-MM-DD
  const selectedDateObj = useMemo(() => {
    if (!value) return new Date();
    const parts = value.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDateObj.getMonth()); // 0-11
  const [tempSelectedIso, setTempSelectedIso] = useState<string>(value);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days matrix for the viewMonth/viewYear
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    
    const days: ({ day: number; iso: string; isDisabled: boolean } | null)[] = [];

    // Empty padding slots
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    const minDateNoTime = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;

    for (let d = 1; d <= daysInMonth; d++) {
      const currentD = new Date(viewYear, viewMonth, d);
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const iso = `${viewYear}-${mStr}-${dStr}`;

      let isDisabled = false;
      if (minDateNoTime && currentD < minDateNoTime) {
        isDisabled = true;
      }

      days.push({ day: d, iso, isDisabled });
    }

    return days;
  }, [viewYear, viewMonth, minDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (iso: string) => {
    setTempSelectedIso(iso);
    onChangeDate(iso);
    handleClose();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.inputWrapper, error ? styles.errorWrapper : null]}
        onPress={handleOpen}
        activeOpacity={0.75}
      >
        <Text style={styles.calendarIcon}>📅</Text>
        <Text style={[styles.inputText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Calendar Modal Dialog (Renders cleanly over viewport without pushing form layout) */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Date'}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Controls (Prev / Month-Year / Next) */}
            <View style={styles.calendarControls}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {monthNames[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View style={styles.weekHeader}>
              {daysOfWeek.map((dayName, idx) => (
                <Text key={idx} style={styles.weekDayText}>
                  {dayName}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              <View style={styles.daysGrid}>
                {calendarDays.map((item, idx) => {
                  if (!item) {
                    return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  }

                  const isSelected = item.iso === (tempSelectedIso || value);

                  return (
                    <TouchableOpacity
                      key={item.iso}
                      style={[
                        styles.dayCell,
                        isSelected && styles.selectedDayCell,
                        item.isDisabled && styles.disabledDayCell,
                      ]}
                      disabled={item.isDisabled}
                      onPress={() => handleSelectDay(item.iso)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected && styles.selectedDayText,
                          item.isDisabled && styles.disabledDayText,
                        ]}
                      >
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

CustomDatePicker.displayName = 'CustomDatePicker';

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  errorWrapper: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  calendarIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#6B7280',
    fontWeight: '400',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '92%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '700',
  },
  calendarControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A57A8',
    lineHeight: 24,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A57A8',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 20,
  },
  selectedDayCell: {
    backgroundColor: '#0A57A8',
  },
  disabledDayCell: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  disabledDayText: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  modalFooter: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: '#E31E24',
    fontSize: 14,
    fontWeight: '700',
  },
});
