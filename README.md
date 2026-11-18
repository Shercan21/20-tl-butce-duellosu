# 20 TL — Bütçe Düellosu

**[Oyunu oyna](https://shercan21.github.io/20-tl-butce-duellosu/)**

Türkçe, mobil uyumlu, çevrimdışı çalışabilen bir açık artırma PWA oyunu. Bilgisayara karşı, aynı cihazda iki kişiyle veya oda koduyla çevrimiçi 2–8 kişiyle oynanır. Gerçek para, ödeme veya hesap gerekmez.

## Oynanış

- Her kategoride her oyuncu 20 TL oyun bütçesiyle başlar.
- Her kategori 10 farklı ürün türü içerir. Tur sayısı katılan oyuncu sayısının 5 katıdır: 2 kişide 10, 4 kişide 20, 8 kişide 40 tur. Ürünler karıştırılır ve tekrar turlarında farklı kopyaları çıkabilir. Gizli, tam sayı teklifler verilir. Yalnızca kazanan kendi teklifini öder.
- Sıfır teklif pas demektir; herkes pas geçerse ürün alınmaz.
- Eşit pozitif teklifte öncelik tur numarasına göre oyuncular arasında döner. En yüksek teklifi verenler arasından bu döngüde ilk sırada olan kazanır.
- Ürün puanlarına her farklı ürün grubu için 2 puan eklenir. Eşit puanda kalan bütçe belirleyicidir.
- Kategoriler seçilen temadan başlayarak sıralı veya tekrarsız rastgele oynanır. Kategori değişiminde bütçeler sıfırlanır; seri skoru tutulur.
- Yerel oyun ilerlemesi tarayıcıda saklanır. Çevrimiçi odaların durumu oyun sunucusunda saklanır; gizli oyuncu anahtarın cihazında kalır. Oda bağlantısı bu anahtarı içermez.

## Kategoriler

Tropik ada, yatak odası, oturma odası, misafir salonu, işyeri, dekor, elbise ve kombin, takı, bilgisayar, futbol stadyumu, hayvanat bahçesi, kahvaltı, mutfak, banyo, çocuk odası, oyun odası, bahçe, garaj, kafe, restoran, mağaza, otel, tatil, kamp, lunapark, akvaryum, uzay üssü, müzik stüdyosu, ev sineması, spor salonu, sınıf ve şehir kurma. Her kategoride 10 farklı ürün bulunur.

## Çalıştırma

Node.js ile `node server.cjs`, ardından tarayıcıda http://127.0.0.1:4187 adresini açın. Kurulum veya paket indirme gerekmez. Otomatik kontroller: `node --test tests/game.test.cjs tests/online.test.cjs tests/visuals.test.cjs`.

`dist/` doğrudan statik sunucuda yayınlanabilir. Alt dizinlere uyumludur (örneğin GitHub Pages). PWA kurulumu ve servis çalışanı için HTTPS veya localhost gereklidir; dosyayı çift tıklayarak açmak yeterli değildir.

## Telefona yükleme

Android Chrome: menü → Ana ekrana ekle / Uygulamayı yükle. iOS Safari: Paylaş → Ana Ekrana Ekle. İlk başarılı yüklemeden sonra yerel modlar çevrimdışı oynanır. Çevrimiçi mod internet gerektirir. Tarayıcı verilerini silmek ilerlemeyi de siler.

## Yapı

`dist/catalog.js` kategori içerikleri, `dist/game.js` oyun kuralları, `dist/app.js` arayüz ve kayıt, `dist/sw.js` çevrimdışı önbellek. Çevrimiçi mod için Cloudflare Workers ve D1 üzerinde barındırılan oyun sunucusu kullanılır; tarayıcı yalnızca yetkili olduğu odanın durumunu alır. Sunucu oyuncu anahtarlarının yalnızca SHA-256 özetlerini saklar. Teklifler sunucuda doğrulanır ve herkes teklif vermeden diğer oyunculara gönderilmez. Kullanıcı takibi, harici font veya ücretli istemci bağımlılığı içermez. Videodan medya veya marka varlığı kullanılmamıştır.


## Çevrimiçi oynama

1. Menüden Çevrimiçi 2–8 kişi seçin.
2. Kategori, akış ve oda kapasitesini seçip oda açın.
3. Oda kodunu veya davet bağlantısını arkadaşlarınızla paylaşın.
4. Herkes kendi cihazından katılsın; kurucu en az 2 kişiyle oyunu başlatsın.
5. Bütün teklifler tamamlanınca sonuç açılır. Herkes hazır olduğunda tur / kategori değişir.

Sayfa yenilenince Çevrimiçi odama dön ile devam edilir. Odalar 24 saat geçerlidir. Oda kurulduktan sonra kapasite sabittir, oyun başlayınca yeni oyuncu katılamaz. Menüye dönmek odayı kapatmaz. Odadan ayrıl düğmesi odadaki oyunu herkes için kapatır.

`online-server/worker.mjs` sunucu mantığı, `online-server/drizzle/` şema geçişleri, `online-server/build.cjs` bağımlılıksız sunucu paketleyicisidir. Yerel otomatik sunucu testleri Node.js 22.13+ SQLite API kullanır. Yayında `DB` adlı D1 bağlantısı gerekir. İstekler 1,5 saniyelik aralıklarla eşitlenir; gizli sekmelerde aralık 8 saniyedir. Eşzamanlı değişiklikler sürüm denetimiyle atomik olarak uygulanır.

## Canlı görsel sahneler

32 kategori için gerçek resimlerden oluşan arka planlar ve 320 ürün görseli vardır. Kahvaltıda yiyecekler ahşap masaya, odalarda eşyalar zemine ve duvarlara, tropik adada palmiye, muz ağacı ve maymun kumsala yerleşir. Satın alınmayan ürün sahnede görünmez. Aynı türün kopyaları tek görsel ve adet etiketiyle gösterilir. Ürünler sayıya göre büyüyüp küçülen, aralıklı ve çakışmayan yerlere dizilir. Sahnedeki büyüt düğmesi ayrıntılı görünümü açar. Azaltılmış hareket tercihi desteklenir.

Görseller `dist/assets/`, yerleştirme sistemi `dist/visuals.js`, eşleme dosyası `dist/art-map.js` içindedir. Görseller yerleşik görüntü üretim aracıyla üretildi; `artwork/prompts.json` üretim istemlerini, `artwork/manifest.json` görsel eşlemesini içerir. WebP optimizasyonu alfa saydamlığını korur. Orijinal referans görsel kullanıcıya aittir ve bu depoya kopyalanmadı.

Masaüstü kopyasındaki **Oyunu Aç.url** dosyası yayındaki oyunu açar. Yerel çalıştırmak için `node server.cjs` kullanılır.

## Derinlikli sahne yerleşimi

Canlı özgün ürün görselleri korunur. Bunlar perspektif kamerada fiziksel konumlara sabitlenmiş, kameraya dönen görsel panolar olarak çizilir; tüm ürünler hacimli model değildir. Zeminler, kahvaltı masası, stadyum sahası, tribün basamakları, koltuklar ve kale gibi yapısal parçalar 3B geometridir. Çim satın alınmadan yeşil saha oluşmaz, koltuklar yalnızca tribün bölgelerine yerleşir. Mobilyalar odada belirlenmiş alanlara gider. Aynı türün kopyaları adet etiketiyle gösterilir. Sürükleyerek döndürme, yakınlaştırma, uzaklaştırma ve kamerayı sıfırlama kontrolleri vardır. WebGL 2 destekli güncel tarayıcı gereklidir.

Three.js 0.187.0 dosyaları ve lisansı `dist/vendor/` içinde yereldir. Görünür sahneler için çizici açılır; ekran dışına çıkan sahnelerin GPU kaynakları bırakılır. `dist/photo-world.js` görsel malzemeleri ve yapıları, `dist/scene-plan.js` kategori alanlarını, `dist/world-3d.js` kamera ve yaşam döngüsünü yönetir.
