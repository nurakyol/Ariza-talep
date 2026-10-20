import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

const KATEGORILER = ['Yazılım / Sistem', 'Donanım / Cihaz', 'Ağ / İnternet'];
const DURUMLAR = ['Bekliyor', 'İşlemde', 'Tamamlandı'];

export default function App() {
  // --- STATE YÖNETİMİ ---
  const [talepler, setTalepler] = useState([
    {
      id: '1',
      baslik: 'E-posta Erişimi Sorunu',
      aciklama: 'Kurumsal e-posta hesabıma giriş yapamıyorum.',
      kategori: 'Yazılım / Sistem',
      durum: 'Bekliyor',
      tarih: new Date().toLocaleDateString('tr-TR'),
    },
  ]);

  // Form State'leri
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [secilenKategori, setSecilenKategori] = useState(KATEGORILER[0]);

  // Filtreleme State'leri (Özgün Özellik)
  const [aramaMetni, setAramaMetni] = useState('');
  const [filtreDurum, setFiltreDurum] = useState('Tümü');

  // Modal (Detay ve Düzenleme) State'leri
  const [seciliTalep, setSeciliTalep] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // --- EYLEMLER VE EVENT HANDLER'LAR ---

  // G1, G2, G3, G4 & G8: Talep Ekleme ve Doğrulama (Validation)
  const handleTalepEkle = () => {
    // Sadece boşluk veya boş girdi kontrolü (G3)
    if (!baslik.trim() || !aciklama.trim()) {
      Alert.alert('Uyarı', 'Lütfen başlık ve açıklama alanlarını doldurunuz!');
      return;
    }

    const yeniTalep = {
      id: Date.now().toString(), // Benzersiz ID
      baslik: baslik.trim(),
      aciklama: aciklama.trim(),
      kategori: secilenKategori,
      durum: 'Bekliyor',
      tarih: new Date().toLocaleDateString('tr-TR'),
    };

    setTalepler([yeniTalep, ...talepler]);
    setBaslik('');
    setAciklama('');
    setSecilenKategori(KATEGORILER[0]);
    
    // Kullanıcıya geri bildirim (G8)
    Alert.alert('Başarılı', 'Arıza talebiniz başarıyla oluşturuldu.');
  };

  // G5: Kısa Dokunma ile Detay Gösterme
  const handleTalepSec = (item) => {
    setSeciliTalep(item);
    setModalVisible(true);
  };

  // G6 & G8: Uzun Basma ile Silme Onayı
  const handleUzunBasma = (item) => {
    Alert.alert(
      'Talep Silme Onayı',
      `"${item.baslik}" başlıklı talebi silmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setTalepler((prev) => prev.filter((t) => t.id !== item.id));
            Alert.alert('Bilgi', 'Talep silindi.');
          },
        },
      ]
    );
  };

  // G7: Durum Değiştirme
  const handleDurumDegistir = (yeniDurum) => {
    if (!seciliTalep) return;

    const guncelTalepler = talepler.map((item) => {
      if (item.id === seciliTalep.id) {
        return { ...item, durum: yeniDurum };
      }
      return item;
    });

    setTalepler(guncelTalepler);
    setSeciliTalep({ ...seciliTalep, durum: yeniDurum });
    Alert.alert('Güncellendi', `Talep durumu "${yeniDurum}" olarak değiştirildi.`);
  };

  // --- D ÖZGÜN ÖZELLİK: ARAMA, DURUM FİLTRELEME VE ANLIK İSTATİSTİK ---
  const filtrelenmisTalepler = talepler.filter((t) => {
    const aramaUyum = t.baslik.toLowerCase().includes(aramaMetni.toLowerCase());
    const durumUyum = filtreDurum === 'Tümü' || t.durum === filtreDurum;
    return aramaUyum && durumUyum;
  });

  const tamamlananSayisi = talepler.filter((t) => t.durum === 'Tamamlandı').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.appTitle}>🛠️ Akıllı Arıza Yönetimi</Text>

        {/* --- FORM ALANI (G1, G2, G3, G4) --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yeni Arıza Bildirimi</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Arıza Başlığı (Örn: Ekran Kırık)"
            value={baslik}
            onChangeText={setBaslik}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Arıza Açıklaması..."
            value={aciklama}
            onChangeText={setAciklama}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Kategori Seçiniz:</Text>
          <View style={styles.chipContainer}>
            {KATEGORILER.map((kat) => (
              <TouchableOpacity
                key={kat}
                style={[
                  styles.chip,
                  secilenKategori === kat && styles.selectedChip,
                ]}
                onPress={() => setSecilenKategori(kat)}
              >
                <Text
                  style={[
                    styles.chipText,
                    secilenKategori === kat && styles.selectedChipText,
                  ]}
                >
                  {kat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleTalepEkle}>
            <Text style={styles.buttonText}>Talep Oluştur</Text>
          </TouchableOpacity>
        </View>

        {/* --- ÖZGÜN ÖZELLİK: İSTATİSTİK & FİLTRELEME --- */}
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Toplam: {talepler.length}</Text>
            <Text style={[styles.statsText, { color: '#2e7d32' }]}>
              Tamamlanan: {tamamlananSayisi}
            </Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Başlığa göre arayın..."
            value={aramaMetni}
            onChangeText={setAramaMetni}
          />

          <View style={styles.filterRow}>
            {['Tümü', ...DURUMLAR].map((durum) => (
              <TouchableOpacity
                key={durum}
                style={[
                  styles.filterBadge,
                  filtreDurum === durum && styles.activeFilterBadge,
                ]}
                onPress={() => setFiltreDurum(durum)}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filtreDurum === durum && styles.activeFilterBadgeText,
                  ]}
                >
                  {durum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- İSTEK LİSTESİ (G5, G6) --- */}
        <Text style={styles.sectionHeader}>Arıza Talepleri</Text>
        {filtrelenmisTalepler.length === 0 ? (
          <Text style={styles.emptyText}>Kayıtlı arıza talebi bulunamadı.</Text>
        ) : (
          filtrelenmisTalepler.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.ticketCard}
              onPress={() => handleTalepSec(item)}
              onLongPress={() => handleUzunBasma(item)}
              delayLongPress={500}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{item.baslik}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.durum === 'Bekliyor' && { backgroundColor: '#ffe0b2' },
                    item.durum === 'İşlemde' && { backgroundColor: '#bbdefb' },
                    item.durum === 'Tamamlandı' && { backgroundColor: '#c8e6c9' },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{item.durum}</Text>
                </View>
              </View>
              <Text style={styles.ticketCategory}>🏷️ {item.kategori}</Text>
              <Text numberOfLines={1} style={styles.ticketDesc}>
                {item.aciklama}
              </Text>
              <Text style={styles.ticketDate}>📅 {item.tarih}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* --- DETAY VE DURUM DEĞİŞTİRME MODALI (G5, G7) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {seciliTalep && (
              <>
                <Text style={styles.modalTitle}>{seciliTalep.baslik}</Text>
                <Text style={styles.modalCategory}>
                  Kategori: {seciliTalep.kategori}
                </Text>

                <View style={styles.modalDescBox}>
                  <Text style={styles.modalDescText}>{seciliTalep.aciklama}</Text>
                </View>

                <Text style={styles.label}>Durumu Güncelle (G7):</Text>
                <View style={styles.statusButtonContainer}>
                  {DURUMLAR.map((durum) => (
                    <TouchableOpacity
                      key={durum}
                      style={[
                        styles.statusSelectButton,
                        seciliTalep.durum === durum && styles.activeStatusSelect,
                      ]}
                      onPress={() => handleDurumDegistir(durum)}
                    >
                      <Text
                        style={[
                          styles.statusSelectText,
                          seciliTalep.durum === durum && styles.activeStatusSelectText,
                        ]}
                      >
                        {durum}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContainer: {
    padding: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a237e',
    textAlign: 'center',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 6,
    color: '#555',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  selectedChip: {
    backgroundColor: '#1a237e',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#1a237e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  activeFilterBadge: {
    backgroundColor: '#00796b',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#444',
  },
  activeFilterBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1a237e',
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  ticketCategory: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  ticketDesc: {
    fontSize: 13,
    color: '#444',
  },
  ticketDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  modalDescBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalDescText: {
    fontSize: 14,
    color: '#333',
  },
  statusButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statusSelectButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  activeStatusSelect: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  statusSelectText: {
    fontSize: 12,
    color: '#333',
  },
  activeStatusSelectText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});