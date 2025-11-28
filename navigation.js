// navigation.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './screens/Dashboard/Dashboard';
import Screen2 from './screens/Screen2';
import theme from './theme';
import { LoansProvider } from './LoansContext';

const Stack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    primary: theme.colors.primary,
    border: DefaultTheme.colors.border,
    notification: DefaultTheme.colors.notification,
  },
};

export default function RootNavigator() {
  return (
    <LoansProvider>
      <NavigationContainer theme={MyTheme}>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.card,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: theme.colors.background,
            },
          }}
        >
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: 'LoanTracker' }}
          />
          <Stack.Screen
            name="Screen2"
            component={Screen2}
            options={{ title: 'Add Loan' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LoansProvider>
  );
}
