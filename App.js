import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, Switch, StyleSheet, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TradingTrackerApp() {
  const [form, setForm] = useState({ date: "", asset: "", buy: "", sell: "", qty: "", notes: "" });
  const [myTrades, setMyTrades] = useState([]);
  const [fatherTrades, setFatherTrades] = useState([]);
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === "dark");

  const STORAGE_KEYS = {
    my: "my_trades",
    father: "father_trades",
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const savedMy = await AsyncStorage.getItem(STORAGE_KEYS.my);
    const savedFather = await AsyncStorage.getItem(STORAGE_KEYS.father);
    if (savedMy) setMyTrades(JSON.parse(savedMy));
    if (savedFather) setFatherTrades(JSON.parse(savedFather));
  };

  const saveEntries = async (type, entries) => {
    const key = type === "father" ? STORAGE_KEYS.father : STORAGE_KEYS.my;
    await AsyncStorage.setItem(key, JSON.stringify(entries));
  };

  const handleAdd = () => {
    const buy = parseFloat(form.buy);
    const sell = parseFloat(form.sell);
    const qty = parseFloat(form.qty);
    const profit = ((sell - buy) * qty).toFixed(2);
    const change = (((sell / buy) - 1) * 100).toFixed(2);

    const newEntry = {
      ...form,
      buy,
      sell,
      qty,
      profit,
      change,
      date: form.date || new Date().toISOString().split("T")[0],
    };

    const updated = isViewerMode ? [newEntry, ...fatherTrades] : [newEntry, ...myTrades];
    if (isViewerMode) {
      setFatherTrades(updated);
      saveEntries("father", updated);
    } else {
      setMyTrades(updated);
      saveEntries("my", updated);
    }
    setForm({ date: "", asset: "", buy: "", sell: "", qty: "", notes: "" });
  };

  const entries = isViewerMode ? fatherTrades : myTrades;
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.header, { color: theme.text }]}>📈 Trading Tracker ({isViewerMode ? "Father" : "You"})</Text>

      <View style={styles.row}>
        <Text style={{ color: theme.text }}>👀 Viewer Mode</Text>
        <Switch value={isViewerMode} onValueChange={setIsViewerMode} />
        <Text style={{ color: theme.text }}>🌙 Dark Mode</Text>
        <Switch value={isDark} onValueChange={setIsDark} />
      </View>

      <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text }]} placeholder="Date (YYYY-MM-DD)" placeholderTextColor="#888" value={form.date} onChangeText={(text) => setForm({ ...form, date: text })} />
      <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text }]} placeholder="Asset (ETH, TATA)" placeholderTextColor="#888" value={form.asset} onChangeText={(text) => setForm({ ...form, asset: text })} />
      <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text }]} placeholder="Buy Price" keyboardType="numeric" placeholderTextColor="#888" value={form.buy} onChangeText={(text) => setForm({ ...form, buy: text })} />
      <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text }]} placeholder="Sell Price" keyboardType="numeric" placeholderTextColor="#888" value={form.sell} onChangeText={(text) => setForm({ ...form, sell: text })} />
      <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text }]} placeholder="Quantity" keyboardType="numeric" placeholderTextColor="#888" value={form.qty} onChangeText={(text) => setForm({ ...form, qty: text })} />
      <TextInput style={[styles.input, { backgroundColor: theme.input, color: theme.text }]} placeholder="Notes (optional)" placeholderTextColor="#888" value={form.notes} onChangeText={(text) => setForm({ ...form, notes: text })} />

      <Button title="➕ Add Entry" onPress={handleAdd} color={isDark ? '#888' : undefined} />

      <View style={{ marginVertical: 20 }}>
        {entries.map((entry, index) => (
          <View key={index} style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text }}>📅 {entry.date}</Text>
            <Text style={{ color: theme.text }}>💼 {entry.asset}</Text>
            <Text style={{ color: theme.text }}>Buy: ₹{entry.buy}</Text>
            <Text style={{ color: theme.text }}>Sell: ₹{entry.sell}</Text>
            <Text style={{ color: theme.text }}>Qty: {entry.qty}</Text>
            <Text style={{ color: theme.text }}>💰 Profit: ₹{entry.profit}</Text>
            <Text style={{ color: theme.text }}>📈 % Change: {entry.change}%</Text>
            <Text style={{ color: theme.text }}>📝 {entry.notes}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const lightTheme = {
  bg: "#fff",
  card: "#f9f9f9",
  text: "#000",
  input: "#fff",
};

const darkTheme = {
  bg: "#111",
  card: "#222",
  text: "#fff",
  input: "#333",
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
