set -e
rm -rf releases

yarn pkg --output releases/pgb --options use_strict,harmony -t node4-macos,node4-linux,node4-win .

cd releases

mv pgb-win.exe pgb.exe && zip -9 -q -m pgb.win.zip pgb.exe

mv pgb-macos pgb && tar -czf pgb.macos.tar.gz pgb && rm pgb
gunzip pgb.macos.tar.gz
cd .. && tar --append --file=releases/pgb.macos.tar completions/* && gzip releases/pgb.macos.tar

cd releases

mv pgb-linux pgb && tar -czf pgb.linux.tar.gz pgb && rm pgb
gunzip pgb.linux.tar.gz
cd .. && tar --append --file=releases/pgb.linux.tar completions/* && gzip releases/pgb.linux.tar

cd releases

openssl sha -sha256 < pgb.macos.tar.gz > pgb.macos.tar.gz.sha
