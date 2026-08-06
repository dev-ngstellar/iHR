import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { CustomInput } from './CustomInput';

export interface SelectOption {
  label: string;
  value: string | number;
  sublabel?: string;
}

export interface CustomSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  selectedValue?: string | number;
  onValueChange: (value: string | number) => void;
  error?: string;
  loading?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = React.memo(({
  label,
  placeholder = 'Select an option',
  options,
  selectedValue,
  onValueChange,
  error,
  loading = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (val: string | number) => {
    onValueChange(val);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.selectTrigger,
          error ? styles.errorTrigger : null,
          loading ? { opacity: 0.6 } : null,
        ]}
        onPress={() => !loading && setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={selectedOption ? styles.selectedText : styles.placeholderText}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {options.length > 5 && (
              <CustomInput
                placeholder="Search options..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchInputContainer}
              />
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.selectedOptionItem]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View style={styles.optionTextWrapper}>
                      <Text style={[styles.optionLabel, isSelected && styles.selectedOptionLabel]}>
                        {item.label}
                      </Text>
                      {item.sublabel && <Text style={styles.optionSublabel}>{item.sublabel}</Text>}
                    </View>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyOptions}>
                  <Text style={styles.emptyText}>No options available</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
});

CustomSelect.displayName = 'CustomSelect';

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  errorTrigger: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  selectedText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '80%',
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
    padding: 4,
  },
  searchInputContainer: {
    marginVertical: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  selectedOptionItem: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: RADIUS.sm,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selectedOptionLabel: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '800',
  },
  emptyOptions: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
