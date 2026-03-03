// src/layouts/components/AppStatusBar.tsx
import React from 'react';
import { StatusBar, Platform } from 'react-native';
import { COLORS } from '../../utlis/comon';

export default function AppStatusBar() {
  return (
    <StatusBar
      backgroundColor={COLORS.primary}
      barStyle="dark-content"
      translucent={Platform.OS === 'android' ? false : true}
    />
  );
}
