# Kompendium Deathwatch 
Zbiór najważniejszych zasad i przedmiotów do gry Deathwatch RPG z roku 2010, przetłumaczonych do mniej więcej zrozumiałej formy.

Czego się nie robi jako znudzony MG...

## Parser referencja
Wszystkie poniższe informacje można uzyskać po analizie kodu, ale nie ma po co skazywać ludzi na... Cóż, analizę tego kodu.

Wszystkie parametry oznaczone symbolem `?` na końcu są opcjonalne, jednak wszystkie tagi, jeżeli nie wyszczególniono inaczej, są wrażliwe na pozycję argumentu. Oznacza to, że do podania wartości argumentów pierwszego i trzeciego należy użyć składni `argument1||argument3`.

### Tagi linkujące
Tagi linkujące powodują wstawienie linku/przycisku powodującego przejście do innej sekcji, punktu... lub wywołanie rzutu kośćmi albo wyświetlenia tabeli. Wszystkie zapisywane są jako `@nazwa{argument1|argument2...}`.  Wszystkie parametry poza pierwszym są zawsze opcjonalne. Jeżeli przy wpisywaniu chcemy pominąć jakiś parametr i przejść do kolejnego, nie wpisujemy nic za oddzielającym go separatorem `|`. `alias` zawsze definiuje nazwę wyświetlania. Jeżeli tag produkujący link do zawartości nie znajdzie jej, nie zostanie sparsowany i w tekście wyjściowym pozostanie w swojej pierwotnej postaci.

#### Tagi kości
Tagi kości mają postać `@dice{dane}`. Występują one w dwóch formach: gdzie pierwszym argumentem jest formuła w notacji kości (np. `1d10`, `2d6+3`) i gdzie pierwszym argumentem jest liczba z zakresu 1-100 z doczepionym znakiem `%`.

Wspierane elementy notacji kości to liczba, rodzaj (liczba ścian), modyfikator i odrzucanie najniższych/najwyższych wyników. Podstawowa formuła może być osadzona zarówno wokół `d` (wersja angielska, np. `2d10`), jak i `k` (wersja polska, np. `8k6`).

Wersja pierwsza zapisywana jest `@dice{formuła|alias?}`. Funkcja odpowiadająca za rzucanie kośćmi odczyta odpowiednio elementy formuły i zwróci wynik w postaci obiektu zawierającego wszystkie dane, tablicę rzutów poszczególnymi kośćmi i końcowy wynik. Z perspektywy użytkownika wynik ten wyświetlany jest w wyskakującym okienku, które podaje wartości kości jak i sumę. Najmniejsze możliwe rzuty (1) są ponadto kolorowane na czerwono, a najwyższe (równe liczbie ścian kości) na zielono. Kości odrzucone są wyszarzane.

Wersja druga stworzona została do łatwego określania wyników rzutów procentowych tak-nie, które sformułowane są "jest x% szans, że...". Zapisywana jest `@dice{celRzutu%|alias?}`. Funkcja rzucająca automatycznie wybiera kość procentową (`k100`) jako tę używaną do rzutu. Wszystkie wyniki równe co najwyżej podanej wartości traktowane są jako sukces, a pozostałe jako porażka i taki też komunikat wyświetlany jest w okienku.

#### Tagi tabel
Tagi tabel mają postać `@table{nazwaTabeli|alias?}`. Nazwa tabeli porównywana jest z parametrem `name` w pliku z danymi, a więc z nazwą wewnętrzną, którą należy znać. Można je znaleźć w sekcji `tables` pliku. Kliknięcie na link wygenerowany w taki sposób powoduje otwarcie okienka tabel i wczytanie odpowiedniej tabeli.

