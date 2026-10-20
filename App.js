import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

// Kategori ve Durum Sabitleri
const KATEGORILER = ['Yazılım / Sistem', 'Donanım / Ağ', 'Fiziksel / Ekipman'];
const DURUMLAR = ['Bekliyor', 'İşlemde', 'Tamamlandı'];

export default function App() {
  // --- STATE YÖNETİMİ ---
  // Ekran Yönetimi: 'LISTE' | 'FORM'
  const [aktifEkran, setAktifEkran] = useState('LISTE');

  // Arıza Talepleri Listesi (G4)
  const [talepler, setTalepler] = useState([
    {
      id: '1',
      baslik: 'Yazıcı Bağlantı Hatası',
      aciklama: '3. kat yazıcısına ağ üzerinden erişilemiyor.',
      kategori: 'Donanım / Ağ',
      durum: 'Bekliyor',
      tarih: '20.10.2026 09:30',
    },
    {
      id: '2',
      baslik: 'E-Posta Senkronizasyon Sorunu',
      aciklama: 'Gelen kutusu güncellenmiyor, hata veriyor.',
      kategori: 'Yazılım / Sistem',
      durum: 'İşlemde',
      tarih: '20.10.2026 10:15',
    },
  ]);

  // Form State'leri (G1, G2)
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [secilenKategori, setSecilenKategori] = useState(KATEGORILER[0]);

  // Detay Modalı State'i (G5)
  const [secilenTalep, setSecilenTalep] = useState(null);
  const [detayModalAcik, setDetayModalAcik] = useState(false);

  // Özgün Özellik State'leri (Arama & Filtreleme)
  const [aramaMetni, setAramaMetni] = useState('');
  const [filtreDurum, setFiltreDurum] = useState('Tümü');

  // --- İŞLEVLER / HANDLER'LAR ---

  // G3 & G4 & G8: Yeni Talep Ekleme ve Doğrulama
  const handleTalepEkle = () => {
    // Boşluk kontrolü (G3)
    if (!baslik.trim() || !aciklama.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve açıklama alanlarını doldurunuz!'); // G8
      return;
    }

    const yeniTalep = {
      id: Date.now().toString(),
      baslik: baslik.trim(),
      aciklama: aciklama.trim(),
      kategori: secilenKategori,
      durum: 'Bekliyor',
      tarih: new Date().toLocaleString('tr-TR'),
    };

    setTalepler([yeniTalep, ...talepler]);
    
    // Formu temizle ve geri dön
    setBaslik('');
    setAciklama('');
    setSecilenKategori(KATEGORILER[0]);
    setAktifEkran('LISTE');

    Alert.alert('Başarılı', 'Arıza talebiniz başarıyla oluşturuldu.'); // G8
  };

  // G6 & G8: Uzun Basma İle Silme Onayı
  const handleUzunBasmaSil = (id) => {
    Alert.alert(
      'Talebi Sil',
      'Bu arıza talebini silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setTalepler((prev) => prev.filter((t) => t.id !== id));
            Alert.alert('Bilgi', 'Talep başarıyla silindi.');
          },
        },
      ]
    );
  };

  // G7: Durum Değiştirme
  const handleDurumDegistir = (id, yeniDurum) => {
    setTalepler((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durum: yeniDurum } : t))
    );
    if (secilenTalep && secilenTalep.id === id) {
      setSecilenTalep((prev) => ({ ...prev, durum: yeniDurum }));
    }
  };

  // G5: Kısa Dokunmada Detay Açma
  const handleTalepDetayAc = (item) => {
    setSecilenTalep(item);
    setDetayModalAcik(true);
  };

  // Özgün Özellik: Filtrelenmiş Talepler
  const filtrelenmisTalepler = talepler.filter((t) => {
    const baslikEslosiyor = t.baslik.toLowerCase().includes(aramaMetni.toLowerCase());
    const durumEslosiyor = filtreDurum === 'Tümü' || t.durum === filtreDurum;
    return baslikEslosiyor && durumEslosiyor;
  });

  // Özgün Özellik: Tamamlanan/Toplam İstatistikleri
  const tamamlananSayisi = talepler.filter((t) => t.durum === 'Tamamlandı').length;

  // --- EKRAN BİLEŞENLERİ ---

  // 1. TALEP LİSTESİ EKRANI
  const renderListeEkrani = () => (
    <View style={styles.container}>
      {/* İstatistik Paneli (Özgün Özellik) */}
      <View style={styles.statsCard}>
        <View>
          <Text style={styles.statsTitle}>Toplam Talep</Text>

          <Text style={styles.statsCount}>{talepler.length}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View>
          <Text style={styles.statsTitle}>Tamamlanan</Text>
          <Text style={[styles.statsCount, { color: '#10B981' }]}>{tamamlananSayisi}</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtnHeader}
          onPress={() => setAktifEkran('FORM')}
        >
          <Text style={styles.newBtnText}>+ Yeni</Text>
        </TouchableOpacity>
      </View>

      {/* Arama ve Filtreleme Alanı */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Başlık ile ara..."
          placeholderTextColor="#9CA3AF"
          value={aramaMetni}
          onChangeText={setAramaMetni}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
          {['Tümü', ...DURUMLAR].map((durum) => (
            <TouchableOpacity
              key={durum}
              style={[
                styles.chip,
                filtreDurum === durum && styles.chipActive,
              ]}
              onPress={() => setFiltreDurum(durum)}
            >
              <Text style={[styles.chipText, filtreDurum === durum && styles.chipTextActive]}>
                {durum}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Talep Listesi */}
      <FlatList
        data={filtrelenmisTalepler}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz gösterilecek arıza talebi yok.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleTalepDetayAc(item)} // G5
            onLongPress={() => handleUzunBasmaSil(item.id)} // G6
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.baslik}</Text>
              <View
                style={[
                  styles.badge,
                  item.durum === 'Bekliyor' && { backgroundColor: '#F59E0B' },
                  item.durum === 'İşlemde' && { backgroundColor: '#3B82F6' },
                  item.durum === 'Tamamlandı' && { backgroundColor: '#10B981' },
                ]}
              >
                <Text style={styles.badgeText}>{item.durum}</Text>
              </View>
            </View>

            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.aciklama}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.categoryText}>📁 {item.kategori}</Text>
              <Text style={styles.dateText}>{item.tarih}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // 2. YENİ TALEP OLUŞTURMA FORM EKRANI
  const renderFormEkrani = () => (
    <ScrollView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Yeni Arıza Talebi</Text>

        <Text style={styles.label}>Arıza Başlığı *</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Bilgisayar Açılmıyor"
          placeholderTextColor="#6B7280"
          value={baslik}
          onChangeText={setBaslik}
        />

        <Text style={styles.label}>Kategori Seçin *</Text>
        <View style={styles.categoryContainer}>
          {KATEGORILER.map((kat) => (
            <TouchableOpacity
              key={kat}
              style={[
                styles.categoryRadio,
                secilenKategori === kat && styles.categoryRadioSelected,
              ]}
              onPress={() => setSecilenKategori(kat)}
            >
              <Text
                style={[
                  styles.categoryRadioText,
                  secilenKategori === kat && styles.categoryRadioTextSelected,
                ]}
              >
                {kat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Açıklama *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detaylı açıklama yazınız..."
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={aciklama}
          onChangeText={setAciklama}
        />

        {/* Butonlar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleTalepEkle}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setAktifEkran('LISTE')}
        >
          <Text style={styles.cancelButtonText}>Vazgeç / Liste</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Üst Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akıllı Arıza Takibi</Text>
      </View>

      {/* Ekran Geçiş Kontrolü */}
      {aktifEkran === 'LISTE' ? renderListeEkrani() : renderFormEkrani()}

      {/* G5 & G7: Talebe Kısa Basınca Açılan Detay Modalı */}
      <Modal
        visible={detayModalAcik}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetayModalAcik(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {secilenTalep && (
              <>
                <Text style={styles.modalTitle}>{secilenTalep.baslik}</Text>
                
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Kategori:</Text>
                  <Text style={styles.modalValue}>{secilenTalep.kategori}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Tarih:</Text>
                  <Text style={styles.modalValue}>{secilenTalep.tarih}</Text>
                </View>

                <Text style={[styles.modalLabel, { marginTop: 10 }]}>Açıklama:</Text>
                <Text style={styles.modalDesc}>{secilenTalep.aciklama}</Text>

                {/* G7: Durum Güncelleme Butonları */}
                <Text style={[styles.modalLabel, { marginTop: 15 }]}>Durumu Güncelle:</Text>
                <View style={styles.durumBtnContainer}>
                  {DURUMLAR.map((durum) => (
                    <TouchableOpacity
                      key={durum}
                      style={[
                        styles.durumBtn,
                        secilenTalep.durum === durum && styles.durumBtnActive,
                      ]}
                      onPress={() => handleDurumDegistir(secilenTalep.id, durum)}
                    >
                      <Text
                        style={[
                          styles.durumBtnText,
                          secilenTalep.durum === durum && styles.durumBtnTextActive,
                        ]}
                      >
                        {durum}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setDetayModalAcik(false)}
                >
                  <Text style={styles.closeModalBtnText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- STİLLER (Modern Dark Theme) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  // İstatistik Kartı
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsTitle: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  statsCount: {
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#374151',
  },
  newBtnHeader: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  newBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Arama & Filtre
  filterContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1F2937',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 10,
  },
  chipScrollView: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#1F2937',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Talep Kartları
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F3F4F6',
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDesc: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 8,
  },
  categoryText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  dateText: {
    color: '#6B7280',
    fontSize: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
  // Form Stilleri
  formCard: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  label: {
    color: '#D1D5DB',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111827',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryRadio: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 8,
  },
  categoryRadioSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#1E3A8A',
  },
  categoryRadioText: {
    color: '#9CA3AF',
  },
  categoryRadioTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modalLabel: {
    color: '#9CA3AF',
    width: 90,
    fontWeight: 'bold',
  },
  modalValue: {
    color: '#F3F4F6',
    flex: 1,
  },
  modalDesc: {
    color: '#D1D5DB',
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  durumBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  durumBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  durumBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  durumBtnText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  durumBtnTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeModalBtn: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});