# Ølsalg

Cloudflare worker som sender daglig varsel om når ølsalget stenger. Gir ekstra varsel dersom morgendagen har en uvanlig stengetid. Sender meldinger til discord gjennom en simpel webhook. Workeren trigges av en cron jobb kl. 16 hver dag.

Mangler å ta høyde for valgdagen. Kjedelig at ikke det er en fast dato gitt. Ellers regnes det meste ut _tror_ jeg:

# Utgangspunkt

## Ølsalgsregler

- Hverdager kl. 09:00–20:00
- Lørdager kl. 09:00–18:00
- Søndager og helligdager - ikke ølsalg
- Onsdag før skjærtorsdag kl. 09:00–18:00
- Påskeaften kl 09:00–16:00
- Dagen før 1. mai - ordinære salgstider
- 1\. mai - ikke ølsalg
- Dagen før 17. mai - ordinære salgstider
- 17\. mai - ikke ølsalg
- Dagen før Kristi Himmelfartsdag - ordinære salgstider
- Pinseaften kl. 09:00–16:00
- Julaften kl. 09:00–16:00 (ikke på søndager)
- Nyttårsaften kl. 09:00–18:00 (ikke på søndager)
- Valgdagen kl. 09:00–20:00 (ikke på søndager)

_Fra: [Oslo kommune](https://www.oslo.kommune.no/skatt-og-naring/salg-servering-og-skjenking/salgstider-for-ol/)_

## Helligdager i henhold til helligdagsfredloven

| Dato              | Navn                  | Bemerkninger                                                               | 2024     |
| ----------------- | --------------------- | -------------------------------------------------------------------------- | -------- |
| 1. januar         | Første nyttårsdag     |                                                                            | mandag   |
| Bevegelig torsdag | Skjærtorsdag          | Torsdag før første påskedag                                                | 28. mars |
| Bevegelig fredag  | Langfredag            | Fredag før første påskedag                                                 | 29. mars |
| Bevegelig søndag  | Første påskedag       | Første søndag etter første fullmåne som inntreffer på eller etter 21. mars | 31. mars |
| Bevegelig mandag  | Andre påskedag        | Dagen etter første påskedag                                                | 1. april |
| Bevegelig torsdag | Kristi himmelfartsdag | 39 dager (40. dag) etter påske                                             | 9. mai   |
| Bevegelig søndag  | Første pinsedag       | 49 dager (50. dag) etter påske                                             | 19. mai  |
| Bevegelig mandag  | Andre pinsedag        | 50 dager (51. dag) etter påske                                             | 20. mai  |
| 25. desember      | Første juledag        |                                                                            | onsdag   |
| 26. desember      | Andre juledag         |                                                                            | torsdag  |
|                   | Søndag                |                                                                            |          |

_Høytidsdagene 1. mai og 17. mai er røde dager på kalenderen, men er ikke helligdager._
_Fra [Wikipedia](https://no.wikipedia.org/wiki/Helligdager_i_Norge)_


Sjukehus formel for å regne ut påsken btw: [Wikipedia](https://en.wikipedia.org/wiki/Date_of_Easter#Gauss's_Easter_algorithm)
