WebPG provides GnuPG, GPG, PGP related Public/Private Key operations and management in Mozilla Firefox

Features as of Version 0.8.3 -

* Fully functioning Public/Private Key manager
* Inline parsing of PGP blocks and keys
* Right-click to Verify, Sign, Encrypt and Decrypt
* Rough gmail integration [EXPERIMENTAL]

In order for this to operate you *must* have some software installed depending on your operating system; namely, GnuPG and a key agent.

Keep in mind, this is beta software, it will probably have lots of bugs -- use at your own risk, and please inform me of any bugs/issues via webpg-bugs@curetheitch.com

To build the extension [Linux or OSX], clone or download this repository, and from the root directory execute:

```
./config_build.sh
./build.sh
```

This should create the XPI file and load the extension in Firefox for installation.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kylehuff/webpg-firefox/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

