# Akıllı Arıza Talep Yönetimi

Expo ve React Native kullanılarak geliştirilmiş, teknik destek ve arıza bildirimlerinin anlık olarak yönetilmesini sağlayan mobil uygulama.

---

## 🚀 Öne Çıkan Özellikler

* **Yeni Arıza Talebi Oluşturma:** Başlık, kategori ve açıklama girilerek yeni talep ekleme.
* **Form Doğrulaması:** Boş veya yalnızca boşluk içeren geçersiz girdilerin engellenmesi ve hata bildirimleri.
* **Detay Görünümü & Durum Güncelleme:** Talebe kısa dokunarak detayları görme; durumunu *Bekliyor*, *İşlemde* veya *Tamamlandı* olarak değiştirme.
* **Güvenli Silme:** Talebe uzun basıldığında onay pencereli (Alert) silme mekanizması.
* **Canlı Arama & Filtreleme:** Başlığa göre anlık arama yapma ve duruma göre kartları filtreleme.
* **İstatistik Paneli:** Toplam ve tamamlanan talep sayılarını anlık hesaplayan canlı panel.

---

## 🛠️ Kullanılan Teknolojiler

* **Framework:** Expo / React Native
* **Dil:** JavaScript (ES6+)
* **State Yönetimi:** React Hooks (`useState`)

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# 1. Depoyu klonlayın
git clone <GITHUB_REPO_URL>

# 2. Proje dizinine geçin
cd proje-adi

# 3. Bağımlılıkları yükleyin
npm install

# 4. Uygulamayı başlatın
npx expo start
