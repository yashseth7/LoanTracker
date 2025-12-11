// navigation.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './screens/Dashboard/Dashboard';
import LossRecoveryScreen from './screens/PNL/LossRecoveryScreen';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Addloan from './screens/AddLoan';
import EditLoan from './screens/EditLoan';
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
            options={({ navigation }) => ({
              title: 'LoanTracker',
              headerRight: () => (
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  {/* Loan Dashboard icon */}
                  <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                    <Ionicons name="home-outline" size={22} color={theme.colors.text} />
                  </TouchableOpacity>

                  {/* PNL Tracker icon */}
                  <TouchableOpacity onPress={() => navigation.navigate('LossRecovery')}>
                    <Ionicons name="stats-chart-outline" size={22} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              ),
            })}
          />
          <Stack.Screen name="Addloan" component={Addloan} options={{ title: 'Add Loan' }} />
          <Stack.Screen name="EditLoan" component={EditLoan} options={{ title: 'Edit Loan' }} />
          <Stack.Screen
            name="LossRecovery"
            component={LossRecoveryScreen}
            options={{ title: 'PNL Tracker' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LoansProvider>
  );
}
