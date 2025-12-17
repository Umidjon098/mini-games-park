# Mini O'yinlar Bog'i

5–10 yoshdagi bolalar uchun brauzerda ishlaydigan mini-o'yinlar platformasi. To'liq client-side: HTML + CSS + JS.

## Lokal ishga tushirish

```bash
cd /home/user/Downloads/kids_3d_village_demo/mini-games-park
python3 -m http.server 8080
```

Ochish:

- `http://localhost:8080/index.html`

## Texnik eslatmalar

- Lokal media fayllar yo'q: rasm/ovoz/animatsiyalar URL orqali yuklanadi (Picsum, Dicebear, Pixabay, Lottie).
- Audio: Howler.js (CDN), Sozlamalarda global ovoz yoqish/o'chirish.
- Ballar: `localStorage`da saqlanadi (har o'yin bo'yicha Top 10 va "Hammasi" ko'rinishi).

## Sahifalar

- `index.html` Bosh sahifa
- `games.html` Boshqotirma, Xotira, Sakrash, Labirint
- `leaderboard.html` Eng yaxshi natijalar (o'yin bo'yicha saralash)
- `settings.html` Ovoz + ballarni tozalash
# mini-games-park
