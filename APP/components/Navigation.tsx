import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles";
import { AuthSession, Patient, TabDefinition, TabKey } from "../types";

export function TopBar({ session, patient, onLogout }: {
  session: AuthSession;
  patient: Patient;
  onLogout: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.appTitle}>Therapy Portal</Text>
        <Text style={styles.appSubtitle}>
          {session.role === "therapist" ? `Terapeuta: ${session.name}` : `Paciente: ${patient.name}`}
        </Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export function BottomTabs({ activeTab, tabs, onChange }: {
  activeTab: TabKey;
  tabs: TabDefinition[];
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={() => onChange(tab.id)}>
          <View style={[styles.tabIcon, activeTab === tab.id ? styles.tabIconActive : null]}>
            <Text style={[styles.tabIconText, activeTab === tab.id ? styles.tabIconTextActive : null]}>{tab.icon}</Text>
          </View>
          <Text style={[styles.tabLabel, activeTab === tab.id ? styles.tabLabelActive : null]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
