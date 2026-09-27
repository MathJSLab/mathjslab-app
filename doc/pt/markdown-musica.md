# Música em Markdown

O fence `abc` é apropriado para autoria simples. A reprodução aparece somente
quando o integrador habilita áudio e sempre começa por uma ação do usuário.

```abc
X:1
T:Escala de dó maior
M:4/4
L:1/4
K:C
C D E F | G A B c |
```

Para partituras completas, use MEI ou MusicXML.

```musicxml
<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1"><measure number="1"><attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure></part>
</score-partwise>
```
