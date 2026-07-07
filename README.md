# Codex Vigilis
Zbiór najważniejszych zasad i przedmiotów do gry Deathwatch RPG z roku 2010, przetłumaczonych do mniej więcej zrozumiałej formy.

Czego się nie robi jako znudzony MG...

## Parser referencja
Wszystkie poniższe informacje można uzyskać po analizie kodu, ale nie ma po co skazywać ludzi na... Cóż, analizę tego kodu.

Wszystkie parametry oznaczone symbolem `?` na końcu są opcjonalne, jednak wszystkie formatki, jeżeli nie wyszczególniono inaczej, są wrażliwe na pozycję argumentu. Oznacza to, że do podania wartości argumentów pierwszego i trzeciego należy użyć składni `argument1||argument3`.

### Formatki linkujące
Formatki linkujące powodują wstawienie linku/przycisku powodującego przejście do innej sekcji, punktu... lub wywołanie rzutu kośćmi albo wyświetlenia tabeli. Wszystkie zapisywane są jako `@nazwa{argument1|argument2...}`.  Wszystkie parametry poza pierwszym są zawsze opcjonalne. Jeżeli przy wpisywaniu chcemy pominąć jakiś parametr i przejść do kolejnego, nie wpisujemy nic za oddzielającym go separatorem `|`. `alias` zawsze definiuje nazwę wyświetlania. Jeżeli formatka produkująca link do zawartości nie znajdzie jej, nie zostanie sparsowana i w tekście wyjściowym pozostanie w swojej pierwotnej tekstowej postaci.

#### Formatki kości
Formatki kości mają postać `@dice{dane}`. Występują one w dwóch formach: gdzie pierwszym argumentem jest formuła w notacji kości (np. `1d10`, `2d6+3`) i gdzie pierwszym argumentem jest liczba z zakresu 1-100 z doczepionym znakiem `%`.

Wspierane elementy notacji kości to liczba, rodzaj (liczba ścian), modyfikator i odrzucanie najniższych/najwyższych wyników. Podstawowa formuła może być osadzona zarówno wokół `d` (wersja angielska, np. `2d10`), jak i `k` (wersja polska, np. `8k6`).

Wersja pierwsza zapisywana jest `@dice{formuła|alias?}`. Funkcja odpowiadająca za rzucanie kośćmi odczyta odpowiednio elementy formuły i zwróci wynik w postaci obiektu zawierającego wszystkie dane, tablicę rzutów poszczególnymi kośćmi i końcowy wynik. Z perspektywy użytkownika wynik ten wyświetlany jest w wyskakującym okienku, które podaje wartości kości jak i sumę. Najmniejsze możliwe rzuty (1) są ponadto kolorowane na czerwono, a najwyższe (równe liczbie ścian kości) na zielono. Kości odrzucone są wyszarzane.

Wersja druga stworzona została do łatwego określania wyników rzutów procentowych tak-nie, które sformułowane są "jest x% szans, że...". Zapisywana jest `@dice{celRzutu%|alias?}`. Funkcja rzucająca automatycznie wybiera kość procentową (`k100`) jako tę używaną do rzutu. Wszystkie wyniki równe co najwyżej podanej wartości traktowane są jako sukces, a pozostałe jako porażka i taki też komunikat wyświetlany jest w okienku.

#### Formatki tabel
Formatki tabel mają postać `@table{nazwaTabeli|alias?}`. Nazwa tabeli porównywana jest z parametrem `name` w pliku z danymi, a więc z nazwą wewnętrzną, którą należy znać. Można je znaleźć w sekcji `tables` pliku. Kliknięcie na link wygenerowany w taki sposób powoduje otwarcie okienka tabel i wczytanie odpowiedniej tabeli.

