import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Dropdown as DefaultDropdown } from 'react-native-element-dropdown';

interface DropdownProps<T>
  extends Omit<React.ComponentProps<typeof DefaultDropdown<T>>, 'data' | 'labelField' | 'valueField'> {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  data: Array<{ label: string; value: T }>;
}

const Dropdown: React.FC<DropdownProps<any>> = ({
  style,
  itemTextStyle,
  selectedTextStyle,
  containerStyle,
  labelStyle,
  label,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <DefaultDropdown
        labelField="label"
        valueField="value"
        style={[styles.dropdown, isFocus && { borderColor: 'lightblue' }, style]}
        selectedTextStyle={[styles.dropdownSelectedText, selectedTextStyle]}
        itemTextStyle={[styles.dropdownItemText, itemTextStyle]}
        placeholder={!isFocus ? placeholder : '...'}
        onFocus={() => {
          onFocus?.();
          setIsFocus(true);
        }}
        onBlur={() => {
          onBlur?.();
          setIsFocus(false);
        }}
        onChange={(item) => {
          onChange?.(item);
          setIsFocus(false);
        }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  label: {
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 10,
  },
  dropdownSelectedText: {
    fontSize: 14,
  },
  dropdownItemText: {
    fontSize: 14,
  },
});

export default Dropdown;
