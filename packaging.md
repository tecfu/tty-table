# Building distributable packages

***Recommended: [FPM](https://github.com/jordansissel/fpm)***

- Arch Linux

```
fpm -s npm -t pacman tty-table
```

- Debian/Ubuntu

```
fpm -s npm -t deb tty-table
```

- Mac OS X

```
fpm -s npm -t osx tty-table
```

- Redhat

```
fpm -s npm -t rpm tty-table
```

- Solaris

```
fpm -s npm -t solaris tty-table
```


