# Mahallece

**Mahallece: Afet Risk Azaltma Gönüllü Ağı** projesinin tek sayfalık sitesi.
Avrasya Tüneli ile Afet Bilinci Eğitim ve Araştırma Derneği'nin iş birliğiyle yürütülen proje için hazırlandı.
Ana siteden (`abea-web`) bağımsızdır; kendi deposu ve kendi yayını vardır.

## Nasıl çalışır

Düz HTML, CSS ve biraz JavaScript. Derleme adımı ve kurulacak paket yok.

Bilgisayarda açmak için klasörde:

```
python -m http.server 4100
```

Sonra tarayıcıda `http://localhost:4100`.

Yayın: Vercel bu depoyu olduğu gibi yayınlar (ayar gerekmez). `main` dalına gönderilen her değişiklik kendiliğinden yayına girer.

## Nerede ne var

| Dosya | İçerik |
|---|---|
| `index.html` | Sayfanın tamamı: metinler, bölümler, logolar |
| `assets/css/style.css` | Görünüm. Renkler en üstte (`:root`) tanımlı |
| `assets/js/main.js` | Formun sayfa içinde açılması, bölümlerin belirmesi |
| `assets/img/` | Avrasya Tüneli logosu, site ikonu |
| `belgeler/mahallece-bilgi-notu.pdf` | "Bilgi notunu indir" butonunun verdiği dosya |

Metinler bilgi notundan (`Mahallece.Bilgi Notu.pdf`) alındı.

## Gönüllü başvuru formu

Form Jotform'da durur (`form.jotform.com/262603393965061`) ve sayfanın içinde bir çerçevede açılır; ziyaretçi siteden çıkmaz.

- Form ancak "Gönüllü Ol" butonuna basılınca yüklenir.
- Formdaki her değişiklik Jotform'da yapılır; sitede kendiliğinden görünür.
- Başka bir form bağlanacaksa `assets/js/main.js` içindeki `FORM_ID` ve `index.html`'deki `form.jotform.com/...` bağlantıları değiştirilir.
- `…/#basvuru` adresi sayfayı form açık olarak getirir.

## Yayına alırken

Site şu an demo olduğu için arama motorlarına kapalı. Yayına alırken:

1. `index.html` içindeki `<meta name="robots" content="noindex, nofollow">` satırı silinir.
2. `robots.txt` içindeki `Disallow: /` satırı `Allow: /` yapılır.
3. Vercel'de alan adı (`mahallece.afetbilinci.org`) projeye eklenir ve alan adının DNS kayıtlarına Vercel'in verdiği kayıt girilir.
