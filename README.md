# Kompendium Deathwatch 
Zbiór najważniejszych zasad i przedmiotów do gry Deathwatch RPG z roku 2010, przetłumaczonych do mniej więcej zrozumiałej formy.

Czego się nie robi jako znudzony MG...

## Parser referencja
Wszystkie poniższe informacje można uzyskać po analizie kodu, ale nie ma po co skazywać ludzi na... Cóż, analizę tego kodu.

### Ogólna składnia
Wszystkie tagi zapisywane są jako `@nazwa{argument1|argument2...}`.  Wszystkie parametry poza pierwszym są zawsze opcjonalne. Jeżeli przy wpisywaniu chcemy pominąć jakiś parametr i przejść do kolejnego, nie wpisujemy nic za oddzielającym go separatorem `|`. `alias` zawsze definiuje nazwę wyświetlania. Jeżeli tag produkujący link do zawartości nie znajdzie jej, nie zostanie sparsowany i w tekście wyjściowym pozostanie w swojej pierwotnej postaci.

### Tagi kości
Tagi kości mają postać `@dice{dane}`. Występują one w dwóch formach: gdzie pierwszym argumentem jest formuła w notacji kości (np. `1d10`, `2d6+3`) i gdzie pierwszym argumentem jest liczba z zakresu 1-100 z doczepionym znakiem `%`.

Wspierane elementy notacji kości to liczba, rodzaj (liczba ścian), modyfikator i odrzucanie najniższych/najwyższych wyników. Podstawowa formuła może być osadzona zarówno wokół `d` (wersja angielska, np. `2d10`), jak i `k` (wersja polska, np. `8k6`).

Wersja pierwsza zapisywana jest `@dice{formuła|alias}`. Funkcja odpowiadająca za rzucanie kośćmi odczyta odpowiednio elementy formuły i zwróci wynik w postaci obiektu zawierającego wszystkie dane, tablicę rzutów poszczególnymi kośćmi i końcowy wynik. Z perspektywy użytkownika wynik ten wyświetlany jest w wyskakującym okienku, które podaje wartości kości jak i sumę. Najmniejsze możliwe rzuty (1) są ponadto kolorowane na czerwono, a najwyższe (równe liczbie ścian kości) na zielono. Kości odrzucone są wyszarzane.

Wersja druga stworzona została do łatwego określania wyników rzutów procentowych tak-nie, które sformułowane są "jest x% szans, że...". Zapisywana jest `@dice{celRzutu%|alias}`. Funkcja rzucająca automatycznie wybiera kość procentową (`k100`) jako tę używaną do rzutu. Wszystkie wyniki równe co najwyżej podanej wartości traktowane są jako sukces, a pozostałe jako porażka i taki też komunikat wyświetlany jest w okienku.

### Tagi tabel
Tagi tabel mają postać `@table{nazwaTabeli|alias}`. Nazwa tabeli porównywana jest z parametrem `name` w pliku z danymi, a więc z nazwą wewnętrzną, którą należy znać. Można je znaleźć w sekcji `tables` pliku. Kliknięcie na link wygenerowany w taki sposób powoduje otwarcie okienka tabel i wczytanie odpowiedniej tabeli.

### Tagi adnotacji
Tagi adnotacji mają postać `@footnote{numer}`. Odwołują się one do adnotacji o podanym numerze należącym do aktualnej sekcji. Adnotacje sekcji zdefiniowane są we właściwości `footnotes`. Dla każdej adnotacji generowany jest symbol - odpowiednia liczba obelisków (&#x2020;). Nie można odnieść się do adnotacji, których treść rozpoczyna się od ciągu `{no-daggers}`, jako że nie są dla nich generowane symbole.

**UWAGA** - numeracja adnotacji zaczyna się od zera.

### Tagi sekcji
Tagi sekcji mają postać `@nazwaSekcji{nazwaElementu|alias|wartość}`.
- `nazwaSekcji` musi odpowiadać jednej z sekcji najwyższego poziomu;
- `nazwaElementu` może być nazwą elementu `item` wewnątrz sekcji lub którejś z jej podsekcji, symbolem `<`, który wskazuje na samą sekcję, lub przyjąć postać `>nazwaPodsekcji`, gdzie link będzie wskazywał na podsekcję;
- `alias` jest jak zawsze parametrem opcjonalnym;
- `wartość` zostanie wpisana w nawiasach po wyświetlanej w linku nazwie.

## Zmiany

### 0.12.0
Pierwsza wersja, od której pokazywane będą postępy. Aktualnie zaimplementowane są wszystkie ważniejsze rzeczy, w tym autorski format, w jakim zapisywane są wewnętrzne dane - RPC - i korzystający z niego parser.

No i autor wreszcie zabrał się za zedytowanie domyślnego readme. Najwyższy czas.

Cele na przyszłość: dokończyć to, co już jest; najpierw opisy (dużo opisów), potem obrazki gdzie można.# Kompendium Deathwatch 

Zbiór najważniejszych zasad i przedmiotów do gry Deathwatch RPG z roku 2010, przetłumaczonych do mniej więcej zrozumiałej formy.

Czego się nie robi jako znudzony MG...

## Parser reference
Wszystkie poniższe informacje można uzyskać po analizie kodu, ale nie ma po co skazywać ludzi na... Cóż, analizę tego kodu.


## Zmiany

### 0.12.0
Pierwsza wersja, od której pokazywane będą postępy. Aktualnie zaimplementowane są wszystkie ważniejsze rzeczy, w tym autorski format, w jakim zapisywane są wewnętrzne dane - RPC - i korzystający z niego parser.