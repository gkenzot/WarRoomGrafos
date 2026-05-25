# War Room Grafos

Website para montar, visualizar e analisar grafos no contexto de um War Room. A aplicacao permite informar conexoes, desenhar a rede e identificar vertices importantes para monitoramento.

## Alunos

Gabriela Mendes - 240348162
Gustavo Takeda - 242898422
Caetano Mikulis - 240794242

## Funcionalidades

- Entrada por lista de arestas, como `A-B`, `B-C` e `C-D`.
- Modelos predefinidos inspirados em redes reais e tecnicas: anel, estrela, spine-leaf, microsservicos, CI/CD, Kubernetes, CDN, blockchain, IoT, load balancer, grafos bipartidos, hubs, war room, redes sociais e sistemas distribuidos.
- Botao para criar um grafo aleatorio.
- Desenho automatico do grafo.
- Destaque dos vertices escolhidos para monitoramento.
- Calculo passo a passo da cobertura de vertices.
- Exibicao da matriz de adjacencia gerada.

## War Room Logica

O War Room usa a tecnica gulosa para resolver uma cobertura de vertices. Essa tecnica sempre escolhe, em cada etapa, a melhor opcao naquele momento: o vertice que cobre a maior quantidade de arestas ainda pendentes.

A ideia e selecionar vertices que cubram todas as conexoes, garantindo que cada aresta tenha pelo menos uma extremidade observada. Na pratica, essa abordagem geralmente encontra um bom caso de cobertura de forma simples e rapida, mas nao acerta a melhor resposta em todas as vezes, porque uma escolha boa no momento atual pode impedir uma combinacao melhor depois.

A logica principal fica em `src/lib/warRoom.js` e funciona assim:

1. Lista todas as arestas ainda nao cobertas.
2. Calcula qual vertice cobre mais arestas pendentes.
3. Escolhe esse vertice para a cobertura.
4. Remove as arestas cobertas por ele.
5. Repete ate nao restarem arestas.

Essa estrategia sempre gera uma cobertura valida, mas nao garante a menor cobertura possivel em todos os grafos, pois Vertex Cover otimo e um problema NP-completo.

## Requisito

Instale o Node.js antes de executar o projeto. Este projeto usa **Vite 5**, compativel com Node.js 18 ou superior (incluindo a versao 20.3.x).

Evite instalar o Vite 8 neste projeto: ele exige Node.js **20.19+** ou **22.12+** e pode falhar com o erro `styleText` em versoes mais antigas.

Para verificar:

```powershell
node -v
npm -v
```

## Como executar

Entre na pasta do projeto:

```powershell
cd WarRoomGrafos
```

Instale as dependencias:

```powershell
npm install
```

Rode o servidor de desenvolvimento:

```powershell
npm run dev
```

Depois abra o endereco mostrado no terminal, normalmente:

```text
http://localhost:5173
```

## Como usar

1. Informe as conexoes do grafo usando a lista de arestas.
2. Use a secao `Modelos prontos` para carregar um cenario pronto ou `Criar aleatorio` para gerar um exemplo automaticamente.
3. Confira o desenho gerado automaticamente.
4. Veja o resultado da cobertura de vertices e o calculo passo a passo.

Na lista de arestas, cada conexao pode ser escrita em uma linha:

```text
A-B
A-C
B-D
C-E
```

Tambem e possivel separar por virgulas:

```text
A-B, A-C, B-D, C-E
```

## Estrutura

```text
WarRoomGrafos/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── index.html
├── package.json
├── README.md
└── src/
    ├── data/
    │   └── modelos.json
    ├── lib/
    │   ├── graph.js
    │   └── warRoom.js
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

Os modelos prontos ficam em `src/data/modelos.json`. A logica de leitura das arestas, matriz de adjacencia e grafo aleatorio fica em `src/lib/graph.js`; o calculo guloso do War Room fica em `src/lib/warRoom.js`.

## Build

Para gerar a versao de producao:

```powershell
npm run build
```

Os arquivos finais serao criados na pasta `dist`.

## Publicacao no GitHub Pages

Este projeto esta configurado para publicar em:

```text
https://gkenzot.github.io/WarRoomGrafos/
```

O arquivo `vite.config.js` usa `base: '/WarRoomGrafos/'`, que e necessario para o Vite carregar CSS, JavaScript e imagens corretamente no GitHub Pages.

Para deixar online pelo proprio GitHub:

1. Envie o projeto para o repositorio `gkenzot/WarRoomGrafos`.
2. No GitHub, abra `Settings` > `Pages`.
3. Em `Build and deployment`, selecione `GitHub Actions` como origem.
4. Aguarde o workflow `Deploy GitHub Pages` terminar na aba `Actions`.

Depois do deploy, o site ficara disponivel no endereco acima.