#### Formatki adnotacji/przypisów
Formatki adnotacji mają postać `@footnote{numer}`. Odwołują się one do adnotacji o podanym numerze należącym do aktualnej sekcji. Adnotacje sekcji zdefiniowane są we właściwości `footnotes`. Dla każdej adnotacji generowany jest symbol - odpowiednia liczba obelisków (&#x2020;). Nie można odnieść się do adnotacji, których treść rozpoczyna się od ciągu `{no-daggers}`, jako że nie są dla nich generowane symbole.

**UWAGA** - numeracja adnotacji zaczyna się od zera.

#### Formatki sekcji
Formatki sekcji mają postać `@nazwaSekcji{nazwaElementu|alias?|wartość?}`.
- `nazwaSekcji` musi odpowiadać jednej z sekcji najwyższego poziomu;
- `nazwaElementu` może być nazwą elementu `item` wewnątrz sekcji lub którejś z jej podsekcji, symbolem `<`, który wskazuje na samą sekcję, lub przyjąć postać `>nazwaPodsekcji`, gdzie link będzie wskazywał na podsekcję;
- `alias` jest jak zawsze parametrem opcjonalnym;
- `wartość` zostanie wpisana w nawiasach po wyświetlanej w linku nazwie.

##### Optymalizacja
Biorąc pod uwagę liczbę parsowanych formatek sekcji przy każdym przejściu na kolejną podstronę, pojawiła się potrzeba optymalizacja rozwiązywania żądanych punktów. Przy jednym uruchomieniu aplikacji w pamięci zachowywany jest obiekt mapujący w prosty sposób wszystkie żądania. Jeśli żądany punkt nie zostanie tam znaleziony, wówczas dopiero jest w całości rozwiązywany, a następnie dopisywany do tego "skorowidza" w celu przyspieszenia rozwiązywania kolejnych żądań.

### Formatki wstawiające
Wszystkie formatki wstawiające używają składni `%nazwa{argument1|argument2|...}`. Powodują one wstawienie bardziej złożonych struktur do treści sekcji lub punktu. Muszą być zawarte w osobnej linii, inaczej nie zostaną w ogóle sparsowane.

#### Formatki tabeli
Powodują wstawienie do tekstu tabeli. Używają składni `%table{nazwa}`. Wstawiona tabela ma ten sam styl, co tabele generowane dla sekcji.

#### Formatki cytatu
Powodują wstawienie do tekstu cytatu, który zajmował będzie od niemal całego ekranu na wąskich wyświetlaczach, do około 2/3 szerokości na szerszych. Używają składni `%quote{treść|autor?}`. Treść wpisywana jest większymi, pochyłymi literami, a poniżej wstawiany jest autor — jeżeli został zdefiniowany, jako że jest to parametr opcjonalny — poprzedzony myślnikiem.

#### Formatki stylu
Zapisywane w formacie `![style]#zawartość#`. Wspierane style to:

- `i` kursywa;
- `b` pogrubienie;
- `c` kapitaliki. 

Kilkakrotne powtórzenie stylu nie "zepsuje" parsera, na przykład `![iii]#zawartość#` nadal da tylko _zawartość_.

### Formatki tekstowe
Nie powodują wstawiania struktur, a jedynie parsowanie samego tekstu. Operacja ta wykonywana jest przed parsowaniem formatek linkujących i wstawiających, w kolejności takiej, w jakiej zostały poniżej wymienione.

#### Formatki operacji
Najbardziej rozbudowane składniowo. Zapisywane są `${operacja:pole|arg1=a|arg2|...}`. Operują na wartościach tzw. lokalnego dostawcy, czyli bezpośrednio na polach obiektu reprezentującego dany punkt. Argumenty podane mogą być z wartością po znaku równości, lub jako sama nazwa — parser przypisuje wtedy wartość `true`.

##### Pole
`pole` to "spłaszczony" (oddzielony kropkami) klucz pola dostawcy, w którym znajdują się poszukiwane dane.

```
{
    "foo": "f00",
    "bar": {
        "baz": true,
        "bar": 2
    }
}
```

Wartości zapisane pod adresami `pola` w powyższym obiekcie:
- `foo`: `"f00"`
- `bar`: obiekt — zamiana na tekst da `[Object object]`
- `bar.baz`: `true`
- `bar.bar`: `2`

Przewidywane jest w przyszłości wsparcie również dla dostępu do konkretnych indeksów tablic.

Pole może również używać dwóch specjalnych modyfikatorów:
- `#foo.bar.baz` oznacza poszukiwanie od "korzenia" dostępnych danych, a więc "wyjęty" zostałby punkt `bar` w sekcji głównej `foo`. Dostępne są również adnotacje źródła w postaci `#foo=s1.bar=s2.baz`;
- `foo.@bar=baz.foobar` oznacza odniesienie. Wartość pola `foo.bar` zostanie wyszukana jako punkt w sekcji głównej `baz`, a z odnalezionego obiektu parser pobierze własność `foobar`.

W niektórych operacjach można podać ciąg pól oddzielonych znakami `?` (`pole1?pole2`). W takim przypadku gdy pierwsza wartość okaże się pusta (`null` albo `undefined`), parser pobierze wartość kolejnego pola i znowu sprawdzi warunek — aż do napotkania pola niepustego. Dodatkowo można wstawiać również stałe (`pole?'stała'`) otoczone znakami `' '`. Wartość ta jest traktowana jako tekst i zatrzymuje sprawdzanie łańcucha, więc MUSI być używana na jego końcu.

##### Aktualnie wspierane operacje
Dla każdej operacji podano jej argumenty. Każddy argument opisano jako `(typ) nazwa=wartość domyślna`. `typ` to sposób, w jaki parser zinterpretuje wartość argumentu (`string` — tekst, `number` — liczba, `bool` — wartość logiczna, `array` — lista wartości oddzielonych przecinkami). Jeśli po znaku `=` nic nie ma, wartość domyślna jest pusta albo (dla argumentów logicznych) `false`.

- `bool`: enumeracja logiczna. Wstawia odpowiednią etykietę podstawie wartości podanego pola
    - `(string) ifTrue=tak`: etykieta dla wartości `true`
    - `(string) ifFalse=nie`: etykieta dla wartości `false`
- `insert`: wstawienie. Wstawia wartość podanego pola;
- `insertKeys`: wstawienie kluczy. Wstawia listę nazw własności zawartych w podanym polu (musi być ono obiektem), oddzieloną podanym separatorem;
- `insertValues`: wstawienie wartości. Wstawia listę własności zawartych w podanym polu (musi być ono obiektem), oddzieloną podanym separatorem;
- `insertArray`: wstawia listę wartości pobraną z będącego tablicą pola oddzieloną podanym separatorem
    - `(string) prepend=`: wartość dodana na początek tablicy
    - `(string) append=`: wartość dodana na koniec tablicy
    - `(string) ifUndef=`: lista wartości używana w przypadku, gdy `pole` będzie puste 
- `insertLinkTo`: wstawia link do elementu o identyfikatorze (nazwie wewnętrznej) `pole`
    - `(string) section=`: sekcja najwyższego poziomu, w której znajduje się poszukiwany element. Jeśli wartośc ta jest pusta, parser założy aktualnie wyświetloną sekcję
- `insertItemName`: jak wyżej, ale wstawia tylko nazwę jako tekst
    - `(string) section=`: sekcja najwyższego poziomu, w której znajduje się poszukiwany element. Jeśli wartośc ta jest pusta, parser założy aktualnie wyświetloną sekcję
- `mapArray`: jak `insertArray`, ale przetwarza wartości tablicy przed połączeniem jej w łańcuch. Używa dodatkowo składni:
    - `$index`: kolejny, liczony od 0, indeks danego elementu;
    - `$name`: skrót do pola `name` parsowanego obiektu;
    - `$item.pole`: wartość pola `pole` obiektu, nie zmienia się podczas iteracji, jako że nie należy do elementów iterowanej tablicy, a do jej "rodzica";
    - `$e.pole`: wartość pola `pole` danego elementu. 
- `mapObject`: podobnie jak `insertValues`, ale przetwarza wartości przed połączeniem ich w łańcuch. Używa składni `mapArray` i dodatkowo:
    - `$key`: zastępuje `$index`, klucz/nazwa pola, na którym aktualnie stoi iterator.

Dodatkowe wspólne argumenty:
- `(bool) capitalize=false`: kapitalizacja wartości wyjściowych;
- `(string) sep=,`: używana przez operacje listowe, takie jak `insertArray` lub `insertKeys`. Łańcuch, który oddzielał będzie poszczególne wczytane wartości.

#### Formatki substytucji specjalnej
Zapisywane są jako `$nazwa`. Używane są nie tylko przez sam komponent parsera. W definicjach tabel `nazwa` może być nazwą pola (wtedy pole interpretowane jest w specjalny sposób, na przykład `$name` produkuje kolumnę zawierającą linki do poszczególnych punktów w sekcji) lub specjalną wartością `roll` informującą o przekształceniu tabeli w taką z możliwością wyboru wiersza przez rzut kością. Inne powodują substytucję zmiennych kontekstowych, takich jak `$parent` w opisach wariantów punktu.

#### Formatki obliczeniowe
Zapisywane są pomiędzy symbolami `^` w odwrotnej notacji polskiej (znanej w nomenklaturze anglojęzycznej jako RPN), która jest łatwym do parsowania i pozbawionym nawiasów systemem notacji. Na przykład `^5 8 * 2 +^` oznacza `(5 * 8) + 2`. Wspierane operacje to dodawanie `+`, odejmowanie `-`, mnożenie `*` i dzielenie `/`. Zaznaczyć należy *dlaczego* tagi te rozwiązywane są jako ostatnie z tekstowych: otóż wymagają działania niektórych z poprzednich. Dla przykładu z definicji punktu `grenade->astartesBlindGrenade` mamy `"range": "^$this.strength 3 *^"`. Zauważyć da się tu substutucję pola `strength`, która musi być wykonana wcześniej, jako że operacje matematyczne parsera rozpoznają wyłącznie liczby i operatory.
Można do nich również dodawać komentarze zamknięte między `#`. Wyświetlane są one gdy parser nie ma odpowiednich danych do wykonania substytucji (co nie jest sprawdzane bezpośrednio przez moduł matematyczny, a jedynie wnioskowane, gdy resolwer natrafi na symbol niebędący liczbą ani operatorem). Podpowiada to prawidłową formę poprzedniej linijki: `"range": "^$this.strength 3 *^#S \u00d7 3#"`.

### Kolejność rozwiązywania
- formatki tekstowe
    - operacja
    - substytucja
    - obliczenia
- formatki wstawiające
    - kości
    - cytaty
    - tabele
- formatki linkujące
    - tabele
    - adnotacje
    - punkty

## Tabela referencja
Podczas pisania układów tabeli, na przykład dla sekcji, wykorzystać można specjalne formatki. Jak wiadomo układy definiuje się następująco:

```
{
    "pole1": "Etykieta 1",
    "pole2": "Etykieta 2",
    ...
}
```

**Kluczem** obiektu jest nazwa pola, które chcemy pozyskać ze wstawianych do tabeli obiektów. **Wartością** mu odpowiadającą jest etykieta wyświetlana w nagłówku danej kolumny w tabeli. Wymienione poniżej formatki wpisuje się jako **klucze**.

### Formatki ogólne
W tabeli można wykorzystywać wszystkie [formatki operacji](#formatki-operacji).

### Formatki specjalne
Poniżej podano listę wszystkich formatek używanych **tylko** przez tabele:
- `$index`: numer wiersza w tabeli **zaczynając od 0**
- `$roll`: kolumna dla tabel, w których przedstawiono wyniki rzutów kością. Jej etykietą będzie formuła rzutu w notacji kości, a wartościami — odpowiadające wierszom wyniki rzutów. Definiowane są one w wierszach przez klucze `match` i `range`
- `$content`: do pola zostanie wstawiony pogrubiony tytuł i zawartość, na przykład `{"title": "abc", "content": "lorem ipsum"}` da: **Abc.** lorem ipsum
- `$covers`: lokacje okrywane przez pancerz
- `$armour`: wartości pancerza
- `$name`: link do elementu poprzedzony kolorem źródła
- `$renown`: wymagana Sława
- `$rof`: Szybkostrzelność broni dystansowej
- `$damage`: przycisk do rzucenia kośćmi na obrażenia i typ obrażeń
- `$class`: klasa broni
- `$qualities`: linki do Własności broni
- `$range`: zasięg broni dystansowej w metrach
- `$reload`: czas przeładowania broni dystansowej w Akcjach Podwójnych
- `$protectionRating`: rzut na Ochronę pola siłowego
- `$overload`: zakres Przeciążenia pola siłowego
- `weight`: masa przedmiotu sformatowana z przecinkiem

## Tagi referencja
Tagi to znaczniki w obiektach zawartości, które pozwalają na poprawne działanie systemu eksportu. Podawane są w formie listy. Każdy z nich ma format `nazwa:argumenty`. Przyjmowane argumenty opisane są osobno dla każdego tagu. Oddzielone są przecinkami bez białych znaków pomiędzy.

Obsługiwane tagi:

- `ammo:{typ},{?liczba}` — przedmiot jest amunicją określonego typu, a jeden magazynek ma pojemność `liczba`. Jeśli nie podano, pobierze wielkość magazynka z opisu broni, np. zwyczajna amunicja do boltera będzie tagowana jako `ammo:bolt`, a plecak amunicji — `ammo:bolt,250`. Tag może występować kilkukrotnie.
- `mod:{klucz},{wartość}` — amunicja (wymaga tagu `ammo`) modyfikuje statystyki broni. `wartość` może być absolutna (np. `mod:pen,=6`) albo inkrementalna/dekrementalna (np. `mod:damage,+2`). Wielokrotny.
- `gainQuality:{własność},{?wartość}` — amunicja zapewnia broni dodatkowe Własności. `własność` podana jest jako ciąg `nazwa|źródło`, np. `gainQuality:blast|CRB,1`. Wielokrotny.
- `loseQuality:{własność}` — amunicja powoduje utratę Własności broni, np. `loseQuality:scatter|CRB`
- `usesAmmo:{typ}` — przedmiot przyjmuje amunicję określoną argumentem `typ`. Musi zgadzać się z `typ` w tagu `ammo` wybranej amunicji.
- `weapon:{typ=melee|ranged|combi},{?idKomb[]}` — przedmiot jest bronią białą/dystansową/łączoną. Jeśli `typ` to `combi`, musi wystąpić także argument `idKomb`. Dodanie jednego przedmiotu o danym `idKomb` spowoduje dodanie wszystkich innych. Po przecinku można podać dodatkowe `idKomb`, tworząc warianty kombinacji (np. kombi–plazma i kombi–miotacz). Tag może wystąpić maksymalnie dwukrotnie, raz z `typ=combi` i raz bez.
- `doublesStrength` — podana broń biała dodaje 1 do mnożnika Siły przy obliczaniu Obrażeń.
- `grenade` — przedmiot jest granatem. Zostanie dodany jako broń dystansowa z Zasięgiem 3×S użytkownika. Implikuje tag `ammo:grenade,1`.
- `missile` — przedmiot jest pociskiem. Można go tylko wystrzelić z wyrzutni. Implikuje `ammo:missile,1`.

## Zmiany

### 2.0
Zawartość z Rites of Battle (2011). Przeformułowanie funkcji. Eksport przedmiotów, Talentów i Cech do VTTES. Rewrite w języku TypeScript dla większej spójności danych. Karty pojazdów. Dodano system tagowania punktów.

Decyzja wykonawcza tłumacza: *by trzymać się starszego stylu, w jakim napisane są niniejsze materiały, zdecydowałem się nie poprawiać "Tau" na "T'au", co jest poprawną pisownią w nowszych materiałach z uniwersum. Wszystkie tłumaczenia jako "T'au" zostały zmienione w ten sposób.*

### 1.2
Kolejne zmiany w działaniu tabel i parsera, uproszczenia, dodanie tagów formatujących, rozszerzenie renderowania o profile stworzeń. Dużo nowej zawartości.

### 1.1
Zapomniana wersja: dodała funkcję wyszukiwania.

### 1.0
O, to już? O ile źródła nie są jeszcze przetłumaczone w całości, to sam system jest zasadniczo kompletny. Mamy także rebrand z **Kompendium Deathwatch** na dużo bardziej poprawnie brzmiące (w kontekście uniwersum) **Codex Vigilis**.

### 0.13.0
Czy ktoś powiedział "rozbudowa parsera i rewizja systemu tabel"? Nie? No dobrze...

### 0.12.0
Pierwsza wersja, od której pokazywane będą postępy. Aktualnie zaimplementowane są wszystkie ważniejsze rzeczy, w tym autorski format, w jakim zapisywane są wewnętrzne dane - RPC - i korzystający z niego parser.

No i autor wreszcie zabrał się za zedytowanie domyślnego readme. Najwyższy czas.

Cele na przyszłość: dokończyć to, co już jest; najpierw opisy (dużo opisów), potem obrazki gdzie można.