#### Tagi adnotacji
Tagi adnotacji mają postać `@footnote{numer}`. Odwołują się one do adnotacji o podanym numerze należącym do aktualnej sekcji. Adnotacje sekcji zdefiniowane są we właściwości `footnotes`. Dla każdej adnotacji generowany jest symbol - odpowiednia liczba obelisków (&#x2020;). Nie można odnieść się do adnotacji, których treść rozpoczyna się od ciągu `{no-daggers}`, jako że nie są dla nich generowane symbole.

**UWAGA** - numeracja adnotacji zaczyna się od zera.

#### Tagi sekcji
Tagi sekcji mają postać `@nazwaSekcji{nazwaElementu|alias?|wartość?}`.
- `nazwaSekcji` musi odpowiadać jednej z sekcji najwyższego poziomu;
- `nazwaElementu` może być nazwą elementu `item` wewnątrz sekcji lub którejś z jej podsekcji, symbolem `<`, który wskazuje na samą sekcję, lub przyjąć postać `>nazwaPodsekcji`, gdzie link będzie wskazywał na podsekcję;
- `alias` jest jak zawsze parametrem opcjonalnym;
- `wartość` zostanie wpisana w nawiasach po wyświetlanej w linku nazwie.

### Tagi wstawiające
Wszystkie tagi wstawiające używają składni `%nazwa{argument1|argument2|...}`. Powodują one wstawienie bardziej złożonych struktur do treści sekcji lub punktu. Muszą być zawarte w osobnej linii, inaczej nie zostaną w ogóle sparsowane.

#### Tagi tabeli
Powodują wstawienie do tekstu tabeli. Używają składni `%table{nazwa}`. Wstawiona tabela ma ten sam styl, co zwijalne tabele sekcji.

#### Tagi cytatu
Powodują wstawienie do tekstu cytatu, który zajmował będzie od niemal całego ekranu na wąskich wyświetlaczach, do około 2/3 szerokości na szerszych. Używają składni `%quote{treść|autor?}`. Treść wpisywana jest większymi, pochyłymi literami, a poniżej wstawiany jest autor — jeżeli został zdefiniowany, jako że jest to parametr opcjonalny — poprzedzony myślnikiem.

#### Tagi przykładu
Powodują wstawienie ramki z tekstem mającym obrazować przykład — *e.g.* obrazujących zastosowanie podanych w poprzedniej treści reguł. Poprzedzone są nagłówkiem o treści "Przykład" i znajdują się w takiej samej ramce co tagi cytatu. Używają składni `%example{tekst}`. Parametr `tekst` może zawierać inne tagi, ponieważ jest on wtórnie parsowany.

### Tagi tekstowe
Nie powodują wstawiania struktur, a jedynie parsowanie samego tekstu. Operacja ta wykonywana jest przed parsowaniem tagów linkujących i wstawiających, w kolejności takiej jak wymieniono tagi.

#### Tagi operacji
Najbardziej rozbudowane składniowo. Zapisywane są `${operacja:pole|arg1=a|arg2|...}`. Operują na wartościach tzw. lokalnego dostawcy, czyli bezpośrednio na polach obiektu reprezentującego dany punkt. Argumenty podane mogą być z wartością po znaku równości, lub jako sama nazwa — parser przypisuje wtedy wartość `true`.

Aktualnie wspierane operacje:
- `bool`: enumeracja logiczna. Wstawia wartość `ifTrue: string` (domyślnie: "tak") albo `ifFalse: string` (domyślnie: "nie") na podstawie wartości podanego pola;
- `insert`: wstawienie. Wstawia wartość podanego pola;
- `insertKeys`: wstawienie kluczy. Wstawia listę nazw własności zawartych w podanym polu (musi być ono obiektem);
- `insertValues`: wstawienie wartości. Wstawia listę własności zawartych w podanym polu (musi być ono obiektem);
- `insertArray`: wstawia listę wartości pobraną z będącego tablicą pola.

Dodatkowe wspólne argumenty:
- `capitalize: bool`: kapitalizacja wartości wyjściowych;
- `sep: string`: używana przez operacje listowe, takie jak `insertArray` lub `insertKeys`. Łańcuch, który oddzielał będzie poszczególne wczytane wartości.

#### Tagi substytucji specjalnej
Zapisywane są jako `$nazwa`. Używane są nie tylko przez sam komponent parsera. W definicjach tabel `nazwa` może być nazwą pola (wtedy pole interpretowane jest w specjalny sposób, na przykład `$name` produkuje kolumnę zawierającą linki do poszczególnych punktów w sekcji) lub specjalną wartością `roll` informującą o przekształceniu tabeli w taką z możliwością wyboru wiersza przez rzut kością. Inne powodują substytucję zmiennych kontekstowych, takich jak `$parent` w opisach wariantów punktu.

#### Tagi substytucji pól \[WIP\]
Zapisywane są jako `$this.pole` i zastępowane są wartością pola `pole` dostawcy globalnego, będącego częścią znajdującego się aktualnie w budowie modułu kart postaci. Na przykład `$this.pr` zastępowane jest PM pobranym z aktualnej karty.

#### Tagi obliczeniowe
Zapisywane są pomiędzy symbolami `^` w formacie ONP (znanej w nomenklaturze anglojęzycznej jako RPN), która jest łatwym do parsowania i pozbawionym nawiasów systemem notacji. Na przykład `^5 8 * 2 +^` oznacza `(5 * 8) + 2`. Wspierane operacje to dodawanie `+`, odejmowanie `-`, mnożenie `*` i dzielenie `/`. Zaznaczyć należy *dlaczego* tagi te rozwiązywane są jako ostatnie z tekstowych: otóż wymagają działania niektórych z poprzednich. Dla przykładu z definicji punktu `grenade->blind` mamy `"range": "^$this.strength 3 *^"`. Zauważyć da się tu substutucję pola `strength`, która musi być wykonana wcześniej, jako że operacje matematyczne parsera rozpoznają wyłącznie liczby i operatory.
Można do nich również dodawać komentarze zamknięte między `#`. Wyświetlane są one gdy parser nie ma odpowiednich danych do wykonania substytucji (co nie jest sprawdzane bezpośrednio przez moduł matematyczny, a jedynie wnioskowane, gdy resolwer natrafi na symbol niebędący liczbą ani operatorem). Podpowiada to prawidłową formę poprzedniej linijki: `"range": "^$this.strength 3 *^#S \u00d7 3#"`.

## Zmiany

### 0.13.0
Czy ktoś powiedział "rozbudowa parsera i rewizja systemu tabel"? Nie? No dobrze...

### 0.12.0
Pierwsza wersja, od której pokazywane będą postępy. Aktualnie zaimplementowane są wszystkie ważniejsze rzeczy, w tym autorski format, w jakim zapisywane są wewnętrzne dane - RPC - i korzystający z niego parser.

No i autor wreszcie zabrał się za zedytowanie domyślnego readme. Najwyższy czas.

Cele na przyszłość: dokończyć to, co już jest; najpierw opisy (dużo opisów), potem obrazki gdzie można.
