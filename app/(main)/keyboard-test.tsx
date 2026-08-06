import React from 'react';
import { View, TextInput } from 'react-native';

export default function KeyboardTestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' }}>
      <TextInput
        placeholder="Test Keyboard"
        style={{
          borderWidth: 1,
          borderColor: '#000',
          height: 50,
          paddingHorizontal: 10,
        }}
        onFocus={() => console.log('TEXTINPUT FOCUSED')}
      />
    </View>
  );
}
