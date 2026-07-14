This is a implementation of Conways game of life, CGoL for short, that uses the hash life algorithm to optimaze the the code for large size grids.

You can visit my webstie [here](https://ripaalsinapedro.github.io/Hashlife/).

You can also visit this github repo, to check more rle patterns, this is also where i get the patterns [Pattern Repo](https://github.com/AlephAlpha/golly/tree/master/Patterns/Other-Rules).

The way it works is that it uses a data structure known as a quadtree, that achives both space and time optimization by using dynamic programing, storing the patterns of cells and the result of that patterns. Altough this method optimiazes a lot the standard CGoL implementation, it is mainly optimazed to run stable and repited patterns, a random grid means that there are less repited cell patterns, that means the need of creating more nodes, therefore an algorithm that dosent benefits as much from the hashing of the dynamic programing.