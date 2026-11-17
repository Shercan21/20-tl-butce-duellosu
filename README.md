# 20 TL — Bütçe Düellosu

**[Oyunu oyna](https://shercan21.github.io/20-tl-butce-duellosu/)**

Türkçe, mobil uyumlu, çevrimdışı çalışabilen bir açık artırma PWA oyunu. Aynı cihazda iki kişiyle veya gizli teklifini önceden belirleyen bilgisayara karşı oynanır. Gerçek para, ödeme veya hesap gerekmez.

## Oynanış

- Her kategoride iki oyuncu da 20 TL oyun bütçesiyle başlar.
- 10 ürün için gizli, tam sayı teklifler verilir. Yalnızca kazanan kendi teklifini öder.
- Sıfır teklif pas demektir; iki oyuncu da pas geçerse ürün alınmaz.
- Eşit pozitif teklifte öncelik tek numaralı turlarda Oyuncu 1, çift numaralı turlarda Oyuncu 2 / bilgisayardadır.
- Ürün puanlarına her farklı ürün grubu için 2 puan eklenir. Eşit puanda kalan bütçe belirleyicidir.
- Kategoriler seçilen temadan başlayarak sıralı veya tekrarsız rastgele oynanır. Kategori değişiminde bütçeler sıfırlanır; seri skoru tutulur.
- Oyun ilerlemesi yalnızca bu tarayıcının yerel depolamasında saklanır. İki kişilik mod yereldir, çevrimiçi çok oyunculu değildir.

## Kategoriler

Yatak odası, oturma odası, misafir salonu, işyeri, dekor, elbise ve kombin, takı, bilgisayar, futbol stadyumu, hayvanat bahçesi, kahvaltı, mutfak, banyo, çocuk odası, oyun odası, bahçe, garaj, kafe, restoran, mağaza, otel, tatil, kamp, lunapark, akvaryum, uzay üssü, müzik stüdyosu, ev sineması, spor salonu, sınıf ve şehir kurma. Her kategoride 10 farklı ürün bulunur.

## Çalıştırma

Node.js ile `node server.cjs`, ardından tarayıcıda http://127.0.0.1:4187 adresini açın. Kurulum veya paket indirme gerekmez. Otomatik kontroller: `node --test tests/game.test.cjs`.

`dist/` doğrudan statik sunucuda yayınlanabilir. Alt dizinlere uyumludur (örneğin GitHub Pages). PWA kurulumu ve servis çalışanı için HTTPS veya localhost gereklidir; dosyayı çift tıklayarak açmak yeterli değildir.

## Telefona yükleme

Android Chrome: menü → Ana ekrana ekle / Uygulamayı yükle. iOS Safari: Paylaş → Ana Ekrana Ekle. İlk başarılı yüklemeden sonra çevrimdışı oynanır. Tarayıcı verilerini silmek ilerlemeyi de siler.

## Yapı

`dist/catalog.js` kategori içerikleri, `dist/game.js` oyun kuralları, `dist/app.js` arayüz ve kayıt, `dist/sw.js` çevrimdışı önbellek. Dış servis, kullanıcı takibi, harici font veya ücretli bağımlılık içermez. Videodan medya veya marka varlığı kullanılmamıştır.

